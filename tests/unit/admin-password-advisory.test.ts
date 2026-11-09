import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { scryptHash } from "@/lib/password";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from "@/lib/demo-credentials";
import {
  isDefaultAdminPasswordActive,
  resetAdvisoryCacheForTests,
  type AdminPasswordAdvisoryClient,
} from "@/lib/admin-password-advisory";

/**
 * S92-2e (audit 92-a HIGH-1): the admin dashboard's default-credential
 * advisory detector. The operator's run-92 production deploy seeded the
 * documented demo admin into the public domain with no UI path to change
 * it — this helper powers the dashboard warning that fires while the
 * seeded admin still authenticates with the default password.
 *
 * The client seam mirrors the session-17/18 mock conventions: a structural
 * Prisma-subset so the detector is unit-testable without a database.
 */
function fakeClient(user: { passwordHash: string | null } | null): AdminPasswordAdvisoryClient {
  return {
    user: {
      async findFirst() {
        return user;
      },
    },
  };
}

// S93-4: the module-state TTL cache must never leak a verdict between
// tests — every pin starts from a clean cache.
beforeEach(() => {
  resetAdvisoryCacheForTests();
});

describe("isDefaultAdminPasswordActive (S92-2e)", () => {
  it("returns true when the seeded admin still verifies the default password", async () => {
    const client = fakeClient({ passwordHash: scryptHash(DEMO_ADMIN_PASSWORD) });
    await expect(isDefaultAdminPasswordActive(client)).resolves.toBe(true);
  });

  it("returns false once the password has been changed", async () => {
    const client = fakeClient({ passwordHash: scryptHash("RotatedSecret99!") });
    await expect(isDefaultAdminPasswordActive(client)).resolves.toBe(false);
  });

  it("returns false when the admin account does not exist (advisory never 500s)", async () => {
    const client = fakeClient(null);
    await expect(isDefaultAdminPasswordActive(client)).resolves.toBe(false);
  });

  it("returns false for an admin without a password hash (external-auth shape)", async () => {
    const client = fakeClient({ passwordHash: null });
    await expect(isDefaultAdminPasswordActive(client)).resolves.toBe(false);
  });

  it("returns false on a malformed stored hash instead of throwing", async () => {
    const client = fakeClient({ passwordHash: "not-a-scrypt-hash" });
    await expect(isDefaultAdminPasswordActive(client)).resolves.toBe(false);
  });
});

describe("the advisory's TTL-cached negative verdict (S93-4, audit 93-a LOW-3)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("serves a negative verdict from cache within the TTL (no scrypt re-burn)", async () => {
    // First read: the password has rotated — the false verdict caches.
    await expect(
      isDefaultAdminPasswordActive(fakeClient({ passwordHash: scryptHash("RotatedSecret99!") })),
    ).resolves.toBe(false);
    // Swap the stored hash back to the default (a DB restore, say) — within
    // the TTL the cached negative still answers, and the scrypt + query are
    // NOT re-run (the post-rotation steady state skips the per-render burn).
    await expect(
      isDefaultAdminPasswordActive(fakeClient({ passwordHash: scryptHash(DEMO_ADMIN_PASSWORD) })),
    ).resolves.toBe(false);
  });

  it("re-checks after the TTL expires", async () => {
    vi.useFakeTimers();
    await expect(
      isDefaultAdminPasswordActive(fakeClient({ passwordHash: scryptHash("RotatedSecret99!") })),
    ).resolves.toBe(false);
    vi.advanceTimersByTime(61_000); // past the 60s TTL
    await expect(
      isDefaultAdminPasswordActive(fakeClient({ passwordHash: scryptHash(DEMO_ADMIN_PASSWORD) })),
    ).resolves.toBe(true);
  });

  it("never caches a POSITIVE verdict — the advisory clears the moment the password rotates", async () => {
    // The dangerous state reads true every time (no cache)…
    await expect(
      isDefaultAdminPasswordActive(fakeClient({ passwordHash: scryptHash(DEMO_ADMIN_PASSWORD) })),
    ).resolves.toBe(true);
    // …so the very next render after the rotation already sees false.
    await expect(
      isDefaultAdminPasswordActive(fakeClient({ passwordHash: scryptHash("RotatedSecret99!") })),
    ).resolves.toBe(false);
  });
});
