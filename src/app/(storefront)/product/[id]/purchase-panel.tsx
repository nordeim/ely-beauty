"use client";

import * as React from "react";

import { AddToCartButton, AddToWishlistButton } from "@/components/store/add-to-cart-button";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { MAX_CART_QUANTITY } from "@/lib/cart-quantity";
import { composeVariantLabel } from "@/lib/variants";
import { cn } from "@/lib/utils";

export type PanelColorOption = { name: string; hex: string };

/**
 * PurchasePanel — client island owning the variant + quantity state of the
 * product detail page (the reference's COLOR:/SIZE: selectors, qty stepper,
 * ADD TO CART and BUY IT NOW). The wishlist heart rides along as the
 * superset affordance (the reference's card carries no heart).
 */
export function PurchasePanel({
  productId,
  stock,
  colors = [],
  sizes = [],
  initialInWishlist = false,
  productName,
}: {
  productId: string;
  stock: number;
  colors?: PanelColorOption[];
  sizes?: string[];
  initialInWishlist?: boolean;
  productName?: string;
}) {
  const [quantity, setQuantity] = React.useState(1);
  // The reference's default selection: the FIRST color / FIRST size.
  const [selectedColor, setSelectedColor] = React.useState(colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = React.useState(sizes[0] ?? "");
  const outOfStock = stock <= 0;
  const max = Math.max(1, Math.min(stock, MAX_CART_QUANTITY));
  // S73-7: compose BOTH dimensions onto the line identity ("Pink / 0.5mm")
  // — the old `selectedColor || selectedSize` silently dropped the size on
  // products that carry both (the reference records both; verified live).
  const variant = composeVariantLabel(selectedColor, selectedSize);

  if (outOfStock) {
    return (
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span
          className="inline-flex h-12 items-center border border-input bg-secondary px-8 text-sm font-medium uppercase tracking-[0.08em] text-muted-foreground"
          aria-disabled="true"
        >
          Out of Stock
        </span>
        <p className="text-sm text-muted-foreground">Check back soon — this item is currently unavailable.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6" data-testid="purchase-panel">
      {colors.length > 0 && (
        <div>
          <p className="eyebrow-label text-muted-foreground" aria-live="polite">
            Color: {selectedColor}
          </p>
          <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label="Choose color">
            {colors.map((c) => {
              const active = selectedColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  aria-pressed={active}
                  aria-label={`Color ${c.name}`}
                  title={c.name}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border border-input transition-all",
                    active ? "ring-1 ring-foreground ring-offset-2 ring-offset-background" : "hover:border-foreground",
                  )}
                >
                  <span className="h-7 w-7 rounded-full" style={{ backgroundColor: c.hex }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="eyebrow-label text-muted-foreground">Size{selectedSize ? `: ${selectedSize}` : ""}</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose size">
            {sizes.map((s) => {
              const active = selectedSize === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  aria-pressed={active}
                  className={cn(
                    "h-10 min-w-14 border border-input px-4 text-sm transition-colors",
                    active
                      ? "border-foreground bg-foreground text-white"
                      : "text-foreground hover:border-foreground",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* S74-5 (P-4, measured): the reference's purchase column is STACKED —
          the qty stepper, then full-width ADD TO CART as an OUTLINED button
          (transparent bg, 1px foreground border), then full-width BUY IT NOW
          as the SOLID foreground button, then the wishlist heart; radius 2px. */}
      <div className="flex flex-col items-start gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} max={max} />
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          variant={variant}
          size="lg"
          className="h-12 w-full rounded-[2px] border border-foreground bg-transparent text-sm font-medium uppercase tracking-[0.1em] text-foreground shadow-none hover:bg-transparent hover:opacity-70"
        >
          ADD TO CART
        </AddToCartButton>
        <AddToCartButton
          productId={productId}
          quantity={quantity}
          variant={variant}
          size="lg"
          buyNow
          className="h-12 w-full rounded-[2px] bg-foreground text-sm font-medium uppercase tracking-[0.1em] text-background shadow-none hover:bg-foreground/90"
        >
          BUY IT NOW
        </AddToCartButton>
        <AddToWishlistButton
          productId={productId}
          productName={productName}
          initialInWishlist={initialInWishlist}
          className="h-12 w-12 rounded-full border border-input bg-transparent shadow-none backdrop-blur-none hover:shadow-none"
        />
      </div>
    </div>
  );
}
