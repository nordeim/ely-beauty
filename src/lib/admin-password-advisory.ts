import { scryptVerify } from "./password";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "./demo-credentials";

/**
 * Default-credential advisory detector (S92-2e, audit 92-a HIGH-1).
 *
 * The seed creates the documented demo admin (AGENTS.md / README.md /
 * Project_Architecture_Document.md / ely-beauty_SKILL.md — the S94-6
 * lockstep inventory; .env.example deliberately does NOT document the pair)
 * — correct for development, a takeover risk the moment a
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

/**
 * S93-4 (audit 93-a LOW-3): a NEGATIVE verdict is cached for a short TTL.
 * The detector burns a synchronous scrypt (~30–80 ms event-loop stall on
 * the single-instance standalone server) on EVERY production dashboard
 * render — including the post-rotation steady state, where the answer is
 * always "inactive". Caching only the negative verdict skips that burn;
 * a POSITIVE verdict is never cached, so the advisory clears on the very
 * first render after the password rotates (the operator-facing contract).
 * The TTL bounds staleness for the exotic revert path (a DB restore
 * flipping the hash back to the default): the advisory re-arms within a
 * minute.
 */
const NEGATIVE_VERDICT_TTL_MS = 60_000;
let negativeVerdictUntil = 0;

/** Test seam: the module-state TTL must never leak between tests. */
export function resetAdvisoryCacheForTests(): void {
  negativeVerdictUntil = 0;
}

/** True when the seeded admin still authenticates with the documented default password. */
export async function isDefaultAdminPasswordActive(client: AdminPasswordAdvisoryClient): Promise<boolean> {
  if (Date.now() < negativeVerdictUntil) return false;
  const admin = await client.user.findFirst({
    where: { email: DEMO_ADMIN_EMAIL, role: "admin" },
    select: { passwordHash: true },
  });
  if (!admin?.passwordHash) return false;
  const active = scryptVerify(DEMO_ADMIN_PASSWORD, admin.passwordHash);
  if (!active) negativeVerdictUntil = Date.now() + NEGATIVE_VERDICT_TTL_MS;
  return active;
}
