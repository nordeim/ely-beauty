import { scryptVerify } from "./password";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "./demo-credentials";

/**
 * Default-credential advisory detector (S92-2e, audit 92-a HIGH-1).
 *
 * The seed creates the documented demo admin (AGENTS.md / README.md /
 * .env.example) — correct for development, a takeover risk the moment a
 * production deploy runs `db:setup` and goes public without rotating it,
 * which is exactly what the operator's run-92 jesspete.shop deploy did.
 * The admin dashboard renders a warning while this returns true on a
 * NON-demo build (the demo-mode gate lives in the dashboard — in dev the
 * credentials are the advertised workflow; in production they are a
 * liability).
 *
 * Structural client seam (the session-17/18 mock convention) so the
 * detector is unit-testable without a database. `scryptVerify` is
 * failure-tolerant (malformed/absent hashes return false), so the only
 * thrown path is the client itself — the dashboard wraps the call with a
 * `.catch(() => false)` (an advisory must never take the console down).
 */
export interface AdminPasswordAdvisoryClient {
  user: {
    findFirst(args: {
      where: { email: string; role: string };
      select: { passwordHash: true };
    }): Promise<{ passwordHash: string | null } | null>;
  };
}

/** True when the seeded admin still authenticates with the documented default password. */
export async function isDefaultAdminPasswordActive(client: AdminPasswordAdvisoryClient): Promise<boolean> {
  const admin = await client.user.findFirst({
    where: { email: DEMO_ADMIN_EMAIL, role: "admin" },
    select: { passwordHash: true },
  });
  if (!admin?.passwordHash) return false;
  return scryptVerify(DEMO_ADMIN_PASSWORD, admin.passwordHash);
}
