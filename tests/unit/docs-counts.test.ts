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
const UNIT_TESTS = 851;
const E2E_TESTS = 93;
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
    // Sentence-final punctuation is never part of a docs/ filename: strip
    // trailing slashes and dots from the capture before resolving. S103-1
    // (audit 103-a F-3): the dot-greedy capture class let an unquoted
    // "…in docs/session_1.md." capture "session_1.md." and phantom-flag a
    // dangle — the class errs loud, never a false green, but precision is
    // free and no docs/ filename ends in a dot.
    const ref = (m[1] ?? "")
      .replace(/\/+$/, "")
      .replace(/\.+$/, "");
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

// ── S100-1 — the stale-existence-claim net (audit 100-a LOW-1) ─────────────
// The S99-4 boundary note claimed "only docs/session_1..53.md exist" —
// falsified by the SAME commit that added it (c3db704 also added
// session_54.md, run-99's own log) and widened by the operator's
// session_55.md. The class: a LIVE-TENSE existence claim over a bounded
// session-file range goes stale the moment the post-reset series grows
// past its bound — and the note's HomeNest-era cite range
// (session_54..132) then NUMERICALLY COLLIDES with the live post-reset
// files, so a reader following an appendix cite lands on a wrong-era file.
// The net derives the session-file numbers from the FILESYSTEM and pins
// that no live-tense scope (the S99-1 seven) — nor the Appendix-B
// boundary-note bullet, which is present-tense guidance about the file
// inventory — carries an "only … session_A..B.md … exist" claim whose B is
// below the highest session number on disk. A stale claim fails BY NAME.
// The rewording must PARAPHRASE the stale claim, never re-quote it (the
// S99-1 lesson: a quoted stale claim inside a live-tense string is
// itself a drift vector).
const SESSION_NUMBERS = [...DOCS_FILES]
  .map((name) => /^session_(\d+)\.md$/.exec(name)?.[1])
  .filter((n): n is string => typeof n === "string")
  .map(Number)
  .sort((a, b) => a - b);
const MAX_SESSION_NUMBER = SESSION_NUMBERS[SESSION_NUMBERS.length - 1] ?? 0;
// S104-1 (audit 104-a F-2): the corpus FLOOR — the pre-reset series starts
// at session_1.md (pinned by the S100-1 inventory test), and the corpus is
// append-only, so the floor is derivable-stable exactly like the max. The
// two-sided canonical grammar pins both ends against it.
const SESSION_CORPUS_FLOOR = SESSION_NUMBERS[0] ?? 1;

/**
 * Stale CANONICAL "only … session_A..B.md … exist" claims in `text` (the
 * S100-1 grammar — used by the Appendix B boundary-note marker pin, whose
 * two-series description carries a CLOSED pre-reset sub-series range
 * deliberately below the disk max). TWO-SIDED since S104-1 (audit 104-a
 * F-2): the S102-1 convention makes the "only…exist" wrapper the
 * whole-corpus DISCRIMINATOR, so an "only A..B exist" claim asserts BOTH
 * that A is the corpus floor AND that B is the highest session number on
 * disk — a WRONG-LOWER-BOUND claim (denying real files below A) and an
 * OVER-CLAIM (citing phantom files past B) are both stale, exactly as an
 * under-claim always was. The gap window (≤ 12 chars) tolerates the
 * line-wrapped "…md`\n  exist." form.
 */
const staleCanonicalExistenceClaims = (text: string): string[] => {
  const stale: string[] = [];
  for (const m of text.matchAll(/only\s+`?(?:docs\/)?session_(\d+)\.\.(\d+)\.md`?[\s\S]{0,12}exist/gi)) {
    const floor = Number(m[1]);
    const bound = Number(m[2]);
    if (bound !== MAX_SESSION_NUMBER || floor !== SESSION_CORPUS_FLOOR) stale.push(m[0].replace(/\s+/g, " "));
  }
  return stale;
};

/**
 * Stale session-file range claims in `text` — the S102-1 paraphrase-proof
 * grammar (audit 102-a INFO-1), made TWO-SIDED by S103-1 (audit 103-a F-1):
 * ANY `session_N..M.md` range whose upper bound is not EXACTLY the highest
 * session number on disk is stale, regardless of the wrapper prose around
 * it — an UNDER-claim (M below the disk max: the corpus has grown past the
 * bound) and an OVER-claim (M past the disk max: the range cites files that
 * do not exist, the S99-1 dangle class's range form — the HomeNest-era
 * `session_54..132.md` shape quoted into a live-tense scope) both flag.
 * Backticks, a docs/ prefix, and inner whitespace are tolerated by matching
 * the bare range core.
 */
const staleSessionExistenceClaims = (text: string): string[] => {
  const stale: string[] = [];
  for (const m of text.matchAll(/session_(\d+)\s*\.\.\s*(\d+)\s*\.md/g)) {
    if (Number(m[2]) !== MAX_SESSION_NUMBER) stale.push(m[0].replace(/\s+/g, " "));
  }
  return stale;
};

describe("S100-1 — stale-existence-claim net: session-range claims stay true against the disk", () => {
  it("derives the session-file inventory from docs/ (the pre + post-reset series)", () => {
    expect(SESSION_NUMBERS.length, "the session corpus is non-trivial").toBeGreaterThanOrEqual(50);
    expect(SESSION_NUMBERS[0], "the pre-reset series starts at 1").toBe(1);
    // The post-reset ElyBeauty series resumed at session_54.md (run-99's
    // log) — the numerical collision the boundary note must acknowledge,
    // never deny.
    expect(
      MAX_SESSION_NUMBER,
      "the post-reset series exists on disk (run-99's log and beyond)",
    ).toBeGreaterThanOrEqual(54);
  });

  it("no live-tense scope carries a stale session-file existence claim", () => {
    const skill = read("ely-beauty_SKILL.md");
    const pad = read("Project_Architecture_Document.md");
    const scopes: Record<string, string> = {
      "AGENTS.md": read("AGENTS.md"),
      "CLAUDE.md": read("CLAUDE.md"),
      "README.md": read("README.md"),
      ".env.example": read(".env.example"),
      "docs/DEPLOYMENT.md": read("docs/DEPLOYMENT.md"),
      "SKILL live body": skill.slice(0, skill.indexOf("## Appendix A")),
      "PAD live body": pad.slice(pad.indexOf("## Table of Contents")),
    };
    for (const [scope, text] of Object.entries(scopes)) {
      expect(staleSessionExistenceClaims(text), `${scope} stale existence claims`).toEqual([]);
    }
  });

  it("the Appendix B boundary note survives (the marker pin) and claims nothing stale in the canonical shape", () => {
    const skill = read("ely-beauty_SKILL.md");
    expect(skill, "the boundary-note bullet survives").toContain("**Docs-reset boundary");
    // The note is present-tense guidance about the CURRENT inventory —
    // scanned even though Appendix B is otherwise exempt (era-history):
    // its existence claims are about NOW, not about the cited eras. Since
    // S102-1 the scan is the CANONICAL grammar only: the note's two-series
    // description carries a CLOSED pre-reset sub-series range
    // (session_1..53.md — deliberately below the disk max), which the
    // widened whole-corpus grammar cannot distinguish from a stale claim;
    // the canonical "only…exist" wrapper is the discriminator (a
    // whole-corpus claim), and the note makes none.
    const note = skill.slice(skill.indexOf("**Docs-reset boundary"));
    expect(staleCanonicalExistenceClaims(note), "boundary-note stale canonical existence claims").toEqual([]);
  });
});

// ── S101-1 — the plan-range lockstep net (audit 101-a INFO-1) ──────────────
// AGENTS.md's architecture bullet carried "docs/REMEDIATION_PLAN.md records
// the session-2..100 security/parity audits" — a bounded-range claim about
// the PLAN's session sections. It sat OUTSIDE the S100-1 net's grammar
// (that net bounds docs/session_*.md FILES; this bounds plan SECTIONS), and
// it is the standing off-by-one shape runs 96–99 fixed repeatedly: accurate
// the cycle it is written in, stale the moment the plan grows. The net
// derives the plan's session headings from the FILESYSTEM and pins that
// every `session-2..N` literal in the seven live-tense scopes carries N ==
// the plan's CURRENT tail — a stale bound fails BY NAME with the scope
// named, and a non-vacuity floor keeps the literal from silently vanishing
// into a false green. The plan's heading history is deliberately NOT
// assumed contiguous (H1/H2/H3 mixed with HomeNest-era gaps and duplicate
// sub-headings — only the MAX is stable), so only the MAX is pinned.
const PLAN_SESSION_NUMBERS = [...read("docs/REMEDIATION_PLAN.md").matchAll(/^#{1,3}\s+Session\s+(\d+)\b/gm)]
  .map((m) => Number(m[1]))
  .sort((a, b) => a - b);
const MAX_PLAN_SESSION = PLAN_SESSION_NUMBERS[PLAN_SESSION_NUMBERS.length - 1] ?? 0;
// S103-1 (audit 103-a F-2): the plan's first RECORDED session is a CONSTANT,
// not derived — the title line carries "(Session 2)" while the numbered
// headings only begin at Session 3 (HomeNest-era gaps, duplicate
// sub-headings: only the MAX is derivable-stable). The START is structural:
// the plan is append-only and its title never changes, so the constant
// cannot drift the way a derived bound can.
const PLAN_START_SESSION = 2;

/**
 * Stale plan-range literals in `text` — the S102-1 paraphrase-proof
 * grammar, made LOWER-BOUND-GENERALIZED by S103-1 (audit 103-a F-2) and
 * BACKTRACKING-PROOF by S104-1 (audit 104-a F-1): any
 * `session(s) N <sep> M` range literal (the canonical `session-2..N` dots
 * plus the paraphrased `Sessions 2 through N` / `session 2–N` separator and
 * case variants) whose (N, M) pair is not exactly (the plan's first
 * recorded session, the plan's CURRENT tail) is stale — the plan is
 * append-only, so any other pair under-claims (a bound below the tail),
 * over-claims (a bound past the tail — sections that do not exist), or
 * mis-anchors the corpus start. The `(?!\d)` guard pins the captured bound
 * to the FULL digit run — without it the greedy capture backtracked under
 * the `.md` lookahead, surrendering trailing digits until the lookahead
 * succeeded, so a session-FILE range in prose flagged a TRUNCATED match
 * (`session_1..5` from `session_1..53.md`) and a TRUE file range at the
 * disk max false-flagged this net; with it the lookahead genuinely keeps
 * session-FILE ranges (S100-1's domain) out of the plan net. The MATCH
 * TEXT (not a reconstructed literal) is reported so a failure names the
 * exact drifting shape.
 */
const stalePlanRangeLiterals = (text: string): string[] =>
  [...text.matchAll(/sessions?[-_ ]?(\d+)\s*(?:\.{2}|…|–|—|-|through|to)\s*(\d+)(?!\d)(?!\s*\.md\b)/gi)]
    .filter((m) => Number(m[1]) !== PLAN_START_SESSION || Number(m[2]) !== MAX_PLAN_SESSION)
    .map((m) => m[0].replace(/\s+/g, " "));

describe("S101-1 — plan-range lockstep: the docs' plan-range literals track the REMEDIATION_PLAN tail", () => {
  it("derives the plan's session headings from the file (the append-only tail grows every cycle)", () => {
    expect(PLAN_SESSION_NUMBERS.length, "the plan corpus is non-trivial").toBeGreaterThanOrEqual(100);
    // Lower bound only — never an upper bound (the S100-1 lesson: an
    // existence claim over a bounded range goes stale by construction the
    // moment the range grows; a lower bound cannot).
    expect(MAX_PLAN_SESSION, "the plan tail has reached Session 101 (this cycle)").toBeGreaterThanOrEqual(101);
  });

  it("no live-tense scope carries a stale session-2..N plan-range literal", () => {
    const skill = read("ely-beauty_SKILL.md");
    const pad = read("Project_Architecture_Document.md");
    const scopes: Record<string, string> = {
      "AGENTS.md": read("AGENTS.md"),
      "CLAUDE.md": read("CLAUDE.md"),
      "README.md": read("README.md"),
      ".env.example": read(".env.example"),
      "docs/DEPLOYMENT.md": read("docs/DEPLOYMENT.md"),
      "SKILL live body": skill.slice(0, skill.indexOf("## Appendix A")),
      "PAD live body": pad.slice(pad.indexOf("## Table of Contents")),
    };
    for (const [scope, text] of Object.entries(scopes)) {
      expect(stalePlanRangeLiterals(text), `${scope} stale plan-range literals`).toEqual([]);
    }
  });

  it("the plan-range literal survives somewhere live-tense (the non-vacuity floor)", () => {
    // If every `session-2..N` literal were deleted from the live-tense
    // scopes, the class scan above would green vacuously — this floor
    // fails loudly instead, keeping the net honest about its own shape.
    const agents = read("AGENTS.md");
    expect([...agents.matchAll(/session-2\.\.(\d+)/g)].length, "AGENTS.md keeps the plan-range literal").toBeGreaterThan(0);
  });
});

// ── S102-1 — the paraphrase-proof grammar net (audit 102-a INFO-1/INFO-2) ──
// The class nets' grammars covered only the CANONICAL quoted shapes: the
// S100-1 scan required the `only … session_A..B.md … exist` wrapper and the
// S101-1 scan the literal `session-2..N` — so a PARAPHRASED stale claim (a
// range below the disk max without the wrapper; a plan range in the
// `Sessions 2 through N` / `session 2–N` separators) evaded both nets. The
// paraphrase-don't-quote convention (S99-1) makes paraphrase the DOCUMENTED
// drift vector, so the nets now own the class: the session-file scan flags
// ANY `session_N..M.md` range whose M bound sits below the disk max
// (regardless of wrapper), and the plan-range scan accepts the
// separator/case variants. The Appendix B boundary note's two-series
// description (`session_1..53.md` — the CLOSED pre-reset series,
// deliberately below the disk max) keeps the CANONICAL grammar for its
// marker pin: the widened grammar cannot distinguish a whole-corpus claim
// from a true closed-sub-series claim, so it applies to the seven
// live-tense scopes only — the documented trade-off (audit 102-a INFO-1).
// The fixtures below are SYNTHETIC (the shape of the drift class, never a
// real doc's bytes — the S99-1 convention).
describe("S102-1 — paraphrase-proof grammar: the scanners flag the paraphrased stale shapes", () => {
  it("the session-file scan flags a paraphrased stale range — no `only…exist` wrapper (audit 102-a INFO-1)", () => {
    const paraphrasedStale = "the survivors run `docs/session_1..53.md` and the series continues";
    expect(staleSessionExistenceClaims(paraphrasedStale), "a bare range below the disk max is stale").toEqual(["session_1..53.md"]);
  });

  it("the session-file scan stays green on a true bound (the disk max, computed)", () => {
    const trueRange = `the logs run session_1..${MAX_SESSION_NUMBER}.md`;
    expect(staleSessionExistenceClaims(trueRange), "a range at the disk max claims nothing stale").toEqual([]);
  });

  it("the plan-range scan flags the paraphrased separators (through / en-dash, any case — audit 102-a INFO-2)", () => {
    expect(stalePlanRangeLiterals("Sessions 2 through 101"), "the through-separator paraphrase").toEqual(["Sessions 2 through 101"]);
    expect(stalePlanRangeLiterals("the plan covers session 2–101"), "the en-dash paraphrase").toEqual(["session 2–101"]);
  });

  it("the plan-range scan stays green on the plan tail (computed, canonical and paraphrased forms)", () => {
    expect(stalePlanRangeLiterals(`session-2..${MAX_PLAN_SESSION}`), "the canonical literal at the tail").toEqual([]);
    expect(stalePlanRangeLiterals(`Sessions 2 through ${MAX_PLAN_SESSION}`), "the paraphrased literal at the tail").toEqual([]);
  });

  it("the canonical wrapper grammar survives for the boundary-note marker (its own non-vacuity, computed bounds)", () => {
    expect(staleCanonicalExistenceClaims("only session_1..50.md exist in docs/"), "the canonical stale shape is flagged").toEqual(["only session_1..50.md exist"]);
    expect(staleCanonicalExistenceClaims(`only session_1..${MAX_SESSION_NUMBER}.md exist`), "the canonical true shape stays green").toEqual([]);
  });
});

// ── S103-1 — the two-sided, lower-bound-generalized, punctuation-precise ────
// net (audit 103-a INFO-1/2/3, F-1/F-2/F-3). The run-102 lesson ("a class
// net's grammar is itself a drift surface") landed one run later: each
// widened grammar still owned only ONE side of its bound class.
//   F-1: the S100-1 session-file scanner flagged only UNDER-claims (a bound
//        below the disk max) — an OVER-claim (a range past the disk max,
//        citing files that do not exist — the S99-1 dangle class's range
//        form) passed green. The scan becomes TWO-SIDED: any range whose
//        upper bound is not EXACTLY the disk max is flagged.
//   F-2: the S101-1 plan-range grammar pinned the literal lower bound `2` —
//        a paraphrased range starting elsewhere evaded entirely. The scan
//        generalizes the lower bound: the claim is stale unless the pair is
//        exactly (PLAN_START_SESSION, the plan's current tail). The start
//        pins to the CONSTANT 2 — the plan's title records Session 2, and
//        the numbered headings begin at Session 3 with HomeNest-era gaps,
//        so only the MAX is derivable-stable; the START is structural. A
//        `.md`-lookahead keeps session-FILE ranges out of the plan net
//        (S100-1's domain). Known trade-off, documented: the grammar still
//        cannot distinguish a whole-corpus claim from a true closed-sub-
//        series cite — a live-scope sub-series cite must use the word-
//        separated form (the S102-1 convention, probe-verified), and the
//        bare `to` separator can over-match incidental prose (both err
//        loud, never a false green).
//   F-3: the S99-1 dangling capture class includes `.`, so a sentence-final
//        period rode into the ref and phantom-flagged a dangle — fails
//        loud, never a false green, but trailing dots are never part of a
//        docs/ filename: strip them for free.
// The fixtures are SYNTHETIC (the shape of the drift class, never a real
// doc's bytes — the S99-1 convention); computed bounds keep the stale
// shapes stale and the true shapes true as the corpora grow.
describe("S103-1 — two-sided bounds: the scanners flag over-claims, wrong lower bounds, and ignore trailing punctuation", () => {
  it("the session-file scan flags an OVER-CLAIM — a bound past the disk max (audit 103-a F-1)", () => {
    // The HomeNest-era shape: an upper bound past every session number on
    // disk cites files that do not exist. Computed so the phantom bound
    // stays phantom as the corpus grows.
    const phantomUpper = `cites session_54..${MAX_SESSION_NUMBER + 100}.md as if on disk`;
    expect(staleSessionExistenceClaims(phantomUpper), "an over-claim past the disk max is stale").toEqual([
      `session_54..${MAX_SESSION_NUMBER + 100}.md`,
    ]);
  });

  it("the plan-range scan flags a WRONG LOWER BOUND (audit 103-a F-2 — the generalized bound)", () => {
    expect(
      stalePlanRangeLiterals(`sessions 3 through ${MAX_PLAN_SESSION}`),
      "a wrong lower bound is stale even at the true tail",
    ).toEqual([`sessions 3 through ${MAX_PLAN_SESSION}`]);
    expect(stalePlanRangeLiterals("sessions 3 through 101"), "the audit's exact probe shape").toEqual([
      "sessions 3 through 101",
    ]);
  });

  it("the dangling scan ignores sentence-final punctuation (audit 103-a F-3)", () => {
    expect(
      danglingDocRefs("see docs/session_1.md. The ritual continues"),
      "a sentence-final period is not part of the ref",
    ).toEqual([]);
    expect(danglingDocRefs("ends at docs/screenshots. too"), "a trailing-dot directory cite resolves").toEqual([]);
  });
});

// ── S104-1 — the backtracking-proof, two-sided canonical net (audit 104-a ────
// INFO-1/INFO-2). Two residuals of the same run-103 lesson ("a widened bound
// owns only the side it was widened to"), one run later again:
//   F-1: the S103-1 plan-range grammar's `.md` lookahead was DEFEATED BY
//        BACKTRACKING — the greedy second `(\d+)` surrenders trailing digits
//        until the lookahead succeeds, so a session-FILE range in prose
//        flagged a TRUNCATED match with a mangled bound (`session_1..5`
//        from `era session_1..53.md files`), and a TRUE session-file range
//        at the disk max false-flagged the plan net (`session_1..6`) — the
//        documented exclusion invariant ("the lookahead keeps session-FILE
//        ranges out of the plan net") was false as written. The `(?!\d)`
//        guard pins the captured bound to the full digit run: backtracking
//        dies at the digit boundary, and the lookahead now genuinely
//        excludes the file-range shape (both probes below pin the clean
//        exclusion AND the un-mangled match text).
//   F-2: the S100-1 canonical grammar (`staleCanonicalExistenceClaims`, the
//        ONLY scanner applied to the Appendix-B boundary-note slice) still
//        flagged only UNDER-claims (bound < disk max): a whole-corpus
//        "only … exist" claim with a WRONG LOWER BOUND (denying real files)
//        or an OVER-CLAIM (citing phantom files) passed green. The S102-1
//        convention makes the "only…exist" wrapper the whole-corpus
//        DISCRIMINATOR, so an "only A..B exist" claim asserts BOTH that A is
//        the corpus floor and that B is the disk max — the grammar now owns
//        both sides of both dimensions.
//   F-3 (INFO-3, no-action): the S103-1 session-file scan's own LOWER-bound
//        side stays deliberately unowned — the documented sub-series
//        trade-off (the grammar cannot distinguish a whole-corpus claim
//        from a legitimate closed-sub-series cite; live-scope sub-series
//        cites use the word-separated form, and the boundary note's slice
//        is covered by the canonical grammar). Recorded here in the class
//        table so future audits do not re-derive it as novel.
// The fixtures are SYNTHETIC (the shape of the drift class, never a real
// doc's bytes — the S99-1 convention); computed bounds keep the stale
// shapes stale and the true shapes true as the corpora grow.
describe("S104-1 — backtracking-proof exclusion + the two-sided canonical bound", () => {
  it("the plan-range grammar EXCLUDES a session-file range in prose, cleanly (audit 104-a F-1)", () => {
    // RED against the pre-S104-1 grammar: the greedy backtrack surrendered
    // the trailing digit and flagged the truncated `session_1..5`. The
    // clean exclusion means NO match at all — the shape is S100-1's domain.
    expect(stalePlanRangeLiterals("era session_1..53.md files"), "a session-file range in prose is not a plan range").toEqual([]);
  });

  it("the plan-range grammar excludes a TRUE file range at the disk max — un-mangled (audit 104-a F-1)", () => {
    // The sharpest probe: the TRUE session-file range (upper bound exactly
    // the disk max — green under the S103-1 session-file scan) must not
    // false-flag the plan net with a truncated bound. Computed so the shape
    // stays true as the corpus grows.
    expect(
      stalePlanRangeLiterals(`era session_1..${MAX_SESSION_NUMBER}.md files`),
      "a true file range at the disk max stays out of the plan net",
    ).toEqual([]);
  });

  it("the canonical grammar flags a WRONG-LOWER-BOUND whole-corpus claim (audit 104-a F-2)", () => {
    // "only A..B exist" asserts A is the corpus floor: this claim denies
    // every file below 54 that exists on disk, with a TRUE upper bound.
    expect(
      staleCanonicalExistenceClaims("only session_54..63.md exist"),
      "a whole-corpus claim with a wrong floor is stale even at a true bound",
    ).toEqual(["only session_54..63.md exist"]);
  });

  it("the canonical grammar flags an OVER-CLAIM past the disk max (audit 104-a F-2)", () => {
    // Computed phantom bound: the claim cites files that do not exist
    // (the S99-1 dangle class's canonical whole-corpus form).
    const overClaim = `only session_1..${MAX_SESSION_NUMBER + 36}.md exist`;
    expect(staleCanonicalExistenceClaims(overClaim), "an over-claim past the disk max is stale").toEqual([overClaim]);
  });
});

// ── S108 — the doc-vocabulary residue net (audit 108-a F-1..F-5) ──────────
// Run-107 retired the "Dollars" identifiers in src/ and swept the five-doc
// count lockstep — but its own sweep left the retired vocabulary alive in
// the DOC stratum: the PAD's live §8.1 test-inventory rows (money.test.ts
// naming parseDollarsToCents; seo-ld saying cents→dollars), the SKILL §7.3
// money-seam map (the same retired API + "dollars→cents conversion"), the
// v2.34 block's payment-intention route typo, and §8.2's HomeNest-era
// dollar nag amounts ($34.99/$15.01) over a live BDT spec. The run-107
// lesson ("a class's residue can outlives its remediation at a LOWER
// stratum") recurs one stratum further out: the DOC INVENTORY is a stratum
// too, and it had no vocabulary net. These pins close it: the PAD/SKILL
// live bodies carry no retired money vocabulary, no nonexistent route
// names, and no stale-currency nag amounts.
describe("S108 — the doc-vocabulary residue net (audit 108-a F-1..F-5)", () => {
  it("S108-1b: the PAD live body carries no parseDollarsToCents / cents→dollars vocabulary", () => {
    const pad = read("Project_Architecture_Document.md");
    const padBody = pad.slice(pad.indexOf("## Table of Contents"));
    // §8.1's money.test.ts row named the retired alias; the seo-ld row
    // said "cents→dollars price" over the centsToTaka helper (S107-1).
    expect(padBody, "no parseDollarsToCents in the PAD live body").not.toContain("parseDollarsToCents");
    expect(padBody, "no cents→dollars in the PAD live body").not.toContain("cents→dollars");
  });

  it("S108-1c: the SKILL live body's money seam names the canonical parser (no Dollars vocabulary)", () => {
    const skill = read("ely-beauty_SKILL.md");
    // Post-frontmatter → pre-Appendix-A: the §1–§20 architecture sections.
    // The frontmatter project_state is ROLLING NARRATION — rewritten every
    // cycle, it legitimately names retired identifiers when describing the
    // sweep that retired them (the Appendix B history convention applied to
    // the frontmatter); §7.3's money-seam MAP is the live architecture claim.
    const afterFrontmatter = skill.slice(skill.indexOf("---", 3) + 3);
    const liveBody = afterFrontmatter.slice(0, afterFrontmatter.indexOf("## Appendix A"));
    // §7.3's money-seam map named parseDollarsToCents and called the
    // conversion "dollars→cents" — both false since S107-1 (the export is
    // parseAmountToCents; the conversion is taka→poisha).
    expect(liveBody, "no parseDollarsToCents in the SKILL architecture sections").not.toContain("parseDollarsToCents");
    expect(liveBody, "no dollars→cents in the SKILL architecture sections").not.toContain("dollars→cents");
    expect(liveBody, "the canonical parser is named at the money seam").toContain("parseAmountToCents");
  });

  it("S108-2a: the PAD carries no payment-intention route (the v2.34 typo class)", () => {
    const pad = read("Project_Architecture_Document.md");
    // The v2.34 revision block named fetch("/api/stripe/payment-intention"…)
    // — a nonexistent route (the real one is payment-intent). Whole-file:
    // the typo string is an error in every stratum, history included.
    expect(pad, "no payment-intention anywhere in the PAD").not.toContain("payment-intention");
  });

  it("S108-3a: the PAD's §8 test inventory carries no HomeNest-era dollar nag amounts over the BDT spec", () => {
    const pad = read("Project_Architecture_Document.md");
    // §8 (the live test-inventory: §8.1 unit + §8.2 e2e) describes what the
    // CURRENT specs pin. §11's known-issues register is frozen history —
    // its Resolved rows quote era symptoms verbatim (the session-23 row
    // quotes the HomeNest-era nag copy) and are not live-tense claims.
    const sec8 = pad.slice(pad.indexOf("### 8.1"), pad.indexOf("## 9."));
    // §8.2's free-shipping-coupon row described the "$34.99 pin cart" and
    // the "Add $15.01 more" nag — HomeNest-era amounts; the live spec is
    // BDT (৳3,000 threshold, the ৳288 under-threshold cart, "Add ৳2,712").
    expect(sec8, "no $34.99 in the PAD test inventory").not.toContain("$34.99");
    expect(sec8, "no $15.01 in the PAD test inventory").not.toContain("$15.01");
  });
});

// ── S109 — the secrets-shape net (audit 109-a F-1/F-2) ─────────────────────
// The standing secrets sweep greps fixed MARKERS (operator literals, 64-hex,
// sk_live, OPENSSH, ghp_, AKIA) — a VALUE-SHAPED secret matches none of them.
// Audit 109-a found the production AUTH_SECRET sitting in plain sight in the
// operator's own deployment log (docs/start_server_log.txt — a captured
// `diff .env .env.example` from the production deploy) and the reference-site
// operator password in the four vendored founding prompts: secrets leaked in
// SHAPES the marker sweep never checked, at the OPERATOR-LOG stratum — the
// one stratum no net had ever covered (the S108 "every stratum" lesson
// recurring). These pins ban the SHAPES across every tracked text file
// (the S99-1 filesystem-derivation convention; skills/ excluded per the
// standing instruction). The pins carry NO values — a secrets net that
// quotes the secret it bans would itself be a leak (the S108-2a
// paraphrase discipline, generalized to the secrets class).
const SECRET_SCAN_EXTS = new Set([
  ".txt", ".md", ".ts", ".tsx", ".js", ".mjs", ".json", ".sh", ".css", ".py", ".yml", ".yaml",
]);
const SECRET_SCAN_SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", "skills", "test-results", "playwright-report", "db", "coverage",
]);
const SECRET_SCAN_ROOT = resolve(import.meta.dirname, "../..");

/** Every text file under the repo root (the S99-1 derivation convention). */
function scanTextFiles(dir: string, acc: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!SECRET_SCAN_SKIP_DIRS.has(ent.name)) scanTextFiles(join(dir, ent.name), acc);
      continue;
    }
    if (!ent.isFile()) continue;
    const dot = ent.name.lastIndexOf(".");
    const ext = dot >= 0 ? ent.name.slice(dot) : "";
    // .env.example is the one dotfile DESIGNED to carry the assignment shape
    // (its value is the empty "" placeholder) — include it so a future
    // accidental real value there fails too.
    if (SECRET_SCAN_EXTS.has(ext) || ent.name === ".env.example") acc.push(join(dir, ent.name));
  }
  return acc;
}

describe("S109 — the secrets-shape net (audit 109-a F-1/F-2)", () => {
  it("S109-1a: no tracked text file carries a value-shaped AUTH_SECRET assignment", () => {
    const files = scanTextFiles(SECRET_SCAN_ROOT);
    // The floor guards against a broken walk passing vacuously.
    expect(files.length, "the secrets-scan corpus is non-trivial").toBeGreaterThanOrEqual(300);
    // A real AUTH_SECRET is an openssl-rand value (32-byte base64/hex — 24+
    // chars); 16+ value-shaped chars after the assignment is a captured
    // value. .env.example's empty "" and prose mentions of the NAME pass;
    // the property-passing shapes in src/tests (AUTH_SECRET: …) are outside
    // the assignment shape.
    const re = /AUTH_SECRET\s*=\s*["'`]?[A-Za-z0-9+/=]{16,}/;
    const hits = files.filter((f) => re.test(readFileSync(f, "utf8")));
    expect(
      hits,
      "value-shaped AUTH_SECRET assignments — rotate at the deploy + redact the capture",
    ).toEqual([]);
  });

  it("S109-2a: no tracked text file carries a $-prefixed password credential", () => {
    // The founding prompts quoted the reference-site login verbatim —
    // `password $<alnum>` (backtick-wrapped). Post-redaction the shape
    // appears nowhere; a future pasted credential of the same shape fails.
    const re = /password\s+`?\$[A-Za-z0-9]{6,}/i;
    const hits = scanTextFiles(SECRET_SCAN_ROOT).filter((f) => re.test(readFileSync(f, "utf8")));
    expect(hits, "$-prefixed password credentials — redact at the source").toEqual([]);
  });
});

describe("S110 — the non-adjacent credential-shape net (audit 110-a F-1/F-2)", () => {
  // Run-110's finding: the recurring leak stratum is the OPERATOR'S RAW
  // NARRATIVES (session_75.md:23 quoted the standing instruction's
  // credential verbatim) — and a narrative can quote the credential in
  // NON-ADJACENT prose ("(`$…`)" — the "password" word nowhere near it),
  // which the S109-2a adjacency shape never catches. The S110 shape bans
  // the backtick-wrapped $-prefixed credential ANYWHERE in the corpus,
  // discriminating credentials from lookalikes by requiring at least one
  // digit AND one letter inside the 6+ alnum body (the operator's real
  // credential shape): Prisma's all-letters identifiers (`$transaction`,
  // `$queryRaw`, `$executeRaw` — the false-positive surface that killed
  // the naive shape) and the `$2.40`/`$X.00` price templates pass.
  //
  // SCOPE BOUNDARY (recorded per the standing contract): the corpus walk
  // excludes `skills/` — the vendored catalog is operator-managed content
  // outside code checking; a credential inside it is remediated by hand
  // (S110-2 did, for skills/replicate-web-app/SKILL-v3.md:586) and the
  // complete fix for the credential itself is operator-side ROTATION.
  const CREDENTIAL_SHAPE = /`\$(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{6,}`/;

  it("S110-3a: the grammar matches credentials in any phrasing and rejects the benign lookalikes", () => {
    // Fixtures use SYNTHETIC placeholder values — the S109 rule: a secrets
    // net bans SHAPES, never values (a net quoting the banned secret would
    // itself be a leak). The fixtures are ASSEMBLED BY CONCATENATION so the
    // raw source of this file never itself carries the banned contiguous
    // shape (the S110-3b corpus pin scans this file too — the S110-3b RED
    // that fired on this very test file during development is the trap
    // this assembly closes; no self-exclusion, no blind spot).
    const token = (body: string): string => "`$" + body + "`";
    const credentials = [
      "password " + token("Zn9xq2b7"), // the S109-2a adjacent form
      "(" + token("Zn9xq2b7") + ")", // the non-adjacent prose form (the run-110 class)
      "the value " + token("Qw3rty8") + " leaked", // mid-sentence, no parens
      "PASSWORD " + token("Ab1cd2ef"), // case-insensitive context
    ];
    for (const fixture of credentials) {
      expect(CREDENTIAL_SHAPE.test(fixture), `credential fixture: ${fixture}`).toBe(true);
    }
    const benign = [
      "`$transaction`", // Prisma API identifier (all letters) — the corpus-wide false-positive surface
      "`$queryRaw`",
      "`$executeRaw`",
      "`$disconnect`",
      "$2.40", // price templates (not backtick-wrapped, no letter)
      "`$X.00`", // the overlay price format (dot breaks the alnum body; 1 letter, 0 digits)
      "`$${var}`", // JS template literal
      "price $288.00",
      "AUTH_SECRET=\"\"", // the empty .env.example placeholder
    ];
    for (const fixture of benign) {
      expect(CREDENTIAL_SHAPE.test(fixture), `benign fixture: ${fixture}`).toBe(false);
    }
  });

  it("S110-3b: no tracked text file carries the backtick-wrapped $-prefixed credential shape", () => {
    const files = scanTextFiles(SECRET_SCAN_ROOT);
    // The S109 floor contract: the walk must prove it scanned.
    expect(files.length, "the secrets-scan corpus is non-trivial").toBeGreaterThanOrEqual(300);
    const hits = files.filter((f) => CREDENTIAL_SHAPE.test(readFileSync(f, "utf8")));
    expect(
      hits,
      "backtick-wrapped $-prefixed credentials in any phrasing — redact at the source + rotate",
    ).toEqual([]);
  });
});
