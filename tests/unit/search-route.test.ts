// Session 77 S77-4 — /api/search matches the reference's field coverage,
// result order, and row payload.
//
// The run-77 live re-measurement: "silk" returns FOUR rows on the reference
// (the Sandalwood Paddle Hairbrush matches only through "silky" in its LONG
// description) vs the clone's two (name/shortDescription/tags only), and the
// reference renders results in the AUTHORED catalog order (createdAt desc =
// the seed's backdated order) while the clone ordered by rating. The payload
// also swaps `category` for `description` — the reference's rows show the
// product's shortDescription line, not a category label.
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

describe("GET /api/search — the S77 reference parity (D-3 + D-4)", () => {
  it("searches the long description too (the OR clause includes description)", async () => {
    db.product.findMany.mockResolvedValue([]);
    await GET(nextReq("/api/search?q=silk"));

    const call = db.product.findMany.mock.calls[0]?.[0];
    const or = call?.where?.OR as Array<Record<string, unknown>>;
    expect(Array.isArray(or)).toBe(true);
    const fields = or.map((clause) => Object.keys(clause)[0]);
    expect(fields).toContain("name");
    expect(fields).toContain("shortDescription");
    expect(fields).toContain("tags");
    expect(fields).toContain("description");
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
