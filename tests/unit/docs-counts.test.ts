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
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── The single source of truth for the docs' live-tense counts ──────────
const UNIT_TESTS = 777;
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

  it("PAD + SKILL: the 20-model claims (the run-94/95 de-drift family)", () => {
    const pad = read("Project_Architecture_Document.md");
    const padBody = pad.slice(pad.indexOf("## Table of Contents"));
    const skill = read("ely-beauty_SKILL.md");
    expect(pad, "PAD §4.1 heading model count").toContain(`(SQLite, ${PRISMA_MODELS} models)`);
    expect(pad, "PAD mermaid node").toContain(`${PRISMA_MODELS} models`);
    expect(pad, "PAD §12 schema row").toContain(`${PRISMA_MODELS} models / idempotent seed`);
    expect(padBody, "PAD body must not carry the stale 19-models claim").not.toContain("19 models");
    expect(skill, "SKILL §2 stack table model count").toContain(`SQLite, ${PRISMA_MODELS} models`);
  });

  it("ely-beauty_SKILL.md project_state carries the counts", () => {
    const skill = read("ely-beauty_SKILL.md");
    expect(skill, "SKILL project_state unit count").toContain(`${UNIT_TESTS} unit tests`);
    expect(skill, "SKILL project_state e2e count").toContain(`${E2E_TESTS} e2e tests`);
  });
});
