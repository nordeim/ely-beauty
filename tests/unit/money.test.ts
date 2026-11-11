import { describe, expect, it } from "vitest";

import {
  discountPercent,
  formatMoney,
  formatOverlayPrice,
  formatStripeUsd,
  parseDollarsToCents,
} from "@/lib/money";

describe("formatMoney", () => {
  it("formats integer cents as BDT (whole taka when no poisha)", () => {
    expect(formatMoney(28800)).toBe("৳288");
    expect(formatMoney(37000)).toBe("৳370");
    expect(formatMoney(0)).toBe("৳0");
    expect(formatMoney(107000)).toBe("৳1,070");
  });

  it("renders poisha only when present", () => {
    expect(formatMoney(36550)).toBe("৳365.50");
    expect(formatMoney(5)).toBe("৳0.05");
  });

  it("handles negative amounts", () => {
    expect(formatMoney(-1999)).toBe("-৳19.99");
  });

  it("rounds fractional input", () => {
    expect(formatMoney(199.6)).toBe("৳2");
  });
});

// S82-1 (D-82-1, codepoint-measured on the live reference 2026-11-09):
// the reference's SEARCH OVERLAY row price renders the Base44 template's
// USD format — literal ASCII "$" (U+0024) + the same numeric value as the
// ৳ grid price + ALWAYS two decimals — while its grid/detail prices stay
// ৳ whole-taka. The clone's overlay matches the reference's bytes; every
// other money surface keeps formatMoney's ৳ form.
describe("formatOverlayPrice (the reference's overlay USD template format)", () => {
  it("renders $ + value + two decimals for whole-taka amounts", () => {
    expect(formatOverlayPrice(37000)).toBe("$370.00");
    expect(formatOverlayPrice(28800)).toBe("$288.00");
    expect(formatOverlayPrice(47000)).toBe("$470.00");
  });

  it("renders the poisha part when present (still two decimals)", () => {
    expect(formatOverlayPrice(47050)).toBe("$470.50");
    expect(formatOverlayPrice(5)).toBe("$0.05");
    expect(formatOverlayPrice(19999)).toBe("$199.99");
  });

  it("zero and thousands grouping", () => {
    expect(formatOverlayPrice(0)).toBe("$0.00");
    expect(formatOverlayPrice(107000)).toBe("$1,070.00");
    expect(formatOverlayPrice(129900)).toBe("$1,299.00");
  });

  it("the dollar is the ASCII codepoint 36, never the ৳ (U+09F3)", () => {
    const out = formatOverlayPrice(37000);
    expect(out.codePointAt(0)).toBe(36);
    expect(out).not.toContain("৳");
  });
});

// S105-1 (audit 105-a LOW-1): the Stripe seam mints USD-only PaymentIntents
// (currency: "usd"; verifyPaymentIntentForPlacement rejects non-USD), so
// StripeEvent.amount and the charge amount/amount_refunded are USD cents —
// they must NEVER render through formatMoney (the ৳ formatter). This
// Stripe-scoped companion renders them with the ASCII dollar and two
// decimals ALWAYS (Stripe's minor-unit convention): $31.29, $10.00, $0.00.
// S106-1 (audit 106-a F-1) widened the domain: the checkout island's Pay
// button ALSO renders through this formatter — the mint route echoes the
// CONVERTED USD intent amount (never the BDT total), so the button states
// what the card will be charged ($2.40 for a ৳288 order at rate 120); the
// run-105 claim that the button rode the BDT cart total was false (the
// echoed value is `intent.amount` — the S105-1 mislabel survived one run
// on the charge-consent surface because the island never mounts in tests).
describe("formatStripeUsd (the Stripe USD form — ledger, refund notes, Pay button)", () => {
  it("renders $ + comma-grouped whole + two decimals ALWAYS (whole dollars never drop the .00)", () => {
    expect(formatStripeUsd(3129)).toBe("$31.29");
    expect(formatStripeUsd(1000)).toBe("$10.00");
    expect(formatStripeUsd(107000)).toBe("$1,070.00");
  });

  it("zero renders $0.00, not ৳0", () => {
    expect(formatStripeUsd(0)).toBe("$0.00");
    expect(formatStripeUsd(5)).toBe("$0.05");
  });

  it("handles negative amounts with a leading minus", () => {
    expect(formatStripeUsd(-1999)).toBe("-$19.99");
  });

  it("the dollar is the ASCII codepoint 36, never the ৳ (U+09F3)", () => {
    const out = formatStripeUsd(3129);
    expect(out.codePointAt(0)).toBe(36);
    expect(out).not.toContain("৳");
  });
});

describe("parseDollarsToCents", () => {
  it("parses plain dollar strings", () => {
    expect(parseDollarsToCents("199.99")).toBe(19999);
    expect(parseDollarsToCents("5")).toBe(500);
    expect(parseDollarsToCents("0.05")).toBe(5);
  });

  it("strips currency symbols and thousands separators", () => {
    expect(parseDollarsToCents("৳1,299.50")).toBe(129950);
    expect(parseDollarsToCents("$1,299.50")).toBe(129950);
    expect(parseDollarsToCents(" 42 ")).toBe(4200);
  });

  it("accepts at most two decimal places", () => {
    expect(parseDollarsToCents("1.999")).toBeNull();
  });

  it("rejects garbage", () => {
    expect(parseDollarsToCents("abc")).toBeNull();
    expect(parseDollarsToCents("")).toBeNull();
    expect(parseDollarsToCents("-5")).toBeNull();
  });
});

describe("discountPercent", () => {
  it("computes the whole-percent discount", () => {
    expect(discountPercent(19999, 27999)).toBe(-29);
    expect(discountPercent(8999, 12999)).toBe(-31);
    expect(discountPercent(34999, 42999)).toBe(-19);
  });

  it("returns null when there is nothing to compare", () => {
    expect(discountPercent(19999, null)).toBeNull();
    expect(discountPercent(19999, 0)).toBeNull();
    expect(discountPercent(19999, 19999)).toBeNull();
    expect(discountPercent(25000, 19999)).toBeNull();
  });
});
