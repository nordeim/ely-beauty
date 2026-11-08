import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Navigate and WAIT FOR HYDRATION before any interaction.
 *
 * Playwright's actionability checks do not cover React hydration — clicking
 * a button before the client bundle wires events silently falls back to
 * native form submission (the login regression this guard exists for).
 * StoreProvider stamps <html data-hydrated="true"> once the tree is live.
 */
export async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForSelector('html[data-hydrated="true"]', { timeout: 20_000 });
}

export const DEMO_CUSTOMER = {
  email: "demo@elybeauty.com",
  password: "Demo1234!",
};

export const DEMO_ADMIN = {
  email: "admin@elybeauty.com",
  password: "Admin123!",
};

/** The seeded in-stock product the specs add through its detail page (run-72:
 *  cards are link-only — ADD TO CART lives on /product/<id>). */
export const PILLOWCASE = {
  name: "Pure Satin Silk Pillowcase – For Hair & Skin",
  cardText: "Pure Satin Silk Pillowcase",
  price: "৳288",
};

/**
 * Open a product's detail page from a /shop listing and return its URL.
 * Clicks the heading's inner LINK — the inline link can be narrower than its
 * block heading, and a center-of-heading click on the trailing empty space
 * navigates nowhere (caught by the short-named "Stainless Steel Gua Sha"
 * card; the run-72 cards are link-only).
 */
export async function openDetailFromShop(
  page: Page,
  cardText: string,
  path = "/shop",
): Promise<string> {
  await gotoHydrated(page, path);
  const card = page.locator("article").filter({ hasText: cardText }).first();
  await card.getByRole("heading").first().getByRole("link").click();
  await page.waitForURL(/\/product\//, { timeout: 10_000 });
  return page.url();
}

/**
 * Add a product to the cart through its DETAIL page (the run-72 anatomy):
 * open /shop (or a filtered listing via opts.path — e.g. a category view for
 * a product beyond page 1 of the 12-per-page global grid), click the
 * matching card, optionally pick a variant swatch, click ADD TO CART and
 * wait for the header badge to prove the POST landed.
 */
export async function addToCartViaDetailPage(
  page: Page,
  cardText: string,
  opts: { variant?: string; quantity?: number; path?: string } = {},
): Promise<void> {
  await openDetailFromShop(page, cardText, opts.path);
  if (opts.variant) {
    await page.getByRole("button", { name: `Color ${opts.variant}` }).click();
  }
  for (let i = 1; i < (opts.quantity ?? 1); i += 1) {
    await page.getByRole("button", { name: "Increase quantity" }).click();
  }
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await expect(page.getByTestId("cart-count")).toHaveText(String(opts.quantity ?? 1), {
    timeout: 10_000,
  });
}
