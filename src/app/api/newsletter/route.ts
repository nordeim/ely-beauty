import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { firstError, newsletterSchema } from "@/lib/validation";
import { parseJsonBody } from "@/lib/json-body";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/newsletter — subscribe an email (idempotent). */
export async function POST(request: NextRequest) {
  try {
    // S79-7: the limiter runs BEFORE the parse — garbage/oversize bodies
    // are metered, and the bounded seam caps the read at 32KB.
    const limit = rateLimit(`newsletter:${clientIp(request.headers)}`, 5, 60_000);
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec ?? 60) } });
    }
    const body = await parseJsonBody(request);
    if (body === null) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }

    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: {},
      create: { email: parsed.data.email },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
