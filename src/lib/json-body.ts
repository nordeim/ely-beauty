/**
 * The bounded JSON body seam (session 79 S79-7, audit 79-a A-2).
 *
 * Every JSON API route used to parse `await request.json()` unbounded, with
 * the per-route rate limiter engaging only AFTER a successful parse + Zod
 * pass — an oversized or garbage payload was never metered and was buffered
 * whole into memory before any gate ran. This seam closes the read side:
 *
 * - a `content-type` that is not `application/json` (form-encoded CSRF
 *   probes, octet-stream junk) is refused outright — the JSON parse used to
 *   reject them by accident, now it is by design;
 * - a declared `content-length` over {@link MAX_JSON_BODY_BYTES}
 *   fast-fails before any read;
 * - a streamed body past the cap is CANCELLED mid-read, so the payload is
 *   never fully buffered;
 * - malformed JSON returns null — the EXACT contract the routes already
 *   render as 400 "Invalid JSON body." (pinned by
 *   tests/unit/api-boundaries.test.ts; changing the null shape would break
 *   every route's error envelope).
 *
 * The largest legitimate payload is the checkout body (address + notes,
 * ~2 KB observed); the cap is ~10x that with margin for admin tooling.
 * Pinned by tests/unit/json-body.test.ts.
 */

/** The body-read ceiling: 32 KB. */
export const MAX_JSON_BODY_BYTES = 32 * 1024;

/**
 * The raw-body ceiling (session 80 S80-3, audit 80-a L-1): 64 KB.
 *
 * The Stripe webhook reads its constructEvent payload through
 * {@link readRawBody} — the events this app listens for (plain
 * PaymentIntents, charges, refunds — no object expansions) are tens of
 * KB at most; 64 KB is the documented ceiling with margin.
 */
export const MAX_RAW_BODY_BYTES = 64 * 1024;

function isJsonContentType(request: Request): boolean {
  const contentType = request.headers.get("content-type");
  if (contentType === null) return false;
  return contentType.toLowerCase().includes("application/json");
}

/**
 * Read the request body as text, bounded to `maxBytes`.
 *
 * The shared byte-walk for both seams: a declared `content-length` over
 * the cap fast-fails before any read, and a streamed body past the cap is
 * CANCELLED mid-read so an attacker-supplied payload is never fully
 * buffered into memory.
 *
 * @returns the body text, or `null` when refused as too large.
 */
async function readBodyTextBounded(request: Request, maxBytes: number): Promise<string | null> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const declaredBytes = Number(declared);
    if (!Number.isNaN(declaredBytes) && declaredBytes > maxBytes) return null;
  }

  if (request.body) {
    // Streamed body: count bytes chunk-by-chunk and cancel past the cap so
    // an attacker-supplied payload is never fully buffered into memory.
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    let cancelled = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value === undefined) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        cancelled = true;
        try {
          await reader.cancel();
        } catch {
          // The stream may already be closed — the cap decision stands.
        }
        break;
      }
      chunks.push(value);
    }
    if (cancelled) return null;
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder().decode(merged);
  }

  const text = await request.text();
  return text.length > maxBytes ? null : text;
}

/**
 * Read a RAW request body defensively (byte-sensitive consumers).
 *
 * For consumers that need the exact payload text — the Stripe webhook's
 * `constructEvent` HMAC — with the same bounded-read guarantees as
 * {@link parseJsonBody} but WITHOUT the content-type gate or JSON parse:
 * the consumer owns the payload's meaning.
 *
 * @returns the raw body text, or `null` when refused as too large.
 */
export async function readRawBody(
  request: Request,
  maxBytes: number = MAX_RAW_BODY_BYTES,
): Promise<string | null> {
  return readBodyTextBounded(request, maxBytes);
}

/**
 * Parse a JSON request body defensively.
 *
 * @returns the parsed value, or `null` for ANY refusal (wrong type, too
 *   large, malformed) — the caller renders its existing 400 envelope.
 */
export async function parseJsonBody(request: Request): Promise<unknown> {
  if (!isJsonContentType(request)) return null;

  const text = await readBodyTextBounded(request, MAX_JSON_BODY_BYTES);
  if (text === null) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
