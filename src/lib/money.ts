/**
 * Money — all monetary amounts are INTEGER CENTS (poisha) in the database and
 * in server code; ৳1 = 100. Formatting to display strings happens only at the
 * UI edge. Floats are never used for money arithmetic.
 *
 * ElyBeauty prices are whole taka (৳288); decimals render only when a
 * computed amount (e.g. a percent coupon) genuinely carries poisha.
 */

/** Currency symbol — Bangladeshi Taka. */
export const CURRENCY_SYMBOL = "৳";

/** Format integer cents as a BDT display string, e.g. 28800 -> "৳288",
 *  36550 -> "৳365.50". Negative amounts render with a leading minus. */
export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const taka = Math.floor(abs / 100);
  const rem = abs % 100;
  const grouped = taka.toLocaleString("en-US");
  return rem === 0
    ? `${sign}${CURRENCY_SYMBOL}${grouped}`
    : `${sign}${CURRENCY_SYMBOL}${grouped}.${rem.toString().padStart(2, "0")}`;
}

/**
 * S82-1 (D-82-1, codepoint-measured on the live reference 2026-11-09): the
 * reference's SEARCH-OVERLAY row price renders the Base44 template's USD
 * format — a literal ASCII "$" (U+0024) followed by the same numeric value
 * the ৳ grid price carries, ALWAYS with two decimals ("$370.00"). The
 * reference's grid/detail prices stay ৳ whole-taka; only the overlay rides
 * this template-remnant format, so this helper is consumed ONLY by the
 * search overlay's result rows (replicate-as-observed, the S81-3 precedent).
 */
export function formatOverlayPrice(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const whole = Math.floor(abs / 100);
  const rem = abs % 100;
  return `${sign}$${whole.toLocaleString("en-US")}.${rem.toString().padStart(2, "0")}`;
}

/**
 * S105-1 (audit 105-a LOW-1): the Stripe seam mints USD-only PaymentIntents
 * (currency: "usd" — verifyPaymentIntentForPlacement rejects anything else),
 * so StripeEvent.amount and the charge amount/amount_refunded are USD minor
 * units, never poisha. Rendering them through formatMoney mislabeled the
 * operator-facing ledger and the refund notes with ৳ (off by the
 * STRIPE_BDT_PER_USD factor). This Stripe-scoped companion renders them with
 * the ASCII dollar and two decimals ALWAYS (Stripe's own minor-unit
 * convention: $31.29, $10.00, $0.00). Consumed by the admin payments
 * ledger, the refund OrderEvent notes, and — since S106-1 — the checkout
 * island's Pay button (the mint route echoes the converted USD intent
 * amount, not the BDT total; audit 106-a F-1 caught run-105's "the button
 * stays ৳" premise being false — the echoed value is `intent.amount`).
 * Every other money surface keeps formatMoney's ৳ form (the review block's
 * ৳ totals are the parent checkout's children, a BDT surface).
 */
export function formatStripeUsd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const whole = Math.floor(abs / 100);
  const rem = abs % 100;
  return `${sign}$${whole.toLocaleString("en-US")}.${rem.toString().padStart(2, "0")}`;
}

/** Parse a user-typed amount string ("288", "৳1,299", "365.50") into integer
 *  cents. Accepts an optional currency symbol and thousand separators. */
export function parseAmountToCents(input: string): number | null {
  const cleaned = input.replace(/[৳$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [wholePart, fracPart = ""] = cleaned.split(".");
  const cents = Number(wholePart) * 100 + Number((fracPart + "00").slice(0, 2));
  return Math.round(cents);
}

/** Back-compat alias for the pre-ElyBeauty name — kept for its unit
 * test AND the three admin dialogs' taka-labeled inputs (product-dialog,
 * coupon-dialog, settings-form — all import this alias). */
export const parseDollarsToCents = parseAmountToCents;

/** Percentage discount between compare-at and current price, e.g. -29 => "-29%". */
export function discountPercent(price: number, compareAtPrice: number | null | undefined): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((price - compareAtPrice) / compareAtPrice) * 100);
}
