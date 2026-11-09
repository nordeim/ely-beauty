// S93-1 (audit 93-a MEDIUM-1) — the transactional credential rotation.
//
// changePasswordAction used to issue THREE independent awaited writes
// (user.update → session.deleteMany → createSession): a crash or SQLite
// write-lock timeout between the first two left the password CHANGED
// while every pre-change session stayed alive — the exact threat the
// rotation exists to kill — for up to the 30-day session TTL, with no
// forgot-password flow to recover (a retry with the old current password
// then fails the uniform error).
//
// The seam follows the growReviewAggregate convention (session-13
// S13-4): a structural Prisma-subset client so the two writes are
// unit-testable without a database, with the CALLER owning the
// transaction boundary — the action wraps the seam in ONE
// db.$transaction so the hash change and the session kill commit or
// roll back together (createSession stays AFTER the commit; its cookie
// write cannot be transactional).
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  rotateCredentialInTx,
  type CredentialRotationClient,
} from "@/lib/credential-rotation";

type UpdateFn = CredentialRotationClient["user"]["update"];
type DeleteManyFn = CredentialRotationClient["session"]["deleteMany"];

function fakeDb(overrides?: {
  update?: ReturnType<typeof vi.fn<UpdateFn>>;
  deleteMany?: ReturnType<typeof vi.fn<DeleteManyFn>>;
}) {
  const update =
    overrides?.update ?? vi.fn<UpdateFn>().mockResolvedValue({ id: "u1" });
  const deleteMany =
    overrides?.deleteMany ?? vi.fn<DeleteManyFn>().mockResolvedValue({ count: 2 });
  return {
    client: { user: { update }, session: { deleteMany } } satisfies CredentialRotationClient,
    update,
    deleteMany,
  };
}

describe("rotateCredentialInTx (S93-1)", () => {
  it("writes the new hash through user.update scoped to the user", async () => {
    const { client, update } = fakeDb();
    await rotateCredentialInTx(client, "u1", "new-hash");
    expect(update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "new-hash" },
    });
  });

  it("kills EVERY session row for the user in the same transaction", async () => {
    const { client, deleteMany } = fakeDb();
    await rotateCredentialInTx(client, "u1", "new-hash");
    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
  });

  it("propagates a rejection so the caller's transaction rolls back", async () => {
    const boom = new Error("SQLITE_BUSY");
    const { client, deleteMany } = fakeDb({
      update: vi.fn<UpdateFn>().mockRejectedValue(boom),
    });
    await expect(rotateCredentialInTx(client, "u1", "new-hash")).rejects.toBe(boom);
    expect(deleteMany).not.toHaveBeenCalled();
  });
});

// The action-side composition pin (the api-boundaries / e2e-infrastructure
// file-reading convention): the rotation must route through ONE
// db.$transaction + the seam — never bare sequential writes that can
// straddle a crash window.
describe("S93-1 — changePasswordAction routes the rotation through the transaction", () => {
  const source = readFileSync(
    path.resolve(import.meta.dirname, "../../src/lib/actions/auth.ts"),
    "utf8",
  );

  it("imports and composes the credential-rotation seam", () => {
    expect(source).toContain('import { rotateCredentialInTx } from "@/lib/credential-rotation"');
    expect(source).toMatch(/db\.\$transaction\(async \(tx\) => \{\s*await rotateCredentialInTx\(tx,/);
  });

  it("keeps createSession AFTER the transaction (the cookie write is not transactional)", () => {
    const txMatch = source.match(/db\.\$transaction\(async \(tx\) => \{[\s\S]*?\}\);\s*\n\s*await createSession\(user\.id\);/);
    expect(txMatch).not.toBeNull();
  });

  it("no longer carries the bare sequential rotation writes", () => {
    // The pre-S93-1 shape: update → deleteMany → createSession as three
    // independent awaited writes on db directly.
    expect(source).not.toMatch(
      /await db\.user\.update\(\{\s*where: \{ id: user\.id \},\s*data: \{ passwordHash: scryptHash\(parsed\.data\.newPassword\) \},\s*\}\);/,
    );
    expect(source).not.toMatch(
      /await db\.session\.deleteMany\(\{ where: \{ userId: user\.id \} \}\);\s*await createSession/,
    );
  });
});
