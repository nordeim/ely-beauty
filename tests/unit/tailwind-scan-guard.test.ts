/**
 * Tailwind candidate-scan guard — the run-76 build-breaker pins.
 *
 * The pushed run-75 tree passed its final `next build` only because
 * Turbopack's persistent cache reused a pre-docs-sweep CSS compile. A
 * CLEAN build fails: the run-75 docs sweep wrote the banner class into
 * four doc files with a COLON (`md:aspect-[3:1]` — CLAUDE.md, PAD v2.3,
 * docs/session_6.md, ely-beauty_SKILL.md), and Tailwind v4's automatic
 * candidate scan reads EVERY non-gitignored text file in the project —
 * .md prose included. The colon-form candidate compiled to
 * `aspect-ratio:3:1` (invalid CSS), and the production build's PostCSS
 * pass died with "Missed semicolon" at globals.css:2:135421.
 *
 * These pins hold the structural fix:
 *   1. globals.css excludes prose and non-render surfaces from the scan
 *      (docs/, skills/ — the operator contract already excludes skills/
 *      from compilation — tests/, scripts/, and every .md/.mdx file).
 *   2. The compiled CSS never carries a colon-form aspect-ratio value.
 *   3. The guard does not over-exclude: the real render classes from
 *      src/ still compile (.container-page, the slash-form banner pair).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const repoRoot = path.resolve(import.meta.dirname, "../..");

function readRepo(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

async function compileGlobals(): Promise<string> {
  const css = readRepo("src/app/globals.css");
  const result = await postcss([tailwind()]).process(css, {
    from: "src/app/globals.css",
  });
  return result.css;
}

describe("S76 tailwind candidate-scan guard (the docs-leak build breaker)", () => {
  it("globals.css excludes prose and non-render surfaces from the candidate scan", () => {
    const css = readRepo("src/app/globals.css");
    // .md prose leaked a class-like string into the compiled CSS once and
    // broke the clean production build — prose is not a render surface.
    expect(css).toContain('@source not "../../**/*.md"');
    expect(css).toContain('@source not "../../**/*.mdx"');
    // docs/ (session logs + plans quote utility class names verbatim),
    // skills/ (excluded from compilation by operator contract), tests/
    // and scripts/ (pins and harnesses assert class strings, never render).
    expect(css).toContain('@source not "../../docs"');
    expect(css).toContain('@source not "../../skills"');
    expect(css).toContain('@source not "../../tests"');
    expect(css).toContain('@source not "../../scripts"');
  });

  it("the compiled CSS carries no colon-form aspect-ratio value (the run-76 breaker)", async () => {
    const css = await compileGlobals();
    // `aspect-ratio:3:1` (from a colon-form arbitrary value) is invalid
    // CSS — PostCSS rejects it and the production build dies.
    expect(css).not.toMatch(/aspect-ratio:\s*\d+\s*:\s*\d+/);
  });

  it("the guard does not over-exclude — src render classes still compile", async () => {
    const css = await compileGlobals();
    // The universal gutter (S75-1) and the banner's slash-form pair
    // (pinned in layout-tokens D-5 against page.tsx) must survive.
    expect(css).toContain(".container-page");
    expect(css).toMatch(/aspect-ratio:\s*3\s*\/\s*1/);
  });
});
