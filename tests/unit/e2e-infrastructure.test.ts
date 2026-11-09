/**
 * E2E infrastructure — the S83 concurrency-isolation pins (session 83).
 *
 * The gates re-validation on the pulled 3d567ad tree reproduced a 2-failure
 * flake in 2 of 6 full-suite runs (both victims green in isolation): the
 * admin spec's two Gua Sha mutation tests hold observable windows
 * (bestsellers 4→5 / skincare 12→11) that parallel storefront count pins
 * can land inside, their same-product full-row upserts clobber each other
 * under fullyParallel, and their post-search Edit clicks race the native
 * GET navigation + re-hydration (an abort mid-mutation leaves durable
 * catalog dirt — masked only by the fresh-server restore backstop).
 *
 * These pins hold the three hardening measures in the SOURCE so a config
 * or spec refactor cannot silently reintroduce the class:
 *
 *   S83-1  the admin-catalog project   admin.spec.ts runs in its own
 *                                     project, workers: 1, after every
 *                                     read-only project (projects run
 *                                     sequentially — no window is ever
 *                                     observable by a parallel reader,
 *                                     and same-file parallelism is gone)
 *   S83-2  the gated search helper     the post-Enter Edit click waits
 *                                     for the navigation URL + the
 *                                     html[data-hydrated] sentinel (the
 *                                     helpers.ts convention, applied to
 *                                     the form-submit navigation)
 *   S83-3  the S81-11 self-heal        the opening heals a leftover
 *                                     Bestsellers membership before
 *                                     pinning the seed shape (the S20-1
 *                                     discipline — a reused-server rerun
 *                                     after an aborted revert must not
 *                                     fail at not.toBeChecked())
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relative: string): string {
  return readFileSync(path.resolve(import.meta.dirname, "../..", relative), "utf8");
}

describe("S83 — the e2e concurrency-isolation pins", () => {
  it("S83-1: admin.spec.ts runs in its own serialized project (admin-catalog, workers: 1)", () => {
    const config = readRepo("playwright.config.ts");
    // The mutation-bearing spec is sliced OUT of the parallel project…
    expect(config).toMatch(/testIgnore:\s*\/mobile-navigation\\\.spec\\\.ts\|admin\\\.spec\\\.ts\//);
    // …into a dedicated single-worker project declared AFTER the readers
    // (projects run sequentially — mutations never overlap a reader).
    const projectMatch =
      config.match(
        /name:\s*"admin-catalog",[\s\S]*?testMatch:\s*\/admin\\\.spec\\\.ts\/,[\s\S]*?workers:\s*1,/,
      ) ?? [];
    expect(projectMatch.length).toBeGreaterThan(0);
    // The desktop project and the admin project are distinct entries.
    expect(config).toMatch(/name:\s*"desktop-chromium"/);
    expect(config).toMatch(/name:\s*"admin-catalog"/);
  });

  it("S83-2: the admin spec gates the post-search Edit click on navigation + hydration", () => {
    const spec = readRepo("tests/e2e/admin.spec.ts");
    // The shared helper: search form submit → waitForURL → the hydration
    // sentinel → only then the Edit click.
    expect(spec).toMatch(/async function searchProductsAndOpenDialog/);
    expect(spec).toMatch(/waitForURL\(/);
    expect(spec).toMatch(/data-hydrated="true"/);
    // Every Enter-driven search that precedes an Edit click routes through
    // the helper (the four former bare sequences are gone).
    expect(spec.match(/searchProductsAndOpenDialog\(/g)?.length).toBeGreaterThanOrEqual(4);
    // No ungated Enter→click pairs remain: an Enter press is never
    // immediately followed by a button click.
    expect(spec).not.toMatch(/press\("Enter"\);\s*\n\s*await page\.getByRole\("button"/);
  });

  it("S83-3: S81-11 self-heals a leftover dual membership before pinning the seed shape", () => {
    const spec = readRepo("tests/e2e/admin.spec.ts");
    // The heal: if Bestsellers survived an aborted prior revert, uncheck +
    // save + reopen before the not.toBeChecked() pin (the S20-1 discipline).
    expect(spec).toMatch(/isChecked\(\)\)[\s\S]{0,400}uncheck\(\)/);
    expect(spec).toMatch(/self-heal/i);
  });
});
