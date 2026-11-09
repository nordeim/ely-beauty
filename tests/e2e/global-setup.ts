/**
 * Playwright globalSetup — the S84-2 pre-run catalog heal (session 84,
 * audit 84-a M-1).
 *
 * The run-83 discipline was asymmetric: the webServer command restores
 * the demo catalog (stock + the membership/template wiring) only on a
 * FRESH server start, but `reuseExistingServer` skips the command
 * entirely — so on a reused server, an aborted prior run's catalog dirt
 * (a leftover dual membership, a cleared template) is observed by the
 * desktop-chromium storefront count pins BEFORE the admin-catalog
 * project runs and heals. The run-83 flake class, in its narrowest
 * residual form.
 *
 * This module closes the window structurally: it runs BEFORE any
 * project. When something is already listening on :3100 (the
 * reused-server case) it runs the idempotent restore script; a fresh
 * start's restore stays the webServer command's own (the probe finds
 * nothing and returns without healing — the command restores before the
 * server process starts). Worst case, with the server up first, the
 * restore runs once more sequentially — idempotent, never concurrent
 * with itself.
 */
import { execSync } from "node:child_process";
import net from "node:net";

const HOST = "127.0.0.1";
const PORT = 3100;

function serverListening(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: HOST, port: PORT });
    const done = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(1500, () => done(false));
    socket.on("connect", () => done(true));
    socket.on("error", () => done(false));
  });
}

export default async function globalSetup(): Promise<void> {
  if (!(await serverListening())) {
    // Nothing answering on :3100 — a fresh start is coming, and the
    // webServer command restores the catalog before the server process
    // starts. Nothing to do here.
    return;
  }
  // A server is already listening (the reused-server case): heal the
  // catalog now, before any project runs.
  execSync("npx tsx scripts/restore-demo-stock.ts", { stdio: "inherit" });
}
