import Image from "next/image";
import Link from "next/link";

import { discountPercent, formatMoney } from "@/lib/money";
import type { ProductCardData } from "@/lib/products";

/**
 * ProductCard — the ElyBeauty reference anatomy: a borderless editorial
 * card (no border, no radius, no shadow) — portrait media with stacked
 * BESTSELLER / SALE rect badges, color swatch dots, sans product name,
 * one-line muted description, price + struck compare-at. The whole card
 * is the detail link (the reference has no per-card add-to-cart; the
 * wishlist heart lives on the detail page — superset surface).
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const discount = discountPercent(product.price, product.compareAtPrice);
  const onSale = discount !== null;
  // Session-47 S47-3 (WCAG 2.5.3 Label in Name): the media link's accessible
  // name must CONTAIN its visible text — the stacked "SALE" / badge pills.
  const visibleBadges = [product.badge, onSale ? "Sale" : null]
    .filter((part): part is string => part !== null)
    .join(", ");
  const mediaLabel = visibleBadges ? `${product.name}, ${visibleBadges}` : product.name;
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden bg-secondary"
        aria-label={mediaLabel}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-0 top-4 flex flex-col items-start gap-1.5">
          {product.badge && (
            <span className="bg-badge-featured px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              {product.badge}
            </span>
          )}
          {onSale && (
            <span className="bg-badge-sale px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              Sale
            </span>
          )}
        </div>
        {product.colors.length > 0 && (
          <span className="absolute bottom-3 left-4 flex items-center gap-1.5" aria-hidden>
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                className="h-3 w-3 rounded-full border border-white/70 shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 pt-3">
        <h3 className="text-sm font-medium leading-snug text-foreground">
          <Link href={`/product/${product.id}`} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.shortDescription}</p>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-sm font-medium text-foreground">{formatMoney(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
