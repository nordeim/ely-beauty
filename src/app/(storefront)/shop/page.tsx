import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { clampSearchTerm } from "@/lib/validation";
import { db } from "@/lib/db";
import { siteBaseUrl } from "@/lib/seo";
import { resolveCategoryFilter, SORT_OPTIONS, queryProducts } from "@/lib/products";
import { ProductCard } from "@/components/store/product-card";

import { ShopControls } from "./shop-controls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Premium Skincare & Beauty Tools",
  description:
    "Browse the full ElyBeauty collection — beauty tools, brushes & combs, and curated gift sets, with category and sort filters.",
  // Faceted URLs (?q=&category=&sort=&page=) canonicalize to the un-parameterized
  // listing — the standard duplicate-content dedup for filter permutations.
  alternates: { canonical: `${siteBaseUrl()}/shop` },
};

const PER_PAGE = 24; // S81-5: the reference renders the whole 19-product catalog on ONE page
const MAX_PAGE = 1000; // sanity clamp against hand-typed ?page= URLs

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Build a /shop href preserving q/category/sort; page 1 stays off the URL. */
function buildHref(q: string, category: string, sort: string, page: number): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (sort && sort !== "newest") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

/** 1 … (c-1) c (c+1) … N with ellipsis markers where pages are skipped. */
function paginationPages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set<number>([1, total]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) wanted.add(p);
  }
  const sorted = Array.from(wanted).sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("ellipsis");
    out.push(p);
    prev = p;
  }
  return out;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = clampSearchTerm(firstParam(sp.q));
  const category = firstParam(sp.category).trim();
  const sortRaw = firstParam(sp.sort).trim();
  const sortValues: readonly string[] = SORT_OPTIONS.map((o) => o.value);
  const sort = sortValues.includes(sortRaw) ? sortRaw : "";
  const pageRaw = Number.parseInt(firstParam(sp.page) || "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, MAX_PAGE) : 1;

  const [categories, result] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, imageUrl: true },
    }),
    queryProducts({
      search: q || undefined,
      category: category || undefined,
      sort: sort || undefined,
      page,
      perPage: PER_PAGE,
    }),
  ]);

  // S81-2: the reference's h1 — the DISPLAY category's name under a
  // display filter, "Shop" under any other category param (the template
  // filters and unknown values), "All Products" unfiltered.
  const activeCategorySlugs = new Set(categories.map((c) => c.slug));
  const resolution = resolveCategoryFilter(category || undefined, activeCategorySlugs);
  const heading =
    resolution.kind === "display"
      ? (categories.find((c) => c.slug === resolution.slug)?.name ?? "Shop")
      : resolution.kind === "template"
        ? "Shop"
        : "All Products";

  // Snap a stale out-of-range page (?page=99) back to the last real page.
  const effective =
    result.products.length === 0 && result.page > result.totalPages && result.total > 0
      ? await queryProducts({
          search: q || undefined,
          category: category || undefined,
          sort: sort || undefined,
          page: result.totalPages,
          perPage: PER_PAGE,
        })
      : result;
  const { products, total, page: currentPage, totalPages } = effective;

  const pageBtn =
    "inline-flex h-10 min-w-10 items-center justify-center border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary";

  return (
    // S73-5: the reference's shop header geometry — py-12 lg:py-20, the
    // title text-4xl lg:text-6xl, and the product count stacked BELOW the
    // title (left-aligned), not right-aligned opposite it.
    <div className="container-page flex flex-col gap-8 py-12 lg:py-20">
      {/* Title + count — the reference's editorial heading. */}
      <div>
        <h1 className="mb-4 font-display text-4xl font-light tracking-tight lg:text-6xl">{heading}</h1>
        {q && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing results for &ldquo;{q}&rdquo;
          </p>
        )}
        {/* S74-3: the count sits directly above the filter band — the band
            itself carries the hairline + pb-6/mb-12 rhythm (measured). */}
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {total} product{total === 1 ? "" : "s"}
        </p>
      </div>

      {/* Filter pills + sort */}
      <ShopControls
        q={q}
        category={category}
        sort={sort || "newest"}
        categories={categories}
        sortOptions={SORT_OPTIONS}
      />

      {/* Grid — the reference's 3-column editorial layout. */}
      {products.length === 0 ? (
        // S81-6 (measured live): the reference's empty state — a centered
        // py-20 block with the Cormorant 24px/300 heading and the muted
        // sub-copy. No border, no icon, no clear-filters link.
        <div className="text-center py-20">
          <p className="mb-2 font-display text-2xl font-light">No products found</p>
          <p className="text-sm text-muted-foreground">Check back soon for new arrivals.</p>
        </div>
      ) : (
        // S76-1 (D-1, measured): the reference's /shop grid rhythm — gap-6
        // (24px) mobile, lg:gap-x-8 lg:gap-y-12 (32/48) desktop, identical
        // to the home curated grid (was the 16px/40px gap pair → 373px
        // columns; the reference renders 363px cards in a 32px gutter).
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 3 && currentPage === 1} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Product pages" className="mt-2 flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={buildHref(q, category, sort, currentPage - 1)}
              className={pageBtn}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className={cn(pageBtn, "cursor-not-allowed opacity-40")} aria-hidden="true">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}

          {paginationPages(currentPage, totalPages).map((p, i) =>
            p === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex h-10 min-w-6 items-center justify-center text-sm text-muted-foreground"
              >
                &hellip;
              </span>
            ) : p === currentPage ? (
              <span
                key={p}
                aria-current="page"
                className={cn(
                  pageBtn,
                  "pointer-events-none border-foreground bg-foreground text-white hover:bg-foreground",
                )}
              >
                {p}
              </span>
            ) : (
              <Link key={p} href={buildHref(q, category, sort, p)} className={pageBtn} aria-label={`Page ${p}`}>
                {p}
              </Link>
            ),
          )}

          {currentPage < totalPages ? (
            <Link
              href={buildHref(q, category, sort, currentPage + 1)}
              className={pageBtn}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <span className={cn(pageBtn, "cursor-not-allowed opacity-40")} aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
