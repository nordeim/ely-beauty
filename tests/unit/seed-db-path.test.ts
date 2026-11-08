// Session 77 S77-6 (audit F7) — the seed routes through the db-path seam.
//
// prisma/seed.ts used a bare `new PrismaClient()`, which follows whatever
// DATABASE_URL the shell exported instead of the schema-anchored resolution
// the app runtime uses (src/lib/db-path.ts) — the root cause of the
// recurring "rows survive fresh reseeds" convergence rituals in the worklog
// (AGENTS.md's own db-path contract claims the CLI AND runtime resolve the
// same file; only the runtime did). The seed is not import-safe for
// execution (it seeds on import), so this is a SOURCE-level pin: the
// constructor must carry datasourceUrl from resolveProcessDatabaseUrl.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function seedSource(): string {
  return readFileSync(path.resolve(import.meta.dirname, "../../prisma/seed.ts"), "utf8");
}

describe("prisma/seed.ts — the db-path seam (S77-6)", () => {
  it("imports the seam's resolver", () => {
    expect(seedSource()).toMatch(
      /import\s*\{[^}]*resolveProcessDatabaseUrl[^}]*\}\s*from\s*["'].*db-path["']/,
    );
  });

  it("constructs the PrismaClient with the resolved datasourceUrl", () => {
    expect(seedSource()).toMatch(
      /new PrismaClient\(\{\s*datasourceUrl:\s*resolveProcessDatabaseUrl\(\)\s*,?\s*\}\)/,
    );
    // The bare constructor is gone.
    expect(seedSource()).not.toMatch(/new PrismaClient\(\)\s*;?/);
  });
});
