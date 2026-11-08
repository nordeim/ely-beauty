import { describe, expect, it } from "vitest";

import {
  parseImages,
  parseSpecs,
  parseTags,
  resolveCategoryFilter,
  toCardData,
  type ProductCardData,
} from "@/lib/products";
import type { Product } from "@prisma/client";

/** Minimal Product/Category fixtures cast from partials (schema-shape only). */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    slug: "damascus-steel-chef-knife-set",
    name: "Damascus Steel Chef Knife Set",
    shortDescription: "Professional 5-piece knife set.",
    description: "Professional 5-piece knife set with Damascus steel blades.",
    categoryId: "cat-1",
    price: 19999,
    compareAtPrice: 27999,
    cost: null,
    sku: "HN-KNIFE-001",
    stock: 24,
    rating: 4.9,
    reviewCount: 412,
    images: JSON.stringify(["/images/product-damascus-knife-set.png"]),
    tags: JSON.stringify(["Damascus steel", "professional"]),
    specs: JSON.stringify([
      { label: "Blade Material", value: "67-layer Damascus steel" },
      { label: "Pieces", value: "5 knives" },
    ]),
    colors: JSON.stringify([{ name: "Pink", hex: "#cb9d9d" }]),
    sizes: JSON.stringify(["0.5mm"]),
    howToUse: "Roll gently.",
    ingredients: "",
    badge: "Featured",
    isFeatured: true,
    isNewArrival: true,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  } as Product;
}

describe("parseImages / parseTags", () => {
  it("parses JSON string arrays", () => {
    expect(parseImages('["/a.png","/b.png"]')).toEqual(["/a.png", "/b.png"]);
    expect(parseTags('["steel","gift"]')).toEqual(["steel", "gift"]);
  });

  it("returns [] on malformed JSON or non-arrays", () => {
    expect(parseImages("not-json")).toEqual([]);
    expect(parseImages('{"a":1}')).toEqual([]);
    expect(parseImages("[1,2]")).toEqual([]);
    expect(parseImages("")).toEqual([]);
  });
});

describe("parseSpecs", () => {
  it("parses label/value pairs", () => {
    const specs = parseSpecs(makeProduct().specs);
    expect(specs).toEqual([
      { label: "Blade Material", value: "67-layer Damascus steel" },
      { label: "Pieces", value: "5 knives" },
    ]);
  });

  it("drops entries without a string label, keeps label-only entries", () => {
    expect(parseSpecs(JSON.stringify([{ label: "X" }, null, "nope"]))).toEqual([{ label: "X" }]);
    expect(parseSpecs(JSON.stringify([null, 42]))).toEqual([]);
  });
});

describe("toCardData", () => {
  it("projects the exact card shape", () => {
    const card: ProductCardData = toCardData(makeProduct());
    expect(card).toEqual({
      id: "prod-1",
      name: "Damascus Steel Chef Knife Set",
      image: "/images/product-damascus-knife-set.png",
      price: 19999,
      compareAtPrice: 27999,
      rating: 4.9,
      reviewCount: 412,
      badge: "Featured",
      colors: [{ name: "Pink", hex: "#cb9d9d" }],
      shortDescription: "Professional 5-piece knife set.",
    });
  });

  it("falls back to the placeholder image", () => {
    const card = toCardData(makeProduct({ images: "[]" }));
    expect(card.image).toBe("/images/placeholder.svg");
  });
});

describe("resolveCategoryFilter (S81-2 — the shop's dual filter mode)", () => {
  // The reference's /shop category param semantics (measured live + the
  // entity API): a value matching a DISPLAY category filters the
  // many-to-many memberships (h1 = the category's name); anything else
  // filters the TEMPLATE category string (h1 "Shop", no pill active).
  const active = new Set(["beauty-tools", "brush-combs", "bestsellers", "gift-sets"]);

  it("no param → none", () => {
    expect(resolveCategoryFilter(undefined, active)).toEqual({ kind: "none" });
    expect(resolveCategoryFilter("", active)).toEqual({ kind: "none" });
  });

  it("a display-category slug → display mode", () => {
    expect(resolveCategoryFilter("beauty-tools", active)).toEqual({
      kind: "display",
      slug: "beauty-tools",
    });
  });

  it("template values → template mode (the nav/footer skincare links)", () => {
    expect(resolveCategoryFilter("skincare", active)).toEqual({
      kind: "template",
      value: "skincare",
    });
    expect(resolveCategoryFilter("body_care", active)).toEqual({
      kind: "template",
      value: "body_care",
    });
    expect(resolveCategoryFilter("lip_care", active)).toEqual({
      kind: "template",
      value: "lip_care",
    });
    expect(resolveCategoryFilter("sets", active)).toEqual({ kind: "template", value: "sets" });
  });

  it("an INACTIVE display slug falls through to template mode (the display filter requires isActive)", () => {
    expect(resolveCategoryFilter("retired-cat", active)).toEqual({
      kind: "template",
      value: "retired-cat",
    });
  });

  it("unknown values → template mode (equality on a value no row carries → 0 products)", () => {
    expect(resolveCategoryFilter("zzz", active)).toEqual({ kind: "template", value: "zzz" });
    // The reference's Category-own slugs match nothing (only IDs filter display).
    expect(resolveCategoryFilter("beautytools", active)).toEqual({
      kind: "template",
      value: "beautytools",
    });
  });
});
