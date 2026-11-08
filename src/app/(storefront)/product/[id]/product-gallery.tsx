"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const FALLBACK_IMAGE = "/images/placeholder.svg";

/**
 * ProductGallery — the reference's gallery (S74-4, measured 2026-11-08):
 * a 3:4 portrait main frame on the muted background (sharp corners, NO
 * border, NO rounding) plus a thumbnail row of 3:4 frames where the active
 * one carries a 2px border. Falls back to the neutral placeholder when a
 * product has no images.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [active, setActive] = React.useState(0);
  const index = Math.min(Math.max(active, 0), gallery.length - 1);
  const mainSrc = gallery[index] ?? FALLBACK_IMAGE;

  return (
    <div>
      {/* S74-4: aspect-[3/4] bg-muted, sharp (the reference measured 544×725
          natural-portrait, radius 0, no border). */}
      <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={mainSrc}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="flex flex-wrap gap-3" role="group" aria-label={`${name} images`}>
          {gallery.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${gallery.length}`}
              aria-pressed={i === index}
              className={cn(
                "relative aspect-[3/4] w-[60px] overflow-hidden border-2 bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === index ? "border-foreground" : "border-transparent hover:border-border",
              )}
            >
              <Image src={src} alt="" fill sizes="60px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
