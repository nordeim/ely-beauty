import { expect, test } from "@playwright/test";
import { gotoHydrated, addToCartViaDetailPage, PILLOWCASE } from "./helpers";

/**
 * Cart badge freshness (session-9 S9-1): the header badge must show the
 * server-computed count on a FRESH full page load. The context used to
 * initialize `cartCount` at 0 (never null), so the `liveCount ?? serverProp`
 * fallback in StoreChrome never fired and every hard load rendered badge-less
 * until the next in-page mutation — the server-computed count was dead code.
 *
 * Run-72: the add goes through the product DETAIL page (cards are link-only).
 */
test.describe("cart badge", () => {
  test("survives a full page reload with the server-rendered count", async ({ page }) => {
    await addToCartViaDetailPage(page, PILLOWCASE.cardText);

    // FULL reload — the badge must come back from the server-rendered count.
    await page.reload();
    await expect(page.getByTestId("cart-count")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("cart-count")).toHaveText("1");
  });

  test("keeps the count across a client-side navigation into the cart", async ({ page }) => {
    await addToCartViaDetailPage(page, PILLOWCASE.cardText);

    // Open the drawer and use its View Cart link (client-side navigation) —
    // the badge must not blank out mid-journey.
    await page.getByRole("button", { name: /^Cart/ }).click();
    await page.getByRole("link", { name: "View Cart" }).click();
    await expect(page).toHaveURL(/\/cart/, { timeout: 15_000 });
    await expect(page.getByTestId("cart-count")).toHaveText("1");
  });
});
