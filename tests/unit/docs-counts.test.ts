// S95-4 — the count-lockstep pin (the neo-crm mechanism, web-application
// skill §14: "the exact check totals live in the docs and must be updated
// in the same commit as any test change, or the docs rot — the proven fix
// is a docs-counts test that puts every live-tense count site under the
// unit gate").
//
// Audit 95-a found the PAD's live-tense body frozen five remediation eras
// back (737/634/79 vs 764; "19 models" vs 20) — only its append-only
// revision blocks ever carried the current numbers. This test pins every
// live-tense count site to ONE set of constants: when a count changes,
// update the constants below and every site that still carries the stale
// number fails HERE, by name — the sweep can no longer be forgotten.
//
// Historical session narratives (docs/session_*.md, REMEDIATION_PLAN
// execution logs, PAD revision blocks, SKILL Appendix B) are append-only
// history and deliberately NOT pinned — only live-tense claims are.
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// ── The single source of truth for the docs' live-tense counts ──────────
const UNIT_TESTS = 808;
const E2E_TESTS = 92;
const PRISMA_MODELS = 20;
// ─────────────────────────────────────────────────────────────────────────

const read = (rel: string): string => readFileSync(join(process.cwd(), rel), "utf8");

describe("docs-counts lockstep (S95-4) — every live-tense count site carries the same numbers", () => {
  it("README.md: the badge, the architecture table, the tree, and the testing commands", () => {
    const readme = read("README.md");
    const badge = readme.match(/tests-(\d+)_unit_·_(\d+)_e2e/);
    expect(badge, "README badge").toBeTruthy();
    expect(Number(badge![1]), "README badge unit count").toBe(UNIT_TESTS);
    expect(Number(badge![2]), "README badge e2e count").toBe(E2E_TESTS);
    expect(readme, "README architecture table row").toContain(`${UNIT_TESTS} unit · ${E2E_TESTS} e2e`);
    expect(readme, "README file-hierarchy tree").toContain(`Vitest · ${UNIT_TESTS}`);
    expect(readme, "README testing command").toContain(`# ${UNIT_TESTS} unit tests`);
    expect(readme, "README e2e command").toContain(`${E2E_TESTS} e2e tests`);
  });

  it("CLAUDE.md: the testing-strategy unit pin", () => {
    const claude = read("CLAUDE.md");
    expect(claude, "CLAUDE unit pin").toContain(`${UNIT_TESTS} pins`);
    expect(claude, "CLAUDE e2e pin").toContain(`(${E2E_TESTS} tests`);
  });

  it("Project_Architecture_Document.md: §1.2 stack table, §8.1/§8.2 headings, §12 key files", () => {
    const pad = read("Project_Architecture_Document.md");
    // The append-only revision blocks (header → "## Table of Contents") QUOTE
    // prior eras' numbers as history — the negative pins scope to the
    // live-tense body only.
    const padBody = pad.slice(pad.indexOf("## Table of Contents"));
    expect(pad, "PAD §1.2 Vitest row").toContain(`(${UNIT_TESTS} tests;`);
    expect(pad, "PAD §1.2 Playwright row").toContain(`${E2E_TESTS} tests incl.`);
    expect(pad, "PAD §8.1 heading").toContain(`node env — ${UNIT_TESTS} tests,`);
    expect(pad, "PAD §8.2 heading").toContain(`Playwright — ${E2E_TESTS} tests:`);
    expect(pad, "PAD §12 suites row").toContain(`${UNIT_TESTS} unit · ${E2E_TESTS} e2e`);
    // The frozen-era counts must be GONE from the live-tense body.
    expect(padBody, "PAD body must not carry the stale 737").not.toContain("737 tests");
    expect(padBody, "PAD body must not carry the stale 634-test heading").not.toContain("634 tests");
    expect(padBody, "PAD body must not carry the stale 79-test heading").not.toContain("79 tests");
  });

  it("PAD + SKILL + README: the 20-model claims (the run-94/95/97 de-drift family)", () => {
    const pad = read("Project_Architecture_Document.md");
    const padBody = pad.slice(pad.indexOf("## Table of Contents"));
    const skill = read("ely-beauty_SKILL.md");
    expect(pad, "PAD §4.1 heading model count").toContain(`(SQLite, ${PRISMA_MODELS} models)`);
    expect(pad, "PAD mermaid node").toContain(`${PRISMA_MODELS} models`);
    expect(pad, "PAD §12 schema row").toContain(`${PRISMA_MODELS} models / idempotent seed`);
    expect(padBody, "PAD body must not carry the stale 19-models claim").not.toContain("19 models");
    expect(skill, "SKILL §2 stack table model count").toContain(`SQLite, ${PRISMA_MODELS} models`);
    // S97-2 (audit 97-a N4/D1): README carried the stale "19 models" in its
    // architecture table AND its file-hierarchy tree while every other doc
    // said 20 — the lockstep net didn't cover README's model-count sites.
    // README is fully live-tense (no historical narrative), so the negative
    // pin scopes to the whole file.
    const readme = read("README.md");
    expect(readme, "README architecture table model count").toContain(
      `Prisma + SQLite | ^6.19 | ${PRISMA_MODELS} models;`,
    );
    expect(readme, "README file-hierarchy model count").toContain(
      `schema.prisma (${PRISMA_MODELS} models)`,
    );
    expect(readme, "README must not carry the stale 19-models claim").not.toContain("19 models");
  });

  it("ely-beauty_SKILL.md project_state carries the counts", () => {
    const skill = read("ely-beauty_SKILL.md");
    expect(skill, "SKILL project_state unit count").toContain(`${UNIT_TESTS} unit tests`);
    expect(skill, "SKILL project_state e2e count").toContain(`${E2E_TESTS} e2e tests`);
  });
});

// ── S98-1 — the enumeration lockstep (audit 98-a D1/D2/D4/N2) ────────────
// The count net above pins NUMBERS; audit 98-a found the docs' route/admin
// ENUMERATIONS silently rotting instead (CLAUDE listed 11-of-13 routes and
// 8-of-9 admin pages; SKILL §5 listed 10-of-13; AGENTS listed 9-of-13 while
// its own next sentence said "all 13 route files"). Prose inventories are
// pinned here the same way: the inventory is derived from the FILESYSTEM at
// test time (the api-boundaries S91-1 convention) and each doc's
// enumeration must set-equal it — a missing OR phantom entry fails by name.
const API_ROUTE_DIR = resolve(import.meta.dirname, "../../src/app/api");
const API_ROUTES = readdirSync(API_ROUTE_DIR, { recursive: true })
  .filter((f): f is string => typeof f === "string" && f.endsWith("route.ts"))
  .map((f) => f.replace(/[/\\]route\.ts$/, ""))
  .sort();

const ADMIN_DIR = resolve(import.meta.dirname, "../../src/app/(storefront)/admin");
// The dashboard IS the admin root page (admin/page.tsx renders the KPI
// surface — there is no dashboard/ folder). N9 (audit 99-a): the derivation
// RECURSES like the API-route one above — a future second-level
// admin/<section>/<sub>/page.tsx can no longer evade the pin silently.
const ADMIN_PAGES = readdirSync(ADMIN_DIR, { recursive: true })
  .filter((f): f is string => typeof f === "string" && f.endsWith("page.tsx"))
  // RED-phase lesson: the strip regex must carry the SAME extension as the
  // filter — `page\.ts$` silently no-ops on "page.tsx" (the x breaks the $)
  // and the derivation yields "analytics/page.tsx" literals.
  .map((f) => (f === "page.tsx" ? "dashboard" : f.replace(/[/\\]page\.tsx$/, "")))
  .sort();

/** Split a doc's parenthetical/table-cell enumeration into a sorted list. */
const enumerate = (raw: string): string[] =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();

describe("S98-1 — route-enumeration lockstep: the docs' route lists match the filesystem", () => {
  it("derives the 13-route inventory from src/app/api (the S91-1 convention)", () => {
    expect(API_ROUTES).toEqual([
      "addresses",
      "cart",
      "cart-summary",
      "cart/bulk",
      "checkout",
      "contact",
      "coupon/apply",
      "health",
      "newsletter",
      "search",
      "stripe/payment-intent",
      "stripe/webhook",
      "wishlist",
    ]);
  });

  it("AGENTS.md architecture-invariants enumeration set-equals the inventory", () => {
    const agents = read("AGENTS.md");
    const m = agents.match(/REST route handlers \(`src\/app\/api\/\*`\) for [^()]+\(([^)]+)\)/);
    expect(m, "AGENTS route enumeration present").toBeTruthy();
    expect(enumerate(m?.[1] ?? ""), "AGENTS enumeration must list exactly the live routes").toEqual(
      API_ROUTES,
    );
  });

  it("CLAUDE.md api enumeration set-equals the inventory", () => {
    const claude = read("CLAUDE.md");
    const m = claude.match(/`src\/app\/api\/` — REST route handlers \(([^)]+)\)/);
    expect(m, "CLAUDE api enumeration present").toBeTruthy();
    expect(enumerate(m?.[1] ?? ""), "CLAUDE enumeration must list exactly the live routes").toEqual(
      API_ROUTES,
    );
  });

  it("SKILL §5 api row set-equals the inventory", () => {
    const skill = read("ely-beauty_SKILL.md");
    const m = skill.match(/\| `src\/app\/api\/` \| route handlers \| ([^|]+)\|/);
    expect(m, "SKILL §5 api row present").toBeTruthy();
    expect(enumerate(m?.[1] ?? ""), "SKILL §5 row must list exactly the live routes").toEqual(
      API_ROUTES,
    );
  });
});

describe("S98-2 — admin-page enumeration lockstep (audit 98-a D2)", () => {
  it("derives the 9-page inventory from src/app/(storefront)/admin", () => {
    expect(ADMIN_PAGES).toEqual([
      "analytics",
      "carousel",
      "categories",
      "coupons",
      "dashboard",
      "orders",
      "payments",
      "products",
      "settings",
    ]);
  });

  it("CLAUDE.md admin enumeration set-equals the inventory", () => {
    const claude = read("CLAUDE.md");
    const m = claude.match(/role-gated back office \(([^)]+)\)/);
    expect(m, "CLAUDE admin enumeration present").toBeTruthy();
    expect(enumerate(m?.[1] ?? ""), "CLAUDE enumeration must list exactly the live admin pages").toEqual(
      ADMIN_PAGES,
    );
  });
});

describe("S98-3 — stale-claim negatives (audit 98-a D3/N1/N3)", () => {
  it("CLAUDE.md carries no stale 'demo payment (no processor)' sentence (session-61 reality)", () => {
    const claude = read("CLAUDE.md");
    expect(claude).not.toContain("demo payment (no processor)");
    expect(claude, "the removed 'no real charge' notice surface must not be guarded").not.toContain(
      '"no real charge"',
    );
  });

  it("AGENTS.md carries no dangling session_114.md pointer (HomeNest-era file, dropped run-72)", () => {
    expect(read("AGENTS.md")).not.toContain("session_114.md");
  });

  it("the AUTH_SECRET command is single-sourced on openssl rand -hex 32 (the gate's own error)", () => {
    const envExample = read(".env.example");
    const deployment = read("docs/DEPLOYMENT.md");
    expect(envExample).not.toContain("openssl rand -base64 32");
    expect(deployment).not.toContain("openssl rand -base64 32");
    expect(envExample, ".env.example teaches the hex form").toContain("openssl rand -hex 32");
    expect(deployment, "DEPLOYMENT.md teaches the hex form").toContain("openssl rand -hex 32");
  });
});

// ── S99-1 — the dangling-doc-pointer class net (audit 99-a D1/N1/N2) ──────
// S98-5 fixed ONE dangling pointer (AGENTS's docs/session_114.md) with a
// file-specific negative; audit 99-a found three MORE of the same class
// surviving in sibling live-tense docs (SKILL §7.4's heading → session_113.md,
// CLAUDE's testing bullet → session_113.md, AGENTS's build-config section →
// build_error.txt) — single-file negatives cannot see the class. The net
// derives the real docs/ inventory from the FILESYSTEM and pins that every
// docs/<path> reference in each LIVE-TENSE scope resolves on disk; a dangle
// fails BY NAME in the assertion diff. Historical scopes (SKILL Appendix
// B's era-accurate narratives, the PAD's append-only revision blocks) are
// deliberately exempt — the S96-8 boundary note documents the dropped files.
const DOCS_DIR = resolve(import.meta.dirname, "../../docs");
const DOCS_FILES = new Set(
  readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name),
);
const DOCS_DIRS = new Set(
  readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name),
);

/** Every docs/<path> reference in `text` that does not resolve on disk. */
const danglingDocRefs = (text: string): string[] => {
  const danglers = new Set<string>();
  for (const m of text.matchAll(/docs\/([A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*)/g)) {
    const ref = (m[1] ?? "").replace(/\/+$/, "");
    if (ref && !existsSync(join(DOCS_DIR, ref))) danglers.add(ref);
  }
  return [...danglers].sort();
};

describe("S99-1 — dangling-doc-pointer class net: live-tense docs reference only real docs/ files", () => {
  it("derives the docs/ inventory from the filesystem (session logs + guides + screenshots dir)", () => {
    expect(DOCS_FILES.size, "the docs corpus is non-trivial").toBeGreaterThanOrEqual(70);
    expect(DOCS_FILES.has("session_1.md")).toBe(true);
    expect(DOCS_FILES.has("DEPLOYMENT.md")).toBe(true);
    expect(DOCS_DIRS.has("screenshots")).toBe(true);
  });

  it("AGENTS.md references no missing docs/ file", () => {
    expect(danglingDocRefs(read("AGENTS.md")), "AGENTS dangling docs/ refs").toEqual([]);
  });

  it("CLAUDE.md references no missing docs/ file", () => {
    expect(danglingDocRefs(read("CLAUDE.md")), "CLAUDE dangling docs/ refs").toEqual([]);
  });

  it("README.md references no missing docs/ file", () => {
    expect(danglingDocRefs(read("README.md")), "README dangling docs/ refs").toEqual([]);
  });

  it(".env.example references no missing docs/ file", () => {
    expect(danglingDocRefs(read(".env.example")), ".env.example dangling docs/ refs").toEqual([]);
  });

  it("docs/DEPLOYMENT.md references no missing docs/ file", () => {
    expect(danglingDocRefs(read("docs/DEPLOYMENT.md")), "DEPLOYMENT dangling docs/ refs").toEqual([]);
  });

  it("SKILL live body (frontmatter + §1–§20, pre-Appendix-A) references no missing docs/ file", () => {
    const skill = read("ely-beauty_SKILL.md");
    const liveBody = skill.slice(0, skill.indexOf("## Appendix A"));
    expect(danglingDocRefs(liveBody), "SKILL live-body dangling docs/ refs").toEqual([]);
  });

  it("PAD live body (post-Table-of-Contents) references no missing docs/ file", () => {
    const pad = read("Project_Architecture_Document.md");
    const padBody = pad.slice(pad.indexOf("## Table of Contents"));
    expect(danglingDocRefs(padBody), "PAD live-body dangling docs/ refs").toEqual([]);
  });
});

// ── S99-3 — stale payment-prose negatives (audit 99-a N3–N6) ───────────────
// The S98-3 sweep fixed CLAUDE.md's "demo payment (no processor)" sentence
// but scoped its negative pin to CLAUDE.md only; the same era's prose
// survived in the SKILL live body (§7.3, §7.4, §13) and the PAD's ADR-005
// alternatives. Since session-61/S73-8 there is no demo payment: card
// payments require a verified Stripe PaymentIntent and cardLast4 is read
// from the intent, never client-sent. The negatives scope to the LIVE
// bodies (the SKILL's Appendix B and the PAD's revision blocks quote the
// removed phrases as era-history — deliberately exempt).
describe("S99-3 — stale payment-prose negatives (the S98-3 class finished)", () => {
  it("SKILL live body carries no 'demo payment'/'demo card wizard' prose (post session-61)", () => {
    const skill = read("ely-beauty_SKILL.md");
    const liveBody = skill.slice(0, skill.indexOf("## Appendix A"));
    expect(liveBody, "no 'demo payment' in the SKILL live body").not.toContain("demo payment");
    expect(liveBody, "no 'demo card wizard' in the SKILL live body").not.toContain("demo card wizard");
  });

  it("PAD live body carries no stale 'the demo payment' clause (ADR-005 annotated, not stale)", () => {
    const pad = read("Project_Architecture_Document.md");
    const padBody = pad.slice(pad.indexOf("## Table of Contents"));
    expect(padBody, "no 'the demo payment' in the PAD live body").not.toContain("the demo payment");
  });
});
