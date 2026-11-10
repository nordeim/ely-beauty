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
const UNIT_TESTS = 798;
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
// surface — there is no dashboard/ folder); nested pages are one dir deep.
const ADMIN_PAGES = [
  ...(existsSync(join(ADMIN_DIR, "page.tsx")) ? ["dashboard"] : []),
  ...readdirSync(ADMIN_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(ADMIN_DIR, d.name, "page.tsx")))
    .map((d) => d.name),
].sort();

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
