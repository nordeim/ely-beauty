"use client";

/**
 * MobileNav — the reference's push-down panel below the fixed header: an
 * ivory panel with a SEARCH row (icon + label) that swaps the panel content
 * for a search input + live results, then the four uppercase nav links —
 * and NOTHING else (S74-2: the reference's panel ends at About; the
 * Sign In/Wishlist/Admin rows were scaffold heritage and are gone — the
 * wishlist entry lives in the footer's SUPPORT column, account on the
 * header icon).
 *
 * Tailwind v4 trap-log note (the bug this file is structured around): v4
 * changed the generation order of display utilities, so JS-toggling the
 * `hidden` class alongside a sibling `flex`/`block` class on the SAME
 * element is unreliable (tailwindlabs/tailwindcss#15884, #18653 — and
 * preflight now also gives `[hidden]` `!important`). This component never
 * toggles display utilities: the panel is conditionally MOUNTED via React
 * state (no `hidden` vs `flex` fight is possible) and animates with a
 * keyframe animation on mount. The desktop nav's `hidden lg:flex` is a
 * static responsive pair that never gets JS-toggled, so it is unaffected.
 *
 * The e2e regression guard is tests/e2e/mobile-navigation.spec.ts.
 */
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money";
import { useStore } from "./store-provider";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=beauty-tools", label: "Beauty Tools" },
  { href: "/shop?category=brush-combs", label: "Brush & Combs" },
  { href: "/about", label: "About" },
];

type SearchResult = { id: string; name: string; image: string; price: number; category: string };

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen, mobileNavSearch, setMobileNavSearch } = useStore();
  const pathname = usePathname();

  // Close on route change (links navigate) — matches reference behavior.
  React.useEffect(() => {
    setMobileNavOpen(false);
    setMobileNavSearch(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!mobileNavOpen) return null;

  return (
    <div
      className="animate-in slide-in-from-top-2 fade-in duration-200 border-b border-border bg-background lg:hidden"
      data-testid="mobile-menu"
    >
      {/* S75-2 (D-9): horizontal padding comes from container-page's px-6 —
          NO element-level px overrides (an element px-* loses to the later
          container-page utility in stylesheet order, the run-75 bug that
          rendered 16px instead of the reference's 24px). */}
      <div className="container-page py-6">
        {mobileNavSearch ? (
          <PanelSearch onExit={() => setMobileNavSearch(false)} />
        ) : (
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setMobileNavSearch(true)}
              className="flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-foreground transition-colors hover:text-primary"
            >
              <Search className="h-4 w-4" aria-hidden />
              Search
            </button>
            {NAV_LINKS.map((link) => (
              <MobileNavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

function MobileNavLink({ href, label, className }: { href: string; label: string; className?: string }) {
  const pathname = usePathname();
  // S73-4 (reference parity + I-1): the LIVE reference renders NO active
  // treatment on the panel links (measured 2026-11-08 — every link
  // rgb(26,26,26), no aria-current). The clone keeps aria-current as the
  // INVISIBLE a11y superset, scoped to exact-path no-query links only —
  // the three /shop-derived links can never all claim "current" on /shop,
  // and the color stays uniform foreground (no text-primary highlight).
  const base = href.split("?")[0] ?? href;
  const isCurrent = !href.includes("?") && pathname === base;
  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "block text-sm uppercase tracking-[0.1em] text-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      {label}
    </Link>
  );
}

/**
 * PanelSearch — the in-panel search flow: input + Close search + live
 * results (the reference's exact interaction). Navigating a result closes
 * the panel via the route-change effect.
 */
function PanelSearch({ onExit }: { onExit: () => void }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced typeahead against /api/search — the same endpoint the desktop
  // overlay uses; <2 chars renders nothing (the endpoint's own floor, checked
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

  return (
    <div className="flex flex-col gap-4" data-testid="mobile-panel-search">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={onExit}
          aria-label="Close search"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
                className="flex items-center gap-4 p-2 transition-colors hover:bg-secondary"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-secondary">
                  <Image src={r.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.name}</span>
                  <span className="block text-xs text-muted-foreground">{r.category}</span>
                </span>
                <span className="text-sm font-semibold">{formatMoney(r.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No products match “{query.trim()}”.</p>
      )}
    </div>
  );
}
