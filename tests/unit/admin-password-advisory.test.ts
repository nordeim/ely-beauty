import { describe, expect, it } from "vitest";

import { scryptHash } from "@/lib/password";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from "@/lib/demo-credentials";
import {
  isDefaultAdminPasswordActive,
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
