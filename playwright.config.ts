import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E — spins up the production build (npm run build && npm run
 * start) so the suite exercises the same standalone server that ships, with
 * CSP in its production form. Run: npm run test:e2e
 */
export default defineConfig({
  // S84-2 (audit 84-a M-1): the pre-run catalog heal. The webServer
  // command's restore only fires on a FRESH start — reuseExistingServer
  // skips the command entirely, so on a reused server an aborted prior
  // run's dirt met the storefront count pins before admin-catalog could
  // heal. The globalSetup probes :3100 and restores BEFORE any project
  // when a server is already listening (a fresh start's restore stays the
  // command's own). Pinned by tests/unit/e2e-infrastructure.test.ts.
  globalSetup: "./tests/e2e/global-setup.ts",
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      // iPhone 13 viewport/UA via Chromium — WebKit is not installable in the
      // target sandbox; the touch viewport is what this suite pins.
      name: "mobile-navigation",
      testMatch: /mobile-navigation\.spec\.ts/,
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
      },
    },
    {
      name: "desktop-chromium",
      testIgnore: /mobile-navigation\.spec\.ts|admin\.spec\.ts|password-change\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      // S83-1: admin.spec.ts's catalog mutations (the S81-11 dual-membership
      // window bestsellers 4→5, the S82-3 template-clear window skincare
      // 12→11, and the two tests' same-product full-row upserts) were
      // observable by parallel storefront count pins under fullyParallel —
      // a 2-of-6-runs flake this cycle root-caused. Projects run
      // SEQUENTIALLY, so the mutation-bearing spec runs alone, serialized,
      // after every read-only project has finished: no window is ever
      // observable by a concurrent reader, and same-file parallelism (the
      // stale-snapshot clobber) is eliminated. Pinned by
      // tests/unit/e2e-infrastructure.test.ts.
      // S92-2f: password-change.spec.ts joins the serialized project — it
      // mutates the demo account's PASSWORD (change→restore window), which
      // every concurrent demo login under fullyParallel would observe as a
      // hard failure. Same S83-1 rationale, same fix: run alone, serialized,
      // after every read-only project has finished.
      name: "admin-catalog",
      testMatch: /admin\.spec\.ts|password-change\.spec\.ts/,
      workers: 1,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // The standalone server reads PORT; the health route doubles as the
    // readiness probe (it round-trips the database). S14-4: a fresh start
    // first restores every product's stock to its seed value — e2e checkouts
    // are traffic that permanently drains the traffic-owned demo stock (the
    // seed policy never refreshes it), which eventually broke the pins that
    // assume the seeded "In Stock" state. A reused healthy server keeps its
    // (already restored) state.
    command: "npx tsx scripts/restore-demo-stock.ts && PORT=3100 npm run start",
    url: "http://127.0.0.1:3100/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
