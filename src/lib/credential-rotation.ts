/**
 * Transactional credential rotation (S93-1, audit 93-a MEDIUM-1).
 *
 * `changePasswordAction`'s rotation used to be three independent awaited
 * writes — `db.user.update` (new hash), `db.session.deleteMany` (kill
 * every session), `createSession` (fresh cookie). A crash or a SQLite
 * write-lock timeout between the first two left the password CHANGED
 * while every pre-change session stayed alive (the exact threat the
 * rotation exists to kill) for up to the 30-day session TTL, and the
 * user had no recovery path: a retry with the old current password fails
 * the uniform error, and the login page offers no forgot-password flow.
 *
 * The seam follows the `growReviewAggregate` convention (session-13
 * S13-4): the CALLER owns the transaction boundary — the action wraps
 * this in ONE `db.$transaction(async (tx) => …)` so the hash change and
 * the session kill commit or roll back TOGETHER. `createSession` stays
 * after the commit (its row write + cookie are not transactional; a
 * failure there is a benign full sign-out, not a security hole).
 *
 * Structural client seam (the session-17/18 mock convention) so the
 * rotation is unit-testable without a database.
 */
export interface CredentialRotationClient {
  user: {
    update: (args: {
      where: { id: string };
      data: { passwordHash: string };
    }) => Promise<unknown>;
  };
  session: {
    deleteMany: (args: { where: { userId: string } }) => Promise<unknown>;
  };
}

/**
 * Rotate a user's credential inside the caller's transaction: write the
 * new password hash, then delete EVERY session row for the user. Must
 * run inside `db.$transaction` — exported for the action and its pins.
 */
export async function rotateCredentialInTx(
  client: CredentialRotationClient,
  userId: string,
  newPasswordHash: string,
): Promise<void> {
  await client.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
  await client.session.deleteMany({ where: { userId } });
}
