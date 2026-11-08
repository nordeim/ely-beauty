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
  const pathname = usePathname();

  // Route change closes the overlay (the reference's overlay dismisses on
  // navigation). No local resets here — the content component is keyed by
  // route and re-mounts fresh.
  React.useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Debounced typeahead against /api/search (the S77-4 fields: name,
  // shortDescription, tags AND the long description — the reference's
  // coverage); <2 chars renders nothing (the endpoint's own floor, checked
  // inside the timer so the effect never calls setState synchronously).
  React.useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      const term = query.trim();
      if (term.length < 2) {
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
    <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xs" data-testid="search-overlay">
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
            className="flex-1 bg-transparent font-display text-lg leading-[1.1] lg:text-2xl text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground transition-opacity hover:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {results.length > 0 && (
          <ul className="flex flex-col gap-1">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/product/${r.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 transition-colors hover:bg-secondary"
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
                  <span className="text-sm font-light">{formatMoney(r.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {query.trim().length >= 2 && results.length === 0 && (
          <p className="pt-4 text-sm text-muted-foreground">No products match “{query.trim()}”.</p>
        )}
      </div>
    </div>
  );
}
