// Run-72 — the ELY-XXXXXXXX order-number contract.
import { describe, expect, it } from "vitest";

import {
  ORDER_NUMBER_BODY_LENGTH,
  ORDER_NUMBER_PREFIX,
  generateOrderNumber,
  isOrderNumberFormat,
} from "@/lib/order-number";

describe("generateOrderNumber (run-72)", () => {
  it("mints ELY- prefixed 8-char uppercase alphanumeric candidates", () => {
    for (let i = 0; i < 200; i += 1) {
      const n = generateOrderNumber();
      expect(n.startsWith(ORDER_NUMBER_PREFIX)).toBe(true);
      expect(n.length).toBe(ORDER_NUMBER_PREFIX.length + ORDER_NUMBER_BODY_LENGTH);
      expect(n.slice(ORDER_NUMBER_PREFIX.length)).toMatch(/^[A-Z0-9]{8}$/);
      expect(isOrderNumberFormat(n)).toBe(true);
    }
  });

  it("carries no sequence information (the enumeration guard)", () => {
    // 200 draws must produce many DISTINCT bodies — a counter-derived scheme
    // (the retired ORD-YYYY-NNN) would produce a run; a random scheme cannot.
    const seen = new Set(Array.from({ length: 200 }, () => generateOrderNumber()));
    expect(seen.size).toBeGreaterThan(150);
  });

  it("rejects the retired and malformed shapes", () => {
    expect(isOrderNumberFormat("ORD-2026-001")).toBe(false);
    expect(isOrderNumberFormat("ELY-MW774C5")).toBe(false); // 7 chars
    expect(isOrderNumberFormat("ELY-mw774c50")).toBe(false); // lowercase
    expect(isOrderNumberFormat("ELY-MW774C509")).toBe(false); // 9 chars
    expect(isOrderNumberFormat("")).toBe(false);
  });

  it("accepts the live reference's observed format", () => {
    // Verified on the live reference 2026-11-08 (docs/reference-investigation.md).
    expect(isOrderNumberFormat("ELY-MW774C50")).toBe(true);
  });
});
