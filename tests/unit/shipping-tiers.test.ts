// Run-72 — the city-tiered shipping contract (verified live on the reference:
// Dhaka ৳70 / outside Dhaka ৳130; "Enter city to calculate" before input).
import { describe, expect, it } from "vitest";

import { computeOrderMoney, shippingMethodForCity } from "@/lib/order-money";

const BASE = {
  subtotal: 28800, // ৳288 — the reference's pillowcase
  discount: 0,
  freeShippingThresholdCents: 300000, // ৳3,000
  standardShippingCents: 7000, // ৳70 — Dhaka
  expressShippingCents: 13000, // ৳130 — outside Dhaka
  taxRatePercent: 0,
};

describe("shippingMethodForCity (run-72)", () => {
  it("maps Dhaka (and its area spellings) to the standard tier", () => {
    expect(shippingMethodForCity("Dhaka")).toBe("standard");
    expect(shippingMethodForCity("dhaka")).toBe("standard");
    expect(shippingMethodForCity("  Dhaka North ")).toBe("standard");
    expect(shippingMethodForCity("DHAKA")).toBe("standard");
  });

  it("maps every other district to the express tier", () => {
    expect(shippingMethodForCity("Chattogram")).toBe("express");
    expect(shippingMethodForCity("Sylhet")).toBe("express");
    expect(shippingMethodForCity("Khulna")).toBe("express");
  });

  it("treats the empty city as standard (the UI gates on the empty string separately)", () => {
    expect(shippingMethodForCity("")).toBe("standard");
    expect(shippingMethodForCity("   ")).toBe("standard");
  });

  it("does not match cities that merely CONTAIN 'dhaka' as a suffix of another word", () => {
    // The startsWith mapping is prefix-based on the whole city string; a
    // hypothetical district like "Baddhaka" must NOT ride the Dhaka tier.
    expect(shippingMethodForCity("Baddhaka")).toBe("express");
  });
});

describe("computeOrderMoney with the city tiers (run-72)", () => {
  it("charges ৳70 inside Dhaka — the reference's verified math (288 + 70 = 358)", () => {
    const money = computeOrderMoney({ ...BASE, shippingMethod: shippingMethodForCity("Dhaka") });
    expect(money.shipping).toBe(7000);
    expect(money.total).toBe(35800); // ৳358 — matches the live reference order
  });

  it("charges ৳130 outside Dhaka (288 + 130 = 418)", () => {
    const money = computeOrderMoney({ ...BASE, shippingMethod: shippingMethodForCity("Chattogram") });
    expect(money.shipping).toBe(13000);
    expect(money.total).toBe(41800); // ৳418 — matches the live reference quote
  });

  it("zeroes BOTH tiers at the free-shipping threshold (the superset spend gate)", () => {
    const at = { ...BASE, subtotal: 300000 };
    expect(computeOrderMoney({ ...at, shippingMethod: "standard" }).shipping).toBe(0);
    expect(computeOrderMoney({ ...at, shippingMethod: "express" }).shipping).toBe(0);
  });

  it("zeroes BOTH tiers under a free_shipping coupon (the S20-6 contract holds)", () => {
    const withCoupon = { ...BASE, couponFreeShipping: true };
    expect(computeOrderMoney({ ...withCoupon, shippingMethod: "standard" }).shipping).toBe(0);
    expect(computeOrderMoney({ ...withCoupon, shippingMethod: "express" }).shipping).toBe(0);
  });
});
