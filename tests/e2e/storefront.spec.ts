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
    // The ritual banner's CTA links plain /shop (S81-8 — the reference's
    // "Discover Sets" carries no category param).
    const discoverSets = page.getByRole("link", { name: /Discover Sets/ }).first();
    await expect(discoverSets).toBeVisible();
    await expect(discoverSets).toHaveAttribute("href", "/shop");

    // The reference's floating WhatsApp affordance rides every storefront page.
    const whatsapp = page.getByTestId("whatsapp-float");
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute("aria-label", "Chat on WhatsApp");

    // The run-72 skin dropped the old trust badges + newsletter surfaces.
    for (const gone of ["Free Shipping", "Secure Payment", "Easy Returns", "24/7 Support", "Subscribe"]) {
      await expect(page.getByText(gone, { exact: true })).toHaveCount(0);
    }
  });

  test("shop lists the catalog with count, pills, sort and the ONE-PAGE grid", async ({ page }) => {
    await gotoHydrated(page, "/shop");

    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
    // 19 seeded products — the count text has no "found" (run-72 copy).
    await expect(page.getByText("19 products", { exact: true })).toBeVisible();
    await expect(page.getByText(/products found/)).toHaveCount(0);

    // S81-5: the reference renders the WHOLE catalog on ONE page (19 cards,
    // no pagination controls at this catalog size).
    await expect(page.locator("article")).toHaveCount(19);
    await expect(page.getByRole("navigation", { name: "Product pages" })).toHaveCount(0);

    // Page 1 opens in the reference's authored order = newest-first (the
    // seed backdates rows): the Bonnet is FIRST, the Pillowcase second.
    // (S90-4: the Bonnet was the run-72 sold-out lead; the reference
    // restocked it — the grid renders stock-independent either way.)
    const firstArticle = page.locator("article").first();
    await expect(firstArticle.getByText("Premium Double Sided Ruffles Silk Hair Bonnet")).toBeVisible();
    await expect(page.getByText("Pure Satin Silk Pillowcase – For Hair & Skin").first()).toBeVisible();
    // The page-1 grid reaches the OLDEST row too now (the Ice Bowl, 19th).
    await expect(
      page.getByText("Facial Ice Bowl – Foldable & Travel-Friendly").first(),
    ).toBeVisible();

    // Category filter pills — active pill carries the solid foreground fill.
    const allPill = page.getByRole("button", { name: "All Products" });
    await expect(allPill).toHaveClass(/bg-foreground/);
    for (const pill of ["Beauty Tools", "Brush & Combs", "Bestsellers", "Gift Sets"]) {
      await expect(page.getByRole("button", { name: pill, exact: true })).toBeVisible();
    }

    // Sort (S74-3: a NATIVE select, the reference's element) — price-asc
    // re-orders the grid (the ৳120 applicator set becomes the first card).
    const sortSelect = page.getByRole("combobox", { name: "Sort products" });
    await expect(sortSelect).toBeVisible();
    const optionLabels = await sortSelect.locator("option").allTextContents();
    expect(optionLabels).toEqual(["Newest", "Price: Low to High", "Price: High to Low", "Name: A-Z"]);
    await sortSelect.selectOption("price-asc");
    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(
      page.locator("article").first().getByText("Travel Silicone Mask Applicator Set 4 Pcs"),
    ).toBeVisible();

    // Category pill narrows results (S81-1: 7 beauty-tools memberships —
    // the entity-API-measured set; the h1 carries the category's name).
    await page.getByRole("button", { name: "Beauty Tools", exact: true }).click();
    await expect(page).toHaveURL(/category=beauty-tools/);
    await expect(page.getByRole("heading", { name: "Beauty Tools", level: 1 })).toBeVisible();
    await expect(page.getByText("7 products", { exact: true })).toBeVisible();
    await expect(page.getByText("Pure Satin Silk Pillowcase – For Hair & Skin").first()).toBeHidden();
    await expect(page.getByText("Stainless Steel Gua Sha").first()).toBeVisible();
    // The three former members that are reference-true UNCATEGORIZED stay
    // out of the filtered grid (they surface only under All Products).
    await expect(page.getByText("Moisturizing Spa Socks").first()).toBeHidden();
    await expect(page.getByText("Crystal Hair Remover").first()).toBeHidden();
    await expect(page.getByText("Full Silicon Scalp Massager").first()).toBeHidden();
    // The dual-member cleansing brush rides BOTH filters (Bestsellers AND
    // Beauty Tools — the reference's many-to-many).
    await page.getByRole("button", { name: "Bestsellers", exact: true }).click();
    await expect(page).toHaveURL(/category=bestsellers/);
    await expect(page.getByText("4 products", { exact: true })).toBeVisible();
    await expect(page.getByText("Wooden Cleansing Brush").first()).toBeVisible();
  });

  test("the nav's category links open the reference's template filters (S81-3)", async ({ page }) => {
    // Measured live: the reference's nav (desktop AND mobile panel) links
    // Beauty Tools -> ?category=skincare and Brush & Combs ->
    // ?category=body_care — TEMPLATE filters, which render h1 "Shop", NO
    // active pill, and the template's product set.
    await gotoHydrated(page, "/shop");
    await page.getByRole("link", { name: "Beauty Tools", exact: true }).first().click();
    await expect(page).toHaveURL(/category=skincare/);
    await expect(page.getByRole("heading", { name: "Shop", level: 1 })).toBeVisible();
    await expect(page.getByText("12 products", { exact: true })).toBeVisible();
    // No pill is active under a template filter (measured — all pills
    // render the hairline/inactive style).
    const allPill = page.getByRole("button", { name: "All Products" });
    await expect(allPill).not.toHaveClass(/bg-foreground/);
    await expect(
      page.getByRole("button", { name: "Beauty Tools", exact: true }),
    ).not.toHaveClass(/bg-foreground/);
    // The body_care template set: the four bamboo/sandalwood brushes.
    await page.getByRole("link", { name: "Brush & Combs", exact: true }).first().click();
    await expect(page).toHaveURL(/category=body_care/);
    await expect(page.getByText("4 products", { exact: true })).toBeVisible();
    await expect(page.getByText("Natural Bamboo Hair Brush - Square").first()).toBeVisible();
  });

  test("the shop empty state is the reference's centered anatomy (S81-6)", async ({ page }) => {
    // The reference's gift-sets filter renders 0 products + the measured
    // empty state: a centered py-20 container, the Cormorant 24px/300
    // "No products found" PARAGRAPH, the muted sub-copy — no dashed box,
    // no icon, no clear-filters link.
    await gotoHydrated(page, "/shop?category=gift-sets");
    await expect(page.getByText("0 products", { exact: true })).toBeVisible();
    const emptyHeading = page.getByText("No products found", { exact: true });
    await expect(emptyHeading).toBeVisible();
    await expect(page.getByText("Check back soon for new arrivals.")).toBeVisible();
    await expect(page.getByText("Try adjusting your filters.")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Clear filters" })).toHaveCount(0);
    // The reference's element anatomy: a <p> riding the display serif at
    // the 24px/300 editorial scale inside the centered py-20 container.
    await expect(emptyHeading.locator("xpath=self::p")).toBeVisible();
    const styles = await emptyHeading.evaluate((el) => {
      const own = getComputedStyle(el);
      const box = getComputedStyle(el.parentElement!);
      return {
        fs: own.fontSize,
        fw: own.fontWeight,
        ff: own.fontFamily,
        align: box.textAlign,
        pt: box.paddingTop,
        pb: box.paddingBottom,
      };
    });
    expect(styles.ff).toContain("Cormorant");
    expect(styles.fs).toBe("24px");
    expect(styles.fw).toBe("300");
    expect(styles.align).toBe("center");
    expect(styles.pt).toBe("80px");
    expect(styles.pb).toBe("80px");
  });

  test("the search overlay finds products live and navigates (the S77 full-screen anatomy)", async ({ page }) => {
    await gotoHydrated(page, "/shop");

    // Open the header's search overlay.
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    // D-1 (S77-2, measured live): the overlay is FULL-SCREEN (the viewport
    // box at 1440×900) — the header-anchored dropdown retired.
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox?.x).toBeCloseTo(0, 1);
    expect(overlayBox?.y).toBeCloseTo(0, 1);
    expect(overlayBox?.width).toBeCloseTo(1440, 0);
    expect(overlayBox?.height).toBeCloseTo(900, 0);

    // The content column is the reference's max-w-2xl, centered; the input
    // rides the display serif at 24px at lg.
    const column = overlay.locator("div.max-w-2xl");
    const colBox = await column.boundingBox();
    expect(colBox?.width).toBeCloseTo(672, 0);
    expect(colBox?.x).toBeCloseTo((1440 - 672) / 2, 0);
    const input = overlay.getByRole("searchbox", { name: "Search products" });
    const fontSize = await input.evaluate((el) => getComputedStyle(el).fontSize);
    expect(fontSize).toBe("24px");
    // The display serif — next/font's generated family name carries the
    // Cormorant token (matched case-insensitively for the hashed suffix).
    const fontFamily = await input.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toMatch(/cormorant/i);

    // Live typeahead: rows carry name + the shortDescription copy + ৳ price
    // (S77-3 — the category label retired with the row anatomy fix).
    await input.fill("silk");
    await expect(overlay.getByText("Pure Satin Silk Pillowcase – For Hair & Skin")).toBeVisible({
      timeout: 10_000,
    });
    await expect(overlay.getByText("Sleep in smooth comfort", { exact: false }).first()).toBeVisible();
    // S82-1: the reference's overlay row price is its $ template format.
    await expect(overlay.getByText("$288.00").first()).toBeVisible();

    // D-2: the rows are the reference's single-column 80px anatomy.
    const row = overlay.getByRole("link", { name: /Pure Satin Silk Pillowcase/ });
    const rowBox = await row.boundingBox();
    expect(rowBox?.height).toBeCloseTo(80, 0);
    expect(rowBox?.width).toBeCloseTo(624, 0);

    // Navigating a result closes the overlay and lands on the detail page.
    await row.click();
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByTestId("search-overlay")).toHaveCount(0);
  });

  test("the search overlay's list scrolls inside the reference's 60vh cap (S78 reachability)", async ({ page }) => {
    await gotoHydrated(page, "/shop");

    // Open the header's search overlay.
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    // S78-5: the full-screen sheet declares dialog semantics (the invisible
    // a11y superset — the reference ships none).
    await expect(overlay).toHaveAttribute("role", "dialog");
    await expect(overlay).toHaveAttribute("aria-modal", "true");

    // S78-2 (D-2, measured live): the reference's typeahead floor is ONE
    // character — a 1-char query returns the capped 8-row set.
    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await input.fill("e");
    const rows = overlay.locator("ul > li");
    await expect(rows).toHaveCount(8, { timeout: 10_000 });

    // S78-1 (D-1, measured live): the list carries the reference's scroll
    // geometry — mt-6 below the input row, max-h capped at 60% of the
    // viewport, scrolling its own rows.
    const list = overlay.locator("ul").first();
    await expect(list).toHaveClass(/mt-6/);
    await expect(list).toHaveClass(/max-h-\[60vh\]/);
    await expect(list).toHaveClass(/overflow-y-auto/);
    const listBox = await list.boundingBox();
    const viewport = page.viewportSize();
    expect(listBox?.height).toBeLessThanOrEqual((viewport?.height ?? 900) * 0.6 + 1);

    // S78-3 (D-3, measured live): the rows carry the reference's 2px
    // corners (its rounded-md under the shadcn radius scale).
    const firstRow = rows.first().locator("a");
    await expect(firstRow).toHaveClass(/rounded-\[2px\]/);

    // The capped list actually scrolls: the 8th row scrolls into view.
    const lastRow = rows.nth(7);
    await lastRow.scrollIntoViewIfNeeded();
    await expect(lastRow).toBeVisible();
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

    // S81-4: the breadcrumb eyebrow renders the TEMPLATE category
    // ("lip care" — the reference's category string, underscores → spaces,
    // uppercased by the eyebrow-label class), not the display category.
    const eyebrow = page.locator("p.eyebrow-label", { hasText: "lip care" });
    await expect(eyebrow).toHaveCount(1);
    await expect(page.getByText("Bestsellers", { exact: true })).toHaveCount(0);

    // S81-7: "Complete the Ritual" = the 3 NEWEST products excluding self
    // (createdAt order — the reference's rule, verified on the Bonnet AND
    // the Pillowcase). For the Pillowcase (2nd newest): Bonnet, Curler,
    // Bamboo Square.
    const ritual = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Complete the Ritual" }),
    });
    await expect(ritual.getByText("Premium Double Sided Ruffles Silk Hair Bonnet")).toBeVisible();
    await expect(ritual.getByText("Heatless Hair Curler Set")).toBeVisible();
    await expect(ritual.getByText("Natural Bamboo Hair Brush - Square")).toBeVisible();
    await expect(ritual.locator("article")).toHaveCount(3);

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
    // S81-1: the reference's Brush & Combs = 3 memberships; the h1 carries
    // the category name under a display filter.
    await expect(page.getByRole("heading", { name: "Brush & Combs", level: 1 })).toBeVisible();
    await expect(page.getByText("3 products", { exact: true })).toBeVisible();
    await expect(page.getByText("Sandalwood Hairbrush - Oval").first()).toBeVisible();
    await expect(page.getByText("Natural Bamboo Hair Brush - Square").first()).toBeHidden();
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

  test("the SUPPORT column carries the wishlist entry (S74-2 — the panel link retired)", async ({ page }) => {
    // The mobile panel ends at About (reference parity); the wishlist page
    // needs a navigable entry on every viewport — the footer SUPPORT column
    // is that entry (the detail-page heart toggles membership; this link is
    // how a shopper VIEWS the list).
    await gotoHydrated(page, "/");
    const wishlistLink = page.getByRole("link", { name: "Wishlist" }).first();
    await expect(wishlistLink).toBeVisible();
    await wishlistLink.click();
    await expect(page).toHaveURL(/\/wishlist/);
  });
});

test.describe("storefront — the S75 measured frame (desktop layout geometry)", () => {
  test("the page gutter, tiles, and banner match the reference's measured geometry", async ({ page }) => {
    await gotoHydrated(page, "/");

    // D-2 (S75-1): the universal gutter is max-w-7xl px-6 lg:px-16 → the
    // 1440px viewport renders 1152px of content (was 1216 under the old
    // px-4 sm:px-6 lg:px-8 container-page).
    const ritual = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Shop by Ritual" }),
    });

    // D-4: the tiles are 264px wide in the 32px-gap 4-col grid (was 292
    // under gap-4 + the wider gutter).
    const firstTile = ritual.locator("a").first();
    const tileBox = await firstTile.boundingBox();
    expect(tileBox?.width).toBeCloseTo(264, 0);

    // D-5: the ritual banner is the measured aspect pair — 1152×384 at
    // this viewport (aspect-[21/9] md:aspect-[3/1]; was auto-height).
    const banner = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Complete Your Ritual" }),
    });
    const bannerMedia = banner.locator("div[class*='aspect-']").first();
    const bannerBox = await bannerMedia.boundingBox();
    expect(bannerBox?.width).toBeCloseTo(1152, 0);
    expect(bannerBox?.height).toBeCloseTo(384, 0);

    // D-3: the "Shop by Ritual" heading is centered (the reference's
    // editorial treatment; the kitchen clone was left-aligned).
    const heading = page.getByRole("heading", { name: "Shop by Ritual" });
    const hBox = await heading.boundingBox();
    const px = await page.evaluate(() => window.innerWidth);
    if (hBox) {
      const leftMargin = hBox.x;
      const rightMargin = px - (hBox.x + hBox.width);
      expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(2);
    }
  });

  test("the product detail frame renders 544px columns (gap-8 lg:gap-16 + the gutter)", async ({ page, request }) => {
    // The stocked Pillowcase — resolved through the search API with a
    // single-hit term. (S77-4 changed the result order to the authored
    // catalog order, under which "silk" leads with the Bonnet — the frame
    // test keeps the single-hit Pillowcase for term stability.)
    // The request fixture carries the absolute base URL — a
    // relative fetch inside page.evaluate on a fresh context fails to parse.
    const res = await request.get("/api/search?q=pillowcase");
    const data = (await res.json()) as { results?: { id: string }[] };
    const productId = data.results?.[0]?.id;
    expect(productId).toBeTruthy();
    await gotoHydrated(page, `/product/${productId}`);

    // D-6 (S75-6): 1152px content − 64px grid gap = 544px columns (was 588
    // under gap-10 + the wider gutter).
    const addToCart = page.getByRole("button", { name: /Add to Cart/i }).first();
    await expect(addToCart).toBeVisible();
    const box = await addToCart.boundingBox();
    expect(box?.width).toBeCloseTo(544, 0);
  });
});

test.describe("storefront — the S76 measured card + variant anatomy (desktop geometry)", () => {
  test("the /shop grid renders 363px cards at the reference's measured gaps (D-1/D-2/D-3/D-4)", async ({ page }) => {
    await gotoHydrated(page, "/shop");

    // D-1: 1152px content − 2×32px gaps = 3×362.67px columns (was 373
    // under gap-x-4's 16px columns).
    const grid = page.locator("div.grid").filter({
      has: page.locator("article"),
    });
    const firstCard = grid.locator("article").first();
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeCloseTo(362.7, 0);

    // D-1: the row gap is 48px (was 40 under gap-y-10).
    const secondRow = grid.locator("article").nth(3);
    const secondBox = await secondRow.boundingBox();
    if (cardBox && secondBox) {
      expect(secondBox.y - (cardBox.y + cardBox.height)).toBeCloseTo(48, 0);
    }

    // D-2/D-3/D-4: the text block anchors like the reference — the name
    // sits 16px under the image at text-sm's default 20px line-height, and
    // the price flows after the last line (the reference's flow anchoring,
    // no mt-auto). The first card is the no-description Bonnet (the seed's
    // authored order; its 64px content trails ~20px inside the row) — the
    // row-normalized card is 447px: 363 image + the 84px block of its
    // description-bearing row neighbor (the Pillowcase).
    expect(cardBox?.height).toBeCloseTo(447, 0);
  });

  test("the product h1 rides the reference's heading scale: 48px at lg (D-5)", async ({ page, request }) => {
    const res = await request.get("/api/search?q=pillowcase");
    const data = (await res.json()) as { results?: { id: string }[] };
    const productId = data.results?.[0]?.id;
    expect(productId).toBeTruthy();
    await gotoHydrated(page, `/product/${productId}`);

    // The SCALE is the pin (the box height depends on the product name's
    // wrap: the reference's own pillowcase h1 wraps to two 48px lines in
    // the 544px column — the clone's does too).
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    const typography = await h1.evaluate((el) => {
      const s = getComputedStyle(el);
      return { fontSize: s.fontSize, lineHeight: s.lineHeight };
    });
    expect(typography.fontSize).toBe("48px");
    // text-5xl's default lh 1.0 — the reference's measured 48/48.
    expect(typography.lineHeight).toBe("48px");
  });

  test("the size chips are the reference's 38px pills (D-6) and the gallery rail renders (D-8/D-12)", async ({ page, request }) => {
    // The massager is the sizes-bearing piece pinned since S76 (the
    // bonnet restocked in S90-4 — both now render purchase controls; the
    // massager keeps the D-6 chip pin's single-hit "Pink" term).
    const res = await request.get("/api/search?q=massager");
    const data = (await res.json()) as { results?: { id: string }[] };
    const productId = data.results?.[0]?.id;
    expect(productId).toBeTruthy();
    await gotoHydrated(page, `/product/${productId}`);

    // D-6: pill chips — 38px tall, fully rounded.
    const chip = page.getByRole("button", { name: "Pink", exact: true });
    await expect(chip).toBeVisible();
    const chipBox = await chip.boundingBox();
    expect(chipBox?.height).toBeCloseTo(38, 0);
    const radius = await chip.evaluate((el) => getComputedStyle(el).borderRadius);
    // Fully-rounded pill (the reference renders 9999px; v4's rounded-full
    // computes to Chrome's infinity representation — both are "full").
    expect(parseFloat(radius)).toBeGreaterThanOrEqual(9999);

    // D-8/D-12: the gallery rail renders below the main image with the
    // 64×80 thumbs (3-image seeded gallery).
    const thumb = page.getByRole("button", { name: "View image 2 of 3" });
    await expect(thumb).toBeVisible();
    const thumbBox = await thumb.boundingBox();
    expect(thumbBox?.width).toBeCloseTo(64, 0);
    expect(thumbBox?.height).toBeCloseTo(80, 0);
  });
});

test.describe("storefront — the S79 overlay serif-price, fresh-sheet & focus cycle", () => {
  test("the overlay's row price renders in the display serif (the reference's Cormorant)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await input.fill("silk");
    const rows = overlay.locator("ul > li");
    await expect(rows).toHaveCount(4, { timeout: 10_000 });

    // S79-1 (D-1, measured live on both viewports): the reference renders
    // the row price in the display serif — computed "Cormorant Garamond",
    // serif, 14px/300. The clone rode the body font (Inter).
    const price = rows.first().locator("a > span").last();
    const fontFamily = await price.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain("Cormorant");
  });

  test("the overlay's row price renders the reference's $ template format (S82-1, D-82-1)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await input.fill("silk");
    const rows = overlay.locator("ul > li");
    await expect(rows).toHaveCount(4, { timeout: 10_000 });

    // S82-1 (codepoint-measured live on the reference 2026-11-09): the
    // overlay's row price renders the Base44 template's USD format —
    // "$370.00" for the Bonnet (ASCII dollar U+0024, always two decimals)
    // — while the grid/detail prices stay ৳ whole-taka on both sites.
    const price = rows.first().locator("a > span").last();
    await expect(price).toHaveText("$370.00");
    const firstCodepoint = await price.evaluate((el) => el.textContent?.codePointAt(0));
    expect(firstCodepoint).toBe(36);
  });

  test("reopening the overlay shows a fresh sheet (the reference's reset, S79-2)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await input.fill("silk");
    await expect(overlay.locator("ul > li")).toHaveCount(4, { timeout: 10_000 });

    // Close, then reopen — the reference RESETS (query "" + zero rows).
    await overlay.getByRole("button", { name: "Close search" }).click();
    await expect(overlay).toBeHidden();
    await page.getByRole("button", { name: "Search products" }).click();
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole("searchbox", { name: "Search products" })).toHaveValue("");
    await expect(overlay.locator("ul > li")).toHaveCount(0);

    // S79-3: focus returns to the opener on close.
    await overlay.getByRole("button", { name: "Close search" }).click();
    await expect(overlay).toBeHidden();
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    expect(focused).toBe("Search products");
  });

  test("the header's search button announces its dialog state (S79-6)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    const opener = page.getByRole("button", { name: "Search products" });
    await expect(opener).toHaveAttribute("aria-haspopup", "dialog");
    await expect(opener).toHaveAttribute("aria-expanded", "false");
    await opener.click();
    await expect(opener).toHaveAttribute("aria-expanded", "true");
    await page.getByTestId("search-overlay").getByRole("button", { name: "Close search" }).click();
    await expect(opener).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("storefront — the S80 overlay empty-state & centered no-results cycle", () => {
  test("a fresh open renders the reference's 'Start typing' hint (S80-1)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    await expect(overlay).toBeVisible();

    // S80-1 (D-80-1, measured live): the reference renders
    // `Start typing to search our collection` at query "" — centered,
    // py-8, muted — on a fresh open. The clone rendered nothing.
    const hint = overlay.getByText("Start typing to search our collection");
    await expect(hint).toBeVisible();
    const textAlign = await hint.evaluate((el) => getComputedStyle(el).textAlign);
    expect(textAlign).toBe("center");
    // Typing removes the hint immediately (it is gated on the query, not
    // on results).
    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await input.fill("silk");
    await expect(hint).toBeHidden();
  });

  test("the fresh-sheet reopen lands back on the hint (S79-2 × S80-1)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    const input = overlay.getByRole("searchbox", { name: "Search products" });
    await input.fill("silk");
    await expect(overlay.locator("ul > li")).toHaveCount(4, { timeout: 10_000 });

    // Close → reopen: the reference's reset (query "") now lands on the
    // reference's empty-state hint, exactly like the live sheet.
    await overlay.getByRole("button", { name: "Close search" }).click();
    await expect(overlay).toBeHidden();
    await page.getByRole("button", { name: "Search products" }).click();
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole("searchbox", { name: "Search products" })).toHaveValue("");
    await expect(overlay.getByText("Start typing to search our collection")).toBeVisible();
    await expect(overlay.locator("ul > li")).toHaveCount(0);
  });

  test("the no-results copy is the reference's straight-quote centered form (S80-2)", async ({ page }) => {
    await gotoHydrated(page, "/shop");
    await page.getByRole("button", { name: "Search products" }).click();
    const overlay = page.getByTestId("search-overlay");
    const input = overlay.getByRole("searchbox", { name: "Search products" });

    // S80-2 (D-80-2, codepoint-verified live): the reference renders
    // `No products found for "zzzzq"` — straight quotes, no trailing
    // period, centered py-8.
    await input.fill("zzzzq");
    const copy = overlay.getByText('No products found for "zzzzq"');
    await expect(copy).toBeVisible({ timeout: 10_000 });
    expect(await copy.textContent()).not.toContain("”");
    expect(await copy.textContent()).not.toMatch(/\.$/);
    const styles = await copy.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { textAlign: cs.textAlign, py: cs.paddingTop };
    });
    expect(styles.textAlign).toBe("center");
    expect(styles.py).toBe("32px");
  });
});
