/**
 * Layout tokens — the S75 measured-frame pins (session 75).
 *
 * The run-74 cycle closed 14 surface deltas but each surface was measured
 * in isolation; the run-75 whole-page walk found the SHARED layout frame
 * the surfaces sit in differs from the live reference. These pins hold the
 * measured values in the SOURCE (the same class-contract style the repo
 * uses for the mobile-nav e2e guard) so a refactor cannot silently drift
 * the frame again:
 *
 *   D-1  header height      h-16 lg:h-20 (64px mobile / 80px desktop)
 *   D-2  universal gutter    .container-page = max-w-7xl px-6 lg:px-16
 *   D-3  home section rhythm per-section py-20 lg:py-32, centered ritual
 *                            heading mb-16, curated header mb-12
 *   D-4  home grids          tiles gap-6 lg:gap-8; curated gap-6
 *                            lg:gap-x-8 lg:gap-y-12
 *   D-5  ritual banner       aspect-[21/9] md:aspect-[3/1]
 *   D-6  product frame       pt-20 lg:pt-24 page top; gap-8 lg:gap-16 grid
 *   D-7  hero h1             leading-[1.1] lg:leading-none; md:text-7xl
 *   D-9  mobile panel        container-page py-6 (no element-level px
 *                            overrides — the CSS-order bug class)
 *   D-10 footer vertical     py-16 lg:py-24
 *   D-8  WhatsApp glyph      the real WhatsApp logo path, fill-white
 *   L-1  Stripe appearance   current tokens (taupe/ivory/4px), no #d96e26
 *   L-2  admin charts        no #d96e26, ৳ axis ticks (no `$` prefix)
 *   L-3  404 icon            Sparkles, not CookingPot
 *   L-4  favicon             #c99a3a / #d95577 anchors
 *
 * All values live-measured on both sites 2026-11-08 (agent-browser computed
 * styles; the dossier is the Session 75 section of docs/REMEDIATION_PLAN.md).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function src(relative: string): string {
  return readFileSync(path.resolve(import.meta.dirname, "../../src", relative), "utf8");
}

describe("S75 measured layout frame (source pins)", () => {
  it("D-2: container-page is the reference's universal gutter (px-6 lg:px-16)", () => {
    const css = src("app/globals.css");
    const block = css.match(/\.container-page\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(block).toContain("max-w-7xl");
    expect(block).toContain("px-6");
    expect(block).toContain("lg:px-16");
    // The kitchen-era gutter steps are gone.
    expect(block).not.toMatch(/(^|\s)px-4(;|\s|$)/);
    expect(block).not.toContain("sm:px-6");
    expect(block).not.toContain("lg:px-8");
  });

  it("D-1: the header is 64px mobile / 80px desktop (h-16 lg:h-20)", () => {
    const header = src("components/store/header.tsx");
    // Token-based: h-16 on the base grid, lg:h-20 at desktop (the classes
    // interleave with grid-template tokens in the cn() string).
    expect(header).toMatch(/grid h-16 /);
    expect(header).toMatch(/ lg:h-20 /);
    // The kitchen-era fixed 80px bar is gone.
    expect(header).not.toMatch(/grid h-20 grid-cols/);
    // S77-2: the search surface moved out of the header into the shared
    // full-screen overlay (search-overlay.tsx) — the header carries no
    // overlay markup of its own anymore, just the icon that toggles the
    // store state.
    expect(header).not.toMatch(/top-16 z-50/);
    expect(header).not.toMatch(/lg:top-20/);
  });

  it("D-1: the body offset is the reference's main clearance (pt-20 lg:pt-24)", () => {
    const chrome = src("components/store/store-chrome.tsx");
    expect(chrome).toMatch(/pt-20 lg:pt-24/);
    expect(chrome).not.toMatch(/"flex min-h-screen flex-col pt-20"/);
  });

  it("D-9: the mobile panel rides container-page with NO element-level px overrides", () => {
    const nav = src("components/store/mobile-nav.tsx");
    // The panel's inner container: py only — the horizontal padding comes
    // from container-page (px-6). Element-level px-* on the same element
    // loses to the later-declared utility (the run-75 CSS-order bug).
    expect(nav).toMatch(/container-page py-6"/);
    expect(nav).not.toMatch(/container-page px-6/);
  });

  it("D-3/D-4/D-5: the home page rides the reference's section rhythm", () => {
    const home = src("app/(storefront)/page.tsx");
    // Per-section vertical rhythm (no single shared gap wrapper).
    expect(home).toMatch(/py-20 lg:py-32/);
    expect(home).not.toMatch(/flex flex-col gap-16 py-16/);
    // The ritual heading is centered with the 64px margin.
    expect(home).toMatch(/text-center/);
    expect(home).toMatch(/mb-16/);
    // The grids match the measured gaps.
    expect(home).toMatch(/gap-6 lg:gap-8/);
    expect(home).toMatch(/lg:gap-x-8 lg:gap-y-12/);
    expect(home).not.toMatch(/grid grid-cols-2 gap-4 lg:grid-cols-4/);
    // The banner is the measured aspect pair.
    expect(home).toMatch(/aspect-\[21\/9\] md:aspect-\[3\/1\]/);
    // The headings break at lg like the reference (not sm).
    expect(home).toMatch(/text-4xl font-light tracking-tight text-foreground lg:text-5xl/);
    expect(home).not.toMatch(/text-4xl font-light tracking-tight text-foreground sm:text-5xl/);
  });

  it("D-6: the product page frame matches the measured column geometry", () => {
    const page = src("app/(storefront)/product/[id]/page.tsx");
    // The shell's pt-20 lg:pt-24 clearance + pt-6 lands the back-link at
    // the reference's measured ~104/~120px; pb-20 bottom.
    expect(page).toMatch(/gap-14 pt-6 pb-20/);
    expect(page).toMatch(/gap-8 lg:gap-16/);
    expect(page).not.toMatch(/gap-14 py-10/);
  });

  it("D-7: the hero h1 uses the reference's responsive line-height + md breakpoint", () => {
    const hero = src("components/store/hero-carousel.tsx");
    expect(hero).toMatch(/leading-\[1\.1\] tracking-tight/);
    expect(hero).toMatch(/md:text-7xl/);
    expect(hero).toMatch(/lg:leading-none/);
    expect(hero).not.toMatch(/sm:text-7xl/);
    expect(hero).not.toMatch(/leading-none tracking-tight/);
  });

  it("D-10: the footer rides py-16 lg:py-24", () => {
    const footer = src("components/store/footer.tsx");
    expect(footer).toMatch(/py-16 lg:py-24/);
    expect(footer).not.toMatch(/py-14 sm:grid-cols-2/);
  });

  it("D-8: the WhatsApp float renders the WhatsApp logo glyph (not a lucide chat bubble)", () => {
    const float = src("components/store/whatsapp-float.tsx");
    expect(float).not.toContain("MessageCircle");
    expect(float).toMatch(/fill-white/);
    expect(float).toMatch(/viewBox="0 0 32 32"/);
  });

  it("L-1: the Stripe Element appearance maps the CURRENT theme (no kitchen palette)", () => {
    const stripe = src("components/checkout/stripe-pay.tsx");
    expect(stripe).not.toContain("#d96e26");
    expect(stripe).not.toContain("#ffffff");
    // The mapping comment must cite the current tokens, not the kitchen set.
    expect(stripe).not.toMatch(/hsl\(24 70% 50%\)/);
    expect(stripe).toMatch(/hsl\(30 12% 48%\)/);
    // The reference's sharp-corner language: the 12px kitchen radius is gone.
    expect(stripe).not.toContain('"12px"');
  });

  it("L-2: the admin charts carry the taupe brand + ৳ axis ticks (no $ prefix)", () => {
    const revenue = src("app/(storefront)/admin/revenue-chart.tsx");
    const analytics = src("app/(storefront)/admin/analytics/charts.tsx");
    for (const file of [revenue, analytics]) {
      expect(file).not.toContain("#d96e26");
      expect(file).not.toContain("$${");
    }
  });

  it("L-3: the 404 icon is beauty-appropriate (no kitchen pot)", () => {
    const notFound = src("app/not-found.tsx");
    expect(notFound).not.toContain("CookingPot");
  });

  it("L-4: the favicon carries the S74-10 logo anchors", () => {
    const icon = src("app/icon.svg");
    expect(icon).toContain("#c99a3a");
    expect(icon).toContain("#d95577");
    expect(icon).not.toContain("#b08d57");
    expect(icon).not.toContain("#c4717d");
  });
});

describe("S76 measured card + variant anatomy (source pins)", () => {
  it("D-1: the /shop grid rides the reference's measured gaps (24/24 mobile, 32/48 desktop)", () => {
    const shop = src("app/(storefront)/shop/page.tsx");
    expect(shop).toMatch(/grid grid-cols-2 gap-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12/);
    // The kitchen-era 16px columns / 40px rows are gone.
    expect(shop).not.toMatch(/gap-x-4 gap-y-10/);
  });

  it("D-2/D-3/D-4: the card text block anchors like the reference (flow, pt-4, default name leading)", () => {
    const card = src("components/store/product-card.tsx");
    expect(card).toMatch(/gap-1 pt-4/);
    // The name rides text-sm's default 20px line-height (the reference's
    // measured h:20) — leading-snug's 17px is gone.
    expect(card).not.toContain("leading-snug");
    // The price row FLOWS 8px under the last line (the reference's
    // anchoring); mt-auto bottom-stuck it inside normalized rows.
    expect(card).not.toContain("mt-auto");
  });

  it("D-5: the product h1 is 36/48 at the lg breakpoint (the reference's heading scale)", () => {
    const page = src("app/(storefront)/product/[id]/page.tsx");
    expect(page).toMatch(/font-display text-4xl font-light tracking-tight lg:text-5xl/);
    expect(page).not.toMatch(/text-3xl font-light leading-tight/);
  });

  it("D-6: the size chips are the reference's 38px pills (ivory active text)", () => {
    const panel = src("app/(storefront)/product/[id]/purchase-panel.tsx");
    expect(panel).toMatch(/h-\[38px\] min-w-14 rounded-full border px-4 text-sm font-normal/);
    // Active: solid foreground + IVORY text (text-background — white is the
    // kitchen-era remnant the reference does not render).
    expect(panel).toMatch(/border-foreground bg-foreground text-background/);
    // Inactive: the hairline border token.
    expect(panel).toMatch(/border-border text-foreground hover:border-foreground/);
    // The square 40px chip is gone.
    expect(panel).not.toMatch(/h-10 min-w-14 border border-input/);
  });

  it("D-7: the color swatches are the reference's 36px double-ring anatomy", () => {
    const panel = src("app/(storefront)/product/[id]/purchase-panel.tsx");
    expect(panel).toMatch(/h-9 w-9/);
    // Active: the measured double ring — background 2px then foreground 4px
    // outside the 2px foreground border.
    expect(panel).toMatch(
      /border-2 border-foreground shadow-\[0_0_0_2px_var\(--color-background\),0_0_0_4px_var\(--color-foreground\)\]/,
    );
    // Inactive: the subtle 1px black/15 ring, transparent border.
    expect(panel).toMatch(/border-transparent shadow-\[0_0_0_1px_rgba\(0,0,0,0\.15\)\]/);
    // The 40px ring-offset anatomy is gone.
    expect(panel).not.toContain("ring-offset-2");
  });

  it("D-8: the gallery thumbs are the reference's 64×80 (aspect 4/5)", () => {
    const gallery = src("app/(storefront)/product/[id]/product-gallery.tsx");
    expect(gallery).toMatch(/aspect-\[4\/5\] w-16/);
    expect(gallery).not.toMatch(/aspect-\[3\/4\] w-\[60px\]/);
  });

  it("D-9: the non-home header carries the reference's border-t (66px bar box)", () => {
    const chrome = src("components/store/store-chrome.tsx");
    // The non-home branch: border-t + border-b + bg/95 + blur.
    expect(chrome).toMatch(/border-t border-b border-border bg-background\/95 backdrop-blur/);
    expect(chrome).not.toMatch(/"border-b border-border bg-background\/95 backdrop-blur"/);
  });
});

describe("S77 measured search-overlay anatomy (source pins)", () => {
  it("D-1: the search overlay is the reference's full-screen z-[70] sheet (not a top-16 dropdown)", () => {
    const overlay = src("components/store/search-overlay.tsx");
    expect(overlay).toContain("fixed inset-0 z-[70] bg-background/95 backdrop-blur-xs");
    // The dropdown anatomy is gone.
    expect(overlay).not.toContain("top-16");
    expect(overlay).not.toContain("shadow-sm");
    // The content column: the reference's max-w-2xl with pt-24 lg:pt-32 —
    // NOT the page-shell gutter.
    expect(overlay).toContain("max-w-2xl mx-auto px-6 pt-24 lg:pt-32");
    expect(overlay).not.toContain("container-page");
  });

  it("D-1b: the search input rides the display serif at text-lg lg:text-2xl with the tight 1.1 leading", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // S84-1 inserted font-light between the family and the sizes (the
    // reference's measured 300 weight); the pin follows the class order.
    expect(overlay).toMatch(/font-display font-light text-lg leading-\[1\.1\] lg:text-2xl/);
  });

  it("D-2: the result rows are the reference's single-column 80px anatomy", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // Single column, 4px gaps (the reference's 84px row rhythm).
    expect(overlay).toMatch(/flex flex-col gap-1/);
    // 12px row padding over the 56px image = the 80px row.
    expect(overlay).toMatch(/items-center gap-4 p-3/);
    // The old two-column grid is gone.
    expect(overlay).not.toContain("sm:grid-cols-2");
    // The price is font-light (the reference's 14px/300).
    expect(overlay).toMatch(/text-sm font-light/);
  });

  it("D-1c: the mobile panel's SEARCH row opens the shared overlay (no in-panel swap)", () => {
    const nav = src("components/store/mobile-nav.tsx");
    // The SEARCH row toggles the shared overlay state.
    expect(nav).toMatch(/setSearchOverlayOpen\(true\)/);
    // The in-panel search component is retired.
    expect(nav).not.toContain("PanelSearch");
    expect(nav).not.toContain("mobile-panel-search");
  });

  it("D-1d: the header search icon drives the shared overlay state", () => {
    const header = src("components/store/header.tsx");
    expect(header).toMatch(/setSearchOverlayOpen/);
    // The old local-state overlay + dropdown container are gone from the
    // header (the overlay component moved to its own module).
    expect(header).not.toContain("DesktopSearchOverlay");
    expect(header).not.toContain("searchOpen");
  });

  it("S78-1: the overlay's result list carries the reference's scroll cap (mt-6 max-h-[60vh] overflow-y-auto)", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // S78-1 (D-1, measured live): the reference's list is `mt-6 space-y-1
    // max-h-[60vh] overflow-y-auto` — the clone's uncapped list left the
    // 8th row unreachable on every sub-816px window.
    expect(overlay).toMatch(/mt-6 flex flex-col gap-1 overflow-y-auto max-h-\[60vh\]/);
  });

  it("S78-3: the result rows carry the reference's measured 2px corners", () => {
    const overlay = src("components/store/search-overlay.tsx");
    expect(overlay).toMatch(/p-3 transition-colors hover:bg-secondary rounded-\[2px\]/);
  });

  it("S78-4: the no-results copy is the reference's 'No products found for' shape", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // S80-2 (D-80-2, codepoint-verified live): the copy's quotes are
    // STRAIGHT ASCII with no trailing period — the reference's exact
    // bytes. The curly-quote + period form this pin used to assert was
    // the un-measured residue, retired in S80-2.
    expect(overlay).toContain("No products found for &quot;{query.trim()}&quot;");
    expect(overlay).not.toContain("No products found for “");
    expect(overlay).not.toContain("No products match");
  });

  it("S78-5: the overlay declares dialog semantics and the chrome shell goes inert behind it", () => {
    const overlay = src("components/store/search-overlay.tsx");
    expect(overlay).toContain('role="dialog"');
    expect(overlay).toContain('aria-modal="true"');
    const chrome = src("components/store/store-chrome.tsx");
    // The shell's inert condition covers the search overlay alongside the
    // cart drawer (the overlay itself renders OUTSIDE the shell).
    expect(chrome).toMatch(/inert=\{cartDrawerOpen \|\| searchOverlayOpen\}/);
  });

  it("S78-2: the search floor is 1 character (the route's gate is emptiness, not length)", () => {
    const route = src("app/api/search/route.ts");
    expect(route).not.toContain("q.length < 2");
    const overlay = src("components/store/search-overlay.tsx");
    expect(overlay).not.toContain("term.length < 2");
  });

  it("S78-6: the chrome comments quote the REAL blur token (xs, not sm — the v4 rename trap)", () => {
    // The run-77 refinement pinned backdrop-blur-xs (v4's xs = the
    // reference's measured 4px); two prose comments still quoted the
    // pre-refinement sm. Comments quoting retired patterns are how the
    // prose-scan family of bugs starts.
    const provider = src("components/store/store-provider.tsx");
    expect(provider).not.toMatch(/backdrop-blur-sm/);
    const nav = src("components/store/mobile-nav.tsx");
    expect(nav).not.toMatch(/backdrop-blur-sm/);
  });

  it("S77-7a: the product twitter card uses the metaDescription fallback", () => {
    const page = src("app/(storefront)/product/[id]/page.tsx");
    // The twitter description composes from the same metaDescription
    // fallback as description/openGraph (S76-8's completion — it used to
    // read product.shortDescription directly, shipping empty card copy for
    // the six no-card-copy products).
    expect(page).toMatch(/twitter:\s*\{\s*card:[^}]*description:\s*metaDescription/s);
  });

  it("S77-7b: the product metadata query filters isActive (no inactive-product title leaks)", () => {
    const page = src("app/(storefront)/product/[id]/page.tsx");
    const metadataWhere = page.match(/where:\s*\{\s*id,\s*isActive:\s*true\s*\}/);
    expect(metadataWhere).not.toBeNull();
  });
});

describe("S79 overlay focus-management, fresh-sheet & wrap-repair pins (source pins)", () => {
  it("S79-1: the overlay's row price rides the display serif (the reference's font-heading)", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // S79-1 (D-1, measured live on both viewports): the reference's row
    // price computes to "Cormorant Garamond", serif 14px/300 — the clone
    // kept text-sm font-light but rode the body font.
    expect(overlay).toMatch(/<span className="text-sm font-light font-display">/);
  });

  it("S79-2: the overlay resets its sheet on close (the reference's fresh reopen)", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // The reset rides the open→false transition while the sheet is hidden
    // (clearing query also drops any in-flight typeahead response through
    // the debounce cleanup's cancelled flag).
    expect(overlay).toMatch(/setResults\(\[\]\)/);
    expect(overlay).toMatch(/setQuery\(""\)/);
  });

  it("S79-3: the overlay captures its opener and restores focus on close (the drawer's modal contract)", () => {
    const overlay = src("components/store/search-overlay.tsx");
    expect(overlay).toMatch(/openerRef/);
    expect(overlay).toMatch(/openerRef\.current = null/);
  });

  it("S79-4: the overlay's close button carries the drawer's focus-visible ring", () => {
    const overlay = src("components/store/search-overlay.tsx");
    expect(overlay).toMatch(/focus-visible:ring-2 focus-visible:ring-ring/);
  });

  it("S79-5: the drawer's Tab-wrap selector is valid CSS (the aref] regression guard)", () => {
    const chrome = src("components/store/store-chrome.tsx");
    // The run-78-and-earlier selector read `aref]` — INVALID CSS that made
    // querySelectorAll throw a SyntaxError on EVERY Tab keydown, silently
    // disabling the S8-7 wrap since its introduction. The repaired selector
    // must carry a[href] and never the corrupted fragment.
    expect(chrome).not.toMatch(/aref\]/);
    expect(chrome).toMatch(/a\[href\]/);
  });

  it("S79-6: the header's search button announces its dialog state (aria-expanded + aria-haspopup)", () => {
    const header = src("components/store/header.tsx");
    // The menu and cart buttons already carry the pair; the search button
    // announced neither while toggling a role="dialog" overlay.
    expect(header).toMatch(/aria-expanded=\{searchOverlayOpen\}/);
    expect(header).toMatch(/aria-haspopup="dialog"/);
  });

  it("S79-7: the JSON routes parse through the bounded shared seam", () => {
    const routes = [
      "app/api/cart/route.ts",
      "app/api/cart/bulk/route.ts",
      "app/api/checkout/route.ts",
      "app/api/contact/route.ts",
      "app/api/coupon/apply/route.ts",
      "app/api/newsletter/route.ts",
      "app/api/wishlist/route.ts",
      "app/api/addresses/route.ts",
      "app/api/stripe/payment-intent/route.ts",
    ];
    for (const route of routes) {
      const text = src(route);
      expect(text, `${route} uses the shared bounded seam`).toMatch(/parseJsonBody|readJsonBody/);
      expect(text, `${route} no longer parses request.json() directly`).not.toMatch(/await request\.json\(\)/);
    }
  });
});

describe("S80 overlay empty-state, centered no-results & raw-body pins (source pins)", () => {
  it("S80-1: the overlay renders the reference's empty-query hint", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // S80-1 (D-80-1, measured live at query ""): the reference renders
    // `Start typing to search our collection` — text-sm
    // text-muted-foreground py-8 text-center (14px centered, 84px box) —
    // the state a fresh open AND the fresh-sheet reset land on. The clone
    // rendered nothing on empty.
    expect(overlay).toContain("Start typing to search our collection");
    expect(overlay).toMatch(/py-8 text-center text-sm text-muted-foreground/);
  });

  it("S80-2: the no-results copy is the reference's straight-quote, period-free form", () => {
    const overlay = src("components/store/search-overlay.tsx");
    // S80-2 (D-80-2, codepoint-verified live): the reference renders
    // `No products found for "zzzzq"` — straight ASCII quotes (codepoint
    // 34), NO trailing period, the SAME centered py-8 family as the hint.
    // The clone's curly quotes + period + pt-4 were the un-measured
    // residue.
    expect(overlay).toContain("No products found for &quot;");
    expect(overlay).not.toContain("No products found for “");
    expect(overlay).not.toContain('.”');
    // The centered style rides the copy line (the hint's class family).
    expect(overlay).not.toMatch(/pt-4 text-sm text-muted-foreground">No products found/);
  });

  it("S80-3: the Stripe webhook reads through the bounded raw-body seam", () => {
    const webhook = src("app/api/stripe/webhook/route.ts");
    // Audit 80-a L-1: the webhook buffered the full body before signature
    // verification (unbounded request.text() on an unauthenticated route).
    // The seam returns string | null; null renders the 400 family.
    expect(webhook).toMatch(/readRawBody/);
    expect(webhook).not.toMatch(/await request\.text\(\)/);
    expect(webhook).toMatch(/Payload too large/);
  });

  it("S80-3b: no request.text() call remains outside the seam module itself", () => {
    // The seam's own text-path fallback is the single sanctioned
    // request.text() site in the codebase.
    const seam = src("lib/json-body.ts");
    expect(seam).toMatch(/request\.text\(\)/);
  });
  it("S81-3: the nav (desktop + mobile panel) links the reference's template filters", () => {
    // Measured live (2026-11-09): the reference's header nav AND mobile
    // panel link Beauty Tools -> /shop?category=skincare and Brush & Combs
    // -> /shop?category=body_care (template filters — the dossier's
    // "replicate as-observed" line-71 mapping). The clone's own display
    // slugs were the un-replicated residue.
    for (const file of ["components/store/header.tsx", "components/store/mobile-nav.tsx"]) {
      const nav = src(file);
      expect(nav).toContain('{ href: "/shop?category=skincare", label: "Beauty Tools" }');
      expect(nav).toContain('{ href: "/shop?category=body_care", label: "Brush & Combs" }');
      expect(nav).not.toContain("/shop?category=beauty-tools");
      expect(nav).not.toContain("/shop?category=brush-combs");
    }
  });

  it("S81-3b: the footer SHOP column is the reference's template set", () => {
    const footer = src("components/store/footer.tsx");
    // The reference's footer: All Products / Skincare / Body Care / Gift
    // Sets -> ?category=skincare / body_care / sets (measured live).
    expect(footer).toContain('{ href: "/shop", label: "All Products" }');
    expect(footer).toContain('{ href: "/shop?category=skincare", label: "Skincare" }');
    expect(footer).toContain('{ href: "/shop?category=body_care", label: "Body Care" }');
    expect(footer).toContain('{ href: "/shop?category=sets", label: "Gift Sets" }');
    expect(footer).not.toContain('label: "Beauty Tools"');
    expect(footer).not.toContain('label: "Brush & Combs"');
  });

  it("S81-4: the detail eyebrow renders the template category", () => {
    const detail = src("app/(storefront)/product/[id]/page.tsx");
    // The reference's breadcrumb eyebrow shows the TEMPLATE category
    // ("skincare" / "lip care", underscores -> spaces) in the eyebrow-label
    // style — not the display category.
    expect(detail).toMatch(/templateCategory/);
    expect(detail).not.toMatch(/\{product\.category\.name\}/);
    expect(detail).not.toMatch(/eyebrow-label[^>]*>\{product\.categories/);
  });

  it("S81-5: the /shop grid renders the full catalog on ONE page (PER_PAGE 24)", () => {
    const shop = src("app/(storefront)/shop/page.tsx");
    expect(shop).toContain("const PER_PAGE = 24;");
    expect(shop).not.toContain("const PER_PAGE = 12;");
  });

  it("S81-6: the shop empty state is the reference's centered Cormorant anatomy", () => {
    const shop = src("app/(storefront)/shop/page.tsx");
    expect(shop).toContain("text-center py-20");
    expect(shop).toContain("No products found");
    expect(shop).toContain("Check back soon for new arrivals.");
    // The retired dashed-box anatomy (measured AGAINST the reference).
    expect(shop).not.toContain("border-dashed");
    expect(shop).not.toContain("PackageSearch");
    expect(shop).not.toContain("Try adjusting your filters");
    expect(shop).not.toContain("Clear filters");
  });

  it("S81-7: Complete the Ritual is the 3 newest products excluding self", () => {
    const detail = src("app/(storefront)/product/[id]/page.tsx");
    expect(detail).not.toMatch(/categoryId:\s*product\.categoryId/);
    expect(detail).toMatch(/id:\s*\{ not: product\.id \}/);
  });

  it("S81-8: the ritual banner CTA links plain /shop (the reference's Discover Sets)", () => {
    const home = src("app/(storefront)/page.tsx");
    expect(home).not.toContain("/shop?category=gift-sets");
  });

  it("S81-9: the webhook parses intent metadata through the guarded seam", () => {
    const webhook = src("app/api/stripe/webhook/route.ts");
    // Audit 81-a L-1: a bare JSON.parse(meta.shipping) throw escapes to the
    // outer catch, which classifies it TRANSIENT (500 + Stripe retry loop,
    // no StripeEvent refund trail). The guarded parse routes unparseable
    // metadata down the metadata-unusable PERMANENT path.
    expect(webhook).toContain("parseShippingMetadata");
    expect(webhook).not.toMatch(/JSON\.parse\(\s*meta\.shipping/);
  });

  it("S81-10: the three stale comments are corrected (audit 81-a L-2)", () => {
    const money = src("lib/money.ts");
    expect(money).not.toContain("no production module imports it");
    const track = src("app/(storefront)/track-order/page.tsx");
    expect(track).not.toContain("sequential");
    const rate = src("lib/rate-limit.ts");
    expect(rate).not.toContain("rejected requests do not extend");
  });

  it("S81-10b: the no-stream body fallback counts BYTES, not UTF-16 units (audit 81-a L-3)", () => {
    const seam = src("lib/json-body.ts");
    expect(seam).not.toMatch(/text\.length > maxBytes/);
    expect(seam).toMatch(/TextEncoder\(\)\.encode\(text\)\.length/);
  });
});

// S82 — the overlay price-format parity + audit 82-a source pins.
//
// D-82-1 (codepoint-measured on the live reference 2026-11-09): the
// reference's search-overlay row price renders the Base44 template's USD
// format ("$370.00" — ASCII U+0024, always two decimals) while its
// grid/detail prices stay ৳ whole-taka. The clone's overlay matches those
// bytes through formatOverlayPrice; every other money surface keeps
// formatMoney. The audit 82-a pins: L-1 the schema junction comment
// matches the declared FK behaviors; L-2 the seed comment reflects the
// S81-3 template-slug links; INFO-2 the first display category is
// deterministic (ordered include); INFO-4 the upsert catch maps P2003;
// INFO-5 the restore script's wiring rebuild is transactional.
describe("S82 — the overlay price format + audit 82-a pins", () => {
  it("S82-1: the overlay row price uses formatOverlayPrice (the reference's $ template format)", () => {
    const overlay = src("components/store/search-overlay.tsx");
    expect(overlay).toContain("formatOverlayPrice");
    expect(overlay).not.toMatch(/formatMoney\(r\.price\)/);
  });

  it("S82-1b: formatOverlayPrice lives in money.ts beside formatMoney (overlay-scoped, no other consumer)", () => {
    const money = src("lib/money.ts");
    expect(money).toMatch(/export function formatOverlayPrice/);
  });

  it("S82-2: the ProductCategory comment matches the declared FKs (audit L-1)", () => {
    const schema = readFileSync(
      path.resolve(import.meta.dirname, "../../prisma/schema.prisma"),
      "utf8",
    );
    expect(schema).not.toContain("Both FKs Restrict");
    // The comment documents the real split: categoryId Restrict, productId Cascade.
    expect(schema).toMatch(/categoryId Restrict[\s\S]{0,200}productId Cascade/);
  });

  it("S82-2b: the seed CATEGORIES comment records the template-slug nav/footer links (audit L-2)", () => {
    const seed = readFileSync(
      path.resolve(import.meta.dirname, "../../prisma/seed.ts"),
      "utf8",
    );
    // The retired claim contradicted the S81-3 nav/footer template links.
    expect(seed).not.toContain("the clone links the real slugs");
  });

  it("S82-4: the first display category is deterministic (ordered include, audit INFO-2)", () => {
    const products = src("lib/products.ts");
    const include = products.match(/export const productCategoryInclude = \{[\s\S]*?satisfies Prisma\.ProductInclude;/)?.[0] ?? "";
    expect(include).toContain("orderBy");
    expect(include).toContain("sortOrder");
  });

  it("S82-5: the upsert catch maps P2003 to the category-gone message (audit INFO-4)", () => {
    const admin = src("lib/actions/admin.ts");
    expect(admin).toMatch(/isForeignKeyViolation/);
    expect(admin.match(/A selected category no longer exists\./g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("S82-6: the restore script's wiring rebuild is transactional + single-read (audit INFO-5)", () => {
    const script = readFileSync(
      path.resolve(import.meta.dirname, "../../scripts/restore-demo-stock.ts"),
      "utf8",
    );
    expect(script).toMatch(/\$transaction/);
  });
});

// S83 — the audit 83-a pins: F-2 the analytics surface's category read is
// deterministic (the S82-4 orderBy never reached its inline select, and the
// products.ts comment overclaimed analytics coverage); F-3 the USD/US
// HomeNest remnants (the dead United States fallbacks + the $0.00 zero
// state beside a ৳ formatter).
describe("S83 — the analytics determinism + USD-remnant pins", () => {
  it("S83-4: the analytics select orders its nested categories (audit F-2)", () => {
    const analytics = src("app/(storefront)/admin/analytics/page.tsx");
    // The nested categories select carries the S82-4 ordering — the
    // categories[0] attribution must not be row-order dependent.
    const selectMatch =
      analytics.match(/categories:\s*\{[\s\S]{0,220}?orderBy[\s\S]{0,120}?sortOrder/) ?? [];
    expect(selectMatch.length).toBeGreaterThan(0);
    expect(analytics).toMatch(/categories\[0\]/);
  });

  it("S83-4b: the productCategoryInclude comment names the real consumers (no analytics overclaim)", () => {
    const products = src("lib/products.ts");
    // The comment claims the determinism flows to analytics through
    // firstCategoryName — analytics owns its own ordered select instead.
    expect(products).not.toMatch(/analytics attribution through `firstCategoryName`/);
    expect(products).toMatch(/JSON-LD/);
  });

  it("S83-5: no dead United States fallbacks in the address surfaces (audit F-3)", () => {
    const addressesRoute = src("app/api/addresses/route.ts");
    // The Zod default ("Bangladesh") always wins — the fallback is dead code.
    expect(addressesRoute).not.toContain('|| "United States"');
    const account = src("app/(storefront)/account/page.tsx");
    // The order-history snapshot display falls back to the BD store default.
    expect(account).not.toContain('|| "United States"');
  });

  it("S83-5b: the analytics AOV zero state renders through formatMoney (no $ remnant)", () => {
    const analytics = src("app/(storefront)/admin/analytics/page.tsx");
    expect(analytics).not.toContain('"$0.00"');
    expect(analytics).toMatch(/formatMoney/);
  });
});

// S84 — the taka-copy pins (session 84): audit 84-a's L-1 — the
// dollar-worded copy that survived the S83-5 USD sweep (the
// coupon-dialog's fixed-value errors and validation.ts's four money-bound
// messages, all HomeNest heritage in a ৳/poisha store whose dialog labels
// already read (৳)).
describe("S84 — the taka-copy pins", () => {
  it("S84-4: validation.ts's money-bound messages read taka (audit L-1)", () => {
    const validation = src("lib/validation.ts");
    // The four bound messages (price / compare-at / coupon value /
    // minimum subtotal) carry the store's currency, not the inherited one.
    expect(validation).not.toMatch(/under \$1,000,000/);
    expect(validation).toMatch(/under ৳1,000,000/);
  });

  it("S84-4b: the coupon dialog's fixed-value errors read taka (audit L-1)", () => {
    const dialog = src("app/(storefront)/admin/coupons/coupon-dialog.tsx");
    // The fixed-value/min-subtotal errors no longer borrow the inherited
    // currency's wording (the fixing comments must not quote the banned
    // literals — the S83-5 trap-5 lesson).
    expect(dialog).not.toMatch(/dollar amount/i);
    expect(dialog).not.toMatch(/\$0\.01/);
  });

  it("S84-1b: the native search-cancel button is suppressed (the reference's plain-text input)", () => {
    const globals = src("app/globals.css");
    // Measured live this cycle (pixel-cluster evidence at the input's right
    // edge, x300-309 @390px): Chromium renders a native clear glyph on
    // typed search inputs — the reference's input is a plain text field and
    // renders nothing there. The clone keeps type=search (the searchbox
    // role the e2e pins target); the Close button stays the sheet's only
    // close affordance, so the glyph is suppressed.
    expect(globals).toMatch(/::-webkit-search-cancel-button/);
    expect(globals).toMatch(/-webkit-appearance:\s*none/);
    expect(globals).toMatch(/display:\s*none/);
  });
});

// S85 — the taka-copy completion pins (session 85): audit 85-a's L-1 —
// the two admin dialogs the run-84 S84-4b sweep missed (product-dialog's
// labels/errors, settings-form's error/helpers), plus the comment-scope
// sweep (audit INFO-2 + the cycle's concept census) and the S84-1b
// comment's exclusivity-claim correction (audit L-2). The S84-4 trap-4
// lesson applies: sweep the CONCEPT (currency wording), not just symbols.
describe("S85 — the taka-copy completion pins", () => {
  it("S85-1: the product dialog's price labels and errors read taka (audit L-1)", () => {
    const dialog = src("app/(storefront)/admin/products/product-dialog.tsx");
    // The two field labels carry the store's currency symbol, not the
    // inherited template's (the coupon dialog's run-84 wording family).
    expect(dialog).not.toMatch(/Price \(\$\)/);
    expect(dialog).not.toMatch(/Compare-at \(\$\)/);
    expect(dialog).toMatch(/Price \(৳\)/);
    expect(dialog).toMatch(/Compare-at \(৳\)/);
    // The two parse-error strings no longer borrow the inherited wording.
    expect(dialog).not.toMatch(/in dollars/);
    expect(dialog).toMatch(/in taka/);
  });

  it("S85-2: the settings form's threshold error and helpers read taka (audit L-1)", () => {
    const form = src("app/(storefront)/admin/settings/settings-form.tsx");
    // The three shipping/threshold helpers sit under labels that read (৳).
    expect(form).not.toMatch(/Enter dollars\./);
    expect(form).toMatch(/Enter taka/);
    // The free-shipping-threshold parse error.
    expect(form).not.toMatch(/dollar amount/i);
    expect(form).toMatch(/taka amount/i);
  });

  it("S85-3: the comment-scope sweep — no stale inherited-currency wording in the touched files", () => {
    // The settings form's doc comment describes the taka-to-poisha edit.
    const form = src("app/(storefront)/admin/settings/settings-form.tsx");
    expect(form).not.toMatch(/dollars ⇄ cents/);
    expect(form).not.toMatch(/edited in dollars/);
    // The coupons page's display-shape comment.
    const couponsPage = src("app/(storefront)/admin/coupons/page.tsx");
    expect(couponsPage).not.toMatch(/shown as dollars/);
    // The checkout route's zero-value-line guard comment.
    const checkout = src("app/api/checkout/route.ts");
    expect(checkout).not.toMatch(/\$0 line/);
    // The cart-quantity seam's zero-value-item comment.
    const cartQuantity = src("lib/cart-quantity.ts");
    expect(cartQuantity).not.toMatch(/\$0 item/);
    // The money back-compat alias comment (the dialogs are taka-labeled
    // once S85-1/S85-2 land — the phrase goes stale with them).
    const money = src("lib/money.ts");
    expect(money).not.toMatch(/dollar-labeled/);
    // The SEO price converter's doc (its product is decimal taka — the
    // JSON-LD BDT price unit).
    const seo = src("lib/seo.ts");
    expect(seo).not.toMatch(/decimal dollars/);
    expect(seo).toMatch(/decimal taka/);
    // The settings schema's whole-number helper doc.
    const settingsSchema = src("lib/settings-schema.ts");
    expect(settingsSchema).not.toMatch(/dollars input/);
    // The coupon dialog's type-switch hazard comment (the fixed-value
    // example must quote the store's symbol).
    const couponDialog = src("app/(storefront)/admin/coupons/coupon-dialog.tsx");
    expect(couponDialog).not.toMatch(/silently means \$10\.00/);
    expect(couponDialog).toMatch(/silently means ৳10\.00/);
  });

  it("S85-4: the S84-1b suppression comment states its real (app-wide) scope (audit L-2)", () => {
    const globals = src("app/globals.css");
    // The run-84 comment claimed nothing else uses type=search — three
    // admin GET-form search inputs do. The corrected comment names them
    // and records the deliberate app-wide coverage.
    expect(globals).not.toMatch(/nothing else uses\s+them/);
    expect(globals).toMatch(/admin/);
    expect(globals).toMatch(/app-wide/);
    // The rule itself is unchanged (the S84-1b pins still hold above).
    expect(globals).toMatch(/::-webkit-search-cancel-button/);
  });
});

// S86 — the placeholder-localization pins (session 86): audit 86-a's L-1
// (the HomeNest kitchenware placeholder trio on the skincare admin dialog —
// the S85 copy-cycle class, missed because placeholders weren't in the
// concept sweep) and I-1/I-2 (the US-format phone and carrier/tracking
// placeholders on a BD store). The S85 lesson carries: sweep the CONCEPT
// (scaffold-heritage examples), not just currency symbols.
describe("S86 — the placeholder-localization pins", () => {
  it("S86-4: the product dialog's placeholder trio is skincare-appropriate (audit L-1)", () => {
    const dialog = src("app/(storefront)/admin/products/product-dialog.tsx");
    // The HomeNest kitchenware examples are gone…
    expect(dialog).not.toMatch(/dutch-oven/i);
    expect(dialog).not.toMatch(/HN-DUTCH/);
    expect(dialog).not.toMatch(/6 qt/i);
    expect(dialog).not.toMatch(/cast iron/i);
    // …replaced by the store's own conventions: a kebab-case skincare
    // slug, the seed's ELY-00N SKU family, and label:value spec lines.
    expect(dialog).toMatch(/placeholder="rosehip-glow-serum"/);
    expect(dialog).toMatch(/placeholder="ELY-020"/);
    expect(dialog).toMatch(/Material: Bamboo/);
    expect(dialog).toMatch(/Bristle type: Soft/);
  });

  it("S86-6a: the account profile phone placeholder is the codebase's BD format (audit I-1)", () => {
    const form = src("app/(storefront)/account/profile-form.tsx");
    // The address dialog's pinned BD example is the single convention —
    // the US +1 (555) scaffold default has no place on a BD store.
    expect(form).not.toMatch(/\+1 \(555\)/);
    expect(form).toMatch(/\+880 1712 345678/);
  });

  it("S86-6b: the order dialog's carrier/tracking placeholders are BD-appropriate (audit I-2)", () => {
    const dialog = src("app/(storefront)/admin/orders/order-manage-dialog.tsx");
    // US carriers and the UPS 1Z… tracking format are scaffold heritage.
    expect(dialog).not.toMatch(/UPS|FedEx|USPS/);
    expect(dialog).not.toMatch(/1Z999AA/);
    // The major BD couriers as examples; a format-neutral alphanumeric
    // tracking dummy (no real-world format asserted).
    expect(dialog).toMatch(/Pathao, RedX, Sundarban/);
    expect(dialog).toMatch(/placeholder="ABC123456789"/);
  });
});

// --- S96-2: the admin accent-color reskin completion (audit 96-a L-10) -----
// Six admin-dialog checkboxes still hardcoded the pre-re-skin terracotta
// accent (accent-[hsl(24_70%_50%)] — the kitchen era's primary) while the
// token palette ships taupe; product-dialog's own category checkbox already
// uses accent-foreground, so the dialogs were inconsistent even internally.
// The L-1/L-2 precedent (no #d96e26 in Stripe appearance / admin charts)
// extends to the accent utilities: the terracotta literal is gone.
describe("S96 — the admin accent-color reskin completion", () => {
  const adminDialogs = [
    "app/(storefront)/admin/products/product-dialog.tsx",
    "app/(storefront)/admin/carousel/slide-dialog.tsx",
    "app/(storefront)/admin/categories/category-dialog.tsx",
    "app/(storefront)/admin/coupons/coupon-dialog.tsx",
  ];

  it("no admin dialog hardcodes the pre-re-skin terracotta accent literal", () => {
    for (const file of adminDialogs) {
      const source = src(file);
      // S97-4: both underscore/space variants of the hsl literal plus the
      // hex form — the negative net covers every spelling of the retired
      // terracotta accent.
      expect(source, `${file} still carries the terracotta accent (underscore)`).not.toContain(
        "hsl(24_70%_50%",
      );
      expect(source, `${file} still carries the terracotta accent (space)`).not.toContain(
        "hsl(24 70% 50%",
      );
      expect(source, `${file} still carries the terracotta accent (hex)`).not.toContain("#d96e26");
    }
  });

  it("every checkbox in those dialogs rides the token palette's accent-foreground", () => {
    for (const file of adminDialogs) {
      const source = src(file);
      // S97-4 (audit 97-a N5): per-tag assertion — every checkbox input's
      // own tag must carry accent-foreground (the count heuristic could be
      // satisfied by a non-checkbox element gaining the class while a
      // checkbox lost it). The tag match spans to the self-closing slash:
      // an onChange arrow function contains ">" (=>), so a [^>]* pattern
      // truncates mid-tag and misses a className that follows the handler.
      const inputs = source.match(/<input\b[\s\S]*?\/>/g) ?? [];
      const checkboxes = inputs.filter((tag) => tag.includes('type="checkbox"'));
      expect(checkboxes.length, `${file}: no checkboxes found to pin`).toBeGreaterThan(0);
      for (const tag of checkboxes) {
        expect(tag, `${file}: a checkbox is missing accent-foreground`).toContain(
          "accent-foreground",
        );
      }
    }
  });
});

// S106 — the Stripe Pay-button currency-domain pins (audit 106-a F-1/F-2,
// source pins). The checkout island's Pay button renders the amount the
// mint route echoes — `intent.amount`, the PaymentIntent's USD MINOR UNITS
// (the converted `stripeChargeAmount` total, `currency: "usd"`) — so it
// must compose `formatStripeUsd` (the Stripe USD formatter, S105-1), never
// `formatMoney` (the ৳ BDT-poisha formatter). Run-105's change-set asserted
// the button "stays ৳ — the BDT cart total", but the echoed value is the
// CONVERTED USD intent amount, not `money.total`: at STRIPE_BDT_PER_USD=120
// a ৳288 order minted a $2.40 intent whose button read "Pay — ৳2.40" — wrong
// symbol AND ~120x under the review block's ৳288, on the charge-consent
// surface. The island never mounts in test envs (Stripe unconfigured), so
// the source pin is the only probe that can hold the seam — the S82-1
// precedent (a money surface renders through its domain's formatter).
describe("S106 — the Stripe Pay-button currency-domain pins (source pins)", () => {
  it("S106-1a: the Pay button composes formatStripeUsd on the echoed intent amount", () => {
    const island = src("components/checkout/stripe-pay.tsx");
    // The button slice — the consent surface for the USD card charge. The
    // review block's ৳ totals are the parent's children (a BDT surface,
    // untouched); the button states exactly what the card will be charged.
    expect(island).toContain("Pay — ${formatStripeUsd(amount)}");
  });

  it("S106-1b: the island carries NO formatMoney (no BDT money surface remains in the file)", () => {
    const island = src("components/checkout/stripe-pay.tsx");
    // The import swap is the whole GREEN: after S106-1 the island renders
    // exactly one money value (the USD intent amount), so the ৳ formatter
    // must not even be imported — a future re-add fails here by name.
    expect(island).not.toContain("formatMoney");
  });

  it("S106-1c: the mint route's session-amount docblock names the USD-minor-unit domain (F-2)", () => {
    const route = readFileSync(
      path.resolve(import.meta.dirname, "../../src/app/api/stripe/payment-intent/route.ts"),
      "utf8",
    );
    const sessionType = route.slice(
      route.indexOf("type PaymentIntentSession = {"),
      route.indexOf("amount: number;", route.indexOf("type PaymentIntentSession = {")) + "amount: number;".length,
    );
    // The domain-silent docblock was the ambiguity that enabled F-1: the
    // field's currency/units must be stated at the boundary that mints it
    // (the docblock's "never formatMoney" prohibition is the guidance —
    // naming the trap at the seam that mints the value).
    expect(sessionType).toMatch(/USD minor units/i);
    expect(sessionType).toContain("formatStripeUsd");
    expect(sessionType).toMatch(/never formatMoney/);
  });
});

// S107 — the taka-vocabulary identifier pins (audit 107-a INFO-1/INFO-3,
// source pins). Runs 105/106 closed the currency-DOMAIN class at the
// formatter and render seams (formatStripeUsd on USD minor units, never
// formatMoney); audit 107-a found the class's last residue at the
// IDENTIFIER level: the admin money-input surfaces still carried the
// HomeNest-scaffold "Dollars" vocabulary over values that are ALL BDT
// poisha — the parseDollarsToCents back-compat alias, the *Dollars form
// field names (price/compareAt/minSubtotal/shipping/threshold), and seo's
// centsToDollars JSON-LD helper. Internal-only names (never rendered, no
// behavioral impact), but the identifier vocabulary is the same
// name-outlived-domain trap: a future maintainer reaching for a money API
// by name finds a "Dollars" surface over taka values. The pins hold the
// retirement: the canonical parseAmountToCents import, the *Taka field
// vocabulary, and no Dollars identifier anywhere on the five admin
// money-input surfaces (the net sweeps stale heritage COMMENTS with the
// stale names — prose carrying the old vocabulary fails here too).
describe("S107 — the taka-vocabulary identifier pins (source pins)", () => {
  it("S107-1a: money.ts exports no parseDollarsToCents alias (retired with S107-1)", () => {
    const money = src("lib/money.ts");
    // The alias always forwarded to parseAmountToCents; with its three
    // dialog consumers migrated, the back-compat export retires — a
    // future re-add fails here by name.
    expect(money).not.toContain("parseDollarsToCents");
  });

  it("S107-1b: the three admin dialogs import parseAmountToCents directly (no alias consumers)", () => {
    const dialogs = [
      "app/(storefront)/admin/products/product-dialog.tsx",
      "app/(storefront)/admin/coupons/coupon-dialog.tsx",
      "app/(storefront)/admin/settings/settings-form.tsx",
    ] as const;
    for (const rel of dialogs) {
      const dialog = src(rel);
      expect(dialog, rel).toContain('import { parseAmountToCents } from "@/lib/money"');
      expect(dialog, rel).not.toContain("parseDollarsToCents");
    }
  });

  it("S107-1c: the admin money-input surfaces carry no *Dollars identifiers (the taka vocabulary)", () => {
    const surfaces = [
      "app/(storefront)/admin/settings/settings-form.tsx",
      "app/(storefront)/admin/products/product-dialog.tsx",
      "app/(storefront)/admin/products/page.tsx",
      "app/(storefront)/admin/coupons/coupon-dialog.tsx",
      "app/(storefront)/admin/coupons/page.tsx",
    ] as const;
    for (const rel of surfaces) {
      const surface = src(rel);
      // Both cases: the identifier shapes (priceDollars, minSubtotalDollars)
      // and any prose heritage notes still carrying the vocabulary.
      expect(surface, rel).not.toContain("Dollars");
      expect(surface, rel).not.toContain("dollars");
    }
  });

  it("S107-1d: seo.ts's JSON-LD price helper is named in the taka vocabulary", () => {
    const seo = src("lib/seo.ts");
    // centsToDollars converted poisha → decimal taka for the JSON-LD BDT
    // price unit (its own docblock flagged the scaffold-heritage name);
    // the rename makes the name match the domain it always served.
    expect(seo).toContain("centsToTaka");
    expect(seo).not.toContain("centsToDollars");
  });

  it("S107-2a: the island's mint fetch carries a timeout signal (audit 107-a INFO-3)", () => {
    const island = src("components/checkout/stripe-pay.tsx");
    const mintStart = island.indexOf('fetch("/api/stripe/payment-intent"');
    const mintEnd = island.indexOf(".then(async (res)", mintStart);
    expect(mintStart, "the mint fetch site").toBeGreaterThanOrEqual(0);
    const mintOptions = island.slice(mintStart, mintEnd);
    // A hung mint request previously left the panel in the preparing state
    // with no retry affordance; the abort rejects into the standing catch
    // → sessionError → the Try-again button. The island never mounts in
    // test envs (Stripe unconfigured), so the source pin is the only probe
    // that can hold the seam.
    expect(mintOptions, "the mint fetch options carry the timeout signal").toContain("AbortSignal.timeout(");
  });
});
