/**
 * Guarded category deletion (session-17 S17-1; S81-1 many-to-many seam).
 *
 * `deleteCategoryAction` used to be check-then-write: count the products,
 * then deleteMany the category. The relation is a Restrict FK, so a product
 * linked in the window between the count and the delete raises P2003 —
 * which no catch in the action mapped (every sibling admin error path was
 * narrowed by S13-5). The escaped rejection surfaced as the generic S13-2
 * toast instead of an actionable message.
 *
 * The pre-delete count stays the fast-fail UX check (it owns the precise
 * "N products still use this category." message); the authoritative gate is
 * the FK itself — the delete's P2003 maps to the same "in use" outcome with
 * an unknown count. Any other error rethrows (the S13-2 contract: unknown
 * errors are deliberately surfaced, never swallowed).
 *
 * S81-1: the count is now the ProductCategory JUNCTION-row count (for one
 * categoryId each junction row IS a distinct member product); the Restrict
 * FK lives on the junction's categoryId column.
 */
import { isForeignKeyViolation } from "@/lib/prisma-errors";

/** The minimal Prisma-client surface the guarded delete touches. */
export interface CategoryWriteClient {
  productCategory: { count(args: { where: { categoryId: string } }): Promise<number> };
  category: { deleteMany(args: { where: { id: string } }): Promise<{ count: number }> };
}

export type DeleteCategoryOutcome =
  | { outcome: "deleted" }
  | { outcome: "not-found" }
  /** `productCount` is null when the FK itself flagged the race (count unknown). */
  | { outcome: "in-use"; productCount: number | null };

export async function deleteCategoryIfEmpty(
  db: CategoryWriteClient,
  id: string,
): Promise<DeleteCategoryOutcome> {
  const productCount = await db.productCategory.count({ where: { categoryId: id } });
  if (productCount > 0) return { outcome: "in-use", productCount };

  try {
    const result = await db.category.deleteMany({ where: { id } });
    return result.count === 0 ? { outcome: "not-found" } : { outcome: "deleted" };
  } catch (error) {
    if (isForeignKeyViolation(error)) return { outcome: "in-use", productCount: null };
    throw error;
  }
}
