/**
 * AUTH_SECRET enforcement — the HMAC key that signs the session cookie.
 *
 * Extracted from `src/lib/auth.ts` so the production gate is unit-testable.
 * The dev fallback keeps local development friction-free, but production must
 * never silently run on a public constant (any future signed-payload feature
 * would inherit a forgeable key).
 */

export const DEV_FALLBACK_SECRET = "insecure-dev-only-secret-change-me";

/**
 * S97-1: the minimum accepted length in production. Matches the README's
 * documented generation command (`openssl rand -hex 32` → 64 hex chars) —
 * anything shorter than 32 characters refuses to key the session-cookie
 * HMAC and the order-access tokens.
 */
export const MIN_AUTH_SECRET_LENGTH = 32;

/** Throw when running in production without a real AUTH_SECRET. */
export function assertAuthSecret(env: {
  NODE_ENV?: string | undefined;
  AUTH_SECRET?: string | undefined;
}): void {
  if (env.NODE_ENV !== "production") return;
  const secret = env.AUTH_SECRET?.trim();
  if (!secret || secret === DEV_FALLBACK_SECRET) {
    throw new Error(
      "AUTH_SECRET must be set to a strong random value in production — refusing to sign session cookies with the dev fallback.",
    );
  }
  if (secret.length < MIN_AUTH_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET must be at least ${MIN_AUTH_SECRET_LENGTH} characters in production (e.g. \`openssl rand -hex 32\`) — refusing to sign session cookies with a weak key.`,
    );
  }
}
