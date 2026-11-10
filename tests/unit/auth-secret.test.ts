import { describe, expect, it } from "vitest";

import { assertAuthSecret } from "@/lib/auth-secret";

describe("assertAuthSecret", () => {
  it("accepts a strong secret in production", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "a-long-random-production-secret-key" }),
    ).not.toThrow();
  });

  it("throws in production when AUTH_SECRET is missing", () => {
    expect(() => assertAuthSecret({ NODE_ENV: "production" })).toThrowError(/AUTH_SECRET/);
  });

  it("throws in production when AUTH_SECRET is empty", () => {
    expect(() => assertAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "" })).toThrowError(/AUTH_SECRET/);
  });

  it("throws in production when AUTH_SECRET is still the documented dev constant", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "insecure-dev-only-secret-change-me" }),
    ).toThrowError(/AUTH_SECRET/);
  });

  // S97-1 (audit 97-a N1): the gate used to reject only missing/empty/
  // dev-fallback — a 1-character non-fallback secret passed in production
  // and then keyed the session-cookie HMAC and the order-access tokens.
  // The floor matches the README's documented generation command
  // (`openssl rand -hex 32`): anything shorter than 32 chars refuses.
  it("throws in production when AUTH_SECRET is shorter than 32 chars (a 1-char secret is not strong)", () => {
    expect(() => assertAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "x" })).toThrowError(
      /AUTH_SECRET/,
    );
  });

  it("throws in production when AUTH_SECRET is 31 chars (just under the floor)", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "a".repeat(31) }),
    ).toThrowError(/AUTH_SECRET/);
  });

  it("accepts a 32-char secret in production (the floor, inclusive)", () => {
    expect(() =>
      assertAuthSecret({ NODE_ENV: "production", AUTH_SECRET: "a".repeat(32) }),
    ).not.toThrow();
  });

  it("allows the dev fallback in development and test", () => {
    expect(() => assertAuthSecret({ NODE_ENV: "development" })).not.toThrow();
    expect(() => assertAuthSecret({ NODE_ENV: "test" })).not.toThrow();
    expect(() => assertAuthSecret({})).not.toThrow();
  });
});
