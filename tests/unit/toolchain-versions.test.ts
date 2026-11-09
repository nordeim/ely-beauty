import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../..");

/**
 * S88 — the npm-audit retirement cycle (the operator's start_server_log.txt).
 *
 * The operator's fresh-install log reported 11 vulnerabilities (9 moderate,
 * 2 critical) — the run-86-recorded "accepted dev-only families" — plus a
 * Prisma CLI/runtime version skew ("Generated Prisma Client (v6.12.0)" from
 * a 6.12.0 CLI while the runtime client is 6.19.3). These pins hold the
 * three dependency invariants that keep both defects from creeping back:
 *
 *   S88-1  vitest ≥ 4.1.12 — carries @vitest/mocker 4.1.12 (patched; the
 *          vulnerable range is ≤4.1.11: GHSA-82fw-gwwq-j7x9 path traversal,
 *          GHSA-qxg6-89mg-rqv8 code injection) and DROPS tinypool entirely
 *          (vitest 3's direct tinypool dep is the only edge for the two
 *          critical prototype-pollution→RCE advisories GHSA-5gmw-xhrv-c9v3
 *          / GHSA-85c8-ppgw-ccpr).
 *   S88-2  the scoped minimatch override — @typescript-eslint/typescript-estree
 *          still declares minimatch ^10.2.2 (vulnerable 7.0.0–11.0.0,
 *          GHSA-g3hv-75wg-m249; the patch lives only in ≥11.0.1), so the
 *          npm overrides block pins the patched 11.x under it.
 *   S88-3  the prisma CLI and the @prisma/client runtime resolve to the
 *          SAME version — a skewed pair (CLI 6.12.0 generating the client
 *          that a 6.19.3 runtime executes) is a silent compatibility risk
 *          visible in every `db:setup` run.
 *
 * All assertions read package-lock.json (what actually installs), not just
 * package.json ranges — a caret range can keep a stale resolution forever.
 */

type LockPackage = {
  version?: string;
  dependencies?: Record<string, string>;
};

type Lockfile = {
  packages?: Record<string, LockPackage>;
  dependencies?: Record<string, { version: string }>;
};

const lock = JSON.parse(
  readFileSync(path.join(repoRoot, "package-lock.json"), "utf8"),
) as Lockfile;

const pkg = JSON.parse(
  readFileSync(path.join(repoRoot, "package.json"), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  overrides?: Record<string, unknown>;
};

const lockPackages = lock.packages ?? {};

/** Resolve the version of an installed package from the lockfile's packages map. */
function installedVersion(name: string): string | undefined {
  return lockPackages[`node_modules/${name}`]?.version;
}

/** Collect every installed version of a package, including nested copies. */
function allInstalledVersions(name: string): string[] {
  const prefix = `node_modules/${name}`;
  return Object.entries(lockPackages)
    .filter(([key]) => key === prefix || key.endsWith(`/node_modules/${name}`))
    .map(([, p]) => p.version)
    .filter((v): v is string => typeof v === "string");
}

/** Compare dotted versions numerically ("4.1.12" vs "4.1.9" — build-safe). */
function versionParts(v: string): number[] {
  return v.split(/[.-]/).map((part) => Number.parseInt(part, 10) || 0);
}

function isAtLeast(version: string, floor: string): boolean {
  const a = versionParts(version);
  const b = versionParts(floor);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av > bv;
  }
  return true;
}

/**
 * The vulnerable minimatch range for GHSA-g3hv-75wg-m249 is 7.0.0–11.0.0
 * inclusive (patched in ≥11.0.1; the legacy 3.x/5.x/6.x majors are below
 * the vulnerable floor and fine).
 */
function isVulnerableMinimatch(version: string): boolean {
  return isAtLeast(version, "7.0.0") && !isAtLeast(version, "11.0.1");
}

describe("S88-1 — the vitest advisory floor (tinypool + @vitest/mocker)", () => {
  it("locks vitest at ≥ 4.1.12 (mocker patched, tinypool dropped)", () => {
    const vitest = installedVersion("vitest");
    expect(vitest, "vitest must be present in the lockfile").toBeDefined();
    expect(
      isAtLeast(vitest as string, "4.1.12"),
      `vitest ${vitest} is below the advisory floor 4.1.12 (GHSA-82fw-gwwq-j7x9, GHSA-qxg6-89mg-rqv8)`,
    ).toBe(true);
  });

  it("declares the vitest floor in package.json so fresh installs cannot re-resolve a vulnerable major", () => {
    const declared = pkg.devDependencies?.vitest;
    expect(declared, "package.json must declare vitest in devDependencies").toBeDefined();
    const match = /^(\^|~)?(\d+)\.(\d+)\.(\d+)/.exec(declared as string);
    expect(match, `unparsable vitest range: ${declared}`).not.toBeNull();
    const base = `${match?.[2]}.${match?.[3]}.${match?.[4]}`;
    expect(
      isAtLeast(base, "4.1.12"),
      `package.json vitest ${declared} would allow a re-resolve below 4.1.12`,
    ).toBe(true);
  });

  it("has no tinypool ≤ 2.1.1 anywhere in the lockfile (the critical RCE gadgets)", () => {
    const versions = allInstalledVersions("tinypool");
    for (const v of versions) {
      expect(
        isAtLeast(v, "2.1.2"),
        `tinypool ${v} is vulnerable (GHSA-5gmw-xhrv-c9v3, GHSA-85c8-ppgw-ccpr)`,
      ).toBe(true);
    }
  });

  it("has no @vitest/mocker ≤ 4.1.11 anywhere in the lockfile", () => {
    const versions = allInstalledVersions("@vitest/mocker");
    for (const v of versions) {
      expect(
        isAtLeast(v, "4.1.12"),
        `@vitest/mocker ${v} is vulnerable (GHSA-82fw-gwwq-j7x9, GHSA-qxg6-89mg-rqv8)`,
      ).toBe(true);
    }
  });
});

describe("S88-2 — the scoped minimatch override (the eslint chain)", () => {
  it("pins the override in package.json (the drift alarm)", () => {
    const scoped = pkg.overrides?.["@typescript-eslint/typescript-estree"] as
      | { minimatch?: string }
      | undefined;
    expect(
      scoped,
      "the scoped overrides entry for @typescript-eslint/typescript-estree must stay declared",
    ).toBeDefined();
    expect(scoped?.minimatch).toMatch(/^\^?11\./);
  });

  it("has no minimatch in the vulnerable 7.0.0–11.0.0 range anywhere in the lockfile", () => {
    const versions = allInstalledVersions("minimatch");
    expect(versions.length, "minimatch should exist in the tree").toBeGreaterThan(0);
    for (const v of versions) {
      expect(
        !isVulnerableMinimatch(v),
        `minimatch ${v} is in the vulnerable range 7.0.0–11.0.0 (GHSA-g3hv-75wg-m249)`,
      ).toBe(true);
    }
  });
});

describe("S88-2b — the scoped deepmerge-ts override (the prisma CLI chain)", () => {
  // @prisma/config (the prisma 6.13+ CLI's config loader) declares
  // deepmerge-ts 7.1.5 EXACT — every 7.x is vulnerable to GHSA-ggr8-5vv4-36mx
  // (stack exhaustion merging recursive object graphs; the patch is the v8
  // recursion limits). Its only usage is the stable named export
  // (`const { deepmerge } = await import("deepmerge-ts")`), so the scoped
  // override to ^8 is surgical; prisma 7 (the CLI's own fix) is out of scope.
  it("pins the override in package.json (the drift alarm)", () => {
    const scoped = pkg.overrides?.["@prisma/config"] as
      | { "deepmerge-ts"?: string }
      | undefined;
    expect(
      scoped,
      "the scoped overrides entry for @prisma/config must stay declared",
    ).toBeDefined();
    expect(scoped?.["deepmerge-ts"]).toMatch(/^\^?8\./);
  });

  it("has no deepmerge-ts < 8.0.0 anywhere in the lockfile", () => {
    const versions = allInstalledVersions("deepmerge-ts");
    for (const v of versions) {
      expect(
        isAtLeast(v, "8.0.0"),
        `deepmerge-ts ${v} is vulnerable (GHSA-ggr8-5vv4-36mx)`,
      ).toBe(true);
    }
  });
});

describe("S88-3 — the prisma CLI ↔ runtime alignment", () => {
  it("resolves prisma and @prisma/client to the same lockfile version", () => {
    const cli = installedVersion("prisma");
    const client = installedVersion("@prisma/client");
    expect(cli, "prisma CLI must be present").toBeDefined();
    expect(client, "@prisma/client must be present").toBeDefined();
    expect(
      cli,
      `prisma CLI ${cli} and @prisma/client ${client} must never skew — a skewed pair ` +
        "(the 6.12.0 CLI generating the client a 6.19.3 runtime executes) is the " +
        "operator-log-visible compatibility risk",
    ).toBe(client);
  });

  it("declares matching package.json floors for prisma and @prisma/client", () => {
    const cliRange = pkg.dependencies?.prisma;
    const clientRange = pkg.dependencies?.["@prisma/client"];
    expect(cliRange).toBeDefined();
    expect(clientRange).toBeDefined();
    // Both floors must be identical so a fresh resolve never re-skews them.
    expect(cliRange).toBe(clientRange);
  });
});
