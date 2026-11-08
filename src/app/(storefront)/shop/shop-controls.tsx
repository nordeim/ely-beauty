"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export type CategoryOption = { slug: string; name: string; imageUrl?: string };
export type SortOption = { value: string; label: string };

/**
 * ShopControls — the reference's filter row (S74-3, live-measured
 * 2026-11-08): sharp-cornered category pills (px-4 py-2, ~34px tall — the
 * ACTIVE pill is a borderless solid near-black with text only; INACTIVE
 * pills carry a 16px round category thumbnail behind a hairline border in
 * muted foreground) plus a NATIVE select for sort (text-xs uppercase,
 * transparent, hairline border). The whole band closes with a hairline
 * bottom border (pb-6; with the page column's gap-8 the grid sits
 * 48px below the band — the reference's mb-12 rhythm). Each change rewrites the ?category/?sort
 * searchParams (resetting ?page) via router.push, so the whole listing
 * stays server-rendered.
 */
export function ShopControls({
  q,
  category,
  sort,
  categories,
  sortOptions,
}: {
  q: string;
  category: string;
  sort: string;
  categories: CategoryOption[];
  sortOptions: ReadonlyArray<SortOption>;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function update(next: { category?: string; sort?: string }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const nextCategory = next.category ?? category;
    if (nextCategory && nextCategory !== "all") params.set("category", nextCategory);
    const nextSort = next.sort ?? sort;
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/shop?${qs}` : "/shop");
    });
  }

  // The reference's pill pair (measured): active = borderless solid
  // bg-foreground/text-background, text only; inactive = hairline border,
  // muted foreground, hover to foreground, with the category thumbnail.
  const pillInactive =
    "flex items-center gap-2 border border-border bg-transparent px-4 py-2 text-xs uppercase tracking-[0.1em] text-muted-foreground transition-all duration-300 hover:text-foreground";
  const pillActive =
    "bg-foreground px-4 py-2 text-xs uppercase tracking-[0.1em] text-background transition-all duration-300";

  return (
    <div
      className={cn(
        "mb-4 flex w-full flex-wrap items-center justify-between gap-4 border-b border-border pb-6 transition-opacity",
        pending && "opacity-60",
      )}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update({ category: "all" })}
          aria-pressed={category === "" || category === "all"}
          className={cn(!category ? pillActive : pillInactive)}
        >
          All Products
        </button>
        {categories.map((c) => {
          const active = category === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => update({ category: c.slug })}
              aria-pressed={active}
              className={cn(active ? pillActive : pillInactive)}
            >
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt="" width={16} height={16} className="h-4 w-4 rounded-full object-cover" />
              ) : null}
              {c.name}
            </button>
          );
        })}
      </div>
      {/* The reference's sort: a NATIVE select, sharp, transparent, hairline
          border (measured: 35px tall, radius 0, 12px muted uppercase). */}
      <select
        id="sort-products"
        aria-label="Sort products"
        value={sort || "newest"}
        onChange={(e) => update({ sort: e.target.value })}
        className="border-border bg-transparent px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
