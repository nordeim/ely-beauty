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
 * SEARCH row that opens the shared full-screen search overlay (S77-2),
 * then Shop / Beauty Tools / Brush & Combs / About. S74-2: the panel ends
 * at About (the reference's panel carries nothing else — the Sign In/Wishlist/
 * Admin rows were scaffold heritage); the wishlist entry lives in the
 * footer's SUPPORT column. The active link carries aria-current with NO
 * color highlight (the invisible a11y superset, S73-4). S110-4: the SEARCH
 * row CLOSES the panel at overlay-open time (the reference's measured
 * state machine — re-measured run-110).
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

    // S74-2 (P-1): the reference panel is SEARCH + the four nav links ONLY
    // (measured live 2026-11-08: the panel text ends at ABOUT — no account,
    // wishlist, or admin rows). The wishlist entry moved to the footer's
    // SUPPORT column; account stays on the header icon.
    await expect(panel.getByRole("button", { name: "Search", exact: true })).toBeVisible();
    for (const label of ["Shop", "Beauty Tools", "Brush & Combs", "About"]) {
      await expect(panel.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    // The superset rows are GONE from the panel (reference parity).
    await expect(panel.getByRole("link", { name: "Sign In", exact: true })).toHaveCount(0);
    await expect(panel.getByRole("link", { name: "Wishlist", exact: true })).toHaveCount(0);
    await expect(panel.getByRole("link", { name: "My Account", exact: true })).toHaveCount(0);
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

  test("the active route carries aria-current with NO color highlight (reference parity)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByTestId("mobile-menu-button").click();
    const panel = page.getByTestId("mobile-menu");
    const activeLink = panel.getByRole("link", { name: "Shop", exact: true });
    // S73-4: the LIVE reference renders NO active-link treatment — every
    // panel link is foreground-colored, no aria-current (measured
    // 2026-11-08: all links rgb(26,26,26)). The clone keeps aria-current
    // scoped to the exact-path no-query links as the invisible a11y
    // superset, and drops the run-72 text-primary highlight for parity.
    await expect(activeLink).toHaveAttribute("aria-current", "page");
    // No STANDALONE text-primary token (the hover: variant is fine — the
    // whitespace-delimited pattern matches the run-72 active class but not
    // "hover:text-primary").
    await expect(activeLink).not.toHaveClass(/(?:^|\s)text-primary(?:\s|$)/);

    // CSS-color assertion: the active link renders in the SAME color as an
    // idle link on the panel (uniform foreground — the reference anatomy).
    const idleLink = panel.getByRole("link", { name: "About", exact: true });
    const [activeColor, idleColor] = await Promise.all([
      activeLink.evaluate((el) => getComputedStyle(el).color),
      idleLink.evaluate((el) => getComputedStyle(el).color),
    ]);
    expect(activeColor).toBe(idleColor);

    // The query-string links (Beauty Tools / Brush & Combs) never claim
    // current on /shop — the exact-path scoping (the I-1 fix).
    await expect(panel.getByRole("link", { name: "Beauty Tools", exact: true })).not.toHaveAttribute("aria-current");
    await expect(panel.getByRole("link", { name: "Brush & Combs", exact: true })).not.toHaveAttribute("aria-current");
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

  test("the panel SEARCH row opens the full-screen overlay that searches and navigates", async ({ page }) => {
    // S77-2 (D-1, measured live): the reference's panel SEARCH row opens
    // the SAME full-screen overlay the header icon opens (z-[70]
    // bg-background/95 backdrop-blur) — the in-panel content swap retired.
    // On the home route (the run-72 fix: the solid-bar layout while the
    // panel is open keeps the panel's rows reachable under the fixed bar).
    const menuButton = page.getByTestId("mobile-menu-button");
    await menuButton.click();
    const panel = page.getByTestId("mobile-menu");
    await panel.getByRole("button", { name: "Search", exact: true }).click();

    // The shared full-screen overlay mounts (S110-4: the panel closed at
    // open time — the reference's measured state machine).
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();
    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await expect(input).toBeVisible();
    await expect(overlay.getByRole("button", { name: "Close search" })).toBeVisible();

    // The overlay is full-screen (the layout viewport box, not a header
    // dropdown). The iPhone 13 descriptor's viewport is 390x664 (the
    // visible-viewport approximation) — pinned dynamically so a descriptor
    // change cannot silently break it.
    const viewport = page.viewportSize();
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox?.x).toBeCloseTo(0, 1);
    expect(overlayBox?.y).toBeCloseTo(0, 1);
    expect(overlayBox?.width).toBeCloseTo(viewport?.width ?? 390, 0);
    expect(overlayBox?.height).toBeCloseTo(viewport?.height ?? 664, 0);

    // Live typeahead: rows carry name + the shortDescription copy + ৳ price
    // (S77-3 — the category label retired with the row anatomy fix).
    await input.fill("silk");
    await expect(overlay.getByText("Pure Satin Silk Pillowcase – For Hair & Skin")).toBeVisible({
      timeout: 10_000,
    });
    await expect(overlay.getByText("Sleep in smooth comfort", { exact: false }).first()).toBeVisible();
    // S82-1: the reference's overlay row price is its $ template format.
    await expect(overlay.getByText("$288.00").first()).toBeVisible();

    // Navigating a result closes the overlay and the panel (route-change
    // effects), landing on the detail page.
    await overlay.getByRole("link", { name: /Pure Satin Silk Pillowcase/ }).click();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByTestId("search-overlay")).toHaveCount(0);
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);
  });

  test("a broad query's 8 capped rows stay reachable inside the scrolling 60vh list (S78-1)", async ({ page }) => {
    // S78-1 (D-1 + A-1, measured live): the reference's result list is
    // `mt-6 space-y-1 max-h-[60vh] overflow-y-auto` — on the 664px iPhone
    // viewport the 8 capped rows (~784px of content) MUST scroll inside
    // the capped list or the last rows are permanently unreachable (a
    // fixed container does not scroll; the page behind it does not move
    // it). The run-77 clone shipped an uncapped list — this is the
    // reachability regression guard.
    const menuButton = page.getByTestId("mobile-menu-button");
    await menuButton.click();
    const panel = page.getByTestId("mobile-menu");
    await panel.getByRole("button", { name: "Search", exact: true }).click();

    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();
    const input = overlay.getByRole("searchbox", { name: "Search products" });

    // S78-2 (D-2): the 1-char floor — "e" matches the capped 8 rows now.
    await input.fill("e");
    const rows = overlay.locator("ul > li");
    await expect(rows).toHaveCount(8, { timeout: 10_000 });

    // The list box is capped at 60% of the viewport height.
    const list = overlay.locator("ul").first();
    await expect(list).toHaveClass(/max-h-\[60vh\]/);
    await expect(list).toHaveClass(/overflow-y-auto/);
    const listBox = await list.boundingBox();
    const viewport = page.viewportSize();
    expect(listBox?.height).toBeLessThanOrEqual((viewport?.height ?? 664) * 0.6 + 1);

    // The 8th row scrolls into view inside the capped list — the S78-1
    // reachability contract.
    const lastRow = rows.nth(7);
    await lastRow.scrollIntoViewIfNeeded();
    await expect(lastRow).toBeVisible();
  });

  test("the panel SEARCH row CLOSES the panel when it opens the overlay (S110-4, measured live)", async ({ page }) => {
    // Run-110 re-measure (matched methodology, both sites logged in, both
    // exit paths probed): the reference's panel does NOT stay mounted
    // under the search overlay — clicking the panel's SEARCH row closes
    // the panel AT OPEN TIME (the reference's header box collapses
    // 278 → 64px while the overlay is up) and the panel stays closed
    // after the overlay exits. The S77-2 claim ("the panel stays open
    // underneath the overlay, exactly like the reference") was stale —
    // re-measured and corrected this cycle.
    const menuButton = page.getByTestId("mobile-menu-button");
    await menuButton.click();
    const panel = page.getByTestId("mobile-menu");
    await expect(panel).toBeVisible();

    await panel.getByRole("button", { name: "Search", exact: true }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    // The panel closed at open time — the reference's measured state machine.
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);

    // Exiting the overlay keeps the panel closed (no zombie re-open).
    await overlay.getByRole("button", { name: "Close search" }).click();
    await expect(page.getByTestId("search-overlay")).toHaveCount(0);
    await expect(page.getByTestId("mobile-menu")).toHaveCount(0);

    // The hamburger re-opens the panel — proves the close was a state
    // set, not a broken mount (the v4-safe pattern holds).
    await menuButton.click();
    await expect(page.getByTestId("mobile-menu")).toBeVisible();
  });
});

test.describe("mobile navigation — the S75 measured frame (header + panel geometry)", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/");
  });

  test("the mobile header is 64px tall (h-16 lg:h-20, measured on the reference)", async ({ page }) => {
    // D-1 (S75-2): the reference's header inner is h-16 lg:h-20 — 64px on
    // this 390px viewport, 80px on desktop. The kitchen-era clone pinned
    // h-20 at every viewport, pushing the panel 16px low.
    const header = page.locator("header");
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box?.height).toBeCloseTo(64, 1);
  });

  test("the open panel starts below the 64px bar with 24px content padding", async ({ page }) => {
    // D-9 (S75-2): the panel's content column rides container-page's px-6
    // (24px) — the element-level px overrides retired (the CSS-order bug
    // that let container-page's old px-4 win and render 16px).
    await page.getByTestId("mobile-menu-button").click();
    const panel = page.getByTestId("mobile-menu");
    await expect(panel).toBeVisible();
    // Settle before measuring (the documented session-41 class): the panel
    // mounts with a slide-in-from-top-2 animation — a bounding box read
    // mid-animation reports the translated position (62.4 instead of 64).
    await page.waitForTimeout(700);
    const panelBox = await panel.boundingBox();
    expect(panelBox?.y).toBeCloseTo(64, 1);

    const searchRow = panel.getByRole("button", { name: "Search", exact: true });
    const searchBox = await searchRow.boundingBox();
    expect(searchBox?.x).toBeCloseTo(24, 1);

    // The panel ends at About (S74-2) — the row rhythm is 16px gaps.
    const about = panel.getByRole("link", { name: "About", exact: true });
    const aboutBox = await about.boundingBox();
    expect(aboutBox?.x).toBeCloseTo(24, 1);
    const aboutDelta = (aboutBox?.y ?? 0) - (searchBox?.y ?? 0);
    expect(aboutDelta).toBeCloseTo(4 * 36, 0);
  });
});
