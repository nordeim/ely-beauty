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
    expect(overlay).toMatch(/font-display text-lg leading-\[1\.1\] lg:text-2xl/);
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
