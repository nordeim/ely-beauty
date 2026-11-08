/**
 * Variant-label composition (S73-7).
 *
 * The reference (verified live on the massager product, which carries BOTH a
 * COLOR row and a SIZE row) records BOTH selections on its cart line. The
 * clone's cart-line identity is a single variant string, so the purchase
 * panel composes the two dimensions through this pure helper — keeping both
 * on the line identity and the `OrderItem.variantLabel` snapshot.
 */

/**
 * Compose the cart-line variant label from the selected color and size.
 *
 * - both selected → `"Color / Size"` (e.g. `"Pink / 0.5mm"`)
 * - one selected  → that dimension alone (products carry either dimension)
 * - none          → `""` (the variant-less line identity)
 *
 * Each dimension is trimmed before joining, and an all-whitespace selection
 * counts as absent (defensive against admin-authored option labels).
 */
export function composeVariantLabel(color: string, size: string): string {
  const c = color.trim();
  const s = size.trim();
  if (c && s) return `${c} / ${s}`;
  return c || s;
}
