"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { MAX_CART_QUANTITY } from "@/lib/cart-quantity";
import { Logo } from "./logo";
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
  // S77-2: the search-open state lives in the store — the header icon and
  // the mobile panel's SEARCH row toggle the SAME full-screen overlay (the
  // reference's single search surface; the overlay itself renders from
  // StoreChrome so it sits above every chrome layer at z-[70]).
  const { setMobileNavOpen, mobileNavOpen, cartDrawerOpen, setCartDrawerOpen, setSearchOverlayOpen, searchOverlayOpen } = useStore();
  const pathname = usePathname();

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
            aria-haspopup="dialog"
            aria-expanded={searchOverlayOpen}
            onClick={() => setSearchOverlayOpen(true)}
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
    </>
  );
}
