// @vitest-environment jsdom
// Session 77 S77-2/S77-3 — the search overlay's reference anatomy.
//
// The run-77 live re-measurement found the reference's search — from BOTH
// the header icon AND the mobile panel's SEARCH row — opens a FULL-SCREEN
// overlay (`fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm`, the
// content column `max-w-2xl mx-auto px-6 pt-24 lg:pt-32`, the input in the
// display serif at `text-lg lg:text-2xl`), with single-column 80px result
// rows (p-3, gap-1) carrying name + shortDescription + a font-light price.
// The clone shipped a top-16 dropdown with a two-column grid and category
// labels instead. These tests drive the REAL SearchOverlay through stubbed
// fetch (the cart-widgets component-test precedent) so the anatomy cannot
// drift back silently.
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SearchOverlay } from "@/components/store/search-overlay";

const RESULTS = [
  {
    id: "prod-1",
    name: "Pure Satin Silk Pillowcase – For Hair & Skin",
    image: "/images/pillowcase-main.jpg",
    price: 28800,
    description: "Sleep in smooth comfort with our premium satin silk pillowcase.",
  },
  {
    id: "prod-2",
    name: "Premium Double Sided Ruffles Silk Hair Bonnet",
    image: "/images/bonnet-main.jpg",
    price: 37000,
    description: "",
  },
] as const;

/** Stub the global fetch to answer /api/search with the result set. */
function stubSearch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => ({
      json: async () =>
        String(input).includes("/api/search") ? { results: RESULTS } : { results: [] },
    }) as unknown as Response),
  );
}

function renderOverlay(open = true) {
  return render(<SearchOverlay open={open} onClose={() => {}} />);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SearchOverlay — the S77 reference anatomy (D-1)", () => {
  it("renders nothing when closed (conditional mount, the v4-safe pattern)", () => {
    const { container } = renderOverlay(false);
    expect(container).toBeEmptyDOMElement();
  });

  it("the container is the reference's full-screen overlay (inset-0 z-[70] bg/95 + the 4px xs blur)", () => {
    renderOverlay();
    const overlay = screen.getByTestId("search-overlay");
    expect(overlay.className).toContain("fixed");
    expect(overlay.className).toContain("inset-0");
    expect(overlay.className).toContain("z-[70]");
    expect(overlay.className).toContain("bg-background/95");
    // v4's xs = the reference's measured blur(4px); v4's sm is 8px (rename trap).
    expect(overlay.className).toContain("backdrop-blur-xs");
    // The old dropdown anatomy is gone (no header-anchored sheet, no shadow chip).
    expect(overlay.className).not.toContain("top-16");
    expect(overlay.className).not.toContain("shadow-sm");
  });

  it("the content column is the reference's max-w-2xl with pt-24 lg:pt-32", () => {
    renderOverlay();
    const overlay = screen.getByTestId("search-overlay");
    const column = overlay.firstElementChild;
    expect(column?.className).toContain("max-w-2xl");
    expect(column?.className).toContain("mx-auto");
    expect(column?.className).toContain("px-6");
    expect(column?.className).toContain("pt-24");
    expect(column?.className).toContain("lg:pt-32");
    // The container-page gutter belongs to the page shell, not the overlay.
    expect(column?.className).not.toContain("container-page");
  });

  it("the input rides the display serif at text-lg lg:text-2xl (the reference's heading-editorial)", () => {
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    expect(input.className).toContain("font-display");
    expect(input.className).toContain("text-lg");
    expect(input.className).toContain("lg:text-2xl");
  });

  it("the input row keeps the hairline border + pb-4 rhythm with 20px icons", () => {
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    const row = input.parentElement;
    expect(row?.className).toContain("border-b");
    expect(row?.className).toContain("pb-4");
  });

  it("Escape closes (the reference's dismiss affordance survives)", () => {
    const onClose = vi.fn();
    render(<SearchOverlay open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});

describe("SearchOverlay — the S77 result rows (D-2)", () => {
  it("renders single-column rows at the 80px anatomy (p-3, gap-1)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });

    const row = await waitFor(() => {
      const link = screen.getByRole("link", { name: /Pure Satin Silk Pillowcase/ });
      expect(link).toBeInTheDocument();
      return link;
    });
    expect(row.className).toContain("p-3");
    const list = row.closest("ul");
    expect(list?.className).toContain("flex");
    expect(list?.className).toContain("flex-col");
    expect(list?.className).toContain("gap-1");
    // The old two-column grid is gone.
    expect(list?.className).not.toContain("grid-cols-2");
  });

  it("the row copy is the reference's: name + shortDescription (no category), ৳ price", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });

    await waitFor(() => {
      expect(screen.getByText("Sleep in smooth comfort with our premium satin silk pillowcase.")).toBeInTheDocument();
    });
    // The price renders ৳ whole-taka (the standing currency deviation).
    expect(screen.getByText("৳288")).toBeInTheDocument();
    // The old category label is gone from the rows.
    expect(screen.queryByText("Bestsellers")).not.toBeInTheDocument();
  });

  it("no-description products render name + price only (no empty copy line)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });

    const bonnet = await waitFor(() => {
      const link = screen.getByRole("link", { name: /Silk Hair Bonnet/ });
      expect(link).toBeInTheDocument();
      return link;
    });
    // Exactly one text line for the name — the bonnet's empty
    // shortDescription renders NO description line (the reference's rows
    // show no copy for no-copy products).
    const lines = bonnet.querySelectorAll("span.block");
    expect(lines.length).toBe(1);
    expect(lines[0]?.textContent).toContain("Silk Hair Bonnet");
  });

  it("the price rides font-light (the reference's 14px/300)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });
    await waitFor(() => {
      expect(screen.getByText("৳288")).toBeInTheDocument();
    });
    const price = screen.getByText("৳288");
    expect(price.className).toContain("font-light");
    expect(price.className).not.toContain("font-semibold");
  });
});
