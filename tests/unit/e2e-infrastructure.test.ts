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
  it("S83-1 + S92-2f: mutation-bearing specs run in the serialized project (admin-catalog, workers: 1)", () => {
    const config = readRepo("playwright.config.ts");
    // The mutation-bearing specs are sliced OUT of the parallel project…
    // (S83-1: admin.spec.ts's catalog mutations; S92-2f:
    // password-change.spec.ts's demo-password rotation window.)
    expect(config).toMatch(
      /testIgnore:\s*\/mobile-navigation\\\.spec\\\.ts\|admin\\\.spec\\\.ts\|password-change\\\.spec\\\.ts\//,
    );
    // …into a dedicated single-worker project declared AFTER the readers
    // (projects run sequentially — mutations never overlap a reader).
    const projectMatch =
      config.match(
        /name:\s*"admin-catalog",[\s\S]*?testMatch:\s*\/admin\\\.spec\\\.ts\|password-change\\\.spec\\\.ts\/,[\s\S]*?workers:\s*1,/,
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

// S84 — the self-heal-closure pins (session 84): audit 84-a's M-1 found
// the run-83 discipline asymmetric — an aborted prior run's catalog dirt
// on a REUSED server (the webServer restore only fires on a FRESH start;
// reuseExistingServer skips the command entirely) is observed by the
// storefront count pins BEFORE the admin-catalog project runs and heals,
// and S82-3 lacked the per-test heal S81-11 got in S83-3. These pins hold
// the closure in the SOURCE:
//
//   S84-2  the global-setup heal   a globalSetup module probes :3100 and
//                                  runs the idempotent restore BEFORE any
//                                  project when a server is already
//                                  listening (the reused-server case; a
//                                  fresh start's restore stays the
//                                  webServer command's own)
//   S84-3  the S82-3 self-heal     the opening restores a leftover
//                                  cleared template to Skincare before
//                                  the flow (the S83-3 symmetry)
describe("S84 — the self-heal-closure pins", () => {
  it("S84-2: the suite heals the catalog before any project on a reused server", () => {
    const config = readRepo("playwright.config.ts");
    // The config wires the pre-run heal.
    expect(config).toMatch(/globalSetup:/);
    const setup = readRepo("tests/e2e/global-setup.ts");
    // The reused-server probe — heal only when something already answers
    // on :3100 (a fresh start's restore is the webServer command's own).
    expect(setup).toMatch(/3100/);
    // The heal is the idempotent restore script.
    expect(setup).toMatch(/restore-demo-stock/);
  });

  it("S84-3: S82-3 self-heals a leftover cleared template before the flow", () => {
    const spec = readRepo("tests/e2e/admin.spec.ts");
    // The heal: if the Template combobox survived an aborted prior run
    // reading None (the trigger renders None as BOTH the null placeholder
    // and the "none" item — one textContent condition covers both dirt
    // shapes), restore Skincare + save + reopen through the gated helper
    // before the flow (the S20-1/S83-3 discipline).
    expect(spec).toMatch(/S84-3[\s\S]{0,700}?Skincare/);
  });
});
