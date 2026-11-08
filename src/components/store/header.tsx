"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { MAX_CART_QUANTITY } from "@/lib/cart-quantity";
import { formatMoney } from "@/lib/money";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { useStore } from "./store-provider";

// The reference's nav map (verified live): four uppercase micro-labels.
// S73-4: the LIVE reference renders NO active-link treatment (measured
// 2026-11-08: every nav link is plain foreground, no aria-current, on every
// route) — so the clone renders none either. This also removes the old
// `window.location.search` read during render, which was hydration-unsafe
// (server/client first-paint mismatch on /shop?category=… landings).
const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=beauty-tools", label: "Beauty Tools" },
  { href: "/shop?category=brush-combs", label: "Brush & Combs" },
  { href: "/about", label: "About" },
];

type SearchResult = { id: string; name: string; image: string; price: number; category: string };

/**
 * Header — the reference anatomy: [nav links | centered logo | icon cluster]
 * in a fixed bar that is 64px on mobile and 80px on desktop (S75-2, D-1
 * measured live: the reference's header inner is `h-16 lg:h-20`). Over the
 * home hero the bar is TRANSPARENT with white text (verified live); on
 * every other route it is solid ivory with a hairline bottom border and
 * dark text.
 */
export function Header({
  user,
  cartCount,
}: {
  user: { name: string; role: string } | null;
  cartCount: number;
}) {
  const { setMobileNavOpen, mobileNavOpen, cartDrawerOpen, setCartDrawerOpen, setMobileNavSearch } = useStore();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Over-hero styling applies on the home route only (the hero image sits
  // directly under the fixed bar there). S75-2: this stays true while the
  // mobile panel is OPEN too — the reference's bar keeps its transparent
  // white-on-hero treatment with the ivory panel riding below it inside
  // the same fixed header (the run-72 solid-bar workaround retired when
  // the panel moved into the header element).
  const overHero = pathname === "/";

  return (
    <>
      <div
        className={cn(
          "container-page grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 lg:h-20 lg:grid-cols-[1fr_auto_1fr]",
          overHero ? "text-white" : "text-foreground",
        )}
      >
        {/* Left: hamburger (mobile) / nav links (desktop) */}
        <div className="flex items-center justify-start gap-3">
          <button
            type="button"
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60 lg:hidden",
            )}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
            // S75-14 (N-2): the push-down panel is a non-modal disclosure —
            // `menu` is the accurate haspopup value (the panel carries no
            // dialog role and does not trap focus).
            aria-haspopup="menu"
            data-testid="mobile-menu-button"
            onClick={() => {
              setMobileNavSearch(false);
              setMobileNavOpen(!mobileNavOpen);
            }}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "eyebrow-label transition-colors",
                  overHero ? "hover:text-white/70" : "hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: logo */}
        <div className="flex justify-center">
          <Logo className={overHero ? "text-white" : undefined} />
        </div>

        {/* Right: icon cluster */}
        <div className="flex items-center justify-end gap-0.5">
          <button
            type="button"
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60",
            )}
            aria-label="Search products"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? `Account: ${user.name}` : "Account"}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60",
            )}
          >
            <User className="h-5 w-5" />
          </Link>
          <button
            type="button"
            aria-label={cartCount > 0 ? `Cart with ${cartCount} items` : "Cart with 0 items"}
            aria-haspopup="dialog"
            aria-expanded={cartDrawerOpen}
            onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-60",
            )}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span
                className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                data-testid="cart-count"
              >
                {cartCount > MAX_CART_QUANTITY ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <DesktopSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/**
 * DesktopSearchOverlay — the reference's full-width search sheet: a hairline
 * input row + live results, sliding under the fixed header. Escape closes;
 * navigating a result closes (the overlay unmounts on route change).
 */
function DesktopSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  // Debounced typeahead against /api/search (the same endpoint the mobile
  // panel uses); <2 chars renders nothing (the endpoint's own floor, checked
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
    // S75-2 (D-1): tracks the responsive header bar (64px mobile / 80px
    // desktop) so the sheet always slides directly under it.
    <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-background shadow-sm lg:top-20" data-testid="search-overlay">
      <div className="container-page py-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {results.length > 0 && (
          <ul className="grid gap-2 pt-4 sm:grid-cols-2">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/product/${r.id}`}
                  onClick={onClose}
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
          <p className="pt-4 text-sm text-muted-foreground">No products match “{query.trim()}”.</p>
        )}
      </div>
    </div>
  );
}
