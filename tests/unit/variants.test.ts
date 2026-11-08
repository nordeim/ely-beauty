/**
 * S73-7 — the variant-label composition seam.
 *
 * The reference (verified live on the massager product, which carries BOTH a
 * COLOR row and a SIZE row) records BOTH selections on the cart line ("Pink"
 * + "Size: Black"). The clone's cart-line identity is a single variant
 * string, so the purchase panel composes the two dimensions through this
 * pure helper — keeping both on the line identity and the
 * `OrderItem.variantLabel` snapshot. Pure + node-env (no DOM needed).
 */
import { describe, expect, it } from "vitest";

import { composeVariantLabel } from "@/lib/variants";

describe("composeVariantLabel (S73-7)", () => {
  it("composes color / size when both dimensions are selected", () => {
    expect(composeVariantLabel("Pink", "0.5mm")).toBe("Pink / 0.5mm");
  });

  it("uses the color alone when the product has no sizes", () => {
    expect(composeVariantLabel("Navy Blue", "")).toBe("Navy Blue");
  });

  it("uses the size alone when the product has no colors", () => {
    expect(composeVariantLabel("", "Large")).toBe("Large");
  });

  it("returns the empty string when nothing is selected (variant-less line)", () => {
    expect(composeVariantLabel("", "")).toBe("");
  });

  it("trims stray whitespace from each dimension before joining", () => {
    expect(composeVariantLabel(" Pink ", " 1.0mm ")).toBe("Pink / 1.0mm");
  });
});
