// S115-2 — the review action's catch is narrow, logged, and rethrowing
// (audit 115-a MEDIUM-1). The pre-fix shape was the sole broad catch-swallow
// in the actions layer: `catch { return { ok: false, error: "Could not
// save your review. Please try again." } }` — untyped, unlogged,
// non-rethrowing. It violates the repo's own S13-5 sibling convention
// (auth.ts + 11 admin.ts sites narrow to known Prisma classes and
// `throw error` for unknowns — "an outage is not a not-found"): a DB outage
// during review submission was indistinguishable from a transient failure
// with no server log and nothing observable.
//
// The narrow catch admits exactly the two PRISMA classes that legitimately
// reach it — the concurrent-delete races the pre-check cannot close: P2003
// from the in-tx `review.create` when the product row vanishes under the
// `onDelete: Cascade` FK, and P2025 from `growReviewAggregate`'s
// `product.update` on the same vanished row. Both map to the pre-check's
// own "Product not found." copy. Every other error is logged with product
// context and RETHROWN — the review-form island's existing catch renders
// the friendly copy, so the UX surface is unchanged.
//
// Mock family: the review-action-gate precedent (next/cache + @/lib/db +
// @/lib/auth + next/headers mocked; @/lib/rate-limit partially mocked via
// importOriginal so the REAL key derivation feeds the gate). P2003/P2025
// must be REAL `PrismaClientKnownRequestError` instances — a code-stamped
// plain Error fails the `instanceof` gate (the session-16 S16-1 lesson).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

vi.mock("@/lib/db", () => ({
  db: {
    product: { findUnique: vi.fn(), update: vi.fn() },
    review: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/rate-limit")>()),
  rateLimit: vi.fn(),
}));

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { submitReviewAction } from "@/lib/actions/reviews";
import { isRecordNotFound } from "@/lib/prisma-errors";

const PID = "product-1";
const VALID_INPUT = [PID, 5, "Great serum", "My skin looks rested after a week.", "Alice"] as const;

const mockedRateLimit = vi.mocked(rateLimit);
const mockedHeaders = vi.mocked(headers);
let consoleSpy: ReturnType<typeof vi.spyOn>;

function prismaError(code: "P2003" | "P2025", message: string): PrismaClientKnownRequestError {
  return new PrismaClientKnownRequestError(message, { code, clientVersion: "test" });
}

beforeEach(() => {
  // resetAllMocks (the review-action-gate convention): a leftover Once
  // queue from a prior test must never leak into the next one.
  vi.resetAllMocks();
  mockedHeaders.mockResolvedValue(new Headers({ "cf-connecting-ip": "203.0.113.9" }));
  mockedRateLimit.mockReturnValue({ ok: true });
  vi.mocked(getCurrentUser).mockResolvedValue(null);
  // The gate's fast-fail product check passes (the catch tests are about
  // what the TX throws, not the pre-check).
  vi.mocked(db.product.findUnique).mockResolvedValue({
    id: PID,
    isActive: true,
    rating: 4.7,
    reviewCount: 10,
  } as never);
  // The console.error boundary must not pollute test output — but its CALL
  // is pinned (the logged-with-context half of the fix).
  consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isRecordNotFound — the P2025 seam helper (S115-2)", () => {
  it("accepts a real P2025 error object", () => {
    expect(isRecordNotFound(prismaError("P2025", "An operation failed because it depends on one or more records that were required but not found."))).toBe(true);
  });

  it("rejects the FK-violation class and un-stamped errors — only P2025 is not-found", () => {
    // The seam duck-types on the `code` field (the isUniqueViolation /
    // isForeignKeyViolation contract): sibling Prisma classes and plain
    // errors never alias onto the not-found class. P2003 is the FK race —
    // mapped to the same copy by the CALLER (an OR), not by the seam.
    const fk = prismaError("P2003", "Foreign key constraint failed on the field: `productId`");
    expect(isRecordNotFound(fk)).toBe(false);
    expect(isRecordNotFound(new Error("plain"))).toBe(false);
    expect(isRecordNotFound(null)).toBe(false);
    expect(isRecordNotFound("P2025")).toBe(false);
  });
});

describe("submitReviewAction — the catch narrows, logs, and rethrows (S115-2)", () => {
  it("maps the concurrent-delete FK race (P2003 from the tx) to the pre-check's not-found copy", async () => {
    vi.mocked(db.$transaction).mockRejectedValue(
      prismaError("P2003", "Foreign key constraint failed on the field: `productId`"),
    );

    const result = await submitReviewAction(...VALID_INPUT);

    expect(result).toEqual({ ok: false, error: "Product not found." });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("maps the aggregate-growth record race (P2025 from the tx) to the same copy", async () => {
    vi.mocked(db.$transaction).mockRejectedValue(
      prismaError("P2025", "An operation failed because it depends on one or more records that were required but not found."),
    );

    const result = await submitReviewAction(...VALID_INPUT);

    expect(result).toEqual({ ok: false, error: "Product not found." });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("logs an unknown failure with product context and RETHROWS it (an outage is not a not-found, S13-5)", async () => {
    const boom = new Error("boom: sqlite is locked");
    vi.mocked(db.$transaction).mockRejectedValue(boom);

    // The island's catch renders the friendly copy — the action must let
    // the rejection escape instead of swallowing it into a result shape.
    await expect(submitReviewAction(...VALID_INPUT)).rejects.toThrow(boom);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    // The log carries the WHERE (productId) alongside the WHAT (the error).
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("submitReviewAction"),
      expect.objectContaining({ productId: PID, error: boom }),
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
