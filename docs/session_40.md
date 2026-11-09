# Session 40 — Run 92: The Production-Deploy Hardening Cycle

The operator's standing instruction refreshed the workspace — a fresh clone at `df631f1` (run-91's code `554d211` plus two docs commits, including the raw narrative `docs/session_39.md`). The NEW operator-side signal: `docs/start_server_log.txt` records a full **production deployment to `https://ely-beauty.jesspete.shop`** — the operator's `.env` sets `NEXT_PUBLIC_SITE_URL=https://ely-beauty.jesspete.shop` and a real `AUTH_SECRET`, and their field session ran `rm -rf .next`, `npm install` (0 vulnerabilities), `db:setup` (Prisma Client 6.19.3, the 19-product catalog), `npm run build` (11/11 static pages, Next.js 16.4.5 Turbopack) and `npm run start` (standalone, Ready) — all green. This cycle opened as a deployment-posture audit of that signal.

## Environment rebuild (the fresh-sandbox sequence)

npm install (582 packages) · `.env` written with `DATABASE_URL="file:../db/custom.db"` **plus a generated `AUTH_SECRET`** (the production build's `assertAuthSecret` refuses to start without one — the first build attempt of the cycle failed on exactly that module-load assertion, the contract working as designed) · `db/` created at the repo root · the parent-shell `DATABASE_URL` shadow converged via the documented symlink · `db:setup` green (19 products, 2 users, 3 coupons) · Playwright's chromium headless-shell installed (the documented fresh-sandbox gap).

## The deployed site, verified live from this sandbox

`https://ely-beauty.jesspete.shop` round-tripped before any code was touched: home HTTP 200 · `/api/health` `{"status":"ok","db":"up"}` · `/shop` 200 with h1 "All Products" and 19 product cards · `sitemap.xml` **28 `<loc>` on the custom domain** (9 static + 19 products) · `robots.txt` with the four disallows and the sitemap pointer · canonical + og:url on the custom domain · JSON-LD Organization + WebSite · the full security-header set (per-request CSP nonce with strict-dynamic, HSTS includeSubDomains, Permissions-Policy, X-Frame-Options DENY, nosniff, strict-origin referrer). The field deploy is healthy — the cycle's findings are about what the deploy EXPOSED, not what it broke.

## Audit 92-a and the findings that shaped the cycle

**Audit 92-a** (read-only subagent, skills/ excluded): **12/12 standing anchors PASS, the run-91 force-dynamic regression surface CLEAN (13/13 route files), 0 CRITICAL — 1 HIGH + 1 MEDIUM + 2 LOW + 3 INFO.** Gates observed on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 738/738 unit ✓ · npm audit 0/0.

- **HIGH-1 (operational, the cycle's driver):** the seeded default admin credentials (`admin@elybeauty.com` / `Admin123!`) are LIVE on the public domain — the operator's `db:setup` seeded them into the production deploy, and the app had **no password-change surface anywhere** (`updateProfileAction` covers name/phone only), so there was no UI path to fix it.
- **MEDIUM-1 (operational):** `TRUST_CF_CONNECTING_IP` defaults to trust — on a DIRECT (non-Cloudflare) deploy the client-forgeable `cf-connecting-ip` header mints fresh per-IP rate-limit buckets. The default is the documented session-6 invariant for CF-fronted deploys; the fix is deploy guidance, not a silent flip.
- **LOW-1 (code):** `siteBaseUrl()` does not trim — a whitespace-only `NEXT_PUBLIC_SITE_URL` is truthy and would 500 every page (`new URL()` throws) while the baked sitemap emits broken origins.
- **LOW-2 (docs):** DEPLOYMENT.md had no single custom-domain walkthrough and never stated that **sitemap.xml/robots.txt are prerendered at build time** — editing the site URL without a rebuild diverges them from the per-request canonicals.
- INFO-1/2/3: the JSON-LD origin-only image absolutization (documented pattern), the in-memory single-process limiter (documented), and the standalone `.env` copy verified in Next's write-standalone-directory (positive confirmation). No action.

## Live parity (mobile 390×844, both sites logged in)

Panel rows SEARCH/Shop/Beauty Tools/Brush & Combs/About at **99/135/171/207/243 — byte-identical on both sites in this environment** (the historical −1px clone delta was cross-environment rounding, not layout; hrefs byte-identical) · overlay input Cormorant Garamond 18px/300 with the 0.6-alpha placeholder both sites · the "silk" set reference 174/258/342/426 (panel-closed state) vs clone 173/257/341/425 (−1px uniform) with $370.00/$288.00/$470.00/$520.00 byte-identical · /shop 19 unique cards bonnet-first with h1 "All Products" both sites · the bonnet detail ৳370 Inter 24px/600 with ADD TO CART + BUY IT NOW active both sites (the S90-4 restock holding). The reference's account page carries only ORDER HISTORY — the clone's profile/addresses tabs remain the documented supersets, and the new password surface joins them. **Zero new parity deltas.**

## S92-1 — the siteBaseUrl whitespace hardening (TDD)

RED: two pins in `tests/unit/seo-ld.test.ts` (whitespace-only → the localhost fallback; surrounding whitespace → trimmed before the trailing-slash strip) failed 2/14. GREEN: the `?.trim()` in `siteBaseUrl()` — the `db-path.ts` trim convention — 14/14.

## S92-2 — the password-change surface + default-credential advisory (TDD, the centerpiece)

Five pieces, each test-first where a unit seam exists:

- **(a) `src/lib/demo-credentials.ts`** — the seeded demo credentials single-sourced. The same email/password pairs lived in three places (the login page's quick-fill, `prisma/seed.ts`, the e2e helpers); all four consumers now compose from one module (a fourth consumer arrives in (e)). Zero behavior change — the seed re-ran green.
- **(b) `changePasswordSchema`** (`src/lib/validation.ts`) — the NEW password rides the register `passwordSchema` (8–128 chars) so the two surfaces can never drift; the CURRENT password only needs to be present (its correctness is verified by the action against the stored hash, not by shape). RED 4 pins → GREEN (65/65 in the file).
- **(c) `changePasswordAction`** (`src/lib/actions/auth.ts`) — session-required (actions are public HTTP endpoints; the page redirect is not the gate), rate-limited with the login pattern (`change-password:` per-email 10/min + `change-password-ip:` per-IP 30/min — a wrong current password burns real scrypt CPU), the current password verified with a single uniform inline error, the new one scrypt-hashed, and **every session row for the user deleted then a fresh one created** — the rotation signs out every OTHER device while this browser keeps the new cookie (the standard secure behavior for a credential change).
- **(d) the `PasswordForm` island** (`account/password-form.tsx`, the ProfileForm pattern: toast + inline error + pending-disable + form reset on success, correct `current-password`/`new-password` autocomplete tokens) wired as the account Profile tab's second card.
- **(e) the advisory** — `isDefaultAdminPasswordActive()` (`src/lib/admin-password-advisory.ts`, the structural-client mock convention; RED 5 pins → GREEN 5/5: default verifies / rotated / no admin / null hash / malformed hash) powers the admin-dashboard `role="alert"` **"Default admin password active"** card, gated on production posture (`!demoModeEnabled()` — in dev the demo credentials are the advertised workflow), linking to `/account?tab=profile`. The detector is failure-tolerant at the call site (`.catch(() => false)` — an advisory must never take the console down).

**The e2e layer (S92-2f) and its two mid-cycle lessons.** The round-trip spec (change → old password stops authenticating → new works → wrong-current error → seed restored, with an opening self-heal for an aborted prior run) landed in its OWN spec file: under `fullyParallel: true` a concurrent demo login inside the change→restore window would fail, so `password-change.spec.ts` joins the serialized `admin-catalog` project (`workers: 1`, after every read-only project — the S83-1 pattern extended to a password mutation), with the `e2e-infrastructure` source pin updated in the same commit. The first run failed at the alternate-password re-login — root-caused live before touching anything: **React 19 resets uncontrolled form inputs after EVERY action completion** (both login boxes come back empty after a failed submission), so the retry POSTed an empty email; the fix re-fills BOTH fields and documents the behavior in-spec. The advisory gets its own e2e on the production-posture e2e server (the exact dangerous configuration — production build, demo mode off, default admin password): the card, the link target, and the password form's fields are asserted. **92/92 ×2 consecutive.**

## S92-3 — the DEPLOYMENT.md custom-domain section

New §6 "Custom-domain production deploy (the run-92 workflow)": the 7-step verified walkthrough (domain/TLS proxy → the env pair + the `TRUST_CF_CONNECTING_IP` edge-topology decision → db:setup → build → start → **rotate the admin password** → verify), the **baked-sitemap trap** callout (sitemap/robots prerender at build time; editing `NEXT_PUBLIC_SITE_URL` without a rebuild silently diverges them from the per-request canonicals), and the demo-credentials note extended with the S92-2 UI path. §7–§9 renumbered.

## Verification

- **Gates, all green on the final tree:** lint ✓ · typecheck ✓ · typecheck:tests ✓ · **749/749 unit** (65 files, +11) · clean build ✓ (11/11 static pages) · **92/92 e2e ×2 consecutive** (2.4m + 2.5m).
- **Standing verifications:** sitemap **28 `<loc>`, 0 private paths** · **25/25 screenshots** regenerated from a live standalone server (7 changed: the two NEW surfaces — the dashboard advisory, the account password card — plus the known raster-noise + data-dependent family; both new surfaces re-verified through the live DOM) · `.env.example` 9/9 against the codebase's env reads (zero drift) · `npm audit` 0 (prod and full) · the deployed jesspete.shop site verified live.
- **The screenshot pass's mid-cycle incident, root-caused:** 13 capture failures were the session-43 orphan-`next-server` trap recurring — the renamed `next-server (v16.4.5)` child held :3000 across rebuilds (`pkill -f "standalone/server.js"` misses it; the fresh server died on EADDRINUSE; the orphan served HTML referencing wiped chunks → ChunkLoadError → the auth/account/admin surfaces failed hydration while cached public pages rendered). Killed by PID per the documented `ss -tlnp` ritual, then 25/25 clean.

## Docs sweep

REMEDIATION_PLAN Session 92 (S92-1..S92-8 with the execution log) · worklog Task 86 · this log · README/CLAUDE counts 738 → 749 unit and 90 → 92 e2e (badge, table, tree, commands, the CLAUDE pin list + e2e project note) · AGENTS.md (the password-rotation contract bullet, the S92-2f serialized-project note, the session range) · CLAUDE.md (the S92-2 project standard) · PAD **v2.19** · **SKILL v2.18.0** (project_state lockstep).

**Lessons for the next cycle:** the React-19 form-reset behavior (uncontrolled inputs clear after every action completion — re-fill every field before a resubmission) deserves a SKILL trap-log entry; and the session-43 orphan-server ritual should be run BEFORE any server-dependent pass after a rebuild, not after the failures surface — the trap has now bitten two screenshot cycles.
