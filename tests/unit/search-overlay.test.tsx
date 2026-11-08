// @vitest-environment jsdom
// Session 77 S77-2/S77-3 — the search overlay's reference anatomy.
//
// The run-77 live re-measurement found the reference's search — from BOTH
// the header icon AND the mobile panel's SEARCH row — opens a FULL-SCREEN
// overlay (`fixed inset-0 z-[70] bg-background/95 backdrop-blur-xs`, the
// content column `max-w-2xl mx-auto px-6 pt-24 lg:pt-32`, the input in the
// display serif at `text-lg lg:text-2xl`), with single-column 80px result
// rows (p-3, gap-1) carrying name + shortDescription + a font-light price.
// The run-78 additions pin the measured scroll container (mt-6 max-h-[60vh]
// overflow-y-auto), the 2px row corners, the 1-char floor, the reference's
// no-results copy, and the dialog-semantics superset.
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

describe("SearchOverlay — the S78 reachability + micro-parity (D-1..D-4 + a11y)", () => {
  it("the result list scrolls inside a 60vh cap below the input row (the reference's reachability)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });

    const row = await waitFor(() => {
      const link = screen.getByRole("link", { name: /Pure Satin Silk Pillowcase/ });
      expect(link).toBeInTheDocument();
      return link;
    });
    const list = row.closest("ul");
    // S78-1 (D-1, measured live): the reference's list is `mt-6 space-y-1
    // max-h-[60vh] overflow-y-auto` — 24px below the input row, capped at
    // 60% of the viewport height, scrolling its OWN rows. Without the cap
    // the 8 capped rows (~784px) overflow every sub-816px window with no
    // scroll anywhere (a fixed container does not scroll; the page behind
    // it does not move it).
    expect(list?.className).toContain("mt-6");
    expect(list?.className).toContain("max-h-[60vh]");
    expect(list?.className).toContain("overflow-y-auto");
    // The 4px rhythm survives (space-y-1 ≡ gap-1).
    expect(list?.className).toContain("gap-1");
  });

  it("the rows carry the reference's 2px corner radius (its rounded-md under the shadcn scale)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });

    const row = await waitFor(() => {
      const link = screen.getByRole("link", { name: /Pure Satin Silk Pillowcase/ });
      expect(link).toBeInTheDocument();
      return link;
    });
    // S78-3 (D-3, measured live): the reference's rows carry rounded-md,
    // which computes to 2px under its shadcn radius scale (--radius .25rem
    // − 2px). v4's default rounded-md is 6px — the arbitrary value pins
    // the measured geometry.
    expect(row.className).toContain("rounded-[2px]");
  });

  it("a 1-character query fires the typeahead (the reference's floor is 1, not 2)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    // S78-2 (D-2, measured live): the reference returns a full 8-row result
    // set for a 1-char query ("e"); the clone floored at 2.
    fireEvent.change(input, { target: { value: "e" } });
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Pure Satin Silk Pillowcase/ })).toBeInTheDocument();
    });
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it("an empty query still renders nothing (the floor is 1, empty stays empty)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "" } });
    // The debounce timer is 250ms — no fetch, no rows, no no-results copy.
    await new Promise((r) => setTimeout(r, 400));
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/No products found/)).not.toBeInTheDocument();
  });

  it("the no-results copy is the reference's 'No products found for' shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => ({ results: [] }) }) as unknown as Response),
    );
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "zzzzq" } });

    await waitFor(() => {
      // S78-4 (D-4, measured live): the reference renders `No products
      // found for "zzzzq"` — the verb + quoted-term shape.
      expect(screen.getByText('No products found for “zzzzq”.')).toBeInTheDocument();
    });
    expect(screen.queryByText(/No products match/)).not.toBeInTheDocument();
  });

  it("the overlay declares dialog semantics (the invisible a11y superset)", () => {
    stubSearch();
    renderOverlay();
    // S78-5 (A-4): the reference ships no dialog semantics either — this is
    // the repo's invisible-superset lane (the aria-current precedent), not
    // a parity fix. The full-screen sheet is a real modal to assistive
    // tech while the shell behind it goes inert.
    expect(screen.getByRole("dialog", { name: "Search products" })).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Search products" })).toHaveAttribute("aria-modal", "true");
  });
});
