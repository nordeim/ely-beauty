import { describe, expect, it } from "vitest";
import { z } from "zod";

import { integerSetting, numericSetting } from "@/lib/settings-schema";
import {
  addressSchema,
  categoryInputSchema,
  changePasswordSchema,
  clampSearchTerm,
  cartLinePatchSchema,
  cartMutateSchema,
  checkoutSchema,
  contactSchema,
  couponApplySchema,
  couponInputSchema,
  emailSchema,
  firstError,
  loginSchema,
  registerSchema,
  reviewSchema,
  trackOrderSchema,
  carouselSlideInputSchema,
  productInputSchema,
  wishlistToggleSchema,
  normalizeTemplateCategory,
} from "@/lib/validation";

describe("registerSchema", () => {
  it("accepts a valid registration and normalizes the email", () => {
    const parsed = registerSchema.parse({
      name: "  Jordan Rivera ",
      email: "  Jordan@Example.COM ",
      password: "Sup3rSecret!",
    });
    expect(parsed.name).toBe("Jordan Rivera");
    expect(parsed.email).toBe("jordan@example.com");
  });

  it("enforces the 8-character password floor", () => {
    const result = registerSchema.safeParse({ name: "Jo", email: "a@b.co", password: "short" });
    expect(result.success).toBe(false);
  });

  it("requires a plausible email", () => {
    const result = registerSchema.safeParse({ name: "Jo", email: "not-an-email", password: "longenough1" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires both fields", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
  });
});

// S92-2b: the account password-change boundary. The NEW password rides the
// register passwordSchema (8–128 chars) so the two surfaces can never drift;
// the CURRENT password only needs to be present (its correctness is verified
// by the action against the stored scrypt hash, not by shape).
describe("changePasswordSchema (S92-2b)", () => {
  it("accepts a valid pair", () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword: "Demo1234!",
      newPassword: "NewSecure123!",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires the current password to be present", () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: "", newPassword: "NewSecure123!" }).success,
    ).toBe(false);
  });

  it("enforces the register password rules on the new password", () => {
    expect(
      changePasswordSchema.safeParse({ currentPassword: "Demo1234!", newPassword: "short" }).success,
    ).toBe(false);
    const tooLong = "x".repeat(129);
    expect(
      changePasswordSchema.safeParse({ currentPassword: "Demo1234!", newPassword: tooLong }).success,
    ).toBe(false);
  });

  it("reports the same min-length copy as registration", () => {
    const result = changePasswordSchema.safeParse({ currentPassword: "ok", newPassword: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Password must be at least 8 characters");
    }
  });
});

describe("addressSchema", () => {
  const valid = {
    fullName: "Jordan Rivera",
    phone: "+1 512 555 0133",
    line1: "482 Maple Avenue",
    city: "Austin",
    state: "TX",
    postalCode: "73301",
  };

  it("applies defaults for optional fields", () => {
    const parsed = addressSchema.parse(valid);
    expect(parsed.label).toBe("Home");
    // S74-12 (F-2): the schema default matches the Bangladesh-only store
    // (the dialog and checkout client already hardcode "Bangladesh" — the
    // zod default was the last US-shaped residual).
    expect(parsed.country).toBe("Bangladesh");
    expect(parsed.line2).toBeUndefined();
  });

  it("rejects a too-short street", () => {
    expect(addressSchema.safeParse({ ...valid, line1: "12" }).success).toBe(false);
  });
});

describe("categoryInputSchema — the S73-10 neutral gradient is single-sourced", () => {
  it("defaults iconGradient to the stone pair (schema.prisma + the dialog agree)", () => {
    // S74-12 (F-3): the zod default was the last kitchenware-orange
    // residual — all three defaults must agree on the neutral pair.
    const parsed = categoryInputSchema.parse({ name: "Serums", slug: "serums" });
    expect(parsed.iconGradient).toBe("from-stone-400 to-stone-600");
  });
});

describe("cartMutateSchema", () => {
  it("bounds quantity to 1..99", () => {
    expect(cartMutateSchema.safeParse({ productId: "p1", quantity: 1 }).success).toBe(true);
    expect(cartMutateSchema.safeParse({ productId: "p1", quantity: 0 }).success).toBe(false);
    expect(cartMutateSchema.safeParse({ productId: "p1", quantity: 100 }).success).toBe(false);
    expect(cartMutateSchema.safeParse({ productId: "", quantity: 1 }).success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  const valid = {
    email: "demo@homenestkitchen.com",
    customerName: "Jordan Rivera",
    shippingMethod: "standard",
    paymentMethod: "card",
    address: {
      fullName: "Jordan Rivera",
      phone: "+1 512 555 0133",
      line1: "482 Maple Avenue",
      city: "Austin",
      state: "TX",
      postalCode: "73301",
    },
  };

  it("accepts the demo checkout payload", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("ignores a client-sent shippingMethod entirely (the server derives the tier — S73-1)", () => {
    // The field is no longer part of the schema: whatever the client sends
    // is STRIPPED by zod (unknown key), never trusted. A crafted
    // "drone"/"standard" value cannot influence the charged tier.
    const parsed = checkoutSchema.safeParse({ ...valid, shippingMethod: "drone" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("shippingMethod" in parsed.data).toBe(false);
    }
    const bare = checkoutSchema.safeParse(valid);
    expect(bare.success).toBe(true);
  });

  it("rejects unknown payment methods (paypal retired — S73-8)", () => {
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: "crypto" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: "paypal" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: "cod" }).success).toBe(true);
  });

  it("accepts an optional idempotency key (16..64 chars)", () => {
    const key = "3f2b8a64-1c5d-4e9a-9f0b-2d7c8e1a4b5c"; // uuid-shaped, 36 chars
    expect(checkoutSchema.safeParse(valid).success).toBe(true); // absent = fine
    expect(checkoutSchema.safeParse({ ...valid, idempotencyKey: key }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...valid, idempotencyKey: "short" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, idempotencyKey: "x".repeat(65) }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, idempotencyKey: "" }).success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("bounds the rating to 1..5", () => {
    const base = { productId: "p1", title: "Great", comment: "This is a great product for the kitchen." };
    expect(reviewSchema.safeParse({ ...base, rating: 0, author: "Jo" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, rating: 6, author: "Jo" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...base, rating: 5, author: "Jo" }).success).toBe(true);
  });

  it("requires a substantive comment", () => {
    expect(
      reviewSchema.safeParse({ productId: "p1", rating: 5, comment: "short", author: "Jo" }).success,
    ).toBe(false);
  });
});

describe("contactSchema", () => {
  it("requires a real message", () => {
    expect(
      contactSchema.safeParse({ name: "Jo", email: "a@b.co", message: "hi" }).success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ name: "Jo", email: "a@b.co", message: "Do you ship to Canada quickly?" }).success,
    ).toBe(true);
  });
});

describe("firstError", () => {
  it("returns the first issue message", () => {
    const result = registerSchema.safeParse({ name: "", email: "bad", password: "x" });
    if (result.success) throw new Error("expected failure");
    expect(typeof firstError(result.error)).toBe("string");
    expect(firstError(result.error).length).toBeGreaterThan(0);
  });
});

describe("trackOrderSchema", () => {
  it("accepts an order number plus the purchase email and normalizes it", () => {
    const parsed = trackOrderSchema.parse({ number: " ord-2026-001 ", email: " Buyer@Example.COM " });
    expect(parsed.number).toBe("ORD-2026-001");
    expect(parsed.email).toBe("buyer@example.com");
  });

  it("requires both fields", () => {
    expect(trackOrderSchema.safeParse({ number: "", email: "a@b.co" }).success).toBe(false);
    expect(trackOrderSchema.safeParse({ number: "ORD-2026-001", email: "" }).success).toBe(false);
    expect(trackOrderSchema.safeParse({ number: "ORD-2026-001", email: "not-an-email" }).success).toBe(false);
  });
});

describe("carouselSlideInputSchema.ctaLink", () => {
  it("accepts internal paths and absolute http(s) URLs", () => {
    const base = { title: "Summer Sale", image: "/images/hero-sale.png" };
    expect(carouselSlideInputSchema.safeParse({ ...base, ctaLink: "/products" }).success).toBe(true);
    expect(carouselSlideInputSchema.safeParse({ ...base, ctaLink: "https://example.com/promo" }).success).toBe(true);
  });

  it("rejects javascript: and other scheme-injected links", () => {
    const base = { title: "Summer Sale", image: "/images/hero-sale.png" };
    expect(carouselSlideInputSchema.safeParse({ ...base, ctaLink: "javascript:alert(1)" }).success).toBe(false);
    expect(carouselSlideInputSchema.safeParse({ ...base, ctaLink: "data:text/html,<script>" }).success).toBe(false);
    expect(carouselSlideInputSchema.safeParse({ ...base, ctaLink: "vbscript:x" }).success).toBe(false);
  });
});

describe("productInputSchema.images", () => {
  const base = {
    name: "Test Knife",
    slug: "test-knife",
    description: "A very good test knife for chopping test vegetables.",
    categoryId: "cat_kitchen-tools",
    price: 1999,
    sku: "KN-TEST-01",
    stock: 10,
  };

  it("accepts root-relative store paths only (session-7 S7-6: CSP img-src alignment)", () => {
    expect(productInputSchema.safeParse({ ...base, images: ["/images/knife-1.jpg"] }).success).toBe(true);
    expect(productInputSchema.safeParse({ ...base, images: ["/images/products/deep/nested/knife.webp"] }).success).toBe(true);
  });

  it("rejects absolute http(s) urls the production CSP would block (session-7 S7-6)", () => {
    expect(productInputSchema.safeParse({ ...base, images: ["https://cdn.example.com/k.jpg?w=200"] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, images: ["http://cdn.example.com/k.jpg"] }).success).toBe(false);
  });

  it("rejects protocol-relative, script and data urls", () => {
    expect(productInputSchema.safeParse({ ...base, images: ["//evil.example/x.png"] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, images: ["javascript:alert(1)"] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, images: ["data:text/html,<script>"] }).success).toBe(false);
  });

  it("still requires at least one image", () => {
    expect(productInputSchema.safeParse({ ...base, images: [] }).success).toBe(false);
  });
});

// --- session-6 S6-5: carousel slide images carry the same scheme gate -------
describe("carouselSlideInputSchema.image (session-6)", () => {
  const base = { title: "Summer Sale" };

  it("accepts root-relative store paths only (session-7 S7-6)", () => {
    expect(carouselSlideInputSchema.safeParse({ ...base, image: "/images/hero-sale.png" }).success).toBe(true);
    expect(carouselSlideInputSchema.safeParse({ ...base, image: "https://cdn.example.com/hero.jpg" }).success).toBe(false);
  });

  it("rejects data:, javascript: and protocol-relative URLs (CSP img-src 'self' alignment)", () => {
    expect(carouselSlideInputSchema.safeParse({ ...base, image: "data:image/png;base64,AAAA" }).success).toBe(false);
    expect(carouselSlideInputSchema.safeParse({ ...base, image: "javascript:alert(1)" }).success).toBe(false);
    expect(carouselSlideInputSchema.safeParse({ ...base, image: "//evil.example.com/x.png" }).success).toBe(false);
  });
});

// --- session-6 S6-14: bounded spec/tag inputs -------------------------------
function productBase(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    name: "Test Knife",
    slug: "test-knife",
    description: "A very good test knife for chopping test vegetables.",
    categoryId: "cat_kitchen-tools",
    price: 1999,
    sku: "KN-TEST-01",
    stock: 10,
    images: ["/images/knife-1.jpg"],
    ...overrides,
  };
}

describe("productInputSchema.price bounds (session-7 S7-7)", () => {
  it("rejects prices at or above the $1M ceiling (Int32-safe)", () => {
    expect(productInputSchema.safeParse(productBase({ price: 100_000_000 })).success).toBe(true);
    expect(productInputSchema.safeParse(productBase({ price: 100_000_001 })).success).toBe(false);
    expect(productInputSchema.safeParse(productBase({ price: 2_147_483_647 })).success).toBe(false);
  });

  it("bounds compareAtPrice identically", () => {
    expect(productInputSchema.safeParse(productBase({ compareAtPrice: 100_000_000 })).success).toBe(true);
    expect(productInputSchema.safeParse(productBase({ compareAtPrice: 100_000_001 })).success).toBe(false);
  });
});

describe("productInputSchema.specs/tags bounds (session-6)", () => {
  it("rejects spec labels/values above 80 characters", () => {
    const long = "x".repeat(81);
    expect(productInputSchema.safeParse(productBase({ specs: [{ label: "Material", value: "Steel" }] })).success).toBe(true);
    expect(productInputSchema.safeParse(productBase({ specs: [{ label: long, value: "Steel" }] })).success).toBe(false);
    expect(productInputSchema.safeParse(productBase({ specs: [{ label: "Material", value: long }] })).success).toBe(false);
  });

  it("rejects individual tags above 40 characters", () => {
    const long = "x".repeat(41);
    expect(productInputSchema.safeParse(productBase({ tags: ["knife", long] })).success).toBe(false);
    expect(productInputSchema.safeParse(productBase({ tags: ["knife"] })).success).toBe(true);
  });
});

describe("clampSearchTerm (S15-4)", () => {
  it("trims whitespace and caps the query at 100 characters", () => {
    expect(clampSearchTerm("  whisk  ")).toBe("whisk");
    expect(clampSearchTerm("x".repeat(250))).toBe("x".repeat(100));
    expect(clampSearchTerm("x".repeat(100))).toHaveLength(100);
  });

  it("returns an empty string for blank input and keeps non-ASCII intact", () => {
    expect(clampSearchTerm("   ")).toBe("");
    expect(clampSearchTerm("日本語の包丁")).toBe("日本語の包丁");
  });

  it("honors a custom cap", () => {
    expect(clampSearchTerm("abcdefghij", 4)).toBe("abcd");
  });
});

describe("wishlistToggleSchema (S16-2 hoist)", () => {
  it("requires a non-empty productId", () => {
    expect(wishlistToggleSchema.safeParse({ productId: "p1" }).success).toBe(true);
    expect(wishlistToggleSchema.safeParse({ productId: "" }).success).toBe(false);
    expect(wishlistToggleSchema.safeParse({}).success).toBe(false);
  });
});

describe("cartLinePatchSchema (S16-2 hoist)", () => {
  it("keeps the PATCH 0-deletes-line semantics the POST schema forbids", () => {
    expect(cartLinePatchSchema.safeParse({ lineId: "l1", quantity: 0 }).success).toBe(true);
    expect(cartMutateSchema.safeParse({ productId: "p1", quantity: 0 }).success).toBe(false);
  });

  it("bounds quantity to integer 0..99", () => {
    expect(cartLinePatchSchema.safeParse({ lineId: "l1", quantity: 99 }).success).toBe(true);
    expect(cartLinePatchSchema.safeParse({ lineId: "l1", quantity: 100 }).success).toBe(false);
    expect(cartLinePatchSchema.safeParse({ lineId: "l1", quantity: 1.5 }).success).toBe(false);
    expect(cartLinePatchSchema.safeParse({ lineId: "l1", quantity: -1 }).success).toBe(false);
    expect(cartLinePatchSchema.safeParse({ lineId: "", quantity: 1 }).success).toBe(false);
  });
});

describe("couponApplySchema (S16-2 hoist)", () => {
  it("trims and enforces the same 40-char cap as checkoutSchema.couponCode", () => {
    const parsed = couponApplySchema.safeParse({ code: "  WELCOME10  " });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.code).toBe("WELCOME10");

    const long = "x".repeat(41);
    const tooLong = couponApplySchema.safeParse({ code: long });
    expect(tooLong.success).toBe(false);
    if (!tooLong.success) expect(firstError(tooLong.error)).toBe("That code is too long");
    expect(couponApplySchema.safeParse({ code: "x".repeat(40) }).success).toBe(true);
  });

  it("gives the friendly empty-code message", () => {
    const empty = couponApplySchema.safeParse({ code: "   " });
    expect(empty.success).toBe(false);
    if (!empty.success) expect(firstError(empty.error)).toBe("Enter a coupon code");
  });
});

describe("MAX_CART_QUANTITY single-sourcing (S17-2)", () => {
  it("is 99 and is the ceiling the cart schemas and the clamp share", async () => {
    const { MAX_CART_QUANTITY } = await import("@/lib/cart-quantity");
    expect(MAX_CART_QUANTITY).toBe(99);
    // The schemas interpolate the shared constant, not a retyped literal.
    expect(
      cartMutateSchema.safeParse({ productId: "p1", quantity: MAX_CART_QUANTITY + 1 }).success,
    ).toBe(false);
    expect(
      cartLinePatchSchema.safeParse({ lineId: "l1", quantity: MAX_CART_QUANTITY + 1 }).success,
    ).toBe(false);
  });
});

describe("couponInputSchema free_shipping (session-20 S20-6)", () => {
  it("accepts a free_shipping coupon with value 0 and applies the defaults", () => {
    const parsed = couponInputSchema.safeParse({ code: "FREESHIP", type: "free_shipping", value: 0 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.minSubtotal).toBe(0);
      expect(parsed.data.isActive).toBe(true);
      expect(parsed.data.maxRedemptions).toBeNull();
    }
  });

  it("rejects a free_shipping coupon carrying a non-zero value", () => {
    // Positive values hit the free_shipping-specific refinement copy…
    for (const value of [1, 695]) {
      const parsed = couponInputSchema.safeParse({ code: "FREESHIP", type: "free_shipping", value });
      expect(parsed.success).toBe(false);
      if (!parsed.success) expect(parsed.error.issues[0]?.message).toMatch(/free shipping/i);
    }
    // …while a negative value is already caught by the base non-negative bound.
    expect(couponInputSchema.safeParse({ code: "FREESHIP", type: "free_shipping", value: -5 }).success).toBe(false);
  });

  it("keeps the percent and fixed positive bounds (regression guard)", () => {
    const zeroPercent = couponInputSchema.safeParse({ code: "SAVE0", type: "percent", value: 0 });
    expect(zeroPercent.success).toBe(false);
    if (!zeroPercent.success) expect(zeroPercent.error.issues[0]?.message).toMatch(/positive/i);
    const zeroFixed = couponInputSchema.safeParse({ code: "BIG0", type: "fixed", value: 0 });
    expect(zeroFixed.success).toBe(false);
    if (!zeroFixed.success) expect(zeroFixed.error.issues[0]?.message).toMatch(/positive/i);
  });

  it("rejects an unknown type", () => {
    expect(couponInputSchema.safeParse({ code: "ODD", type: "mystery", value: 1 }).success).toBe(false);
  });
});

// S73-12 — the admin product form's variant fields (colors/sizes). The
// run-72 docs claimed "products CRUD (+ colors/sizes)" but the schema had
// no such fields — variants were seed-only. These pins make the claim true.
describe("productInputSchema.variants (S73-12)", () => {
  const base = {
    name: "Test Serum Tool",
    slug: "test-serum-tool",
    description: "A very good test tool for the variant schema pins.",
    categoryId: "cat_beauty-tools",
    price: 1999,
    sku: "BT-TEST-01",
    stock: 10,
    images: ["/images/tool-1.jpg"],
  };

  it("defaults colors and sizes to empty arrays (variant-less products stay valid)", () => {
    const parsed = productInputSchema.safeParse(base);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.colorOptions).toEqual([]);
      expect(parsed.data.sizes).toEqual([]);
    }
  });

  it("accepts bounded color swatches and size labels", () => {
    const parsed = productInputSchema.safeParse({
      ...base,
      colorOptions: [{ name: "Pink", hex: "#CB9D9D" }],
      sizes: ["0.5mm", "1.0mm"],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects malformed hex colors", () => {
    const parsed = productInputSchema.safeParse({
      ...base,
      colorOptions: [{ name: "Pink", hex: "CB9D9D" }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects blank and over-long labels", () => {
    expect(
      productInputSchema.safeParse({ ...base, colorOptions: [{ name: "", hex: "#CB9D9D" }] }).success,
    ).toBe(false);
    expect(productInputSchema.safeParse({ ...base, sizes: [""] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, sizes: ["x".repeat(29)] }).success).toBe(false);
  });

  it("bounds the arrays at 12 entries (dialog-scale inputs)", () => {
    const thirteen = Array.from({ length: 13 }, (_, i) => `Size ${i}`);
    expect(productInputSchema.safeParse({ ...base, sizes: thirteen }).success).toBe(false);
  });

  it("keeps any composed Color / Size label inside the cart variant bound (60 chars)", () => {
    // 28 + " / " + 28 = 59 ≤ 60 — the bounds are chosen so the composed
    // variant label (S73-7) can never overflow cartMutateSchema.variant.
    const parsed = productInputSchema.safeParse({
      ...base,
      colorOptions: [{ name: "x".repeat(28), hex: "#CB9D9D" }],
      sizes: ["y".repeat(28)],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const c = parsed.data.colorOptions[0]?.name ?? "";
      const s = parsed.data.sizes[0] ?? "";
      expect(`${c} / ${s}`.length).toBeLessThanOrEqual(60);
    }
  });
});

describe("productInputSchema.categoryIds — the S81-1 many-to-many input", () => {
  // The reference's products carry a category_ids ARRAY (6 of its 19
  // published products belong to NO display category; the Wooden cleansing
  // brush belongs to TWO). The admin input follows: an array of existing
  // category ids, ZERO allowed, duplicates rejected, bounded.
  const base = {
    name: "Test Tool",
    slug: "test-tool",
    description: "A very good test tool for the category array pins.",
    price: 1999,
    sku: "BT-CAT-01",
    stock: 10,
    images: ["/images/knife-1.jpg"],
  };

  it("accepts zero categories (the reference's 6 uncategorized products)", () => {
    const out = productInputSchema.safeParse({ ...base, categoryIds: [] });
    expect(out.success).toBe(true);
  });

  it("accepts one and multiple categories and carries them through", () => {
    const one = productInputSchema.safeParse({ ...base, categoryIds: ["cat_beauty-tools"] });
    expect(one.success).toBe(true);
    if (one.success) expect(one.data.categoryIds).toEqual(["cat_beauty-tools"]);
    const two = productInputSchema.safeParse({
      ...base,
      categoryIds: ["cat_beauty-tools", "cat_bestsellers"],
    });
    expect(two.success).toBe(true);
    if (two.success) expect(two.data.categoryIds).toEqual(["cat_beauty-tools", "cat_bestsellers"]);
  });

  it("rejects duplicates, non-strings, and an unbounded array", () => {
    expect(productInputSchema.safeParse({ ...base, categoryIds: ["a", "a"] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, categoryIds: ["a", 42] }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, categoryIds: "cat_x" }).success).toBe(false);
    expect(
      productInputSchema.safeParse({ ...base, categoryIds: Array.from({ length: 11 }, (_, i) => `c${i}`) })
        .success,
    ).toBe(false);
  });

  it("the parsed output no longer carries the retired single categoryId field", () => {
    const out = productInputSchema.safeParse({ ...base, categoryIds: ["cat_beauty-tools"] });
    expect(out.success).toBe(true);
    if (out.success) expect("categoryId" in out.data).toBe(false);
  });
});

// S82-3 (audit 82-a L-3): the admin dialog's Template-category Radix
// Select has no deselect path — once set, a template category could not
// be cleared through the UI. The dialog now offers a "None" option whose
// value routes through this pure normalizer (client-safe seam beside the
// zod schemas it feeds).
describe("normalizeTemplateCategory — the dialog's None path (S82-3)", () => {
  it("the three template values pass through", () => {
    expect(normalizeTemplateCategory("skincare")).toBe("skincare");
    expect(normalizeTemplateCategory("lip_care")).toBe("lip_care");
    expect(normalizeTemplateCategory("body_care")).toBe("body_care");
  });

  it("the None option and the empty string normalize to null (the clear path)", () => {
    expect(normalizeTemplateCategory("none")).toBeNull();
    expect(normalizeTemplateCategory("")).toBeNull();
  });

  it("stray values normalize to null (never an invalid enum write)", () => {
    expect(normalizeTemplateCategory("Skincare")).toBeNull();
    expect(normalizeTemplateCategory("sets")).toBeNull();
    expect(normalizeTemplateCategory("garbage")).toBeNull();
  });
});

// S86 — the zod 3→4 migration pins (session 86): the standing deferred
// debt, now driven by the unpatchable HIGH advisory GHSA-mrhx-c7xc-m3w5
// (memory exhaustion validating oversized constrained collections; fixed
// only in zod ≥4.6.7 — v3 is end-of-line). The audit-86-a census found one
// hard break (stripe-payment's single-arg z.record — module-load crash
// under v4, pinned over in the stripe-payment spec), deprecated-but-
// functional params, and v4's rewritten DEFAULT texts for un-messaged checks
// (the accepted policy — every pinned message below is an explicit one).
// These pins lock the migration's zero-behavior-change contract: the
// sentinel proves the runtime is v4, and every touched seam keeps its
// exact user-facing wording.
describe("S86 — the zod 3→4 migration pins", () => {
  it("S86-1 sentinel: the runtime is zod v4 (the top-level z.email exists)", () => {
    // z.email is a v4-only top-level API (v3 only exposes the deprecated
    // .email() method on ZodString). Bumping without this pin would let a
    // silent v3 resolve keep the advisory vulnerable dependency installed.
    expect(typeof z.email).toBe("function");
  });

  it("S86-2: emailSchema keeps its exact messages and lowercase transform across the restructure", () => {
    // Empty and whitespace-only surface the required wording (not v4's
    // default "Too small…" text — the un-messaged-check policy is ACCEPTED
    // for bare bounds, but this seam's messages are explicit and pinned).
    const blank = emailSchema.safeParse("   ");
    expect(blank.success).toBe(false);
    if (!blank.success) expect(firstError(blank.error)).toBe("Email is required");

    const invalid = emailSchema.safeParse("not-an-email");
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(firstError(invalid.error)).toBe("Enter a valid email address");

    // The trim + lowercase transform survives the v4 pipe restructure.
    const valid = emailSchema.safeParse("  Jordan@Example.COM ");
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data).toBe("jordan@example.com");
  });

  it("S86-2: the coupon type enum keeps its explicit message (the { error } param rename)", () => {
    const result = couponInputSchema.safeParse({
      code: "WELCOME10",
      type: "mystery",
      value: 10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "Choose a discount type")).toBe(true);
    }
  });

  it("S86-2: the settings numeric/integer refines keep their exact range wording", () => {
    const numeric = numericSetting(0, 100).safeParse("100.1");
    expect(numeric.success).toBe(false);
    if (!numeric.success) expect(firstError(numeric.error)).toBe("Enter a number between 0 and 100.");

    const whole = integerSetting(0, 1000000).safeParse("7.5");
    expect(whole.success).toBe(false);
    if (!whole.success) expect(firstError(whole.error)).toBe("Enter a whole number between 0 and 1000000.");

    // The in-range paths are unchanged (the normalize transform included).
    const okNumeric = numericSetting(0, 100).safeParse(" 7.50 ");
    expect(okNumeric.success).toBe(true);
    if (okNumeric.success) expect(okNumeric.data).toBe("7.5");
    const okWhole = integerSetting(0, 1000000).safeParse(" 2500 ");
    expect(okWhole.success).toBe(true);
    if (okWhole.success) expect(okWhole.data).toBe("2500");
  });

  it("S86-2: the coupon superRefine issues carry the custom code (the ZodIssueCode → \"custom\" rename)", () => {
    const percent = couponInputSchema.safeParse({ code: "PCT150", type: "percent", value: 150 });
    expect(percent.success).toBe(false);
    if (!percent.success) {
      const issue = percent.error.issues.find((i) => i.path[0] === "value");
      expect(issue?.message).toBe("Percent discounts are limited to 100%.");
    }

    const fixed = couponInputSchema.safeParse({ code: "FIX0", type: "fixed", value: 0 });
    expect(fixed.success).toBe(false);
    if (!fixed.success) {
      const issue = fixed.error.issues.find((i) => i.path[0] === "value");
      expect(issue?.message).toBe("Fixed discounts must be a positive amount.");
    }
  });
});
