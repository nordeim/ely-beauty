// Session-94 S94-2 (audit 94-a L-7) — the Stripe-intent P2002 recovery
// branch is ownership-bound, mirroring the idempotencyKey sibling (S7-2).
//
// Why this file exists: placeOrderWithRetry's stripePaymentIntentId branch
// returned the already-placed order's receipt UNCONDITIONALLY —
// `if (existing) return existing.number` — while the idempotencyKey branch
// routes through resolveReplay precisely because a caller who merely KNOWS
// another client's anchor (log/XSS exposure) must not receive the winner's
// {orderNumber, token} (the receipt capability: name/address/items PII).
// A leaked pi_… id plus a cart that passes the pre-tx amount verification
// would have handed the receipt over on the unguarded branch.
//
// Conventions: the api-boundaries route-import + mock conventions (the
// checkout flow reads cookies via next/headers → mocked to a guest cart
// token; getCurrentUser → guest; the db layer mocked at the boundary). The
// Stripe verification seams are module-mocked so the P2002 recovery loop
// is reached without any network.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
    $transaction: vi.fn(),
    storeSetting: { findMany: vi.fn().mockResolvedValue([]) },
    cart: { findUnique: vi.fn() },
    order: { findUnique: vi.fn() },
  },
}));

// Guest with a cart token cookie — the same shape the api-boundaries file
// uses: the recovery branch's ownership gate keys on this token.
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => (name === "homenest_cart" ? { value: "guest-token" } : undefined),
  })),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => null),
}));

// The Stripe verification seams: a live-looking intent id reaches the
// placement loop without network or keys.
vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    paymentIntents: {
      retrieve: vi.fn(async () => ({ id: "pi_REPLAYTEST1", amount: 400, currency: "usd", status: "succeeded" })),
    },
  })),
}));

vi.mock("@/lib/stripe-payment", () => ({
  parseStripeBdtPerUsd: vi.fn(() => 120),
  verifyPaymentIntentForPlacement: vi.fn(() => ({ ok: true })),
  paymentIntentLast4: vi.fn(() => "4242"),
  stripeChargeAmount: vi.fn(() => 400),
}));

import { POST as checkoutPOST } from "@/app/api/checkout/route";
import { db } from "@/lib/db";

const ORIGIN = "http://localhost:3000";

/** A card-payment body carrying the CONFIRMED intent id (the anchor). */
function stripeBody(): string {
  return JSON.stringify({
    email: "guest@example.com",
    customerName: "Test Customer",
    paymentMethod: "card",
    stripePaymentIntentId: "pi_REPLAYTEST1",
    address: {
      fullName: "Test Customer",
      phone: "+1 555 000 0000",
      line1: "123 Test Street",
      city: "Testville",
      state: "TS",
      postalCode: "12345",
    },
  });
}

function post(ip: string): NextRequest {
  return new NextRequest(`${ORIGIN}/api/checkout`, {
    method: "POST",
    body: stripeBody(),
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
  });
}

/** The guest cart that reaches the placement loop with one line. */
const GUEST_CART = {
  id: "cart-1",
  userId: null,
  token: "guest-token",
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: "item-1",
      cartId: "cart-1",
      productId: "p1",
      variant: "",
      quantity: 1,
      createdAt: new Date(),
      product: {
        id: "p1",
        name: "Silk Bonnet",
        slug: "silk-bonnet",
        images: JSON.stringify(["/images/silk-bonnet.png"]),
        price: 37000,
        stock: 10,
        isActive: true,
      },
    },
  ],
};

/** The P2002 the placement hits when the intent already anchored an order. */
function intentCollision(): unknown {
  return Object.assign(new Error("Unique constraint failed"), {
    code: "P2002",
    meta: { target: ["stripePaymentIntentId"] },
  });
}

beforeEach(() => {
  vi.mocked(db.$transaction).mockReset();
  vi.mocked(db.order.findUnique).mockReset();
  vi.mocked(db.cart.findUnique).mockReset().mockResolvedValue(GUEST_CART as never);
});

describe("POST /api/checkout — the stripe-intent replay is ownership-bound (S94-2)", () => {
  it("409s and never emits the receipt when the already-placed order belongs to ANOTHER client", async () => {
    // The victim's order: placed by a signed-in user, bound to THEIR cart
    // token — this guest (different token, no session) merely KNOWS the
    // intent id. The unguarded branch would return their receipt.
    vi.mocked(db.$transaction).mockRejectedValue(intentCollision());
    vi.mocked(db.order.findUnique).mockResolvedValue({
      number: "ELY-VICTIM99",
      userId: "user-9",
      cartToken: "another-token",
    } as never);

    const res = await checkoutPOST(post("203.0.113.61"));

    // RED pre-fix: 200 + { orderNumber: "ELY-VICTIM99", token: … }.
    expect(res.status).toBe(409);
    const body = (await res.json()) as { error?: string; orderNumber?: string; token?: string };
    expect(body.error).toBe(
      "We couldn't verify this checkout retry belongs to you. Please review your cart and try again.",
    );
    expect(body.orderNumber).toBeUndefined();
    expect(body.token).toBeUndefined();
  });

  it("replays to the winner's receipt for a GENUINE retry (same guest cart token)", async () => {
    // The double-submit race: the same guest (same cart cookie) retries
    // after the response was lost — the webhook backstop may have placed
    // the order with the SAME metadata. The receipt must come back.
    vi.mocked(db.$transaction).mockRejectedValue(intentCollision());
    vi.mocked(db.order.findUnique).mockResolvedValue({
      number: "ELY-WINNER42",
      userId: null,
      cartToken: "guest-token",
    } as never);

    const res = await checkoutPOST(post("203.0.113.62"));

    expect(res.status).toBe(200);
    const body = (await res.json()) as { orderNumber?: string; token?: string };
    expect(body.orderNumber).toBe("ELY-WINNER42");
    expect(typeof body.token).toBe("string");
    expect(body.token!.length).toBeGreaterThan(0);
  });

  it("routes the stripe-intent branch through resolveReplay (the source composition pin)", () => {
    // The api-boundaries file-reading convention: the route source must
    // compose the ownership gate INSIDE the stripePaymentIntentId branch —
    // the exact composition the idempotencyKey sibling carries (S7-2).
    const source = readFileSync(
      path.join(process.cwd(), "src/app/api/checkout/route.ts"),
      "utf8",
    );
    const stripeBranch = source.slice(
      source.indexOf("stripePaymentIntentId && uniqueTargetField"),
      source.indexOf('uniqueTargetField(error, "idempotencyKey")'),
    );
    expect(stripeBranch).toContain("resolveReplay(existing, args.userId, args.cartToken)");
    expect(stripeBranch).toContain("ReplayDeniedError");
  });
});
