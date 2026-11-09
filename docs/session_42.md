# Session 42 — Run 93: The Rotation-Atomicity & Credential-Single-Sourcing Cycle

The operator's standing instruction refreshed the workspace — `git pull` at `913c872` (run-92's code `2ec891b` plus the raw narrative `docs/session_41.md`). No NEW operator-side signal artifact this cycle (`start_server_log.txt` unchanged since run 92), so this ran as a standard verification/remediation cycle on the mature tree — run 93.

## Environment (the survived-workspace sequence)

The sandbox workspace SURVIVED from run 92: node_modules intact, `.env` carrying `DATABASE_URL="file:../db/custom.db"` + a generated `AUTH_SECRET`, `db/` at the repo root with the parent-shell shadow converged via hardlink (same inode verified). `npm install` → 0 vulnerabilities; a fresh reseed ran before the screenshot pass (`db:setup` → 19 products / 2 users / 3 coupons / 4 categories / 11 settings). Baseline gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · **749/749 unit** — the docs matched reality exactly.

## Audit 93-a and the findings that shaped the cycle

**Audit 93-a** (read-only subagent, `skills/` excluded, web-application + code-review-checklist methodology): **12/12 standing anchors PASS · R1–R8 (the run-92 regression surface) 8/8 PASS · 0 CRITICAL — 1 MEDIUM + 3 LOW + 4 INFO.**

- **MEDIUM-1 (the cycle's driver):** `changePasswordAction`'s rotation was THREE independent awaited writes (`db.user.update` → `db.session.deleteMany` → `createSession`) — a crash or SQLite write-lock timeout between the first two left the password CHANGED while every pre-change session stayed alive (the exact threat the rotation exists to kill) for up to the 30-day session TTL, and the user had no recovery path: a retry with the old current password fails the uniform error, and the app offers no forgot-password flow.
- **LOW-1:** the S92-2a credential single-sourcing missed `scripts/capture-screenshots.mjs` — three login sites + a track-order URL still hardcoded both demo pairs.
- **LOW-2:** `ely-beauty_SKILL.md`'s demo-account table still carried the pre-rename `@homenestkitchen.com` emails (stale since the run-72 re-skin).
- **LOW-3:** the S92-2e advisory detector burns a synchronous scrypt (~30–80 ms event-loop stall) on EVERY production dashboard render — including the post-rotation steady state.
- INFO-1/2/3/4: the no-JS account-form GET fallback (the pre-existing ProfileForm pattern — recorded), same-password rotation allowed (cryptographically harmless — recorded), a scheme-less `NEXT_PUBLIC_SITE_URL` fails fast (the documented posture), and the docs count lockstep verified current repo-wide.

## Live parity (mobile 390×844, reference logged in with the operator credentials)

Panel rows SEARCH/Shop/Beauty Tools/Brush & Combs/About at **reference 99/135/171/207/243 vs clone 98/134/170/206/242** (the −1px uniform tolerance; hrefs byte-identical) · the overlay input Cormorant Garamond 18px/300 with the 0.6-alpha placeholder both sites (the clone expresses the alpha as `lab(…/0.6)` — the same color) · the "silk" set reference 214/298/382/466 vs clone 213/297/381/465 (−1px ×4) with **$370.00/$288.00/$470.00/$520.00 byte-identical** · `/shop` 19 unique cards bonnet-first with h1 "All Products" both sites · the bonnet detail ৳370 Inter 24px/600 with ADD TO CART + BUY IT NOW active both. **Zero new parity deltas. Mobile navigation fully functional — no Tailwind v4 bug** (the panel is conditionally mounted; zero `classList` usage in src/, audit-verified).

The clone-side pass hit the **session-43 orphan-`next-server` trap once** — the fresh standalone server died on EADDRINUSE behind a stale `next-server (v16.4.5)` from the pre-rebuild session, serving wiped-chunk HTML (the login page rendered its error boundary). Killed by the documented `ss -tlnp` → PID ritual; the fresh server then served disk-verifiable chunks and every later pass ran clean.

## S93-1 — the transactional credential rotation (TDD)

RED (the compile-level module-miss, the S92-2b convention) → GREEN: `src/lib/credential-rotation.ts` — the `rotateCredentialInTx` seam on a structural client (the `growReviewAggregate` S13-4 convention; the caller owns the transaction boundary) — with `changePasswordAction` wrapping BOTH writes in one `db.$transaction(async (tx) => …)` and `createSession` AFTER the commit (its row + cookie are not transactional; a failure there is a benign full sign-out, not a security hole). **6/6 pins**: 3 seam (the update args, the deleteMany scope, rejection propagation with the second write unrun) + 3 action-source pins (the api-boundaries file-reading convention: the seam composed inside `$transaction`; `createSession` after the commit; the bare pre-S93-1 sequential-write shapes absent). The serialized e2e round-trip re-verified the flow live on the new path.

## S93-2 — the screenshot script joins the credential single-source

`git mv scripts/capture-screenshots.mjs scripts/capture-screenshots.ts`; the five hardcoded sites (two admin logins, the demo login, the checkout contact fill, the track-order URL via `encodeURIComponent`) compose from `src/lib/demo-credentials.ts`; the invocation becomes `npx tsx scripts/capture-screenshots.ts` (the `restore-demo-stock.ts` pattern). **The mid-fix lesson, root-caused before the workaround:** the first tsx run failed with 21 "Top-level await is currently not supported with the cjs output format" errors — tsx compiles the file as CommonJS because the repo's package.json carries no `"type": "module"` (the `.mjs` extension was the ESM signal). The body now lives in an async `main()` + `main().catch(...)`, with strict-mode typing throughout (Browser/Page/BrowserContext param types, unknown-in-catch guard, `as const` tuple loop, non-null device-descriptor assertions). Invocation references updated in AGENTS/README/SKILL ×4/DEPLOYMENT; `typecheck:tests` covers the file.

## S93-3 + S93-4 — the SKILL email drift and the advisory TTL

S93-3: the SKILL's demo table now reads `@elybeauty.com`, and `demo-credentials.ts`'s header lockstep list covers the four doc sites + the screenshot consumer. S93-4 (TDD, RED 8 → GREEN 8/8): the detector caches ONLY its negative verdict for 60 s (module state + `resetAdvisoryCacheForTests()`; `beforeEach` in the spec so state never leaks between pins) — the post-rotation steady state skips the per-render scrypt burn, while a POSITIVE verdict never caches, so the advisory clears on the very first render after the operator rotates; the exotic revert path (a DB restore) re-arms within the TTL.

## Verification

- **Gates, all green on the final tree:** lint ✓ · typecheck ✓ · typecheck:tests ✓ · **758/758 unit** (66 files, +9) · clean build ✓ (11/11 static pages) · **92/92 e2e ×2 consecutive** (2.4m + 2.4m).
- **Standing verifications:** sitemap **28 `<loc>`, 0 private paths** · **25/25 screenshots** regenerated from the live standalone server after the fresh reseed + the orphan-server ritual (8 changed: the known raster-noise + data-dependent family on the fresh-reseed state; both S92-2 surfaces re-verified through the live DOM — the dashboard advisory card with its `/account?tab=profile` link, and the password form's current/new fields with correct autocomplete tokens) · `.env.example` **9/9** (6 active + 3 commented, zero drift) · `npm audit` **0** (prod and full).

## Docs sweep

REMEDIATION_PLAN Session 93 (S93-1..S93-7 with the execution log) · worklog Task 87 · this log · README/CLAUDE counts 749 → 758 (badge, table, tree, commands, the CLAUDE pin list) · AGENTS.md (the S93-1 rotation-atomicity + S93-4 TTL notes in the password contract bullet, the capture-script invocation + single-source note, the session range) · PAD **v2.20** · **SKILL v2.19.0** (project_state lockstep).

**Lessons for the next cycle:** the tsx/CJS top-level-await trap (any new `scripts/*.ts` with top-level await needs the async-main shape — worth remembering before converting another `.mjs`); and the orphan-server ritual should run BEFORE the first server-dependent pass after ANY rebuild, not just before captures — it bit the parity pass first this cycle.
