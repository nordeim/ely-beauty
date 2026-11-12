// S113-2/S113-3 — the schema-defaults drift net (audit 113-a INFO-1/INFO-2)
//
// Audit 113-a found two schema-drift items the prior cycles had recorded as
// no-action INFOs (run-112 INFO-3: "the Prisma schema's dead default/comment
// drift — every write path routes through Zod"): the Address.country column
// default "United States" (dead HomeNest scaffolding on a Bangladesh
// storefront — the Zod boundary has defaulted country to "Bangladesh" since
// S74-12, and the S83-5 pin banned the `|| "United States"` fallbacks in
// src/ in run 83; the column default is the same class one stratum down,
// waiting for a future write path that omits country to silently ship a US
// address) and the Coupon.type comment listing only "percent | fixed" (the
// live vocabulary is percent | fixed | free_shipping — validation.ts's z.enum
// and coupons.ts's redemption filter implement the three-type set since
// S74-11; the schema comment is the model's only vocabulary documentation).
//
// SQLite has no native enums, so the schema file is the documentation seam
// for both invariants. These pins read it directly (the S99-1
// filesystem-derivation convention, like docs-counts) so the class can never
// drift silently again: a stale default or comment fails HERE, by name.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const schema = readFileSync(join(process.cwd(), "prisma", "schema.prisma"), "utf8");

describe("S113 — the schema-defaults net (audit 113-a INFO-1/INFO-2)", () => {
  it("S113-2a: the Address.country column defaults to Bangladesh (the storefront's market)", () => {
    // The BD storefront's address model must not default to the US: the Zod
    // boundary defaults country to "Bangladesh" (S74-12) and every current
    // write path passes an explicit value — but a column default of
    // "United States" is a foot-gun for any FUTURE write path that omits it.
    expect(
      schema,
      "the country column default is Bangladesh",
    ).toMatch(/country\s+String\s+@default\("Bangladesh"\)/);
    // The dead scaffolding must be GONE — banned by name so a re-leak of the
    // HomeNest-era default (copy/paste from the scaffold, a schema regen)
    // fails the same pin twice over.
    expect(schema, "no United States column default anywhere").not.toContain('@default("United States")');
  });

  it("S113-3a: the Coupon.type comment documents the full live vocabulary", () => {
    // The live vocabulary is percent | fixed | free_shipping (validation.ts
    // z.enum + coupons.ts redemption filter — S74-11's first-class
    // free_shipping type). The schema comment had drifted to the two
    // original types, misdocumenting the model for every future reader.
    expect(
      schema,
      "the coupon-type comment lists all three types",
    ).toMatch(/type\s+String\s+@default\("percent"\)\s*\/\/\s*percent \| fixed \| free_shipping/);
  });
});
