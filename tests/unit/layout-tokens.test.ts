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
    // The search overlay tracks the responsive bar.
    expect(header).toMatch(/top-16 z-50/);
    expect(header).toMatch(/lg:top-20/);
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
