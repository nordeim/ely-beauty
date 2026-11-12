// S114-2 — the api-seam-counts drift net (audit 114-a INFO-1)
//
// Audit 114-a found the standing "10 files/14 sites" parseJsonBody seam-count
// narrative was not exactly replicable: the measurable reality is 10 route
// files consuming the bounded body seam at 12 invocation sites (11
// `await parseJsonBody(` + 1 `await readRawBody(`). No counting method
// (imports, handlers, exports) reproduces 14 — the number originated in the
// run-79 audit vocabulary and was copied forward by four cycles of audit
// narratives without independent measurement (the run-113 lesson: an
// unpinned count is a debt that compounds quietly).
//
// These pins read the route sources directly (the S99-1
// filesystem-derivation convention, like docs-counts and schema-defaults):
// the seam's file count, the invocation-site count with its per-seam
// breakdown, and the zero-raw-parse ban that makes the net non-vacuous —
// a future route that parses `request.json()`/`request.text()` directly, or
// any seam growth a doc narrative then miscounts, fails HERE, by name.
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const API_ROOT = join(process.cwd(), "src", "app", "api");

/** Every route.ts under src/app/api (recursively), relative-posix named. */
function listRouteFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name === "route.ts") out.push(full);
    }
  };
  walk(API_ROOT);
  return out;
}

const routeFiles = listRouteFiles();
const routeSources = new Map(routeFiles.map((f) => [f, readFileSync(f, "utf8")]));

const countMatches = (src: string, re: RegExp) => [...src.matchAll(re)].length;
// Stateless detectors (matchAll needs the g flag; a stateful global regex's
// lastIndex would leak between .test() calls and miss files — caught RED).
const hasParseJson = (src: string) => countMatches(src, /await\s+parseJsonBody\(/g) > 0;
const hasReadRaw = (src: string) => countMatches(src, /await\s+readRawBody\(/g) > 0;

const seamConsumingFiles = routeFiles.filter((f) => {
  const src = routeSources.get(f) ?? "";
  return hasParseJson(src) || hasReadRaw(src);
});
const parseJsonSites = routeFiles.reduce(
  (sum, f) => sum + countMatches(routeSources.get(f) ?? "", /await\s+parseJsonBody\(/g),
  0,
);
const readRawSites = routeFiles.reduce(
  (sum, f) => sum + countMatches(routeSources.get(f) ?? "", /await\s+readRawBody\(/g),
  0,
);

describe("S114 — the api-seam-counts net (audit 114-a INFO-1)", () => {
  it("S114-2a: the bounded body seam is consumed by exactly 10 route files at exactly 12 invocation sites", () => {
    // The measured geometry (audit 114-a, independently re-measured):
    // 10 files — newsletter, coupon/apply, contact, addresses, cart, cart/bulk,
    // checkout, wishlist, stripe/payment-intent, stripe/webhook — at 12 sites:
    // 11 `await parseJsonBody(` (addresses ×2, cart ×2, the other seven ×1)
    // and 1 `await readRawBody(` (the Stripe webhook's constructEvent payload).
    // A change here MUST update the live-tense narratives in the same commit
    // (the count-lockstep discipline this pin now enforces at the source).
    expect(
      seamConsumingFiles.length,
      "route files consuming the bounded body seam",
    ).toBe(10);
    expect(parseJsonSites, "await parseJsonBody( invocation sites").toBe(11);
    expect(readRawSites, "await readRawBody( invocation sites").toBe(1);
    expect(
      parseJsonSites + readRawSites,
      "total bounded-seam invocation sites",
    ).toBe(12);
  });

  it("S114-2b: no route parses a raw request body outside the seam module", () => {
    // The anchor that makes this net non-vacuous: the ONLY sanctioned
    // `request.text()` site is src/lib/json-body.ts itself (the seam), and NO
    // route ever calls `request.json()` — a raw-parse violation (the class the
    // seam exists to close, S79-7) fails this pin by file name, as does any
    // future route that bypasses the seam with a hand-rolled read.
    const offenders: string[] = [];
    for (const [file, src] of routeSources) {
      if (/request\.json\(\)/.test(src)) offenders.push(`${file}: request.json()`);
      if (/request\.text\(\)/.test(src)) offenders.push(`${file}: request.text()`);
    }
    expect(
      offenders,
      "raw body parses inside route files (the seam is src/lib/json-body.ts)",
    ).toEqual([]);
  });
});
