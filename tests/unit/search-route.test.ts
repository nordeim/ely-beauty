// Session 77 S77-4, resynced run 95 S95-1 — /api/search matches the
// reference's field coverage, result order, and row payload.
//
// The run-77 live re-measurement: "silk" returns FOUR rows on the reference
// (the Sandalwood Paddle Hairbrush matches only through "silky" in its LONG
// description) vs the clone's two (name/shortDescription/tags only), and the
// reference renders results in the AUTHORED catalog order (createdAt desc =
// the seed's backdated order) while the clone ordered by rating. The payload
// also swaps `category` for `description` — the reference's rows show the
// product's shortDescription line, not a category label.
//
// The run-95 re-measurement (S95-1): the reference's owner RESTRUCTURED the
// product content since run 77 — the marketing paragraphs now live in
// short_description and description holds feature lists (or nothing), and
// the reference's overlay matches title + short_description + tags ONLY.
// Measured live: "Silkfare" (only in the massager's description) → 0 rows;
// "Nano" (only in the Crystal's description) → 0; "spa-like"
// (short_description) → 1; "bastseller" (tag) → 2; "SILK" → 4
// (case-insensitive). The S77-4 description clause would now OVER-match
// against the resynced content ("Silkfare" → the massager), so it is gone.
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/search/route";

const db = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({ db }));

function nextReq(url: string): NextRequest {
  return new NextRequest(`http://localhost:3000${url}`);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/search — the S77 reference parity (D-3 + D-4), resynced S95-1", () => {
  it("matches title + shortDescription + tags only — the long description is NOT searched (S95-1)", async () => {
    db.product.findMany.mockResolvedValue([]);
    await GET(nextReq("/api/search?q=silk"));

    const call = db.product.findMany.mock.calls[0]?.[0];
    const or = call?.where?.OR as Array<Record<string, unknown>>;
    expect(Array.isArray(or)).toBe(true);
    const fields = or.map((clause) => Object.keys(clause)[0]);
    expect(fields).toContain("name");
    expect(fields).toContain("shortDescription");
    expect(fields).toContain("tags");
    // The run-95 live measurement: "Silkfare" (only in a description) and
    // "Nano" (only in a description) both return ZERO rows on the reference
    // — the description clause is gone.
    expect(fields).not.toContain("description");
    expect(fields).toHaveLength(3);
  });

  it("orders results by the authored catalog order (createdAt desc), not rating", async () => {
    db.product.findMany.mockResolvedValue([]);
    await GET(nextReq("/api/search?q=silk"));

    const call = db.product.findMany.mock.calls[0]?.[0];
    expect(call?.orderBy).toEqual({ createdAt: "desc" });
    expect(JSON.stringify(call?.orderBy)).not.toContain("rating");
  });

  it("the payload carries description (the shortDescription), not category", async () => {
    db.product.findMany.mockResolvedValue([
      {
        id: "prod-1",
        name: "Pure Satin Silk Pillowcase",
        images: '["/images/pillowcase-main.jpg"]',
        price: 28800,
        shortDescription: "Sleep in smooth comfort.",
        description: "The long copy.",
        category: { name: "Brush & Combs", slug: "brush-combs" },
      },
      {
        id: "prod-2",
        name: "Bonnet",
        images: "[]",
        price: 37000,
        shortDescription: "",
        description: "The long bonnet copy.",
        category: { name: "Beauty Tools", slug: "beauty-tools" },
      },
    ]);

    const res = await GET(nextReq("/api/search?q=silk"));
    const data = (await res.json()) as {
      results?: Array<{ id: string; description?: string; category?: string; image?: string }>;
    };

    expect(data.results?.[0]).toMatchObject({
      id: "prod-1",
      description: "Sleep in smooth comfort.",
    });
    // The empty shortDescription passes through as "" (the row renders no
    // description line for it) — NOT the long-description metadata fallback.
    expect(data.results?.[1]).toMatchObject({ id: "prod-2", description: "" });
    // The category label is gone from the payload.
    expect(data.results?.[0]?.category).toBeUndefined();
    // The image falls back to the placeholder when the array is empty.
    expect(data.results?.[1]?.image).toBe("/images/placeholder.svg");
  });

  it("keeps the active-only filter and the 8-row cap", async () => {
    db.product.findMany.mockResolvedValue([]);
    await GET(nextReq("/api/search?q=silk"));

    const call = db.product.findMany.mock.calls[0]?.[0];
    expect(call?.where?.isActive).toBe(true);
    expect(call?.take).toBe(8);
  });
});

describe("GET /api/search — the S78 1-character floor (D-2)", () => {
  it("a 1-character query reaches the catalog (the reference's floor is 1, not 2)", async () => {
    db.product.findMany.mockResolvedValue([
      {
        id: "prod-1",
        name: "Pure Satin Silk Pillowcase",
        images: '["/images/pillowcase-main.jpg"]',
        price: 28800,
        shortDescription: "Sleep in smooth comfort.",
        description: "The long copy.",
      },
    ]);

    // S78-2 (D-2, measured live on the reference): a 1-char query ("e")
    // returns a full 8-row result set there; the clone's 2-char gate
    // returned [] before the query ever ran.
    const res = await GET(nextReq("/api/search?q=e"));
    const data = (await res.json()) as { results?: Array<{ id: string }> };
    expect(db.product.findMany).toHaveBeenCalledTimes(1);
    expect(data.results?.[0]).toMatchObject({ id: "prod-1" });
  });

  it("an empty or whitespace-only query still short-circuits to []", async () => {
    await GET(nextReq("/api/search?q="));
    await GET(nextReq("/api/search?q=%20%20"));
    expect(db.product.findMany).not.toHaveBeenCalled();
  });
});
