import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { parseImages } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { clampSearchTerm } from "@/lib/validation";

/** GET /api/search?q=… — typeahead search over active products. */
export async function GET(request: NextRequest) {
  try {
    // Typeahead fires per keystroke — generous but metered (120/min per IP) so
    // a scripted client can't hammer the catalog for free (session-5 S5-8).
    const ipLimit = rateLimit(`search:${clientIp(request.headers)}`, 120, 60_000);
    if (!ipLimit.ok) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSec ?? 60) } });
    }

    // Same 100-char cap every search surface applies via clampSearchTerm
    // (session-9 S9-7; single-sourced in validation.ts since S15-4) — an
    // oversized term feeds three LIKE clauses for nothing.
    const q = clampSearchTerm(request.nextUrl.searchParams.get("q") ?? "");
    if (q.length < 2) return NextResponse.json({ results: [] });

    const products = await db.product.findMany({
      where: {
        isActive: true,
        // S77-4 (D-3, measured live): the reference's typeahead matches the
        // LONG description too — "silk" returns the Sandalwood Paddle
        // Hairbrush there purely through "silky" in its long copy. The
        // contains clauses are substring matches on SQLite, so "silk"
        // hitting "silky" is exactly the reference's behavior.
        OR: [
          { name: { contains: q } },
          { shortDescription: { contains: q } },
          { tags: { contains: q } },
          { description: { contains: q } },
        ],
      },
      orderBy: {
        // S77-4 (D-4): the authored catalog order (the seed's backdated
        // createdAt renders index 0 first) — the reference's result order,
        // not a rating sort.
        createdAt: "desc",
      },
      take: 8,
    });

    return NextResponse.json({
      results: products.map((p) => ({
        id: p.id,
        name: p.name,
        image: parseImages(p.images)[0] ?? "/images/placeholder.svg",
        price: p.price,
        // S77-3 (D-2): the row's visible copy is the shortDescription
        // ("" renders no line — the reference's no-copy products show name +
        // price only; this is NOT the metadata fallback, which uses the
        // long copy). The category label is gone from the rows.
        description: p.shortDescription,
      })),
    });
  } catch {
    // Sibling-consistent error shape (session-7 S7-11): a failed query is a
    // JSON { error } 500, never Next's generic error page.
    return NextResponse.json({ error: "Something went wrong searching. Please try again." }, { status: 500 });
  }
}
