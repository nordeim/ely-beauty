// @vitest-environment jsdom
// Run 110 S110-4 — the mobile panel's state machine at the search-overlay
// handoff (measured live on the reference with matched methodology: the
// panel CLOSES at overlay-open time — the reference's header box collapses
// 278 → 64px while the overlay is up — and stays closed after the overlay
// exits; the clone kept the panel mounted under the overlay, the stale
// S77-2 claim this cycle corrected).
//
// The suite's first MobileNav component test (the search-overlay/toaster
// precedents): renders the REAL MobileNav inside the REAL StoreProvider
// through a tiny harness that exposes the store's booleans, so the
// panel↔overlay handoff is asserted at the state level the e2e spec then
// guards on the production build.
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { MobileNav } from "@/components/store/mobile-nav";
import { StoreProvider, useStore } from "@/components/store/store-provider";

/** Exposes the store's booleans + a panel opener so the test can drive the
 *  real MobileNav through the real provider without touching internals. */
function Harness() {
  const { mobileNavOpen, setMobileNavOpen, searchOverlayOpen } = useStore();
  return (
    <>
      <button type="button" onClick={() => setMobileNavOpen(true)}>
        open-panel
      </button>
      <div data-testid="panel-state">{mobileNavOpen ? "open" : "closed"}</div>
      <div data-testid="overlay-state">{searchOverlayOpen ? "open" : "closed"}</div>
      <MobileNav />
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe("MobileNav — the S74-2 panel anatomy", () => {
  it("renders the SEARCH row and the four nav links ONLY (no scaffold-heritage rows)", () => {
    render(
      <StoreProvider>
        <Harness />
      </StoreProvider>,
    );
    fireEvent.click(screen.getByText("open-panel"));
    const panel = screen.getByTestId("mobile-menu");
    expect(panel).toBeInTheDocument();
    const panelQueries = within(panel);

    expect(panelQueries.getByRole("button", { name: "Search" })).toBeInTheDocument();
    for (const label of ["Shop", "Beauty Tools", "Brush & Combs", "About"]) {
      expect(panelQueries.getByRole("link", { name: label })).toBeInTheDocument();
    }
    // S74-2: the reference's panel ends at About — the Sign In/Wishlist/
    // account rows are scaffold heritage and must stay gone.
    expect(screen.queryByRole("link", { name: "Sign In" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Wishlist" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "My Account" })).not.toBeInTheDocument();
  });

  it("the nav links carry the reference's template-filter hrefs (S81-3)", () => {
    render(
      <StoreProvider>
        <Harness />
      </StoreProvider>,
    );
    fireEvent.click(screen.getByText("open-panel"));
    const panelQueries = within(screen.getByTestId("mobile-menu"));
    expect(panelQueries.getByRole("link", { name: "Shop" })).toHaveAttribute("href", "/shop");
    expect(panelQueries.getByRole("link", { name: "Beauty Tools" })).toHaveAttribute(
      "href",
      "/shop?category=skincare",
    );
    expect(panelQueries.getByRole("link", { name: "Brush & Combs" })).toHaveAttribute(
      "href",
      "/shop?category=body_care",
    );
    expect(panelQueries.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });
});

describe("MobileNav — the S110-4 panel↔overlay handoff (measured live on the reference)", () => {
  it("the SEARCH row closes the panel when it opens the shared overlay", () => {
    render(
      <StoreProvider>
        <Harness />
      </StoreProvider>,
    );
    // Panel closed at rest (conditional mount — the Tailwind v4-safe pattern).
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("open-panel"));
    expect(screen.getByTestId("panel-state")).toHaveTextContent("open");
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();

    // The handoff: clicking SEARCH must open the overlay AND close the
    // panel in the same click — the reference's measured state machine
    // (run-110: header box 278 → 64px at overlay-open time; the S77-2
    // "panel stays open underneath" claim was stale).
    fireEvent.click(
      within(screen.getByTestId("mobile-menu")).getByRole("button", { name: "Search" }),
    );
    expect(screen.getByTestId("overlay-state")).toHaveTextContent("open");
    expect(screen.getByTestId("panel-state")).toHaveTextContent("closed");
    // The panel UNMOUNTS (conditional mount, not a display toggle).
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
  });
});
