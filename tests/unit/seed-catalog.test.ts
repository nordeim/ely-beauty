// S15-2 (session 15, re-pinned run-72) — the seed-owned catalog constants,
// pinned at the layer that can actually import `prisma/seed.ts` (Vitest
// transpiles it; Playwright cannot — its CJS transform rejects the seed's
// `import.meta` execution guard).
//
// The storefront e2e spec consumes these assumptions (19-product ElyBeauty
// catalog in the live reference's authored order, 4 categories, 2-page
// pagination at 12/page); the restore-demo-stock harness keeps the live demo
// DB aligned with them (stock AND isActive since S15-2). If a seed change
// moves any value here, re-check the storefront/shopping-flow e2e
// assumptions in the same change.
//
// Run-72 note: the reference lists several products with stock 0 (sold-out
// pieces stay visible in its grid — verified live). The seed mirrors that
// data; the "restore harness" pins below therefore assert INTEGER stock
// (>= 0), not positive stock.
import { describe, expect, it } from "vitest";

import { PRODUCTS } from "../../prisma/seed";

describe("seed catalog constants (S15-2, run-72)", () => {
  it("ships the 19-product ElyBeauty reference catalog the e2e pins assume", () => {
    expect(PRODUCTS).toHaveLength(19);
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(19);
  });

  it("carries the reference's authored titles verbatim (S74-13 — the massager casing)", () => {
    // The live reference's authored title is "Full silicon scalp massager"
    // (all lowercase after "Full"); the seed had title-cased it. Content
    // parity: render the reference's authored string.
    const massager = PRODUCTS.find((p) => p.slug === "full-silicon-scalp-massager");
    expect(massager?.name).toBe("Full silicon scalp massager");
    // The authored-order neighbors keep their exact titles too (guard
    // against any future "cleanup" drift on the visible strings).
    expect(PRODUCTS.find((p) => p.slug === "exfoliating-body-gloves")?.name).toBe(
      "Exfoliating Body Gloves | 100% Natural Viscose Fiber",
    );
  });

  it("opens with the reference's authored order (run-72 live re-baseline)", () => {
    // The reference's /shop "Newest" order, card-for-card, fetched live from
    // its public entity API on 2026-11-08 (docs/reference-investigation.md).
    expect(PRODUCTS.slice(0, 6).map((p) => p.slug)).toEqual([
      "premium-double-sided-ruffles-silk-hair-bonnet",
      "pure-satin-silk-pillowcase",
      "heatless-hair-curler-set",
      "natural-bamboo-hair-brush-square",
      "sandalwood-paddle-hairbrush-oval",
      "sandalwood-hairbrush-oval",
    ]);
    // The full 19-slug tail, in order.
    expect(PRODUCTS.slice(6).map((p) => p.slug)).toEqual([
      "natural-bamboo-hair-brush-oval",
      "stainless-steel-gua-sha",
      "exfoliating-body-gloves",
      "facial-threading-tool",
      "moisturizing-spa-socks",
      "crystal-hair-remover",
      "full-silicon-scalp-massager",
      "derma-roller-titanium",
      "derma-stamp-titanium",
      "travel-silicone-mask-applicator-set-4-pcs",
      "wooden-cleansing-brush",
      "anti-cellulite-dry-body-brush",
      "facial-ice-bowl",
    ]);
  });

  it("carries the category rows the /shop category-filter pins assume", () => {
    expect(PRODUCTS.filter((p) => p.category === "beauty-tools").length).toBe(10);
    expect(PRODUCTS.filter((p) => p.category === "brush-combs").length).toBe(6);
    expect(PRODUCTS.filter((p) => p.category === "bestsellers").length).toBe(3);
  });

  it("fills page 1 of the 12-per-page /shop grid (pagination pin reaches page 2)", () => {
    expect(PRODUCTS.length).toBeGreaterThan(12);
    expect(PRODUCTS.length).toBeLessThanOrEqual(24);
  });

  it("spans 3 product-bearing categories (gift-sets is seeded with no products — reference-true)", () => {
    expect(new Set(PRODUCTS.map((p) => p.category)).size).toBe(3);
    expect(PRODUCTS.find((p) => p.category === "gift-sets")).toBeUndefined();
  });

  it("every product carries the fields the restore harness restores against", () => {
    for (const p of PRODUCTS) {
      expect(typeof p.slug).toBe("string");
      expect(Number.isInteger(p.stock)).toBe(true);
      expect(p.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it("prices are whole-taka BDT cents (the reference's ৳ grid prices)", () => {
    for (const p of PRODUCTS) {
      expect(p.price % 100).toBe(0);
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it("variant-bearing products parse (colors/sizes on the ElyBeauty catalog)", () => {
    const pillowcase = PRODUCTS.find((p) => p.slug === "pure-satin-silk-pillowcase");
    expect(pillowcase?.colors?.map((c) => c.name)).toEqual(["Pink", "Navy Blue", "Sky Blue", "Black"]);
    const roller = PRODUCTS.find((p) => p.slug === "derma-roller-titanium");
    expect(roller?.sizes).toEqual(["0.5mm", "1.0mm"]);
  });
});
