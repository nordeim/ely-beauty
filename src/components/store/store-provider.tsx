"use client";

// Global client store — the small shared UI state (mobile nav, search panel,
// cart drawer, toast handoff) that lives across the storefront chrome.

import * as React from "react";

type StoreState = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  /** The shared full-screen search overlay (S77-2): the header's search
   *  icon AND the mobile panel's SEARCH row toggle the SAME overlay — the
   *  reference's single search surface (measured live: `fixed inset-0
   *  z-[70] bg-background/95 backdrop-blur-sm` from both entry points). */
  searchOverlayOpen: boolean;
  setSearchOverlayOpen: (open: boolean) => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  /**
   * `null` means "no client-side truth yet" — the header badge falls back to
   * the server-computed count until the first in-page mutation sets a value
   * (session-9 S9-1). Initializing at 0 made the fallback dead code and every
   * fresh page load rendered a badge-less cart.
   */
  cartCount: number | null;
  setCartCount: (count: number) => void;
};

const StoreContext = React.createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = React.useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState<number | null>(null);

  // Lock body scroll while any overlay is open.
  React.useEffect(() => {
    const locked = mobileNavOpen || cartDrawerOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen, cartDrawerOpen]);

  // Hydration sentinel — the E2E suite waits for this attribute before
  // interacting, so clicks never race the React event wiring.
  React.useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  const value = React.useMemo<StoreState>(
    () => ({
      mobileNavOpen,
      setMobileNavOpen,
      searchOverlayOpen,
      setSearchOverlayOpen,
      cartDrawerOpen,
      setCartDrawerOpen,
      cartCount,
      setCartCount,
    }),
    [mobileNavOpen, searchOverlayOpen, cartDrawerOpen, cartCount],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
