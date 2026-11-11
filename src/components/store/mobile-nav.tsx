"use client";

/**
 * MobileNav — the reference's push-down panel below the fixed header: an
 * ivory panel with a SEARCH row (icon + label) and the four uppercase nav
 * links — and NOTHING else (S74-2: the reference's panel ends at About; the
 * Sign In/Wishlist/Admin rows were scaffold heritage and are gone — the
 * wishlist entry lives in the footer's SUPPORT column, account on the
 * header icon).
 *
 * S77-2: the SEARCH row opens the shared FULL-SCREEN search overlay (the
 * reference's single search surface — measured live: both the header icon
 * and the panel's SEARCH row open `fixed inset-0 z-[70]
 * bg-background/95 backdrop-blur-xs`). The old in-panel content swap is
 * retired; S110-4 (re-measured live at run 110, matched methodology on
 * both sites): the reference's panel CLOSES at overlay-open time — it does
 * not stay mounted underneath (the stale S77-2 claim, corrected). The
 * SEARCH row's handler closes the panel and opens the overlay in one batch.
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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "./store-provider";

// S81-3 (measured live): the panel's category links open the reference's
// TEMPLATE filters (skincare / body_care) — same mapping as the desktop nav.
const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=skincare", label: "Beauty Tools" },
  { href: "/shop?category=body_care", label: "Brush & Combs" },
  { href: "/about", label: "About" },
];

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen, setSearchOverlayOpen } = useStore();
  const pathname = usePathname();

  // Close on route change (links navigate) — matches reference behavior.
  React.useEffect(() => {
    setMobileNavOpen(false);
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
        <nav aria-label="Mobile" className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              // S110-4 (measured live on the reference at run 110): the
              // panel closes AT overlay-open time — the reference's header
              // box collapses to the 64px bar while the overlay is up, and
              // the panel stays closed after the overlay exits. Both state
              // sets batch into one render (the panel unmounts as the
              // overlay mounts — no display-utility toggle involved).
              setMobileNavOpen(false);
              setSearchOverlayOpen(true);
            }}
            className="flex items-center gap-3 text-sm uppercase tracking-[0.1em] text-foreground transition-colors hover:text-primary"
          >
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
          {NAV_LINKS.map((link) => (
            <MobileNavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>
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
