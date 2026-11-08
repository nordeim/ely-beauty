import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { siteBaseUrl } from "@/lib/seo";

import { db } from "@/lib/db";
import { toCardData } from "@/lib/products";
import { CategoryCard } from "@/components/store/category-card";
import { HeroCarousel } from "@/components/store/hero-carousel";
import { ProductCard } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: `${siteBaseUrl()}/` },
};

export default async function HomePage() {
  const [slides, categories, curated] = await Promise.all([
    db.carouselSlide.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    // "Curated for You" — the reference renders the newest 6 active products
    // (its own home query is `-created_date limit 6`); the seed's backdated
    // createdAt makes this the reference's authored order.
    db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { category: { select: { name: true, slug: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero — full-bleed under the transparent fixed header. */}
      <HeroCarousel
        slides={slides.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          image: s.image,
          ctaText: s.ctaText,
          ctaLink: s.ctaLink,
        }))}
      />

      {/* S75-3 (D-3, measured): the reference's section rhythm — each
        section owns its vertical padding (py-20 lg:py-32) inside its own
        container, the "Shop by Ritual" heading is CENTERED with mb-16,
        and the curated header rides mb-12 (the kitchen-era single
        gap-wrapper + left heading is gone). */}
      <section aria-labelledby="shop-by-ritual" className="py-20 lg:py-32">
        <div className="container-page">
          <h2
            id="shop-by-ritual"
            className="mb-16 text-center font-display text-4xl font-light tracking-tight text-foreground lg:text-5xl"
          >
            Shop by Ritual
          </h2>
          {/* S75-4 (D-4, measured): gap-6 lg:gap-8 (24/32px) — the
              reference's tile rhythm (was gap-4). */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                slug={cat.slug}
                name={cat.name}
                description={cat.description}
                imageUrl={cat.imageUrl}
              />
            ))}
          </div>
        </div>
      </section>

        {/* Curated for You */}
        <section aria-labelledby="curated-for-you" className="py-20 lg:py-32">
          <div className="container-page">
          <div className="mb-12 flex items-end justify-between gap-4">
            <h2 id="curated-for-you" className="font-display text-4xl font-light tracking-tight text-foreground lg:text-5xl">
              Curated for You
            </h2>
            {/* S74-9 (measured): the reference's VIEW ALL — a muted
                micro-label link with the trailing arrow, hidden below sm. */}
            <Link
              href="/shop"
              className="hidden items-center gap-2 text-xs font-normal uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              View All
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {/* S75-4 (D-4, measured): gap-6 lg:gap-x-8 lg:gap-y-12 — the
              reference's card rhythm. */}
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            {curated.map((p, i) => (
              <ProductCard key={p.id} product={toCardData(p, p.category)} priority={i < 3} />
            ))}
          </div>
          </div>
        </section>

      {/* Complete Your Ritual — the inset photographic banner. S75-5
          (D-5, measured): aspect-[21/9] md:aspect-[3/1] (1152×384 @1440;
          342×147 @390) — the reference's media geometry (was auto-height). */}
      <section className="py-20 lg:py-32">
        <div className="container-page">
          <div className="relative aspect-[21/9] overflow-hidden md:aspect-[3/1]">
            <Image
              src="/images/ritual-banner.png"
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" aria-hidden />
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="eyebrow-label text-white">The Signature Set</p>
              <h2 className="font-display text-4xl font-light tracking-tight text-white sm:text-6xl">
                Complete Your Ritual
              </h2>
              <Link href="/shop?category=gift-sets" className="link-cta mt-2 border-white/60 text-white hover:border-white">
                Discover Sets
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
