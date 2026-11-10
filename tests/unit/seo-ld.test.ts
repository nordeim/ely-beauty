import { describe, expect, it } from "vitest";

import {
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebsiteJsonLd,
  productMetaDescription,
  siteBaseUrl,
} from "@/lib/seo";
import type { JsonLdObject } from "@/lib/seo";

const BASE = "https://homenest.example";

const PRODUCT = {
  id: "prod_knife",
  name: "Damascus Steel Chef Knife Set",
  shortDescription: "Hand-forged blades for the modern home chef.",
  description: "Full description of the knife set with many details.",
  images: "/images/knife-1.jpg,/images/knife-2.jpg",
  sku: "KN-SET-01",
  price: 19999,
  compareAtPrice: 27999,
  currency: "USD",
  stock: 24,
  rating: 4.7,
  reviewCount: 412,
  categoryName: "Kitchen Tools",
  url: `${BASE}/product/prod_knife`,
  brandName: "HomeNest Kitchen",
};

describe("buildProductJsonLd", () => {
  const ld = buildProductJsonLd(PRODUCT) as JsonLdObject & {
    offers: Record<string, unknown>;
    aggregateRating: Record<string, unknown>;
  };

  it("emits a schema.org Product with the core identity fields", () => {
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Product");
    expect(ld.name).toBe("Damascus Steel Chef Knife Set");
    expect(ld.sku).toBe("KN-SET-01");
    expect(ld.description).toBe(PRODUCT.shortDescription);
  });

  it("converts integer cents to decimal-dollar price strings", () => {
    expect(ld.offers.price).toBe(199.99);
    expect(ld.offers.priceCurrency).toBe("USD");
  });

  it("maps stock to the schema.org availability vocabulary", () => {
    expect(ld.offers.availability).toBe("https://schema.org/InStock");
    const out = buildProductJsonLd({ ...PRODUCT, stock: 0 }) as JsonLdObject & {
      offers: Record<string, unknown>;
    };
    expect(out.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("carries the offer url and item condition", () => {
    expect(ld.offers.url).toBe(`${BASE}/product/prod_knife`);
    expect(ld.offers.itemCondition).toBe("https://schema.org/NewCondition");
  });

  it("exposes the aggregate rating only when reviews exist", () => {
    expect(ld.aggregateRating.ratingValue).toBe(4.7);
    expect(ld.aggregateRating.reviewCount).toBe(412);
    const unreviewed = buildProductJsonLd({ ...PRODUCT, reviewCount: 0 }) as JsonLdObject & {
      aggregateRating?: unknown;
    };
    expect(unreviewed.aggregateRating).toBeUndefined();
  });

  it("parses the images JSON into an http(s)-absolute array", () => {
    expect(ld.image).toEqual([
      `${BASE}/images/knife-1.jpg`,
      `${BASE}/images/knife-2.jpg`,
    ]);
  });
});

describe("buildOrganizationJsonLd", () => {
  it("emits the Organization node with contact + social surface", () => {
    const ld = buildOrganizationJsonLd({
      baseUrl: BASE,
      name: "HomeNest Kitchen",
      description: "Premium home & kitchen products",
      email: "hello@homenest.com",
      phone: "+1 (555) 123-4567",
      socials: [`${BASE}/facebook`, `${BASE}/instagram`],
    }) as JsonLdObject & { contactPoint: Record<string, unknown>; sameAs: string[] };

    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toBe(BASE);
    expect(ld.sameAs).toEqual([`${BASE}/facebook`, `${BASE}/instagram`]);
    expect(ld.contactPoint.email).toBe("hello@homenest.com");
  });

  it("omits sameAs when there are no social links", () => {
    const ld = buildOrganizationJsonLd({
      baseUrl: BASE,
      name: "HomeNest Kitchen",
      description: "x",
      email: "",
      phone: "",
      socials: [],
    }) as JsonLdObject & { sameAs?: string[]; contactPoint?: unknown };
    expect(ld.sameAs).toBeUndefined();
    expect(ld.contactPoint).toBeUndefined();
  });
});

describe("buildWebsiteJsonLd", () => {
  it("emits a WebSite node with the typeahead SearchAction", () => {
    const ld = buildWebsiteJsonLd({ baseUrl: BASE, name: "HomeNest Kitchen" }) as JsonLdObject & {
      potentialAction: { target: string };
    };
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.url).toBe(BASE);
    expect(ld.potentialAction.target).toBe(`${BASE}/shop?q={search_term_string}`);
  });
});

// --- session-6 S6-14: priceValidUntil (Google rich-result recommendation) ---
describe("buildProductJsonLd — priceValidUntil (session-6)", () => {
  it("emits offers.priceValidUntil as a YYYY-MM-DD date about a year out", () => {
    const ld = buildProductJsonLd(PRODUCT) as JsonLdObject & { offers: Record<string, unknown> };
    const value = ld.offers.priceValidUntil;
    expect(typeof value).toBe("string");
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const parsed = new Date(`${value as string}T00:00:00Z`).getTime();
    expect(Number.isNaN(parsed)).toBe(false);
    const yearAhead = Date.now() + 360 * 24 * 60 * 60 * 1000;
    expect(parsed).toBeGreaterThanOrEqual(yearAhead);
  });
});

// --- session-6 S6-4: shared canonical base-URL helper -----------------------
describe("siteBaseUrl (session-6)", () => {
  it("returns NEXT_PUBLIC_SITE_URL when set, trailing slashes stripped", () => {
    expect(siteBaseUrl("https://shop.example.com/")).toBe("https://shop.example.com");
    expect(siteBaseUrl("https://shop.example.com")).toBe("https://shop.example.com");
  });

  it("falls back to localhost:3000 when unset or empty", () => {
    expect(siteBaseUrl(undefined)).toBe("http://localhost:3000");
    expect(siteBaseUrl("")).toBe("http://localhost:3000");
  });

  // S92-1 (audit 92-a LOW-1): a whitespace-only NEXT_PUBLIC_SITE_URL is
  // truthy, so the pre-fix helper returned it verbatim — every page then
  // threw at `new URL(siteUrl)` (a 500 site-wide) while the baked sitemap
  // emitted broken origins. Whitespace trims BEFORE the fallback decision;
  // surrounding whitespace on a real value trims before use (the db-path.ts
  // trim convention).
  it("treats a whitespace-only value as unset (S92-1)", () => {
    expect(siteBaseUrl("   ")).toBe("http://localhost:3000");
    expect(siteBaseUrl("\t\n")).toBe("http://localhost:3000");
  });

  it("trims surrounding whitespace before composing the base (S92-1)", () => {
    expect(siteBaseUrl("  https://shop.example.com  ")).toBe("https://shop.example.com");
    expect(siteBaseUrl(" https://shop.example.com/ ")).toBe("https://shop.example.com");
  });
});

// --- S96-1: the meta-description fallback chain (audit 96-a L-8) ------------
// The run-95 content resync left natural-bamboo-hair-brush-oval with BOTH
// shortDescription AND description empty (the reference's owner ships the
// oval with no copy at all) — the detail page's two-term chain
// `shortDescription || description` then shipped an EMPTY meta/OG/Twitter/
// JSON-LD description, exhausting the S76-8 "never an empty-string meta"
// invariant. The reference itself ships a GENERIC meta ("Product Detail on
// ElyBeauty. A high-fashion…") on every product page, so the clone's
// per-product metas are a superset; the invariant is restored with a
// name-based third term rather than regressing to the generic.
describe("productMetaDescription — the S96-1 fallback chain", () => {
  it("prefers the short description when present", () => {
    expect(productMetaDescription(PRODUCT)).toBe(PRODUCT.shortDescription);
  });

  it("falls back to the long description when the short is empty", () => {
    expect(productMetaDescription({ ...PRODUCT, shortDescription: "" })).toBe(PRODUCT.description);
  });

  it("treats a null shortDescription the same as an empty one", () => {
    expect(productMetaDescription({ ...PRODUCT, shortDescription: null })).toBe(PRODUCT.description);
  });

  it("falls back to the name-based line when BOTH fields are empty (the oval reality)", () => {
    const both = productMetaDescription({ ...PRODUCT, shortDescription: "", description: "" });
    expect(both).toBe("Damascus Steel Chef Knife Set — ElyBeauty");
    expect(both.length).toBeGreaterThan(0);
  });

  // S97-3 (audit 97-a N6): a whitespace-only field is truthy in the || chain
  // and would ship as the meta. The schema trims upstream, but the helper
  // owns the never-empty invariant — so it trims its own terms.
  it("treats a whitespace-only shortDescription as empty (falls through to the description)", () => {
    expect(productMetaDescription({ ...PRODUCT, shortDescription: "   " })).toBe(PRODUCT.description);
  });

  it("renders the name-based line when both fields are whitespace-only", () => {
    const ws = productMetaDescription({ ...PRODUCT, shortDescription: " \t ", description: "  " });
    expect(ws).toBe("Damascus Steel Chef Knife Set — ElyBeauty");
  });
});

describe("buildProductJsonLd — the S96-1 description fallback", () => {
  it("renders the name-based fallback when both copy fields are empty (not an empty string)", () => {
    const empty = buildProductJsonLd({
      ...PRODUCT,
      shortDescription: "",
      description: "",
    }) as JsonLdObject;
    expect(empty.description).toBe("Damascus Steel Chef Knife Set — ElyBeauty");
  });
});
