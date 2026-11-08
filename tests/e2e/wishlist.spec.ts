import { expect, test } from "@playwright/test";
import { gotoHydrated, openDetailFromShop } from "./helpers";

/**
 * Wishlist flows (session-8 S8-6/S8-12; run-72 re-pins): the heart lives on
 * the product DETAIL page (the editorial cards carry no heart), toggles into
 * the guest wishlist, the page lists the saved items (bounded read), and
 * "Add All to Cart" lands everything in ONE bulk request instead of a
 * limper-fighting sequential loop.
 */

/** Open a product's detail page from the /shop grid and return its URL. */
async function openDetailPage(page: import("@playwright/test").Page, cardText: string): Promise<string> {
  return openDetailFromShop(page, cardText);
}

/** Heart a product from its detail page and wait for the toast. */
async function heartFromDetail(page: import("@playwright/test").Page, cardText: string): Promise<void> {
  await openDetailPage(page, cardText);
  const heart = page.getByRole("button", { name: /^Add .* to wishlist$/ });
  await heart.click();
  // .first(): the toast title also lives inside the aria-live wrapper's
  // text — a strict-mode race the suite has hit before (session-9).
  await expect(page.getByText("Added to wishlist").first()).toBeVisible({ timeout: 10_000 });
}

test.describe("wishlist", () => {
  test("hearts toggle, the page lists items, and Add All bulk-adds to the cart", async ({ page }) => {
    // Heart two in-stock products from their detail pages (labels name the
    // product — session-7 S7-13).
    await heartFromDetail(page, "Pure Satin Silk Pillowcase");
    await heartFromDetail(page, "Natural Bamboo Hair Brush - Square");

    // The wishlist page lists exactly the two saved items.
    await gotoHydrated(page, "/wishlist");
    await expect(page.getByText(/2 saved items?/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Pure Satin Silk Pillowcase – For Hair & Skin").first()).toBeVisible();
    await expect(page.getByText("Natural Bamboo Hair Brush - Square").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Add All to Cart/i })).toBeEnabled();

    // One bulk request → both lines in the cart → routed to /cart.
    await page.getByRole("button", { name: /Add All to Cart/i }).click();
    await expect(page).toHaveURL(/\/cart/, { timeout: 15_000 });
    await expect(page.getByText(/2 items?/).first()).toBeVisible({ timeout: 10_000 });
  });

  test("removing a heart takes the item back out of the wishlist", async ({ page }) => {
    const detailUrl = await openDetailPage(page, "Pure Satin Silk Pillowcase");
    const heart = page.getByRole("button", { name: /^Add .* to wishlist$/ });
    const label = (await heart.getAttribute("aria-label")) ?? "";
    const productName = label.replace(/^Add (.*) to wishlist$/, "$1");
    expect(productName).not.toBe("");
    await heart.click();
    // .first(): the toast title also lives inside the aria-live wrapper's
    // text — a strict-mode race the suite has hit before (session-9).
    await expect(page.getByText("Added to wishlist").first()).toBeVisible({ timeout: 10_000 });

    await gotoHydrated(page, "/wishlist");
    await expect(page.getByText(/1 saved item/)).toBeVisible({ timeout: 10_000 });

    // Revisit the detail page — the heart renders the filled "Remove …"
    // state (S11-2 server truth). Toggle it again → removed.
    await gotoHydrated(page, detailUrl);
    const filled = page.getByRole("button", { name: `Remove ${productName} from wishlist`, exact: true });
    await expect(filled).toBeVisible({ timeout: 10_000 });
    await filled.click();
    await expect(page.getByText("Removed from wishlist").first()).toBeVisible({ timeout: 10_000 });

    await gotoHydrated(page, "/wishlist");
    await expect(page.getByText(/wishlist is empty/i)).toBeVisible({ timeout: 10_000 });
  });

  test("the detail-page heart renders the filled wishlist state and flips its label (S11-2)", async ({ page }) => {
    const detailUrl = await openDetailPage(page, "Pure Satin Silk Pillowcase");
    const heart = page.getByRole("button", { name: /^Add .* to wishlist$/ });
    const label = (await heart.getAttribute("aria-label")) ?? "";
    const productName = label.replace(/^Add (.*) to wishlist$/, "$1");
    expect(productName).not.toBe("");

    await heart.click();
    await expect(page.getByText("Added to wishlist").first()).toBeVisible({ timeout: 10_000 });

    // Client-side flip: the just-toggled heart reads "Remove …" immediately.
    const removeHeart = page
      .getByRole("button", { name: `Remove ${productName} from wishlist`, exact: true });
    await expect(removeHeart).toBeVisible({ timeout: 10_000 });

    // Server truth: a fresh render still shows the filled state.
    await gotoHydrated(page, detailUrl);
    await expect(
      page
        .getByRole("button", { name: `Remove ${productName} from wishlist`, exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    // And the stale "Add …" label is gone for that product.
    await expect(
      page.getByRole("button", { name: `Add ${productName} to wishlist`, exact: true }),
    ).toHaveCount(0);
  });
});
