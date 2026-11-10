/**
 * Capture the documentation screenshots into docs/screenshots/.
 *
 * Usage: npx tsx scripts/capture-screenshots.ts [baseUrl]
 * Default baseUrl: http://localhost:3000 (a running production or dev server).
 *
 * Desktop shots at 1440x900, mobile shots at 390x844. Admin + account shots
 * sign in with the seeded demo credentials — single-sourced from
 * src/lib/demo-credentials.ts since S93-2 (audit 93-a LOW-1: this script was
 * the one remaining consumer still hardcoding both pairs).
 */
import {
  chromium,
  devices,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { mkdirSync } from "node:fs";

import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_CUSTOMER_EMAIL,
  DEMO_CUSTOMER_PASSWORD,
} from "../src/lib/demo-credentials";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;

mkdirSync(OUT, { recursive: true });

// noUncheckedIndexedAccess: the two device descriptors are compile-time-known
// registry keys — the non-null assertions are safe.
const desktop = { ...devices["Desktop Chrome"]!, viewport: { width: 1440, height: 900 } };
const mobile = { ...devices["iPhone 13"]!, browserName: "chromium" as const };
type Device = typeof desktop | typeof mobile;

type ShotMode = "full" | "viewport";
type ShotFn = (page: Page, context: BrowserContext) => Promise<void>;

async function shoot(browser: Browser, device: Device, name: string, mode: ShotMode, fn: ShotFn) {
  const context = await browser.newContext({ ...device, baseURL: BASE });
  const page = await context.newPage();
  try {
    await fn(page, context);
    if (mode === "full") await waitForImages(page); // S53-1 lazy-image settle
    await page.screenshot({ path: `${OUT}${name}.png`, fullPage: mode === "full" });
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await context.close();
  }
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForSelector('html[data-hydrated="true"]');
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(admin|account)/, { timeout: 15_000 });
}

/** Open a product detail page from the shop grid (cards are link-only) and
 *  add it with the given quantity via the detail-page ADD TO CART. */
async function addViaDetailPage(page: Page, cardText: string, quantity = 1) {
  await page.goto("/shop");
  await page.waitForSelector('html[data-hydrated="true"]');
  await page.locator("article").filter({ hasText: cardText }).first().getByRole("link").first().click();
  await page.waitForURL(/\/product\//);
  await page.waitForSelector('html[data-hydrated="true"]');
  for (let i = 1; i < quantity; i += 1) {
    await page.getByRole("button", { name: "Increase quantity" }).click();
  }
  await page.getByRole("button", { name: "ADD TO CART" }).click();
}

/** Deterministic add-to-cart: the header badge must read the given count. */
async function expectBadgeCount(page: Page, count: number) {
  const badge = page.getByTestId("cart-count");
  await badge.waitFor({ state: "visible", timeout: 15_000 });
  const text = (await badge.textContent())?.trim();
  if (text !== String(count)) {
    throw new Error(`cart-count badge shows "${text}", expected "${count}"`);
  }
}

/**
 * S53-1: full-page rasters can fire before below-fold lazy images decode.
 * The fullPage capture expands the viewport past every loading="lazy"
 * image at once, and the screenshot can outrun the loads — run 54 caught
 * rows 2-3 of the products grid blank on a cold server while rows 1+4 won
 * the race (the S35-2/S37-2/S42-2/S50-1 capture-gate family, on the
 * lazy-image surface). Promote every img to eager (starts any not-yet-
 * loaded lazy image) and gate on full decode; a genuinely broken image
 * fails the capture loudly instead of shipping a blank docs raster.
 */
async function waitForImages(page: Page) {
  await page.$$eval("img", (imgs) => {
    for (const img of imgs) {
      if (img instanceof HTMLImageElement) img.loading = "eager";
    }
  });
  await page.waitForFunction(
    () =>
      Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    { timeout: 15_000 }
  );
  await page.waitForTimeout(120); // decode-to-raster settle
}

// The script body lives in an async main() (the restore-demo-stock.ts
// pattern): tsx compiles this file as CommonJS — the repo's package.json
// carries no "type": "module" — and top-level await is a CJS syntax error.
async function main() {
  const browser = await chromium.launch();

  // ---------- Public desktop pages ----------
  await shoot(browser, desktop, "01-home", "full", async (page) => {
    await page.goto("/");
    await page.waitForSelector('html[data-hydrated="true"]');
  });
  await shoot(browser, desktop, "02-products", "full", async (page) => {
    await page.goto("/shop");
    await page.waitForSelector('html[data-hydrated="true"]');
  });
  await shoot(browser, desktop, "03-product-detail", "full", async (page) => {
    await page.goto("/shop");
    await page.waitForSelector('html[data-hydrated="true"]');
    await page.locator("article").filter({ hasText: "Pure Satin Silk Pillowcase" }).first().getByRole("link").first().click();
    await page.waitForLoadState("networkidle");
    // Select a color so the variant selector renders in the shot.
    await page.getByRole("button", { name: "Color Sky Blue" }).click();
    await page.waitForTimeout(200);
  });
  await shoot(browser, desktop, "04-cart", "full", async (page) => {
    await addViaDetailPage(page, "Pure Satin Silk Pillowcase");
    // The add is a fire-and-forget fetch — wait for the badge before the
    // navigation or the goto aborts it and the shot captures the empty cart
    // (session-23: the run-24 capture hit exactly this race).
    await expectBadgeCount(page, 1);
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
  });
  // Session-23 S23-2 evidence: the coupon-aware free-shipping hint. A
  // below-threshold cart shows the progress nag; an applied FREESHIP swaps it
  // for the coupon-attributed block (the S21-7 contradiction, resolved).
  await shoot(browser, desktop, "04b-cart-coupon-hint", "full", async (page) => {
    // Run-72: the ৳288 pillowcase cart sits below BOTH the ৳3,000 threshold
    // (the progress nag renders) and FREESHIP's own ৳3,000 minimum (the apply
    // rejects with the server's minimum error) — the honest below-threshold
    // state, both surfaces visible in one shot.
    await addViaDetailPage(page, "Pure Satin Silk Pillowcase");
    await expectBadgeCount(page, 1);
    await page.goto("/cart");
    await page.waitForLoadState("networkidle");
    await page.getByText("more for free shipping", { exact: false }).waitFor();
    await page.getByLabel("Coupon code").fill("FREESHIP");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    // S37-2 determinism: gate on the toast's auto-dismiss so the shot is
    // byte-stable (the animation frame at capture time was run-to-run noise).
    await page
      .locator("li")
      .filter({ hasText: "minimum subtotal" })
      .waitFor({ state: "detached", timeout: 10000 });
  });
  await shoot(browser, desktop, "05-login", "viewport", async (page) => {
    await page.goto("/login");
    await page.waitForSelector('html[data-hydrated="true"]');
  });
  await shoot(browser, desktop, "06-track-order", "full", async (page) => {
    // The protected tracking page (number + email contract).
    await page.goto(`/track-order?number=ELY-AAAAAAAA&email=${encodeURIComponent(DEMO_CUSTOMER_EMAIL)}`);
    await page.waitForLoadState("networkidle");
  });
  await shoot(browser, desktop, "07-about", "full", async (page) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
  });
  await shoot(browser, desktop, "08-contact", "full", async (page) => {
    await page.goto("/contact");
    await page.waitForSelector('html[data-hydrated="true"]');
  });
  await shoot(browser, desktop, "09-legal", "full", async (page) => {
    await page.goto("/legal/privacy-policy");
    await page.waitForLoadState("networkidle");
  });
  await shoot(browser, desktop, "10-register", "viewport", async (page) => {
    await page.goto("/register");
    await page.waitForSelector('html[data-hydrated="true"]');
  });
  await shoot(browser, desktop, "11-checkout", "full", async (page) => {
    await addViaDetailPage(page, "Pure Satin Silk Pillowcase");
    // The add is a fire-and-forget fetch — wait for the badge before the
    // navigation or the goto aborts it and the shot captures the empty-cart
    // shell at /checkout (session-35: the run-35 capture lost exactly this
    // race and shipped the empty state; the run-36 capture won it — the
    // same fix the 04-cart shot got in session-24).
    await expectBadgeCount(page, 1);
    await page.goto("/checkout");
    await page.waitForSelector('html[data-hydrated="true"]');
    // Fill the contact + address so the shot shows the live shipping tier
    // (Dhaka ৳70) instead of "Enter city to calculate".
    await page.getByLabel("Full Name *").fill("Ayesha Rahman");
    await page.getByLabel("Email *").fill(DEMO_CUSTOMER_EMAIL);
    await page.getByLabel("Phone Number *").fill("01787385459");
    await page.getByLabel("Address *").fill("House 12, Road 5, Dhanmondi");
    await page.getByLabel("City / District *").fill("Dhaka");
    await page.getByTestId("summary-shipping").getByText("৳70").waitFor();
  });

  // ---------- Authenticated desktop pages ----------
  await shoot(browser, desktop, "19-account", "full", async (page) => {
    await login(page, DEMO_CUSTOMER_EMAIL, DEMO_CUSTOMER_PASSWORD);
    await page.waitForLoadState("networkidle");
  });
  await shoot(browser, desktop, "12-admin-dashboard", "full", async (page) => {
    await login(page, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD);
    await page.waitForLoadState("networkidle");
    // S50-1: the dashboard's recharts RevenueChart animates its area draw on a
    // local ~1500ms timer after mount — `networkidle` fires while the animation
    // is still running, so the screenshot catches a variable frame and the shot
    // flips between rasters run-to-run against an UNCHANGED database (three
    // md5s across two consecutive capture runs in run 51; the S37-2/S42-2
    // animation-frame class). The 2000ms settle outlasts the animation.
    await page.waitForTimeout(2000);
  });
  for (const [name, path] of [
    ["13-admin-products", "/admin/products"],
    ["14-admin-orders", "/admin/orders"],
    ["15-admin-categories", "/admin/categories"],
    ["15b-admin-coupons", "/admin/coupons"],
    ["16-admin-carousel", "/admin/carousel"],
    ["17-admin-analytics", "/admin/analytics"],
    ["18-admin-settings", "/admin/settings"],
  ] as const) {
    await shoot(browser, desktop, name, "full", async (page) => {
      await login(page, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD);
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // S50-1: the analytics page renders recharts Bar/Pie charts with the
      // same ~1500ms mount animations as the dashboard's RevenueChart — its
      // shot flipped rasters run-to-run against an UNCHANGED database in run
      // 51 too. The 2000ms settle outlasts the animations; the other admin
      // pages carry no charts and stay on the plain networkidle gate.
      if (name === "17-admin-analytics") await page.waitForTimeout(2000);
    });
  }

  // ---------- Mobile ----------
  await shoot(browser, mobile, "20-mobile-home", "viewport", async (page) => {
    await page.goto("/");
    await page.waitForSelector('html[data-hydrated="true"]');
  });
  await shoot(browser, mobile, "21-mobile-menu-open", "viewport", async (page) => {
    await page.goto("/");
    await page.waitForSelector('html[data-hydrated="true"]');
    await page.getByTestId("mobile-menu-button").click();
    await page.getByTestId("mobile-menu").waitFor();
    // S42-2: the panel-mount re-rasterizes the photographic hero (and the
    // header's backdrop-blur + the category tile photos) — screenshotting
    // before the re-raster settles flips the shot between two raster states
    // run-to-run (the S37-2 class, ~12.6% of pixels, content-identical).
    // The 700ms settle (the parity-script methodology) pins one state.
    await page.waitForTimeout(700);
  });
  await shoot(browser, mobile, "22-tracking-locked", "viewport", async (page) => {
    // The anti-enumeration contract, visually: a number without its email.
    await page.goto("/track-order?number=ELY-AAAAAAAA");
    await page.waitForLoadState("networkidle");
  });
  await shoot(browser, desktop, "23-checkout-success-locked", "viewport", async (page) => {
    // S3-1 access contract, visually: a guessed crypto-random order number
    // (ELY-XXXXXXXX — no sequence to enumerate) without its token renders
    // the same not-found shell — no receipt, no PII.
    await page.goto("/checkout/success?order=ELY-AAAAAAAA");
    await page.waitForLoadState("networkidle");
  });

  await browser.close();
  console.log(`\nScreenshots written to ${OUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
