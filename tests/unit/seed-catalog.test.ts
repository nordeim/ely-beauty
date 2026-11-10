// S15-2 (session 15, re-pinned run-72) — the seed-owned catalog constants,
// pinned at the layer that can actually import `prisma/seed.ts` (Vitest
// transpiles it; Playwright cannot — its CJS transform rejects the seed's
// `import.meta` execution guard).
//
// The storefront e2e spec consumes these assumptions (19-product ElyBeauty
// catalog in the live reference's authored order, 4 display categories, the
// ONE-PAGE /shop grid at 24/page — S81-5); the restore-demo-stock harness
// keeps the live demo DB aligned with them (stock AND isActive since
// S15-2). If a seed change moves any value here, re-check the
// storefront/shopping-flow e2e assumptions in the same change.
//
// Run-72 note (superseded by S90-4): the reference listed several products
// with stock 0 at extraction time (sold-out pieces stay visible in its grid
// — verified live). Run-90 re-measurement: the reference RESTOCKED all four
// (active purchase panels on their detail pages); the seed mirrors the
// restock, and the S90-4 pin below asserts positive stock file-wide.
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

  it("carries the reference's display-category memberships (S81-1 — entity-API measured)", () => {
    // Captured from the reference's public entity API + its ID-link filters
    // (2026-11-09): products carry a category_ids ARRAY — many-to-many. The
    // Wooden cleansing brush is a DUAL member (Bestsellers AND Beauty Tools).
    const inCat = (slug: string) =>
      PRODUCTS.filter((p) => (p.categories ?? []).includes(slug)).map((p) => p.slug);
    // Beauty Tools = 7 (incl. the dual-member cleansing brush).
    expect(inCat("beauty-tools")).toEqual([
      "stainless-steel-gua-sha",
      "facial-threading-tool",
      "derma-roller-titanium",
      "derma-stamp-titanium",
      "travel-silicone-mask-applicator-set-4-pcs",
      "wooden-cleansing-brush",
      "facial-ice-bowl",
    ]);
    // Brush & Combs = 3.
    expect(inCat("brush-combs")).toEqual([
      "sandalwood-hairbrush-oval",
      "exfoliating-body-gloves",
      "anti-cellulite-dry-body-brush",
    ]);
    // Bestsellers = 4 (the cleansing brush's second membership).
    expect(inCat("bestsellers")).toEqual([
      "premium-double-sided-ruffles-silk-hair-bonnet",
      "pure-satin-silk-pillowcase",
      "heatless-hair-curler-set",
      "wooden-cleansing-brush",
    ]);
    // Gift Sets = 0 (the reference's empty category — reference-true).
    expect(inCat("gift-sets")).toEqual([]);
  });

  it("six reference-true products belong to NO display category (S81-1)", () => {
    // The reference's category_ids arrays are EMPTY for these six — they
    // surface only under All Products (and the template filters).
    const uncategorized = PRODUCTS.filter((p) => (p.categories ?? []).length === 0).map(
      (p) => p.slug,
    );
    expect(uncategorized).toEqual([
      "natural-bamboo-hair-brush-square",
      "sandalwood-paddle-hairbrush-oval",
      "natural-bamboo-hair-brush-oval",
      "moisturizing-spa-socks",
      "crystal-hair-remover",
      "full-silicon-scalp-massager",
    ]);
  });

  it("every product carries a template category (skincare ×12 / lip_care ×3 / body_care ×4 — S81-1)", () => {
    // The reference's `category` STRING field — drives the detail-page
    // breadcrumb eyebrow, the nav/footer slug filters, and the template
    // filter mode on /shop.
    const counts: Record<string, number> = {};
    for (const p of PRODUCTS) {
      expect(["skincare", "lip_care", "body_care"]).toContain(p.templateCategory);
      counts[p.templateCategory] = (counts[p.templateCategory] ?? 0) + 1;
    }
    expect(counts).toEqual({ skincare: 12, lip_care: 3, body_care: 4 });
  });

  it("fits the reference's ONE-PAGE /shop grid (S81-5 — 24/page, no pager at 19)", () => {
    expect(PRODUCTS.length).toBeGreaterThan(12);
    expect(PRODUCTS.length).toBeLessThanOrEqual(24);
  });

  it("spans 3 product-bearing display categories (gift-sets seeded empty — reference-true)", () => {
    const bearing = new Set<string>();
    for (const p of PRODUCTS) for (const c of p.categories ?? []) bearing.add(c);
    expect(bearing).toEqual(new Set(["beauty-tools", "brush-combs", "bestsellers"]));
  });

  it("every product carries the fields the restore harness restores against", () => {
    for (const p of PRODUCTS) {
      expect(typeof p.slug).toBe("string");
      expect(Number.isInteger(p.stock)).toBe(true);
      expect(p.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it("the four run-72 sold-out products are restocked (S90-4 — the live reference restocked them)", () => {
    // Run-90 live re-measurement: the reference's detail pages for the four
    // run-72 stock-0 products (Bonnet / Curler / Spa Socks / Ice Bowl) now
    // render active purchase panels (variants + ADD TO CART + BUY IT NOW) —
    // it restocked since the run-72 extraction. The seed mirrors: every
    // product now carries POSITIVE stock, so the clone's detail pages match
    // the reference's purchasable state.
    const byName = (frag: string) => PRODUCTS.find((p) => p.name.includes(frag));
    for (const frag of ["Bonnet", "Curler", "Socks", "Ice Bowl"]) {
      const hit = byName(frag);
      expect(hit, `seed product matching "${frag}"`).toBeTruthy();
      expect(hit!.stock, `"${frag}" restocked (S90-4)`).toBeGreaterThan(0);
    }
    // The whole catalog is purchasable now (no sold-out rows remain).
    for (const p of PRODUCTS) {
      expect(p.stock, `"${p.name}" positive stock (S90-4)`).toBeGreaterThan(0);
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

  it("S76 D-10: the bonnet carries NO badge (the reference's live card renders none)", () => {
    const bonnet = PRODUCTS.find((p) => p.slug === "premium-double-sided-ruffles-silk-hair-bonnet");
    expect(bonnet?.badge ?? null).toBeNull();
  });

  it("S76 D-11: the six reference-true no-description products ship empty card copy", () => {
    // Measured live on the reference's /shop grid 2026-11-08: these six
    // render name + price only (no 12px description line). The seed's copy
    // must match — the card line is data, not a code branch.
    const noDesc = [
      "premium-double-sided-ruffles-silk-hair-bonnet",
      "natural-bamboo-hair-brush-square",
      "natural-bamboo-hair-brush-oval",
      "facial-threading-tool",
      "moisturizing-spa-socks",
      "full-silicon-scalp-massager",
    ];
    for (const slug of noDesc) {
      expect(PRODUCTS.find((p) => p.slug === slug)?.shortDescription).toBe("");
    }
    // A description-bearing product keeps its card copy (the guard against
    // over-sweeping).
    expect(PRODUCTS.find((p) => p.slug === "pure-satin-silk-pillowcase")?.shortDescription).toContain(
      "Sleep in smooth comfort",
    );
  });

  it("S76 D-12: every product ships a 3-image gallery (the rail renders everywhere)", () => {
    for (const p of PRODUCTS) {
      expect(p.images).toHaveLength(3);
      expect(p.images[0]).toMatch(/^\/images\/product-/);
      expect(p.images[1]).toMatch(/-2\.png$/);
      expect(p.images[2]).toMatch(/-3\.png$/);
    }
  });
});

describe("seed content resync (S95-2 — the reference's run-95 content)", () => {
  // The reference's owner restructured the product content since run-77:
  // the marketing paragraphs now live in short_description, description
  // holds feature lists (or nothing), how_to_use is empty for ALL 19, and
  // the authored quirks are verbatim (the S74-13 convention). Measured via
  // the reference's public entities API + the live detail/overlay/cards.

  it("the reference's restructured copy: paragraphs in shortDescription, feature-lists/empties in description", () => {
    const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
    // The Bonnet's description is the reference's current copy.
    expect(bySlug("premium-double-sided-ruffles-silk-hair-bonnet")?.description).toContain(
      "Protect your hair day and night",
    );
    // The Pillowcase's shortDescription is the reference's full paragraph.
    expect(bySlug("pure-satin-silk-pillowcase")?.shortDescription).toContain(
      "Sleep in smooth comfort with our premium satin silk pillowcase",
    );
    // Three products carry EMPTY descriptions on the reference (their
    // detail pages render no Description section).
    for (const slug of ["heatless-hair-curler-set", "natural-bamboo-hair-brush-oval", "stainless-steel-gua-sha"]) {
      expect(bySlug(slug)?.description, `${slug} description empty (S95-2)`).toBe("");
    }
    // The Sandalwood Paddle's description is the reference's feature list.
    expect(bySlug("sandalwood-paddle-hairbrush-oval")?.description).toContain("Features -");
  });

  it("howToUse is empty for ALL 19 products (the reference renders no How to Use sections)", () => {
    for (const p of PRODUCTS) {
      expect(p.howToUse ?? "", `"${p.name}" howToUse empty (S95-2)`).toBe("");
    }
  });

  it("the Ice Bowl is the only ingredient-bearing product (the reference's run-95 data)", () => {
    for (const p of PRODUCTS) {
      if (p.slug === "facial-ice-bowl") {
        expect(p.ingredients ?? "").toContain("Key Features");
      } else {
        expect(p.ingredients ?? "", `"${p.name}" ingredients empty (S95-2)`).toBe("");
      }
    }
  });

  it("the authored quirks are verbatim: tags, the Bonnet size labels, the color spellings", () => {
    // The owner's tag spelling "bastseller" and the variant-label typos
    // are the reference's rendered truth (S74-13: content parity renders
    // the authored string, quirks included).
    const bonnet = PRODUCTS.find((p) => p.slug === "premium-double-sided-ruffles-silk-hair-bonnet");
    expect(bonnet?.tags).toEqual(["bastseller"]);
    expect(bonnet?.sizes).toEqual(["Pink & Lovender", "Marron & Navy Blue", "Black & White"]);
    const brush = PRODUCTS.find((p) => p.slug === "wooden-cleansing-brush");
    expect(brush?.tags).toEqual(["sale", "bastseller"]);
    // The Dry Body Brush's clone-era "sale" tag is gone on the reference.
    expect(PRODUCTS.find((p) => p.slug === "anti-cellulite-dry-body-brush")?.tags).toEqual([]);
    // The massager's third color and the Curler's second color keep the
    // reference's spellings ("Biege", "Navy blue").
    const massager = PRODUCTS.find((p) => p.slug === "full-silicon-scalp-massager");
    expect(massager?.colors?.map((c) => c.name)).toEqual(["Pink", "Black", "Biege"]);
    const curler = PRODUCTS.find((p) => p.slug === "heatless-hair-curler-set");
    expect(curler?.colors?.map((c) => c.name)).toEqual(["Black", "Navy blue"]);
  });
});
