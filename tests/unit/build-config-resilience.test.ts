import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  CONFIG_FALLBACKS,
  ensureAll,
  missingConfigFiles,
} from "../../scripts/ensure-build-configs.mjs";

const repoRoot = path.resolve(import.meta.dirname, "../..");

/**
 * S87 — the lost-config build-resilience cycle.
 *
 * The operator's checkout tree (docs/build_error.txt) lost tsconfig.json and
 * postcss.config.mjs — the only build-critical root configs untouched since
 * the 2026-10-12 initial migration — and `npm run build` failed with a wall
 * of 312 module-not-found errors (311 `@/` aliases + tw-animate-css) plus 15
 * @apply/@utility warnings. These pins hold the three layers that make the
 * build survive that loss class:
 *
 *   S87-1  next.config.ts carries the `@/*` alias itself (turbopack
 *          resolveAlias) so Turbopack compilation never depends on
 *          tsconfig.json surviving the checkout.
 *   S87-2  scripts/ensure-build-configs.mjs embeds the five long-untouched
 *          configs and restores any that are missing/empty — never
 *          overwriting existing content.
 *   S87-3  every gated npm script (build/dev/lint/test/test:e2e/typecheck/
 *          typecheck:tests) runs that bootstrap first.
 */
describe("S87-1 — the turbopack resolveAlias belt (next.config.ts)", () => {
  it("pins the @/* alias so Turbopack compilation survives a lost tsconfig.json", () => {
    const config = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
    expect(config).toContain("resolveAlias");
    // The identical mapping to tsconfig's paths — belt (config) and
    // suspenders (tsconfig) must never disagree.
    expect(config).toMatch(/["']@\/\*["']\s*:\s*["']\.\/src\/\*["']/);
  });
});

describe("S87-2 — the build-config fallback registry", () => {
  it("embeds exactly the five 2026-10-12-vintage configs", () => {
    expect(Object.keys(CONFIG_FALLBACKS).sort()).toEqual(
      [
        "eslint.config.mjs",
        "postcss.config.mjs",
        "tsconfig.json",
        "tsconfig.tests.json",
        "vitest.config.ts",
      ].sort(),
    );
  });

  it("stays byte-in-sync with the canonical on-disk files (the drift alarm)", () => {
    for (const [name, content] of Object.entries(CONFIG_FALLBACKS)) {
      const canonical = readFileSync(path.join(repoRoot, name), "utf8");
      expect(canonical, `${name} drifted from CONFIG_FALLBACKS — update the registry`).toBe(content);
    }
  });

  it("restores every missing config into a bare directory, byte-exact", () => {
    const target = mkdtempSync(path.join(tmpdir(), "ely-ensure-configs-"));
    try {
      expect(missingConfigFiles(target)).toEqual(Object.keys(CONFIG_FALLBACKS).sort());
      const written = ensureAll(target, () => {});
      expect([...written].sort()).toEqual(Object.keys(CONFIG_FALLBACKS).sort());
      for (const [name, content] of Object.entries(CONFIG_FALLBACKS)) {
        expect(readFileSync(path.join(target, name), "utf8")).toBe(content);
      }
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });

  it("treats an empty-but-present file as missing, and never overwrites non-empty content", () => {
    const target = mkdtempSync(path.join(tmpdir(), "ely-ensure-configs-"));
    try {
      writeFileSync(path.join(target, "tsconfig.json"), "");
      writeFileSync(path.join(target, "postcss.config.mjs"), "// operator customization\n");
      const written = ensureAll(target, () => {});
      expect(written).toContain("tsconfig.json"); // empty → restored
      expect(written).not.toContain("postcss.config.mjs"); // non-empty → untouched
      expect(readFileSync(path.join(target, "postcss.config.mjs"), "utf8")).toBe(
        "// operator customization\n",
      );
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  });

  it("reports nothing missing on the real repo tree", () => {
    expect(missingConfigFiles(repoRoot)).toEqual([]);
  });
});

describe("S87-3 — the gated npm scripts chain the bootstrap first", () => {
  it("build/dev/lint/test/test:e2e/typecheck/typecheck:tests all bootstrap configs", () => {
    const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    for (const script of [
      "build",
      "dev",
      "lint",
      "test",
      "test:e2e",
      "typecheck",
      "typecheck:tests",
    ]) {
      expect(
        pkg.scripts[script],
        `npm script "${script}" must run the config bootstrap first`,
      ).toMatch(/^node scripts\/ensure-build-configs\.mjs/);
    }
  });

  it("the bootstrap script itself is tracked in the repo (survives fresh clones)", () => {
    expect(existsSync(path.join(repoRoot, "scripts/ensure-build-configs.mjs"))).toBe(true);
  });
});
