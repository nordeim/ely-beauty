import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { findCartId, getCartSummary, readCartToken } from "@/lib/cart";
import { applyCouponCode } from "@/lib/coupons";
import { computeOrderMoney, shippingMethodForCity } from "@/lib/order-money";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { getStripe, isStripeServerConfigured } from "@/lib/stripe";
import {
  buildPaymentIntentParams,
  checkoutSnapshotHash,
  parseStripeBdtPerUsd,
  stripeChargeAmount,
  stripeIdempotencyKey,
} from "@/lib/stripe-payment";
import { checkoutSchema, firstError } from "@/lib/validation";

export const dynamic = "force-dynamic";

// The mint body is the checkout input's placement subset (the same schema —
// single source — minus the fields the placement itself owns). S73-1: no
// shippingMethod — the tier is server-derived from the address city at
// mint time too, so the intent amount always matches the placement's
// in-tx derivation.
const mintBodySchema = checkoutSchema.pick({
  email: true,
  customerName: true,
  couponCode: true,
  idempotencyKey: true,
  address: true,
});

type MintBody = z.infer<typeof mintBodySchema>;

type PaymentIntentSession = {
  clientSecret: string;
  paymentIntentId: string;
  /** Echoed for the island's own amount display — server truth, not client input. */
  amount: number;
};

/**
 * POST /api/stripe/payment-intent — the client island's entry point (the
 * Stripe retrofit's mint, PAY-STRIPE-1).
 *
 * Re-derives the cart + coupon + settings SERVER-SIDE (money is server
 * truth — nothing the client sends can move the amount), builds the
 * PaymentIntent params via the pure seam, and creates (or idempotently
 * reuses — the deterministic key) the intent. Returns the client secret the
 * Payment Element mounts with.
 *
 * Placement itself stays in POST /api/checkout — the same transactional seam
 * as the demo path; this route never writes orders. The intent's metadata
 * carries the full placement input so the webhook backstop can rebuild the
 * order if the customer's browser dies between confirmation and placement.
 */
export async function POST(request: NextRequest) {
  // S74-11 (F-1): the card gate needs keys AND the explicit FX rate —
  // minting a USD intent whose amount equals the poisha count would
  // overcharge ~120x, so a missing rate keeps the gate shut server-side
  // (the checkout page's cardEnabled is the UX mirror of this check).
  const bdtPerUsd = parseStripeBdtPerUsd(process.env);
  if (!isStripeServerConfigured() || bdtPerUsd === null) {
    // Customer-safe: no operator vocabulary (the R10-2 rule).
    return NextResponse.json(
      { error: "Card payments are unavailable right now. Please try again later." },
      { status: 503 },
    );
  }
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Card payments are unavailable right now. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = mintBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const snapshot = parsed.data;

  // Per-client budget keyed like the reference's mint (user id, else IP).
  const user = await getCurrentUser();
  const limit = rateLimit(`stripe-intent:${user?.id ?? clientIp(request.headers)}`, 10, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many payment attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec ?? 60) } },
    );
  }

  const cartId = await findCartId(user?.id ?? null);
  const summary = await getCartSummary(cartId);
  if (!cartId || summary.lines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 409 });
  }

  // Fast-fail coupon check — the authoritative derivation reruns inside the
  // placement transaction (the same contract as POST /api/checkout).
  let discount = 0;
  let couponFreeShipping = false;
  if (snapshot.couponCode) {
    const applied = await applyCouponCode(snapshot.couponCode, summary.subtotal);
    if (!applied.ok) {
      return NextResponse.json({ error: applied.error }, { status: 409 });
    }
    discount = applied.discount;
    couponFreeShipping = applied.freeShipping === true;
  }

  const settings = await getSettings();
  // S73-1: the tier is derived from the ADDRESS CITY — the same derivation
  // the placement re-runs in-tx (a client-sent method can never skew the
  // intent amount away from the order it places).
  const shippingMethod = shippingMethodForCity(snapshot.address.city);
  const money = computeOrderMoney({
    subtotal: summary.subtotal,
    discount,
    shippingMethod,
    freeShippingThresholdCents: settings.freeShippingThresholdCents,
    standardShippingCents: settings.standardShippingCents,
    expressShippingCents: settings.expressShippingCents,
    taxRatePercent: settings.taxRatePercent,
    couponFreeShipping,
  });

  const cartToken = await readCartToken();
  // S74-11: the intent amount is the CONVERTED total — USD cents through
  // the operator rate, never the raw poisha count. The idempotency key
  // hashes the same converted amount, so a rate change mints a fresh
  // intent instead of replaying a stale one at a stale amount.
  const amountUsdCents = stripeChargeAmount(money.total, bdtPerUsd);
  const params = buildPaymentIntentParams({
    snapshot,
    amountUsdCents,
    cartId,
    userId: user?.id ?? null,
    cartToken,
  });
  const idempotencyKey = stripeIdempotencyKey(cartId, amountUsdCents, checkoutSnapshotHash(snapshot));

  try {
    const intent = await stripe.paymentIntents.create(
      params as Parameters<typeof stripe.paymentIntents.create>[0],
      { idempotencyKey },
    );
    if (!intent.client_secret) {
      console.error("[api/stripe/payment-intent] intent without client_secret", intent.id);
      return NextResponse.json(
        { error: "We could not start your payment. Please try again." },
        { status: 502 },
      );
    }
    const session: PaymentIntentSession = {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: intent.amount,
    };
    return NextResponse.json(session);
  } catch (error) {
    console.error("[api/stripe/payment-intent] create failed", error);
    return NextResponse.json(
      { error: "We could not start your payment. Please try again." },
      { status: 502 },
    );
  }
}
