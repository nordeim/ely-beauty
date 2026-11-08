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
 * test AND the three admin dialogs' dollar-labeled inputs (product-dialog,
 * coupon-dialog, settings-form — all import this alias). */
export const parseDollarsToCents = parseAmountToCents;

/** Percentage discount between compare-at and current price, e.g. -29 => "-29%". */
export function discountPercent(price: number, compareAtPrice: number | null | undefined): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((price - compareAtPrice) / compareAtPrice) * 100);
}
