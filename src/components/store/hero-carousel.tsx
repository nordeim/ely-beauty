"use client";

/**
 * HeroCarousel — the ElyBeauty hero: a full-bleed editorial image with
 * CENTERED white Cormorant headline, subtitle, and an underlined uppercase
 * text CTA (the reference's treatment). The carousel ENGINE is retained as
 * the superset: with 2+ slides the dot indicators + prev/next arrows +
 * auto-rotation activate; the seeded single slide renders as a static hero
 * (exactly the reference's single-image look).
 *
 * v4 trap-log: the slide transition animates opacity only (compositor-safe);
 * slides are absolutely stacked so height is driven by the media box —
 * no `hidden` toggling anywhere.
 */
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type Slide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
};

// S15-5: lazily-created, module-level MediaQueryList cache. Only ever called
// on the client (subscribe + getSnapshot); the module never touches
// `window.matchMedia` during SSR.
let cachedReducedMotionQuery: MediaQueryList | null = null;
function reducedMotionQuery(): MediaQueryList {
  cachedReducedMotionQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return cachedReducedMotionQuery;
}

export function HeroCarousel({ slides, autoRotateMs = 6000 }: { slides: Slide[]; autoRotateMs?: number }) {
  const [active, setActive] = React.useState(0);
  const count = slides.length;
  const isSingle = count === 1;
  // WCAG 2.2.2: auto-motion pauses on hover/focus and for users who ask the
  // OS for reduced motion. Purely behavioral — no visual change in captures.
  // `useSyncExternalStore` subscribes to the media query the React-idiomatic
  // way (no set-state-in-effect; SSR snapshot is `false`).
  // S15-5: the MediaQueryList is cached at module level — getSnapshot runs on
  // every render, and `window.matchMedia(...)` constructs a fresh MQL per
  // call. The cache is lazy (client-only; the SSR snapshot below never
  // touches it) and the MQL is live, so `.matches` always reflects the OS
  // setting at read time.
  const [paused, setPaused] = React.useState(false);
  const reducedMotion = React.useSyncExternalStore(
    React.useCallback((onStoreChange: () => void) => {
      const query = reducedMotionQuery();
      query.addEventListener("change", onStoreChange);
      return () => query.removeEventListener("change", onStoreChange);
    }, []),
    () => reducedMotionQuery().matches,
    () => false,
  );

  const next = React.useCallback(() => setActive((i) => (i + 1) % count), [count]);
  const prev = React.useCallback(() => setActive((i) => (i - 1 + count) % count), [count]);

  React.useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const timer = window.setInterval(next, autoRotateMs);
    return () => window.clearInterval(timer);
  }, [next, autoRotateMs, count, paused, reducedMotion]);

  if (count === 0) return null;
  // Session-8 S8-5: `active` is state and can exceed the array bounds when
  // the slides prop SHRINKS under a live client (admin deletes the last
  // slide while the home page is open → router.refresh delivers a smaller
  // array). Storing the index unclamped used to blank the whole hero (the
  // `!activeSlide` guard returned null and nothing recovered it). Derive the
  // rendered index instead — the same pattern ProductGallery uses — so the
  // carousel always lands on a valid slide and the next wrap corrects state.
  const activeIndex = Math.min(active, count - 1);
  const activeSlide = slides[activeIndex];
  if (!activeSlide) return null;

  return (
    <section
      aria-roledescription={isSingle ? undefined : "carousel"}
      aria-label="Featured collections"
      className="relative w-full overflow-hidden bg-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* S74-1 (P-3): the reference hero is full-viewport (h-screen
          min-h-[600px], measured live 2026-11-08) — not 78svh. */}
      <div className="relative h-screen min-h-[600px] w-full">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== activeIndex}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              i === activeIndex ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* sRGB-interpolated scrim (arbitrary gradient form — the v4
                oklab interpolation trap produces a different ramp). */}
            <div className="absolute inset-0 [background-image:linear-gradient(to_top,rgb(0_0_0/0.45),rgb(0_0_0/0.12)_45%,rgb(0_0_0/0.25))]" />
          </div>
        ))}

        {/* Centered slide text (the reference's editorial treatment). S74-1:
            the content column is max-w-3xl (768px) — narrow enough that the
            96px display title wraps to two lines exactly like the reference
            (measured: ref h1 720×192 two-line, lh 1.0). */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {/* The reference combines max-w-3xl WITH px-6 on one element —
              720px of content width, which is what wraps the 96px title
              to two lines (measured: their h1 is 720×192). */}
          <div className="w-full max-w-3xl px-6">
            {/* S75-7 (D-7, measured): the reference's responsive title —
                lh 1.1 at mobile (52.8px @ 48px font) and lh 1.0 at desktop
                (96px @ 96px font), breaking to text-7xl at md like the
                reference's own `heading-editorial text-5xl md:text-7xl
                lg:text-8xl` (was leading-none everywhere + the sm step). */}
            <h1 className="font-display text-5xl font-light leading-[1.1] tracking-tight text-white drop-shadow-md md:text-7xl lg:text-8xl lg:leading-none">
              {activeSlide.title}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-sm text-white/85 drop-shadow sm:text-base">{activeSlide.subtitle}</p>
            <div className="mt-10">
              <Link href={activeSlide.ctaLink} className="link-cta border-white/60 text-white hover:border-white">
                {activeSlide.ctaText}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        {/* Dots — plain buttons with aria-current (session-6 S6-13): the
            tab/tablist roles implied tabpanels that don't exist here.
            Hidden for the seeded single slide (reference parity). */}
        {!isSingle && (
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-current={i === activeIndex}
                aria-label={`Slide ${i + 1}: ${slide.title}`}
                onClick={() => setActive(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === activeIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        )}

        {/* Arrows (multi-slide superset only). */}
        {!isSingle && (
          <div className="absolute bottom-5 right-5 flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/35"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/35"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
