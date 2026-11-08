import { expect, test } from "@playwright/test";
import { gotoHydrated, openDetailFromShop } from "./helpers";

// S15-2: the storefront cardinality pins must not hard-couple to the demo
// DB's exact row counts (the S14-4 data-depletion class — a deactivated seed
// product or an admin-created extra permanently breaks an absolute pin).
// The e2e layer therefore pins the count FORMAT + the seeded slugs/order;
// the exact seed-owned values (19 products, 10 beauty-tools, the run-72
// ElyBeauty re-skin reference order) are pinned where the seed constant can
// actually be imported — tests/unit/seed-catalog.test.ts — and the
// restore-demo-stock harness (which now also restores isActive) keeps the
// live DB aligned with them.

/**
 * Storefront parity smoke — the ElyBeauty reference anatomy (run-72):
 * single-slide editorial hero, "Shop by Ritual" tiles, "Curated for You"
 * grid, ritual banner, category pills + sort combobox on /shop, the desktop
 * search overlay, and the product detail page. No trust badges, no
 * newsletter, no per-card add-to-cart (cards are link-only).
 */
test.describe("storefront", () => {
  test("home renders the reference anatomy", async ({ page }) => {
    await gotoHydrated(page, "/");

    // Hero: the seeded single editorial slide (region + h1 + subtitle + CTA).
    await expect(page.getByRole("region", { name: "Featured collections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The Art of Radiance", level: 1 })).toBeVisible();
    await expect(
      page.getByText("Luxury botanicals. Clinical precision. Your skin, elevated."),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /SHOP THE COLLECTION/ }).first()).toBeVisible();

    // Shop by Ritual — the 4 seeded category tiles (scoped: the same names
    // also live in the header nav and the footer).
    const ritual = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Shop by Ritual" }),
    });
    await expect(ritual).toBeVisible();
    for (const cat of ["Beauty Tools", "Brush & Combs", "Bestsellers", "Gift Sets"]) {
      await expect(ritual.getByRole("link", { name: new RegExp(`^${cat}( —|$)`) })).toBeVisible();
    }

    // Curated for You — the 6 newest products + the View All link.
    await expect(page.getByRole("heading", { name: "Curated for You" })).toBeVisible();
    await expect(page.getByRole("link", { name: /View All/ }).first()).toBeVisible();
    const cards = page.locator("article");
    expect(await cards.count()).toBeGreaterThanOrEqual(6);

    // Ritual banner (the reference's inset photographic CTA).
    await expect(page.getByRole("heading", { name: "Complete Your Ritual" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Discover Sets/ }).first()).toBeVisible();

    // The reference's floating WhatsApp affordance rides every storefront page.
    const whatsapp = page.getByTestId("whatsapp-float");
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("aria-label", "Chat on WhatsApp");

    // The run-72 skin dropped the old trust badges + newsletter surfaces.
    for (const gone of ["Free Shipping", "Secure Payment", "Easy Returns", "24/7 Support", "Subscribe"]) {
      await expect(page.getByText(gone, { exact: true })).toHaveCount(0);
    }
  });

  test("shop lists the catalog with count, pills, sort and pagination", async ({ page }) => {
    await gotoHydrated(page, "/shop");

    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
    // 19 seeded products — the count text has no "found" (run-72 copy).
    await expect(page.getByText("19 products", { exact: true })).toBeVisible();
    await expect(page.getByText(/products found/)).toHaveCount(0);

    // Page 1 opens in the reference's authored order = newest-first (the
    // seed backdates rows): the sold-out Bonnet is FIRST, the Pillowcase
    // (first in-stock card) second.
    const firstArticle = page.locator("article").first();
    await expect(firstArticle.getByText("Premium Double Sided Ruffles Silk Hair Bonnet")).toBeVisible();
    await expect(page.getByText("Pure Satin Silk Pillowcase – For Hair & Skin").first()).toBeVisible();

    // Pagination reaches the tail on page 2 (19 products at 12/page — the
    // oldest 7 seeded rows under the newest-first default).
    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("Full Silicon Scalp Massager").first()).toBeVisible();
    await expect(
      page.getByText("Facial Ice Bowl – Foldable & Travel-Friendly").first(),
    ).toBeVisible();

    // Back to page 1 via the pill row (a pill change always resets ?page).
    await page.getByRole("button", { name: "All Products" }).click();
    await expect(page).toHaveURL(/\/shop$/);

    // Category filter pills — active pill carries the solid foreground fill.
    const allPill = page.getByRole("button", { name: "All Products" });
    await expect(allPill).toHaveClass(/bg-foreground/);
    for (const pill of ["Beauty Tools", "Brush & Combs", "Bestsellers", "Gift Sets"]) {
      await expect(page.getByRole("button", { name: pill, exact: true })).toBeVisible();
    }

    // Sort combobox (Radix Select) — "Top Rated" is gone; price-asc re-orders
    // the grid (the ৳120 applicator set becomes the first card).
    await page.getByRole("combobox", { name: "Sort products" }).click();
    for (const option of ["Newest", "Price: Low to High", "Price: High to Low", "Name: A-Z"]) {
      await expect(page.getByRole("option", { name: option, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("option", { name: "Top Rated" })).toHaveCount(0);
    await page.getByRole("option", { name: "Price: Low to High" }).click();
    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(
      page.locator("article").first().getByText("Travel Silicone Mask Applicator Set 4 Pcs"),
    ).toBeVisible();

    // Category pill narrows results (10 seeded beauty-tools products).
    await page.getByRole("button", { name: "Beauty Tools", exact: true }).click();
    await expect(page).toHaveURL(/category=beauty-tools/);
    await expect(page.getByText("10 products", { exact: true })).toBeVisible();
    await expect(page.getByText("Pure Satin Silk Pillowcase – For Hair & Skin").first()).toBeHidden();
    await expect(page.getByText("Stainless Steel Gua Sha").first()).toBeVisible();
  });

  test("the desktop search overlay finds products live and navigates", async ({ page }) => {
    await gotoHydrated(page, "/shop");

    // Open the header's search overlay.
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    // Live typeahead: results carry name + category + ৳ price.
    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await input.fill("silk");
    await expect(overlay.getByText("Pure Satin Silk Pillowcase – For Hair & Skin")).toBeVisible({
      timeout: 10_000,
    });
    await expect(overlay.getByText("Bestsellers").first()).toBeVisible();
    await expect(overlay.getByText("৳288").first()).toBeVisible();

    // Navigating a result closes the overlay and lands on the detail page.
    await overlay.getByRole("link", { name: /Pure Satin Silk Pillowcase/ }).click();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByTestId("search-overlay")).toHaveCount(0);
  });

  test("product detail renders gallery, price, variant selector and reviews", async ({ page }) => {
    await openDetailFromShop(page, "Pure Satin Silk Pillowcase", "/shop?q=pillowcase");
    await expect(page).toHaveURL(/\/product\//);

    await expect(
      page.getByRole("heading", { name: "Pure Satin Silk Pillowcase – For Hair & Skin", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Shop" })).toBeVisible();
    await expect(page.getByText("In Stock").first()).toBeVisible();
    await expect(page.getByText("৳288").first()).toBeVisible();
    await expect(page.getByText("৳350").first()).toBeVisible();

    // COLOR selector: live label + swatch buttons (aria-label "Color <name>").
    await expect(page.getByText("Color: Pink")).toBeVisible();
    for (const color of ["Pink", "Navy Blue", "Sky Blue", "Black"]) {
      await expect(page.getByRole("button", { name: `Color ${color}` })).toBeVisible();
    }

    // Purchase affordances live on the DETAIL page (cards are link-only).
    await expect(page.getByRole("button", { name: "ADD TO CART" })).toBeVisible();
    await expect(page.getByRole("button", { name: "BUY IT NOW" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Add Pure Satin Silk Pillowcase – For Hair & Skin to wishlist" }),
    ).toBeVisible();

    // Content sections + reviews + related.
    await expect(page.getByRole("heading", { name: "Description" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Customer Reviews" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Complete the Ritual" })).toBeVisible();

    // A how-to-use product renders its usage section (conditional content).
    await openDetailFromShop(page, "Stainless Steel Gua Sha", "/shop?q=gua");
    await expect(page.getByRole("heading", { name: "How to Use" })).toBeVisible();
  });

  test("category tiles deep-link into filtered products", async ({ page }) => {
    await gotoHydrated(page, "/");
    const ritual = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Shop by Ritual" }),
    });
    await ritual.getByRole("link", { name: /^Brush & Combs/ }).click();
    await expect(page).toHaveURL(/category=brush-combs/);
    await expect(page.getByText("6 products", { exact: true })).toBeVisible();
    await expect(page.getByText("Natural Bamboo Hair Brush - Square").first()).toBeVisible();
  });

  test("footer links carry the reference policies", async ({ page }) => {
    await gotoHydrated(page, "/");
    for (const label of ["Privacy Policy", "Terms of Service"]) {
      await expect(page.getByRole("link", { name: label }).first()).toBeVisible();
    }
    await page.getByRole("link", { name: "Privacy Policy" }).first().click();
    await expect(page).toHaveURL(/\/legal\/privacy-policy/);
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });
});
