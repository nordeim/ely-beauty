import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { findCartId, getCartSummary, readCartToken } from "@/lib/cart";
import { applyCouponCode } from "@/lib/coupons";
import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/order-number";
import { computeOrderMoney, shippingMethodForCity } from "@/lib/order-money";
import { orderAccessToken, replayAuthorized, resolveReplay, ReplayDeniedError } from "@/lib/order-access";
import { CheckoutError, placeOrderTx, type PlaceOrderArgs } from "@/lib/order-placement";
import { isUniqueViolation, uniqueTargetField } from "@/lib/prisma-errors";
import { parseJsonBody } from "@/lib/json-body";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { getStripe } from "@/lib/stripe";
import {
  parseStripeBdtPerUsd,
  paymentIntentLast4,
  stripeChargeAmount,
  verifyPaymentIntentForPlacement,
} from "@/lib/stripe-payment";
import { checkoutSchema, firstError } from "@/lib/validation";

// checkoutSchema + the Stripe path's CONFIRMED PaymentIntent id (card data
// never touches this app: the Payment Element owns it; the id is the only
// thing that crosses). S73-8 retired the scaffold's demo-card last-4 field —
// a card payment now requires a VERIFIED intent, and the receipt digits are
// read from the intent itself, never from the body.
const checkoutBodySchema = checkoutSchema.extend({
  stripePaymentIntentId: z
    .string()
    .trim()
    .regex(/^pi_[A-Za-z0-9]{6,}$/, "Invalid payment reference")
    .optional()
    .or(z.literal("")),
});

type CheckoutBody = z.infer<typeof checkoutBodySchema>;

type PlacedOrder = { orderNumber: string; token: string };

function respond(orderNumber: string): NextResponse {
  return NextResponse.json({ orderNumber, token: orderAccessToken(orderNumber) });
}

/**
 * POST /api/checkout — THE critical path. Every monetary amount is re-derived
 * server-side INSIDE the order transaction from the live product rows and
 * settings (client totals are never trusted), stock is reserved via
 * conditional atomic decrements, and the order + items + "placed" event +
 * stock decrement + cart clear all commit atomically.
 *
 * Idempotency: the body may carry a client-generated `idempotencyKey`. A retry
 * (lost response, double click) with the same key returns the ALREADY-placed
 * order's `{ orderNumber, token }` instead of double-ordering.
 *
 * The Stripe path (PAY-STRIPE-1 retrofit): the body may carry a
 * `stripePaymentIntentId` (the client island's CONFIRMED intent — card data
 * itself never crosses). The server retrieves the intent from Stripe and
 * verifies status/amount/currency OUTSIDE the transaction (an external call
 * must never hold the SQLite write lock), then places the order with the
 * paid-payment columns. The `Order.stripePaymentIntentId` UNIQUE constraint
 * is the placement idempotency anchor: a retried submit after a successful
 * placement maps to the ALREADY-PLACED order number (never a second order,
 * never a second charge). The in-tx money authority re-derives the total and
 * rejects a drift with StripeAmountMismatchError (the residual TOCTOU guard).
 */
export async function POST(request: NextRequest) {
  try {
    // S79-7: the per-client budget runs BEFORE the parse (x-forwarded-for
    // when behind a proxy, shared bucket for direct connections — generous:
    // blocks scripted spam, not shoppers) so garbage/oversize bodies are
    // metered too; the bounded seam caps the read at 32KB (malformed
    // payloads stay a 400, not a 500).
    const limit = rateLimit(`checkout:${clientIp(request.headers)}`, 20, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec ?? 60) } },
      );
    }
    const body = await parseJsonBody(request);
    if (body === null) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    const parsed = checkoutBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;
    const stripeIntentId = data.stripePaymentIntentId || null;

    // S73-8: card payments require a VERIFIED Stripe PaymentIntent — the
    // run-72 UI only offers Card through the Payment Element, so a bare
    // `card` body with any 4-digit last4 is a crafted request, not a shopper.
    // (The scaffold's demo card path is gone; unpaid "card" orders are ops
    // noise that can never exist again.)
    if (data.paymentMethod === "card" && !stripeIntentId) {
      return NextResponse.json(
        { error: "Card payments are unavailable right now. Please choose Cash on Delivery or try again later." },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();
    const requestCartToken = await readCartToken();

    // Idempotent replay: the order already committed on an earlier attempt —
    // hand back its receipt without touching stock or the cart again. The
    // replay is OWNERSHIP-BOUND (session-6 S6-8): user orders replay only for
    // the same session, guest orders only with the same cart-token cookie.
    // A leaked key alone reveals nothing.
    if (data.idempotencyKey) {
      const existing = await db.order.findUnique({ where: { idempotencyKey: data.idempotencyKey } });
      if (existing && replayAuthorized(existing.userId, existing.cartToken, user?.id ?? null, requestCartToken)) {
        return respond(existing.number);
      }
    }

    const cartId = await findCartId(user?.id ?? null);
    const summary = await getCartSummary(cartId);
    if (!cartId || summary.lines.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 409 });
    }

    // Defensive: a quantity-0 line must never become an order item (it would
    // be a ৳0 line that still accrues shipping/tax). The cart PATCH deletes
    // such lines — this guard backstops stale summaries and races.
    if (summary.lines.some((line) => line.quantity <= 0)) {
      return NextResponse.json(
        { error: "Your cart needs attention — please update item quantities and try again." },
        { status: 409 },
      );
    }

    // Fast-fail coupon check for good UX only — the AUTHORITATIVE validation
    // and discount derivation happen inside the transaction below.
    let couponDiscountCents = 0;
    let couponFreeShipping = false;
    if (data.couponCode) {
      const applied = await applyCouponCode(data.couponCode, summary.subtotal);
      if (!applied.ok) {
        return NextResponse.json({ error: applied.error }, { status: 409 });
      }
      couponDiscountCents = applied.discount;
      couponFreeShipping = applied.freeShipping === true;
    }

    const settings = await getSettings();
    // S73-1: the shipping tier for the Stripe amount estimate is derived
    // from the ADDRESS CITY — the same derivation the placement re-runs
    // in-tx (the client's field is not part of the schema and never trusted).
    const estimatedShippingMethod = shippingMethodForCity(data.address.city);
    const shippingAddressJson = JSON.stringify({
      fullName: data.address.fullName,
      phone: data.address.phone,
      line1: data.address.line1,
      line2: data.address.line2 || "",
      city: data.address.city,
      state: data.address.state,
      postalCode: data.address.postalCode,
      country: data.address.country,
    });

    // ---- The Stripe verification (outside the transaction — no external
    // call may hold the SQLite write lock). The intent id is NEVER trusted:
    // the server re-retrieves it and gates on status + amount + currency.
    // The amount gate runs against the SAME server-derived estimate the
    // mint used (live cart + coupon + settings through computeOrderMoney);
    // the in-tx authority re-checks the final total (StripeAmountMismatch).
    let stripeLast4: string | null = null;
    let paidTotalCents: number | null = null;
    // S74-11: the operator FX rate — rides through to the in-tx amount
    // guard (the intent carries USD cents; the guard converts the final
    // BDT total through the same rate).
    let bdtPerUsd: number | null = null;
    if (stripeIntentId) {
      const stripe = getStripe();
      // S74-11: the rate must exist — the mint would have 503'd without it,
      // so reaching here with a live intent id means the operator REMOVED
      // the rate mid-checkout. Refuse (never verify against a guess).
      bdtPerUsd = parseStripeBdtPerUsd(process.env);
      if (!stripe || bdtPerUsd === null) {
        return NextResponse.json(
          { error: "Card payments are unavailable right now. Please try again later." },
          { status: 503 },
        );
      }
      // The estimate the mint computed (the authoritative derivation reruns
      // inside the transaction below).
      const estimate = computeOrderMoney({
        subtotal: summary.subtotal,
        discount: couponDiscountCents,
        shippingMethod: estimatedShippingMethod,
        freeShippingThresholdCents: settings.freeShippingThresholdCents,
        standardShippingCents: settings.standardShippingCents,
        expressShippingCents: settings.expressShippingCents,
        taxRatePercent: settings.taxRatePercent,
        couponFreeShipping,
      });
      try {
        const intent = await stripe.paymentIntents.retrieve(stripeIntentId, {
          expand: ["payment_method", "latest_charge"],
        });
        // S74-11: verify against the CONVERTED amount — the same derivation
        // the mint used (computeOrderMoney, then the operator rate).
        const verification = verifyPaymentIntentForPlacement(
          intent,
          stripeChargeAmount(estimate.total, bdtPerUsd),
        );
        if (!verification.ok) {
          // The amount branch is the island's re-mint signal (its session
          // resets and a fresh intent is minted at the fresh total).
          return NextResponse.json({ error: verification.message }, { status: 409 });
        }
        stripeLast4 = paymentIntentLast4(intent);
        paidTotalCents = intent.amount;
      } catch {
        console.error("[api/checkout] stripe retrieve failed", stripeIntentId);
        return NextResponse.json(
          { error: "We could not verify your payment. Please try again." },
          { status: 502 },
        );
      }
    }

    const args: PlaceOrderArgs = {
      cartId,
      userId: user?.id ?? null,
      email: data.email,
      customerName: data.customerName,
      lines: summary.lines,
      couponCode: data.couponCode ? data.couponCode.trim().toUpperCase() : null,
      paymentMethod: data.paymentMethod,
      cardLast4: stripeIntentId ? stripeLast4 : null,
      shippingAddressJson,
      notes: data.notes ? data.notes.trim() : null,
      saveAddress: Boolean(user) && data.saveAddress === true,
      address: data.address,
      idempotencyKey: data.idempotencyKey ?? null,
      cartToken: requestCartToken,
      settings: {
        freeShippingThresholdCents: settings.freeShippingThresholdCents,
        standardShippingCents: settings.standardShippingCents,
        expressShippingCents: settings.expressShippingCents,
        taxRatePercent: settings.taxRatePercent,
      },
      stripePaymentIntentId: stripeIntentId,
      paidTotalCents,
      bdtPerUsd,
    };

    const orderNumber = await placeOrderWithRetry(args);
    return respond(orderNumber);
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Something went wrong placing your order." }, { status: 500 });
  }
}

/**
 * ELY-XXXXXXXX allocation (run-72 — the reference's crypto-random format).
 * A unique violation on the NUMBER (concurrent order) retries with a fresh
 * candidate. A unique violation on the IDEMPOTENCY KEY (two racing first-attempts
 * with the same key) resolves to the winning order instead. A unique violation
 * on the STRIPE INTENT ANCHOR (a retried submit whose intent already placed —
 * the PAY-STRIPE-1 anchor) resolves to the already-placed order: the customer
 * sees their confirmation, not an error, on a double-click/race. The whole
 * transaction retries, so a failed attempt never leaves partial writes.
 */
async function placeOrderWithRetry(args: PlaceOrderArgs): Promise<string> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateOrderNumber();
    try {
      return await placeOrderTx(db, candidate, args);
    } catch (error) {
      // The placement idempotency anchor (PAY-STRIPE-1): a P2002 on
      // stripePaymentIntentId means this confirmed intent already placed an
      // order (a retried submit or a race against the webhook backstop) —
      // resolve to that order's receipt.
      if (args.stripePaymentIntentId && uniqueTargetField(error, "stripePaymentIntentId")) {
        const existing = await db.order.findUnique({
          where: { stripePaymentIntentId: args.stripePaymentIntentId },
        });
        if (existing) return existing.number;
      }
      // Session-8 S8-3: tolerant matching — the engine may report the P2002
      // target as a field array (today's SQLite shape) or as the constraint
      // NAME string ("Order_idempotencyKey_key"); matching only the field
      // shape would silently disable this recovery branch.
      if (uniqueTargetField(error, "idempotencyKey")) {
        const winner = args.idempotencyKey
          ? await db.order.findUnique({ where: { idempotencyKey: args.idempotencyKey } })
          : null;
        // Session-7 S7-2: the recovery path is ownership-bound too. A genuine
        // double-submit shares the same cookies and passes; a caller who only
        // KNOWS the key (log/XSS leak) gets a 409 instead of the receipt.
        try {
          const resolved = resolveReplay(winner, args.userId, args.cartToken);
          if (resolved) return resolved;
        } catch (denied) {
          if (denied instanceof ReplayDeniedError) {
            throw new CheckoutError(409, "We couldn't verify this checkout retry belongs to you. Please review your cart and try again.");
          }
          throw denied;
        }
      }
      if (isUniqueViolation(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  throw lastError ?? new CheckoutError(500, "Could not allocate an order number.");
}
