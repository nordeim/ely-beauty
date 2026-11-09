# Session 38 — Run 91: The API force-Dynamic Consistency & Verification Cycle

The operator's standing instruction refreshed the workspace — a fresh clone at `68a8a23` (run-90's code `8a36e75` plus two docs commits, including the operator's `docs/session_37.md` raw narrative of run-90). No new operator-side signal artifacts (no build_error.txt / start_server_log.txt update), so this run opened as a standard verification cycle with the operator's named focus surfaces: the DATABASE_URL contract, the mobile navigation (the Tailwind v4 concern), the Vitest + Playwright suites, and the sitemap/SEO posture.

## Environment rebuild (the fresh-sandbox sequence)

npm install (582 packages) · `.env` written with `DATABASE_URL="file:../db/custom.db"` · `db/` created at the repo root · the parent-shell `DATABASE_URL` shadow (`file:/home/z/my-project/db/custom.db`) converged via the documented symlink (`/home/z/my-project/db` → `<repo>/db` — the AGENTS.md sandbox-trap ritual) · `db:setup` green (19 products, 2 users, 3 coupons — the file landing at `<repo>/db/custom.db`, the A1 contract holding) · Playwright's chromium headless-shell installed (the documented run-88 fresh-sandbox gap — without it the e2e run fails 79 tests on `browserType.launch`).

## The audit and the operator's named surfaces

**Audit 91-a** (read-only subagent, skills/ excluded): **12/12 standing anchors PASS, R1–R8 (the run-88..90 regression surface) all PASS, 0 CRITICAL/HIGH/MEDIUM/LOW — 3 INFO.** The five CONFIG_FALLBACKS byte-exact; npm audit 0 (prod and full); the zod-4 idioms, the lockfile toolchain pins, and the Tailwind v4 trap scan all verified clean (zero `classList` usage in src/; every `hidden` token a static responsive pair; the mobile panel conditionally mounted).

The operator's named surfaces, verified live:

- **DATABASE_URL**: the `.env` contract + the db-path seam resolve ONE file at `<repo>/db/custom.db` for CLI push, seed, dev, build and the standalone server (audit A1 with file:line evidence; the health route round-tripping `{"db":"up"}` on the standalone build). No code change was required — the single-seam design was already the documented and implemented contract.
- **Mobile navigation (Tailwind v4)**: the live parity pass measured the clone's panel rows at 98/134/170/206/242 vs the reference's 99/135/171/207/243 — the recorded −1px uniform tolerance, hrefs byte-identical, SEARCH + four links on both. The trap scan found no JS-toggled display utilities anywhere in src/. The mobile-navigation e2e spec (the regression guard) green in both runs. **No Tailwind v4 bug present.**
- **Vitest + Playwright**: both suites present and green — 737 unit (64 files) before the fix, 90 e2e ×2 consecutive after it.
- **Sitemap/SEO**: 28 `<loc>` public-only (9 static + 19 active products), robots disallowing `/admin /account /checkout /api`, noindex on all ten private surfaces, canonicals site-wide, escaped JSON-LD.

**Live parity (mobile 390×844, logged in with the operator credentials):** the overlay input Cormorant 18px/300 with the /0.6-alpha placeholder both sites; the "silk" result set 213/297/381/465 vs 214/298/382/466 (−1px ×4) with $370.00/$288.00/$470.00/$520.00 on both; /shop 19 unique cards bonnet-first with h1 "All Products" on BOTH sites; the bonnet detail ৳370 Inter 24px/600 with ADD TO CART + BUY IT NOW active on both (the S90-4 restock holding). **Zero new parity deltas.**

## S91-1 — the force-dynamic sweep (the audit's one actionable finding)

11 of 13 API route files lacked `export const dynamic = "force-dynamic"` (only the two Stripe routes declared it). Zero behavioral impact today — Next 15+/16 leaves request-reading handlers uncached by default — but the family SKILL §6 idiom is the explicit declaration, and a future edit that stops reading the request (a parameterless GET, say) would silently become static-cached without it.

TDD: RED — a new source-scan describe in `tests/unit/api-boundaries.test.ts` (the e2e-infrastructure/layout-tokens file-reading convention) reads every `src/app/api/**/route.ts` and asserts the declaration; it failed listing the 11 files. GREEN — the two-line export added to each (a surgical 2-lines-per-route diff), the declaration placed after the import block following the Stripe routes' convention. 22/22 in the file; the pin now guards all 13 route files file-wide.

## Verification

- **Gates, all green on the final tree:** lint ✓ · typecheck ✓ · typecheck:tests ✓ · **738/738 unit** (64 files, +1 pin) · clean build ✓ (11/11 static pages) · **90/90 e2e ×2 consecutive** (2.3m + 2.4m).
- **Standing verifications:** sitemap **28 `<loc>`, 0 private paths** · **25/25 screenshots** regenerated from the live standalone server (6 changed: the known raster-noise + data-dependent family — `git status` showing real changes, the run-90 dead-server lesson applied) · `.env.example` 9/9 (6 active keys + 3 commented opt-ins, matching the codebase's env reads exactly) · `npm audit` 0 (prod and full).
- **Environmental lessons re-confirmed:** the fresh-sandbox Playwright browser gap (79 launch failures → `npx playwright install chromium` → 90/90); the background-process kill (the sandbox reaps children when a tool-call shell exits — server + measurement must share one invocation).

## Docs sweep

REMEDIATION_PLAN Session 91 (S91-1..S91-6 with the execution log) · worklog Task 85 · this log · README/CLAUDE count rows 737 → 738 · PAD **v2.18** (revision block: the force-dynamic convention + the named-surface verifications) · AGENTS.md (the force-dynamic route-file convention note) · **SKILL v2.17.0** — its `project_state` was still the run-88 record (735) after run-90 moved the count to 737; the count-lockstep convention enforced retroactively with the current 738 state.

**Lessons for the next cycle:** the SKILL `project_state` went two runs stale without anyone noticing — the count-lockstep sweep should include the SKILL frontmatter, not just README/CLAUDE; and the fresh-sandbox browser-install gap is now a two-run pattern — consider a doctor-style check at cycle open.
