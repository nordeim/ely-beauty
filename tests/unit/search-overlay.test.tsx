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

  it("the input rides font-light with the /60 placeholder (the reference's measured 300 + dimmed hint, S84-1)", () => {
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    // S84-1 (D-84-1/D-84-2, measured live 2026-11-09 on both viewports):
    // the reference's input carries font-light — computed 300 (the clone
    // shipped the default 400) — and dims its placeholder to 60% (its
    // text-muted-foreground/60; the clone shipped full opacity). The
    // weight/placeholder pair had never been compared before this cycle.
    expect(input.className).toContain("font-light");
    expect(input.className).toContain("placeholder:text-muted-foreground/60");
    // The un-dimmed placeholder form is retired (the bare utility is a
    // substring of the /60 form — the lookahead keeps the ban honest).
    expect(input.className).not.toMatch(/placeholder:text-muted-foreground(?!\/60)/);
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

  it("the row copy is the reference's: name + shortDescription (no category), the $ template price", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });

    await waitFor(() => {
      expect(screen.getByText("Sleep in smooth comfort with our premium satin silk pillowcase.")).toBeInTheDocument();
    });
    // S82-1 (D-82-1): the reference's overlay renders the Base44 template's
    // USD format — "$288.00", ASCII dollar + two decimals (codepoint-measured
    // live 2026-11-09) — while its grid prices stay ৳. The clone matches the
    // reference's bytes here; the ৳ whole-taka form survives everywhere else.
    expect(screen.getByText("$288.00")).toBeInTheDocument();
    expect(screen.queryByText("৳288")).not.toBeInTheDocument();
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
      expect(screen.getByText("$288.00")).toBeInTheDocument();
    });
    const price = screen.getByText("$288.00");
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

  it("an empty query fires no typeahead and renders no rows (the floor is 1)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "" } });
    // The debounce timer is 250ms — no fetch, no rows, no no-results copy
    // (the S80-1 hint below is the ONLY empty-state content).
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
      // S80-2 (D-80-2, codepoint-verified live): the reference's quotes
      // are STRAIGHT ASCII (codepoint 34) with NO trailing period, in
      // the centered py-8 style (the empty-state hint's own class
      // family). The clone's curly quotes + period + pt-4 were the
      // un-measured residue.
      expect(screen.getByText('No products found for "zzzzq"')).toBeInTheDocument();
    });
    expect(screen.queryByText(/No products match/)).not.toBeInTheDocument();
    // The retired curly/period forms are gone for good.
    expect(screen.queryByText("No products found for “zzzzq”.")).not.toBeInTheDocument();
  });

  it("the no-results copy rides the reference's centered py-8 style (S80-2)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => ({ results: [] }) }) as unknown as Response),
    );
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "zzzzq" } });

    const copy = await waitFor(() => {
      const el = screen.getByText('No products found for "zzzzq"');
      expect(el).toBeInTheDocument();
      return el;
    });
    // The reference's class: text-sm text-muted-foreground py-8 text-center.
    expect(copy.className).toContain("py-8");
    expect(copy.className).toContain("text-center");
    expect(copy.className).toContain("text-sm");
    expect(copy.className).toContain("text-muted-foreground");
    // The old left-aligned pt-4 rhythm is retired.
    expect(copy.className).not.toContain("pt-4");
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

describe("SearchOverlay — the S79 fresh-sheet, focus & serif-price cycle", () => {
  it("the price rides the display serif (the reference's Cormorant font-heading, 14px/300)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });
    await waitFor(() => {
      expect(screen.getByText("$288.00")).toBeInTheDocument();
    });
    // S79-1 (D-1, measured live on both viewports): the reference renders
    // the row price in the display serif — computed "Cormorant Garamond",
    // serif 14px/300, right-aligned (its class carries font-heading
    // font-light). The clone kept the size/weight but rode the body font.
    // S82-1: the TEXT is the reference's $ template format ("$288.00").
    const price = screen.getByText("$288.00");
    expect(price.className).toContain("font-display");
    expect(price.className).toContain("font-light");
  });

  it("closing resets the sheet — the reference's fresh reopen (D-2)", async () => {
    stubSearch();
    const { rerender } = renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Pure Satin Silk Pillowcase/ })).toBeInTheDocument();
    });

    // Close (the sheet renders null but the component stays mounted — the
    // store-chrome harness never unmounts it), then reopen.
    rerender(<SearchOverlay open={false} onClose={() => {}} />);
    rerender(<SearchOverlay open onClose={() => {}} />);

    // S79-2 (D-2, measured live): the reference RESETS on close/reopen —
    // query "" and zero rows after reopening. The clone used to persist the
    // previous query + results (the never-unmounted component never reset).
    const freshInput = screen.getByRole("searchbox", { name: "Search products" });
    expect(freshInput).toHaveValue("");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/No products found/)).not.toBeInTheDocument();
  });

  it("focus returns to the opener on close (the drawer's modal contract, S79-3)", () => {
    stubSearch();
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            open-search
          </button>
          <SearchOverlay open={open} onClose={() => setOpen(false)} />
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "open-search" });
    opener.focus();
    expect(document.activeElement).toBe(opener);

    fireEvent.click(opener);
    const input = screen.getByRole("searchbox", { name: "Search products" });
    expect(document.activeElement).toBe(input);

    // Escape closes → focus lands back on the opener (previously it dropped
    // to <body>: the focused input unmounts with the sheet).
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("search-overlay")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener);
  });

  it("Tab wraps inside the overlay at the last control (the drawer's wrap contract, S79-4)", async () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });
    const lastLink = await waitFor(() => {
      const link = screen.getAllByRole("link").at(-1);
      expect(link).toBeInTheDocument();
      return link as HTMLElement;
    });
    lastLink.focus();
    expect(document.activeElement).toBe(lastLink);

    // jsdom performs no native Tab focus moves — only the handler's explicit
    // wrap is observable. Tab from the LAST result link must land on the
    // FIRST focusable (the input).
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(input);
  });

  it("the close button carries the drawer's focus-visible ring (S79-4)", () => {
    stubSearch();
    renderOverlay();
    const close = screen.getByRole("button", { name: "Close search" });
    expect(close.className).toContain("focus-visible:ring-2");
    expect(close.className).toContain("focus-visible:ring-ring");
  });

  it("the input keeps a visible focus treatment (no naked outline suppression, S79-4)", () => {
    stubSearch();
    renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    // focus:outline-none without a replacement indicator is a WCAG 2.4.7
    // hole on a primary surface — the input must pair the suppression with
    // a visible ring.
    if (input.className.includes("focus:outline-none")) {
      expect(input.className).toMatch(/focus-visible:ring|focus:ring/);
    }
  });
});

describe("SearchOverlay — the S80 empty-state hint & centered no-results cycle", () => {
  it("an empty query renders the reference's 'Start typing' hint (D-80-1)", () => {
    stubSearch();
    renderOverlay();
    // S80-1 (D-80-1, measured live on the reference at query ""): the
    // reference renders `Start typing to search our collection` — class
    // `text-sm text-muted-foreground py-8 text-center` (14px centered,
    // 84px box) — the state a fresh open lands on. The clone rendered
    // nothing on empty.
    const hint = screen.getByText("Start typing to search our collection");
    expect(hint.className).toContain("py-8");
    expect(hint.className).toContain("text-center");
    expect(hint.className).toContain("text-sm");
    expect(hint.className).toContain("text-muted-foreground");
  });

  it("the hint is the empty query's ONLY state content — no rows, no no-results copy", () => {
    stubSearch();
    renderOverlay();
    expect(screen.getByText("Start typing to search our collection")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/No products found/)).not.toBeInTheDocument();
  });

  it("the hint disappears as soon as the query is non-empty (before results land)", () => {
    stubSearch();
    renderOverlay();
    expect(screen.getByText("Start typing to search our collection")).toBeInTheDocument();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "s" } });
    // Synchronous re-render: the hint is gated on the query, not on
    // results — the reference swaps it for the rows/no-results copy the
    // moment typing starts.
    expect(screen.queryByText("Start typing to search our collection")).not.toBeInTheDocument();
  });

  it("the fresh-sheet reopen lands back on the hint (S79-2 × S80-1)", async () => {
    stubSearch();
    const { rerender } = renderOverlay();
    const input = screen.getByRole("searchbox", { name: "Search products" });
    fireEvent.change(input, { target: { value: "silk" } });
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Pure Satin Silk Pillowcase/ })).toBeInTheDocument();
    });

    // Close → reopen: the reference's reset (query "") now lands on the
    // reference's empty-state hint, exactly like the live sheet.
    rerender(<SearchOverlay open={false} onClose={() => {}} />);
    rerender(<SearchOverlay open onClose={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Search products" })).toHaveValue("");
    expect(screen.getByText("Start typing to search our collection")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
