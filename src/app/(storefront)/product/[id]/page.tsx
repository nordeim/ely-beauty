import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { parseColors, parseImages, parseSizes, toCardData } from "@/lib/products";
import { buildProductJsonLd, jsonLdScript, siteBaseUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistIds } from "@/lib/wishlist";
import { ProductCard } from "@/components/store/product-card";
import { StarRating } from "@/components/store/star-rating";

import { ProductGallery } from "./product-gallery";
import { PurchasePanel } from "./purchase-panel";
import { ReviewForm } from "./review-form";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    select: { name: true, shortDescription: true, images: true },
  });
  if (!product) return { title: "Product not found" };
  // First product image as the share card (root-relative store path — the
  // only form imageUrlSchema accepts since S7-6). metadataBase resolves the
  // relative path to an absolute URL for crawlers. External hosts would need
  // a CSP img-src widening decision first.
  const firstImage = parseImages(product.images)[0];
  const ogImages = firstImage ? [firstImage] : ["/images/og-default.png"];
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `${siteBaseUrl()}/product/${id}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.shortDescription,
      url: `${siteBaseUrl()}/product/${id}`,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      images: ogImages,
    },
  };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const reviewsParam = Number.parseInt(Array.isArray(sp.reviews) ? (sp.reviews[0] ?? "1") : (sp.reviews ?? "1"), 10);
  const reviewsPage = Number.isFinite(reviewsParam) && reviewsParam > 0 ? Math.min(reviewsParam, 1000) : 1;
  const [product, user, settings] = await Promise.all([
    db.product.findUnique({
      where: { id, isActive: true },
      include: { category: { select: { name: true, slug: true } } },
    }),
    getCurrentUser(),
    getSettings().catch(() => null),
  ]);
  if (!product) notFound();

  const [reviewCount, related, wishlistIds] = await Promise.all([
    db.review.count({ where: { productId: product.id } }),
    // "Complete the Ritual" — the reference renders 3 related pieces.
    db.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: { category: { select: { name: true, slug: true } } },
    }),
    // Session-11 S11-2: the detail-page heart renders the filled state.
    getWishlistIds(),
  ]);
  // Honest pagination (session-6 S6-9): one page of reviews plus the real
  // total — never a silent cap that hides data. Out-of-range pages snap back
  // to 1 (same UX contract as /shop?page=).
  const REVIEW_PAGE_SIZE = 5;
  const reviewsPages = Math.max(1, Math.ceil(reviewCount / REVIEW_PAGE_SIZE));
  const reviewsPageSafe = Math.min(reviewsPage, reviewsPages);
  const reviews = reviewCount
    ? await db.review.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: "desc" },
        skip: (reviewsPageSafe - 1) * REVIEW_PAGE_SIZE,
        take: REVIEW_PAGE_SIZE,
      })
    : [];

  const images = parseImages(product.images);
  const colors = parseColors(product.colors);
  const sizes = parseSizes(product.sizes);

  // schema.org/Product structured data — drives rich results (price, stock,
  // stars). Pure builder unit-pinned in tests/unit/seo-ld.test.ts.
  const productJsonLd = buildProductJsonLd({
    id: product.id,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    images: product.images,
    sku: product.sku,
    price: product.price,
    currency: "BDT",
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    categoryName: product.category.name,
    url: `${siteBaseUrl()}/product/${product.id}`,
    brandName: settings?.storeName ?? "ElyBeauty",
  });

  return (
    <div className="container-page flex flex-col gap-14 py-10 sm:py-14">
      <script
        type="application/ld+json"
        // Serialized through jsonLdScript (session-7 S7-9): `<` and line
        // separators are escaped so even an admin-authored string (name /
        // description) can never terminate the element early — the old
        // "builder-shaped strings only" assumption did not hold for admins.
        dangerouslySetInnerHTML={{ __html: jsonLdScript(productJsonLd) }}
      />
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Shop
        </Link>
      </div>

      {/* Two-column detail */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* LEFT — gallery */}
        <ProductGallery images={images} name={product.name} />

        {/* RIGHT — summary + purchase + description (reference anatomy) */}
        <div className="flex flex-col">
          {/* S74-6 (P-5, measured): the reference renders the product's
              category as a micro-label eyebrow above the title. */}
          <p className="eyebrow-label mb-3 text-muted-foreground">{product.category.name}</p>
          <h1 className="font-display text-3xl font-light leading-tight tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold text-foreground">{formatMoney(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatMoney(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="mt-4 flex items-center gap-2 text-sm font-medium" aria-live="polite">
            {product.stock > 0 ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden />
                <span className="text-emerald-800">
                  In Stock{product.stock < 10 ? ` — only ${product.stock} left` : ""}
                </span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" aria-hidden />
                <span className="text-destructive">Out of Stock</span>
              </>
            )}
          </p>

          <PurchasePanel
            productId={product.id}
            stock={product.stock}
            colors={colors}
            sizes={sizes}
            initialInWishlist={wishlistIds.has(product.id)}
            productName={product.name}
          />

          {/* DESCRIPTION / HOW TO USE / INGREDIENTS — the reference's
              right-column content sections. */}
          <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8">
            <section aria-labelledby="description-title">
              <h2 id="description-title" className="eyebrow-label mb-3 text-foreground">
                Description
              </h2>
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </div>
            </section>
            {product.howToUse && (
              <section aria-labelledby="how-to-use-title">
                <h2 id="how-to-use-title" className="eyebrow-label mb-3 text-foreground">
                  How to Use
                </h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.howToUse}
                </div>
              </section>
            )}
            {product.ingredients && (
              <section aria-labelledby="ingredients-title">
                <h2 id="ingredients-title" className="eyebrow-label mb-3 text-foreground">
                  Ingredients
                </h2>
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.ingredients}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Reviews (superset surface) */}
      <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24 border-t border-border pt-10">
        <h2 id="reviews-title" className="font-display text-2xl font-light tracking-tight sm:text-3xl">
          Customer Reviews
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
              <p className="font-display text-5xl font-light leading-none">{product.rating.toFixed(1)}</p>
              <div>
                <StarRating rating={product.rating} size={18} />
                <p className="mt-1 text-sm text-muted-foreground">
                  Based on {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="py-8 text-sm text-muted-foreground">
                No reviews yet. Be the first to share your experience.
              </p>
            ) : (
              <ul className="flex flex-col">
                {reviews.map((review) => (
                  <li key={review.id} className="border-b border-border py-6 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground"
                      >
                        {review.author.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                      <div>
                        <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
                          {review.author}
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
                              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                              Verified Purchase
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} className="mt-2.5" />
                    {review.title && <p className="mt-2 text-sm font-semibold text-foreground">{review.title}</p>}
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
            {reviewsPages > 1 && (
              <nav aria-label="Review pages" className="mt-6 flex items-center gap-3 text-sm">
                {reviewsPageSafe > 1 ? (
                  <Link
                    href={`/product/${product.id}?reviews=${reviewsPageSafe - 1}#reviews`}
                    className="border border-border px-3 py-1.5 transition-colors hover:bg-secondary"
                  >
                    Previous
                  </Link>
                ) : (
                  <span aria-disabled className="border border-border px-3 py-1.5 text-muted-foreground/50">
                    Previous
                  </span>
                )}
                <span className="text-muted-foreground">
                  Page {reviewsPageSafe} of {reviewsPages}
                </span>
                {reviewsPageSafe < reviewsPages ? (
                  <Link
                    href={`/product/${product.id}?reviews=${reviewsPageSafe + 1}#reviews`}
                    className="border border-border px-3 py-1.5 transition-colors hover:bg-secondary"
                  >
                    Next
                  </Link>
                ) : (
                  <span aria-disabled className="border border-border px-3 py-1.5 text-muted-foreground/50">
                    Next
                  </span>
                )}
              </nav>
            )}
          </div>

          <ReviewForm productId={product.id} authorName={user?.name ?? null} />
        </div>
      </section>

      {/* Complete the Ritual — the reference's related section. */}
      {related.length > 0 && (
        <section aria-labelledby="related-title">
          <h2 id="related-title" className="mb-8 font-display text-2xl font-light tracking-tight sm:text-3xl">
            Complete the Ritual
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={toCardData(p, p.category)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
