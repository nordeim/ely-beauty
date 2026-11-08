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

import { MAX_JSON_BODY_BYTES, parseJsonBody } from "@/lib/json-body";

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
