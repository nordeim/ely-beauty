"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CategoryOption = { slug: string; name: string; imageUrl?: string };
export type SortOption = { value: string; label: string };

/**
 * ShopControls — the reference's filter row: category PILL buttons (each
 * carrying its round category thumbnail; the active pill is solid
 * near-black) plus the sort combobox at the right. Each change rewrites the
 * ?category/?sort searchParams (resetting ?page) via router.push, so the
 * whole listing stays server-rendered.
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

  const pill =
    "inline-flex h-10 items-center gap-2 rounded-full border border-input bg-background px-4 text-xs font-medium uppercase tracking-[0.08em] text-foreground transition-colors hover:border-foreground";

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-2 transition-opacity lg:flex-nowrap",
        pending && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => update({ category: "all" })}
        aria-pressed={category === "" || category === "all"}
        className={cn(pill, !category && "border-foreground bg-foreground text-white hover:border-foreground")}
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
            className={cn(pill, active && "border-foreground bg-foreground text-white hover:border-foreground")}
          >
            {c.imageUrl ? (
              <Image src={c.imageUrl} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover" />
            ) : null}
            {c.name}
          </button>
        );
      })}
      <div className="ml-auto">
        <Select value={sort || "newest"} onValueChange={(value) => update({ sort: value })}>
          <SelectTrigger id="sort-products" aria-label="Sort products" className="h-10 w-40 rounded-full border-input bg-background text-xs font-medium uppercase tracking-[0.08em]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
