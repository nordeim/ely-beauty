"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

import { formatMoney } from "@/lib/money";

// Session 77 S77-2 (D-1, measured live on both sites): the reference's
// search — from BOTH the header icon AND the mobile panel's SEARCH row —
// opens a FULL-SCREEN overlay: `fixed inset-0 z-[70] bg-background/95
// backdrop-blur-xs` (v4's xs = the reference's measured blur(4px) — v4's
// `sm` is 8px, the v3-rename trap), the content column `max-w-2xl mx-auto
// px-6 pt-24 lg:pt-32`, the input in the display serif at `text-lg
// lg:text-2xl` with the reference's tight 1.1 leading (the reference's
// heading-editorial 18px/20px + 24px/26px boxes), flanked by 20px search
// + close icons over a hairline border-b row. The run-72..76 clone shipped
// a header-anchored dropdown sheet from the header icon and an in-panel
// swap from the panel row; this component replaces both with the one
// shared full-screen sheet.
export type SearchResult = {
  id: string;
  name: string;
  image: string;
  price: number;
  /** The row's visible copy — the product's shortDescription ("" renders no
   * line, exactly like the reference's no-copy products). */
  description: string;
};

/**
 * SearchOverlay — the reference's full-screen search sheet. Props-driven so
 * the component test renders it standalone; StoreChrome wires the shared
 * open state (the header icon and the mobile panel's SEARCH row both toggle
 * it through the store). Escape closes; navigating a result closes (the
 * route-change effect).
 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const openerRef = React.useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  // Route change closes the overlay (the reference's overlay dismisses on
  // navigation). No local resets here — the render-time adjustment below
  // owns the fresh-sheet reset (S79-2).
  React.useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // S79-2 (D-2, measured live): the reference RESETS on close/reopen —
  // query "" and zero rows after reopening. The reset rides the canonical
  // "storing information from previous renders" adjustment (setState during
  // render — the react-hooks/set-state-in-effect-clean form the repo's lint
  // enforces; the carousel's matchMedia listener is the cautionary twin).
  // The adjustment runs while the sheet is already hidden (open→false), so
  // no reset is ever visible mid-render. Clearing `query` also drops any
  // in-flight typeahead response: the debounce effect's cleanup flips its
  // `cancelled` flag, so a late response can never repopulate results.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }

  // S79-3: focus returns to the opener on close — the drawer's modal
  // contract (the focused input otherwise unmounts with the sheet and
  // focus drops to <body>).
  React.useEffect(() => {
    if (!open) {
      openerRef.current?.focus();
      openerRef.current = null;
      return;
    }
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();
  }, [open]);

  // S79-4: Escape closes; Tab wraps INSIDE the overlay (the drawer's
  // S8-7 wrap handler — the shell's `inert` keeps background content out
  // of the tab order, but Chromium drops focus to browser chrome at the
  // last control instead of wrapping).
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const scope = overlayRef.current;
      if (!scope) return;
      const focusables = scope.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const current = document.activeElement;
      const inside = current instanceof HTMLElement && scope.contains(current);
      if (e.shiftKey) {
        if (!inside || current === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Debounced typeahead against /api/search (the S77-4 fields: name,
  // shortDescription, tags AND the long description — the reference's
  // coverage). S78-2 (D-2, measured live): the floor is ONE character —
  // the reference returns its capped 8-row set for a 1-char query ("e");
  // empty still renders nothing (the endpoint's own `!q` gate mirrors
  // this, checked inside the timer so the effect never calls setState
  // synchronously).
  React.useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      const term = query.trim();
      if (term.length < 1) {
        setResults([]);
        return;
      }
      fetch(`/api/search?q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((data: { results?: SearchResult[] }) => !cancelled && setResults(data.results ?? []))
        .catch(() => !cancelled && setResults([]));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xs"
      data-testid="search-overlay"
    >
      <div className="max-w-2xl mx-auto px-6 pt-24 lg:pt-32">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="flex-1 bg-transparent font-display text-lg leading-[1.1] lg:text-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {results.length > 0 && (
          <ul className="mt-6 flex flex-col gap-1 overflow-y-auto max-h-[60vh]">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/product/${r.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 transition-colors hover:bg-secondary rounded-[2px]"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-secondary">
                    <Image src={r.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.name}</span>
                    {r.description ? (
                      <span className="block truncate text-xs text-muted-foreground">{r.description}</span>
                    ) : null}
                  </span>
                  <span className="text-sm font-light font-display">{formatMoney(r.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {query.trim().length >= 1 && results.length === 0 && (
          <p className="pt-4 text-sm text-muted-foreground">No products found for “{query.trim()}”.</p>
        )}
      </div>
    </div>
  );
}
