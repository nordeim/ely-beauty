import { describe, expect, it } from "vitest";

import {
  isPublishableKeyConfigured,
  isRealSecret,
  parseStripeBdtPerUsd,
  resolveStripeConfig,
} from "@/lib/stripe-config";

/**
 * The sentinel mirror (PAY-STRIPE-1): the SERVER (STRIPE_SECRET_KEY) and
 * CLIENT (publishable key) "configured" checks share ONE truth table — they
 * can never disagree, and placeholder values are NOT configuration.
 */
describe("resolveStripeConfig — the sentinel mirror", () => {
  it("unconfigured by default: no secret → serverConfigured false, publishableKey null", () => {
    expect(resolveStripeConfig({})).toEqual({ serverConfigured: false, publishableKey: null, bdtPerUsd: null, cardEnabled: false });
  });

  it("a real secret alone → serverConfigured true but NO publishable key (the mirror stays off)", () => {
    const config = resolveStripeConfig({ STRIPE_SECRET_KEY: "sk_test_abc" });
    expect(config.serverConfigured).toBe(true);
    expect(config.publishableKey).toBe(null);
  });

  it("secret + publishable key → both sides on (the fully-configured state)", () => {
    const config = resolveStripeConfig({
      STRIPE_SECRET_KEY: "sk_test_abc",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_xyz",
    });
    expect(config.serverConfigured).toBe(true);
    expect(config.publishableKey).toBe("pk_test_xyz");
  });

  it("a publishable key WITHOUT a secret → the server is OFF (never a client-only on state)", () => {
    const config = resolveStripeConfig({ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_xyz" });
    expect(config.serverConfigured).toBe(false);
    expect(config.publishableKey).toBe(null);
  });

  it("placeholder values are documentation, not configuration", () => {
    expect(resolveStripeConfig({ STRIPE_SECRET_KEY: "set-me" }).serverConfigured).toBe(false);
    expect(isRealSecret("set-me")).toBe(false);
    expect(isRealSecret("  ")).toBe(false);
    expect(isRealSecret(undefined)).toBe(false);
    expect(isRealSecret(null)).toBe(false);
    expect(isRealSecret("sk_test_real")).toBe(true);
  });

  it("the client mirror agrees with the server resolution (one truth table)", () => {
    // The page passes the server's resolution as props; the island asks the
    // mirror before loadStripe — both sides derive from isRealSecret.
    expect(isPublishableKeyConfigured(null)).toBe(false);
    expect(isPublishableKeyConfigured("pk_test_xyz")).toBe(true);
    expect(isPublishableKeyConfigured("set-me")).toBe(false);
  });
});

/**
 * S74-11 (F-1) — the FX gate. Stripe cannot charge BDT, so the card path
 * needs an explicit operator-provided taka-per-dollar rate before it may
 * mint a single intent. Without the rate, "configured" keys alone must NOT
 * enable the Card option: the pre-fix code minted intents whose USD-cent
 * amount equaled the BDT-poisha count (a ~120× overcharge).
 */
describe("parseStripeBdtPerUsd — the explicit FX rate", () => {
  it("parses a positive finite rate", () => {
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "120" })).toBe(120);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "117.5" })).toBe(117.5);
  });

  it("missing, empty, non-numeric, zero, negative, and NaN values are NOT a rate", () => {
    expect(parseStripeBdtPerUsd({})).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: undefined })).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "" })).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "  " })).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "abc" })).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "0" })).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "-120" })).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "Infinity" })).toBe(null);
    expect(parseStripeBdtPerUsd({ STRIPE_BDT_PER_USD: "set-me" })).toBe(null);
  });
});

describe("resolveStripeConfig — the card gate needs keys AND the rate", () => {
  it("keys without a rate → cardEnabled false (the overcharge footgun stays closed)", () => {
    const config = resolveStripeConfig({
      STRIPE_SECRET_KEY: "sk_test_abc",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_xyz",
    });
    expect(config.serverConfigured).toBe(true);
    expect(config.publishableKey).toBe("pk_test_xyz");
    expect(config.bdtPerUsd).toBe(null);
    expect(config.cardEnabled).toBe(false);
  });

  it("keys + rate → cardEnabled true (the fully-configured card state)", () => {
    const config = resolveStripeConfig({
      STRIPE_SECRET_KEY: "sk_test_abc",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_xyz",
      STRIPE_BDT_PER_USD: "120",
    });
    expect(config.serverConfigured).toBe(true);
    expect(config.bdtPerUsd).toBe(120);
    expect(config.cardEnabled).toBe(true);
  });

  it("a rate alone (no keys) → cardEnabled false", () => {
    const config = resolveStripeConfig({ STRIPE_BDT_PER_USD: "120" });
    expect(config.serverConfigured).toBe(false);
    expect(config.cardEnabled).toBe(false);
  });

  it("an invalid rate string behaves like a missing rate (never NaN)", () => {
    const config = resolveStripeConfig({
      STRIPE_SECRET_KEY: "sk_test_abc",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_xyz",
      STRIPE_BDT_PER_USD: "banana",
    });
    expect(config.bdtPerUsd).toBe(null);
    expect(config.cardEnabled).toBe(false);
  });
});
