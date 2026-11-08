/**
 * Bulk cart planning (session-9 S9-8).
 *
 * POST /api/cart/bulk applies the SAME per-line clamp as the single-add POST
 * (stock ceiling + 99 cap) inside one transaction. The two pure helpers below
 * pin the branches the route used to carry inline: dedupe-summing a
 * duplicated payload (so a repeated wishlist entry cannot double-count) and
 * planning each line's final quantity against live stock.
 */

import { MAX_CART_QUANTITY, clampPurchaseQuantity } from "./cart-quantity";

/**
 * Collapse `[productId, variant, quantity]` items into one wanted quantity per
 * product+variant LINE (run-72: the same product in two colors is two lines).
 * Repeated line keys SUM (a duplicated wishlist entry means "want it more",
 * not "want it twice"), with the same 99 ceiling the cart enforces — the
 * per-line stock clamp runs later, at plan time. The map key is the
 * composite `${productId}|${variant}` the route splits before its upserts.
 */
export function dedupeBulkWanted(
  items: ReadonlyArray<{ productId: string; quantity: number; variant?: string }>,
): Map<string, number> {
  const wanted = new Map<string, number>();
  for (const item of items) {
    const key = `${item.productId}|${item.variant ?? ""}`;
    wanted.set(key, Math.min((wanted.get(key) ?? 0) + item.quantity, MAX_CART_QUANTITY));
  }
  return wanted;
}

/** Split a dedupeBulkWanted key back into its (productId, variant) pair. */
export function splitBulkKey(key: string): { productId: string; variant: string } {
  const parts = key.split("|");
  const productId = parts[0] ?? "";
  const variant = parts[1] ?? "";
  return { productId, variant };
}

/**
 * Final upsert quantity for one line: existing cart quantity + wanted,
 * clamped to the live stock (which also enforces the 99 ceiling and drops
 * sold-out lines to 0 — the caller skips those).
 */
export function planBulkUpsertQuantity(existingQuantity: number, wanted: number, stock: number): number {
  return clampPurchaseQuantity(existingQuantity + wanted, stock);
}
