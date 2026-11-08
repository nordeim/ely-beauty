import Image from "next/image";
import Link from "next/link";

// Lucide icon shim for the admin category grid (the storefront tile is
// image-based; the admin table keeps its icon column).
import { Package, type LucideIcon } from "lucide-react";

/** Admin-surface category icon (name → lucide component, image tiles carry
 *  the storefront). Unknown names fall back to the package glyph. */
export function CategoryIcon({ icon, className }: { icon: string; className?: string; gradient?: string }) {
  const map: Record<string, LucideIcon> = { package: Package };
  const Glyph = map[icon] ?? Package;
  return <Glyph className={className} aria-hidden />;
}

/**
 * CategoryCard — the ElyBeauty "Shop by Ritual" tile: a portrait image
 * card with a soft gradient scrim, the category name in Cormorant, and
 * the caption in muted body type (the reference's tiles).
 */
export function CategoryCard({
  slug,
  name,
  description,
  imageUrl,
}: {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
}) {
  return (
    <Link
      href={`/shop?category=${slug}`}
      className="group relative block aspect-[4/3] overflow-hidden bg-secondary"
      aria-label={`${name}${description ? ` — ${description}` : ""}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-left">
        <span className="font-display text-2xl font-medium text-white">{name}</span>
        {description ? (
          <span className="text-xs text-white/80">{description}</span>
        ) : null}
      </span>
    </Link>
  );
}
