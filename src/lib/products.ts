import { db } from "@/lib/db";
import type { Prisma, Product } from "@prisma/client";

/** The exact shape ProductCard renders — parsed from a Prisma Product row. */
export type ProductCardData = {
  id: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  /** ElyBeauty color swatches (run-72) — the grid's dots. */
  colors: { name: string; hex: string }[];
  shortDescription: string;
};

export function parseImages(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function parseTags(json: string): string[] {
  return parseImages(json);
}

export type ParsedSpec = { label: string; value: string };

export function parseSpecs(json: string): ParsedSpec[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is ParsedSpec =>
        typeof v === "object" && v !== null && typeof (v as ParsedSpec).label === "string",
    );
  } catch {
    return [];
  }
}

export type ColorOption = { name: string; hex: string };

/** Parse the Product.colors JSON column (ElyBeauty variants, run-72). */
export function parseColors(json: string): ColorOption[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is ColorOption =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as ColorOption).name === "string" &&
        typeof (v as ColorOption).hex === "string",
    );
  } catch {
    return [];
  }
}

/** Parse the Product.sizes JSON column (ElyBeauty variants, run-72). */
export function parseSizes(json: string): string[] {
  return parseImages(json);
}

/**
 * Project a Prisma Product into the card shape (S81-1: the display
 * categories are many-to-many and the card renders none of them — the
 * retired single-FK param is gone).
 */
export function toCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    name: product.name,
    image: parseImages(product.images)[0] ?? "/images/placeholder.svg",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.badge,
    colors: parseColors(product.colors),
    shortDescription: product.shortDescription,
  };
}

export type ProductQuery = {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  onlyActive?: boolean;
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
] as const;

/**
 * The /shop category-param resolution (S81-2 — the reference's dual filter
 * mode, measured live + the entity API).
 *
 * The reference filters on TWO parallel category systems: a value matching
 * a DISPLAY category (its pills/tiles pass IDs; the clone's stand-in is the
 * category slug) filters the many-to-many memberships and renders the
 * category's NAME as the h1; ANY other value filters the TEMPLATE category
 * STRING (equality) — the nav/footer ?category=skincare/body_care/sets
 * links — rendering h1 "Shop" with NO pill active. An unknown value simply
 * matches no row's template string (0 products), exactly like the
 * reference's own Category slugs (beautytools matches nothing).
 */
export type CategoryFilterResolution =
  | { kind: "none" }
  | { kind: "display"; slug: string }
  | { kind: "template"; value: string };

export function resolveCategoryFilter(
  param: string | undefined,
  activeCategorySlugs: ReadonlySet<string>,
): CategoryFilterResolution {
  const value = param?.trim() ?? "";
  if (value === "") return { kind: "none" };
  if (activeCategorySlugs.has(value)) return { kind: "display", slug: value };
  return { kind: "template", value };
}

/** The display-category include every product-card query shares (S81-1).
 *  S82-4: ordered by the category's sortOrder (name as the tie-break) so
 *  the "first" display category is DETERMINISTIC — the dual-member product
 *  (Bestsellers + Beauty Tools) feeds the product page's JSON-LD block and
 *  detail eyebrow, and the dashboard low-stock label, through
 *  `firstCategoryName`; an unordered relation read is row-order dependent
 *  (audit 82-a INFO-2). S83-4: /admin/analytics reads its own inline
 *  select (not this include) — it carries the same ordering there.
 *  `satisfies` (not `as const` — a readonly orderBy array is rejected by
 *  Prisma's include type) keeps the literal shape while validating it. */
export const productCategoryInclude = {
  categories: {
    orderBy: [{ category: { sortOrder: "asc" } }, { category: { name: "asc" } }],
    include: { category: { select: { id: true, name: true, slug: true } } },
  },
} satisfies Prisma.ProductInclude;

/** The first display-category name (admin tables, JSON-LD) or null. */
export function firstCategoryName(
  product: { categories: { category: { name: string } }[] },
): string | null {
  return product.categories[0]?.category.name ?? null;
}

/**
 * Storefront product query — search + the S81-2 dual category filter +
 * sort + pagination (24/page since S81-5: the reference renders the whole
 * 19-product catalog on ONE page; the pager survives as the >24 superset).
 */
export async function queryProducts(query: ProductQuery) {
  const perPage = query.perPage ?? 24;
  const page = Math.max(1, query.page ?? 1);

  // The dual filter mode: resolve against the ACTIVE display categories
  // first (one indexed query); everything else is a template filter.
  const activeSlugs = new Set(
    (
      await db.category.findMany({
        where: { isActive: true },
        select: { slug: true },
      })
    ).map((c) => c.slug),
  );
  const resolution = resolveCategoryFilter(query.category, activeSlugs);

  const where = {
    isActive: query.onlyActive === false ? undefined : true,
    name: query.search ? { contains: query.search } : undefined,
    categories:
      resolution.kind === "display"
        ? { some: { category: { slug: resolution.slug, isActive: true } } }
        : undefined,
    templateCategory:
      resolution.kind === "template" ? { equals: resolution.value } : undefined,
  };

  const orderBy = (() => {
    switch (query.sort) {
      case "price-asc":
        return { price: "asc" as const };
      case "price-desc":
        return { price: "desc" as const };
      case "rating":
        return { rating: "desc" as const };
      case "name":
        return { name: "asc" as const };
      default:
        return { createdAt: "desc" as const };
    }
  })();

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    products: products.map((p) => toCardData(p)),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}
