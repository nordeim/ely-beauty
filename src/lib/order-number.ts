/**
 * Order numbers (run-72) — the ElyBeauty format observed live:
 * `ELY-` + 8 uppercase base36 characters (e.g. ELY-MW774C50).
 *
 * Crypto-random (not sequential): the reference's shape carries no sequence
 * information, so numbers cannot be enumerated by walking a counter. The
 * UNIQUE column + the checkout retry loop keep collisions impossible to
 * observe (a P2002 on `number` retries with a fresh candidate).
 */
import { randomInt } from "node:crypto";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export const ORDER_NUMBER_PREFIX = "ELY-";
export const ORDER_NUMBER_BODY_LENGTH = 8;

/** Generate one candidate: ELY-XXXXXXXX (uppercase base36-ish, crypto-random). */
export function generateOrderNumber(): string {
  let body = "";
  for (let i = 0; i < ORDER_NUMBER_BODY_LENGTH; i++) {
    body += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${ORDER_NUMBER_PREFIX}${body}`;
}

/** Structural check used by tests and admin tooling. */
export function isOrderNumberFormat(value: string): boolean {
  return new RegExp(`^${ORDER_NUMBER_PREFIX}[A-Z0-9]{${ORDER_NUMBER_BODY_LENGTH}}$`).test(value);
}
