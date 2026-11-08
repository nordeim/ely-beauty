import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

/**
 * Mobile navigation — the Tailwind v4 regression guard.
 *
 * The bug this spec pins: Tailwind v4 changed the generation order of
 * display utilities, so JS-toggling the `hidden` class on an element that
 * also carries `flex`/`block` silently fails (tailwindlabs/tailwindcss#15884,
 * #18653; preflight's `[hidden]` now also carries !important).
 *
 * The implementation contract (src/components/store/mobile-nav.tsx):
 * the panel is conditionally MOUNTED via React state and never toggles a
 * display utility. These tests fail if anyone reintroduces a hidden-vs-flex
 * toggle: open -> panel visible with the search row + nav links; navigate
 * works; the header toggle X hides it; the hamburger re-opens it.
 *
 * Run-72 anatomy: the panel is the reference's ivory push-down with a
 * SEARCH row that swaps the panel content for an input + live results, then
 * Shop / Beauty Tools / Brush & Combs / About, a divider, then Sign In +
 * Wishlist (Admin Dashboard for admins only). The active link is the
 * text-primary color (no bg-primary pill anymore).
 */
test.describe("mobile navigation (Tailwind v4 regression guard)", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/");
  });

  test("hamburger opens the push-down panel with the search row and nav links", async ({ page }) => {
    const menuButton = page.getByTestId("mobile-menu-button");
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-label", "Open menu");

    await menuButton.click();
    const panel = page.getByTestId("mobile-menu");
    await expect(panel).toBeVisible();

    // Conditional mount: the panel is mounted via React state and carries NO
    // bare `hidden` token (the v4 display-toggle trap — `lg:hidden` is a
    // static responsive pair and is fine).
    const hasBareHidden = await panel.evaluate((el) => el.classList.contains("hidden"));
    expect(hasBareHidden).toBe(false);

    // The reference panel: a Search row + the nav links + account rows.
    await expect(panel.getByRole("button", { name: "Search", exact: true })).toBeVisible();
    for (const label of ["Shop", "Beauty Tools", "Brush & Combs", "About", "Sign In", "Wishlist"]) {
      await expect(panel.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    // Guests never see the admin surface.
    await expect(panel.getByRole("link", { name: "Admin Dashboard" })).toHaveCount(0);
  });

  test("nav links navigate and the panel closes afterwards", async ({ page }) => {
    await page.getByTestId("mobile-menu-button").click();
    const panel = page.getByTestId("mobile-menu");
    await panel.getByRole("link", { name: "Shop", exact: true }).click();
    await expect(page).toHaveURL(/\/shop/);
    // Route change closes the panel (mobile-nav effect).
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
  });

  test("the header toggle X closes the panel and it can be reopened", async ({ page }) => {
    const menuButton = page.getByTestId("mobile-menu-button");
    await menuButton.click();
    const panel = page.getByTestId("mobile-menu");
    await expect(panel).toBeVisible();

    // While open the toggle flips to the X: the aria-label flips and the
    // affordance keeps its 44×44 touch target.
    await expect(menuButton).toHaveAttribute("aria-label", "Close menu");
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    const box = await menuButton.boundingBox();
    expect(box?.width).toBe(44);
    expect(box?.height).toBe(44);

    await menuButton.click();
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
    await expect(menuButton).toHaveAttribute("aria-label", "Open menu");

    // Reopen — proves the toggle is state-driven, not a one-shot class flip.
    await menuButton.click();
    await expect(page.getByTestId("mobile-menu")).toBeVisible();
  });

  test("the active route is highlighted with the text-primary color (no pill)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByTestId("mobile-menu-button").click();
    const panel = page.getByTestId("mobile-menu");
    const activeLink = panel.getByRole("link", { name: "Shop", exact: true });
    await expect(activeLink).toHaveAttribute("aria-current", "page");
    // Run-72: the active treatment is the text-primary color — the reference
    // dropped the old bg-primary pill.
    await expect(activeLink).toHaveClass(/text-primary/);
    await expect(activeLink).not.toHaveClass(/bg-primary/);

    // CSS-color assertion: the active link renders in the primary color, a
    // different computed color from an idle link on the same panel.
    const idleLink = panel.getByRole("link", { name: "About", exact: true });
    const [activeColor, idleColor] = await Promise.all([
      activeLink.evaluate((el) => getComputedStyle(el).color),
      idleLink.evaluate((el) => getComputedStyle(el).color),
    ]);
    expect(activeColor).not.toBe(idleColor);
  });

  test("panel works on the reference's core routes (about)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByTestId("mobile-menu-button").click();
    await page.getByTestId("mobile-menu").getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Beauty, Redefined" })).toBeVisible();
  });

  test("body scroll locks while the panel is open", async ({ page }) => {
    const menuButton = page.getByTestId("mobile-menu-button");
    await menuButton.click();
    await expect(page.getByTestId("mobile-menu")).toBeVisible();
    const locked = await page.evaluate(() => document.body.style.overflow === "hidden");
    if (!locked) {
      // The provider locks scroll for the panel; if it ever regresses, fail loudly.
      throw new Error("body scroll lock missing while mobile menu is open");
    }
    await page.getByTestId("mobile-menu-button").click();
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
    await expect
      .poll(async () => page.evaluate(() => document.body.style.overflow === ""))
      .toBe(true);
  });

  test("the panel search flow swaps links for a live search that navigates", async ({ page }) => {
    // On the home route (the run-72 fix: the solid-bar layout while the
    // panel is open keeps the panel's rows reachable under the fixed bar).
    const menuButton = page.getByTestId("mobile-menu-button");
    await menuButton.click();
    const panel = page.getByTestId("mobile-menu");
    await panel.getByRole("button", { name: "Search", exact: true }).click();

    // The panel content swaps to the search input + its Close affordance.
    const searchMode = page.getByTestId("mobile-panel-search");
    await expect(searchMode).toBeVisible();
    const input = searchMode.getByRole("searchbox", { name: "Search products" });
    await expect(input).toBeVisible();
    await expect(searchMode.getByRole("button", { name: "Close search" })).toBeVisible();

    // Live typeahead: results carry name + category + ৳ price.
    await input.fill("silk");
    await expect(searchMode.getByText("Pure Satin Silk Pillowcase – For Hair & Skin")).toBeVisible({
      timeout: 10_000,
    });
    await expect(searchMode.getByText("Bestsellers").first()).toBeVisible();
    await expect(searchMode.getByText("৳288").first()).toBeVisible();

    // Navigating a result closes the panel via the route-change effect.
    await searchMode.getByRole("link", { name: /Pure Satin Silk Pillowcase/ }).click();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
  });
});
