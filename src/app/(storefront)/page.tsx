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

      <div className="container-page flex flex-col gap-16 py-16 sm:gap-20 sm:py-20">
        {/* Shop by Ritual */}
        <section aria-labelledby="shop-by-ritual">
          <h2 id="shop-by-ritual" className="font-display text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            Shop by Ritual
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        </section>

        {/* Curated for You */}
        <section aria-labelledby="curated-for-you">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 id="curated-for-you" className="font-display text-4xl font-light tracking-tight text-foreground sm:text-5xl">
              Curated for You
            </h2>
            <Link href="/shop" className="link-cta text-foreground">
              View All
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
            {curated.map((p, i) => (
              <ProductCard key={p.id} product={toCardData(p, p.category)} priority={i < 3} />
            ))}
          </div>
        </section>
      </div>

      {/* Complete Your Ritual — the inset photographic banner. */}
      <section className="container-page">
        <div className="relative overflow-hidden">
          <Image
            src="/images/ritual-banner.png"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" aria-hidden />
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-20 text-center sm:py-28">
            <p className="eyebrow-label text-white">The Signature Set</p>
            <h2 className="font-display text-4xl font-light tracking-tight text-white sm:text-6xl">
              Complete Your Ritual
            </h2>
            <Link href="/shop?category=gift-sets" className="link-cta mt-2 text-white">
              Discover Sets
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
      <div className="h-16 sm:h-20" />
    </div>
  );
}
