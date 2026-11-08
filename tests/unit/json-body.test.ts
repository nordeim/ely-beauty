/**
 * Session 79 S79-7 — the bounded JSON body seam.
 *
 * Audit 79-a (A-2, MEDIUM): every JSON API route parsed `await
 * request.json()` unbounded, with the rate limiter engaging only AFTER a
 * successful parse + Zod pass — oversized/garbage payloads were never
 * metered and were buffered whole into memory. The shared `parseJsonBody`
 * seam (src/lib/json-body.ts) closes the read side: a declared
 * content-length over the cap fast-fails, a streamed body over the cap is
 * cancelled mid-read, a non-JSON content-type is refused, and malformed
 * JSON keeps the exact "null → 400 Invalid JSON body." contract the routes
 * already render (pinned by tests/unit/api-boundaries.test.ts).
 */
import { describe, expect, it } from "vitest";

import { MAX_JSON_BODY_BYTES, MAX_RAW_BODY_BYTES, parseJsonBody, readRawBody } from "@/lib/json-body";

function jsonRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost:3000/api/test", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("parseJsonBody — the bounded JSON body seam (S79-7)", () => {
  it("parses a valid JSON body (the passthrough contract)", async () => {
    const body = await parseJsonBody(jsonRequest(JSON.stringify({ hello: "world" })));
    expect(body).toEqual({ hello: "world" });
  });

  it("maps malformed JSON to null (the routes' existing 400 shape)", async () => {
    expect(await parseJsonBody(jsonRequest("{not json"))).toBeNull();
  });

  it("refuses a declared content-length over the cap without reading the body", async () => {
    const request = jsonRequest("{}".padEnd(MAX_JSON_BODY_BYTES + 1, " "), {
      // A declared length over the cap fast-fails before any buffering.
      "content-length": String(MAX_JSON_BODY_BYTES + 1),
    });
    expect(await parseJsonBody(request)).toBeNull();
  });

  it("cancels a streamed body past the cap (no content-length declared)", async () => {
    // A ReadableStream body carries no content-length — the reader must
    // count bytes and cancel at the cap instead of buffering the whole
    // payload into memory.
    const payload = "x".repeat(MAX_JSON_BODY_BYTES + 1024);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(payload));
        controller.close();
      },
    });
    const request = new Request("http://localhost:3000/api/test", {
      method: "POST",
      body: stream,
      headers: { "content-type": "application/json" },
      duplex: "half",
    } as RequestInit);
    expect(await parseJsonBody(request)).toBeNull();
  });

  it("refuses a non-JSON content-type (the CSRF-relevant gate)", async () => {
    // Form-encoded bodies (a cross-site form POST) carry
    // application/x-www-form-urlencoded — the JSON parse used to reject
    // them by accident; the seam now refuses them by design.
    const urlencoded = new Request("http://localhost:3000/api/test", {
      method: "POST",
      body: "email=attacker@example.com",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    expect(await parseJsonBody(urlencoded)).toBeNull();
  });

  it("accepts a JSON content-type with a charset parameter", async () => {
    const request = jsonRequest(JSON.stringify({ ok: true }), {
      "content-type": "application/json; charset=utf-8",
    });
    expect(await parseJsonBody(request)).toEqual({ ok: true });
  });

  it("refuses a missing content-type", async () => {
    const request = new Request("http://localhost:3000/api/test", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
    });
    expect(await parseJsonBody(request)).toBeNull();
  });

  it("the cap is a sane bound for every schema the API accepts", () => {
    // The largest legit payload is the checkout body (an address + notes);
    // 32 KB is ~10x its observed maximum. Pin the constant so a refactor
    // cannot silently drop it to something the checkout would trip on —
    // or inflate it into uselessness.
    expect(MAX_JSON_BODY_BYTES).toBe(32 * 1024);
  });
});

describe("readRawBody — the bounded raw-body seam (S80-3, audit 80-a L-1)", () => {
  it("round-trips the exact raw bytes under the cap (the webhook's constructEvent contract)", async () => {
    // constructEvent is byte-sensitive: the raw text that reaches the HMAC
    // must be byte-identical to what request.text() would have returned.
    const payload = JSON.stringify({ id: "evt_123", type: "payment_intent.succeeded" });
    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
    });
    expect(await readRawBody(request)).toBe(payload);
  });

  it("returns the empty string for an empty body (an empty webhook POST is not a refusal)", async () => {
    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: "",
      headers: { "content-type": "application/json" },
    });
    expect(await readRawBody(request)).toBe("");
  });

  it("does NOT gate on content-type (constructEvent owns the payload's meaning)", async () => {
    // Unlike parseJsonBody, the raw seam never parses — the content-type is
    // irrelevant to the HMAC over the bytes (Stripe posts JSON, but the seam
    // must not refuse a body on content-type grounds).
    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: '{"id":"evt_1"}',
      headers: { "content-type": "application/octet-stream" },
    });
    expect(await readRawBody(request)).toBe('{"id":"evt_1"}');
  });

  it("fast-fails a declared content-length over the cap without reading the body", async () => {
    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: "{}".padEnd(64, " "),
      headers: {
        "content-type": "application/json",
        // A declared length over the cap fast-fails before any buffering.
        "content-length": String(MAX_RAW_BODY_BYTES + 1),
      },
    });
    expect(await readRawBody(request)).toBeNull();
  });

  it("cancels a streamed body past the cap (no content-length declared)", async () => {
    // The DoS shape from audit 80-a L-1: an unauthenticated POST with a
    // huge streamed body. The reader must count bytes and cancel mid-read
    // instead of buffering the whole payload before constructEvent can
    // reject the signature.
    const payload = "x".repeat(MAX_RAW_BODY_BYTES + 4096);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(payload));
        controller.close();
      },
    });
    const request = new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body: stream,
      headers: { "content-type": "application/json" },
      duplex: "half",
    } as RequestInit);
    expect(await readRawBody(request)).toBeNull();
  });

  it("honors a custom cap (the seam is parameterized, the default is the webhook's)", async () => {
    // A Request body can be read once — each read gets its own Request.
    const mk = () =>
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        body: "0123456789",
        headers: { "content-type": "application/json" },
      });
    expect(await readRawBody(mk(), 5)).toBeNull();
    expect(await readRawBody(mk(), 10)).toBe("0123456789");
  });

  it("the default cap is 64 KB — generous for Stripe events, merciless for junk", () => {
    // Stripe events (no object expansions — this app mints plain PaymentIntents
    // and listens for charges/refunds) are tens of KB at most; 64 KB is the
    // documented ceiling with margin. Pin the constant so a refactor cannot
    // silently drop or inflate it.
    expect(MAX_RAW_BODY_BYTES).toBe(64 * 1024);
  });
});
