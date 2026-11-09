The workspace exists. Let me set up a task plan and refresh the workspace.
Working tree is clean and on main. Let me pull the latest and survey the docs structure.
Pull brought in `docs/session_41.md` (new). Workspace is now current. Let me check file sizes before reading.
Session 40/41 cover run-92 (production-deploy hardening). This session will be run-93. Let me read the full AGENTS.md from persisted output and the other core docs.
Nested persistence is awkward — let me read AGENTS.md directly in chunks.
I have the AGENTS.md contracts. Now let me quickly review README, CLAUDE.md heads, worklog tail, and REMEDIATION_PLAN Session 92 structure.
Now let me check for new operator-side signals and the REMEDIATION_PLAN structure.
No new operator signal beyond session_41.md (run-92 raw narrative). This cycle is run-93 — a standard verification/remediation cycle. Let me validate the environment state.
Environment survived from the previous session. Let me verify the parent-shell DATABASE_URL shadow convergence (the documented sandbox trap).
Same inode — the shadow is converged via hardlink. Environment is intact. Let me run npm install and reseed the DB fresh for a clean run-93 baseline.
Fresh seed complete. Now the baseline gate chain (lint, typechecks, unit tests).
All baseline gates green: lint ✓ · typecheck ✓ · typecheck:tests ✓ · **749/749 unit** — matches the documented run-92 state. Now let me find the standing anchors list for the audit.
The anchors are re-derived each audit from the docs. Let me check the repo's skills catalog to select the audit methodology skills.
I have the methodology. Now let me dispatch the deep audit subagent (read-only, skills/ excluded) — audit 93-a — while I prepare the live parity pass.
**Audit 93-a complete: 12/12 anchors PASS · R1-R8 PASS · 0 CRITICAL/HIGH · 1 MEDIUM + 3 LOW + 4 INFO.** Key findings: non-atomic password rotation (MEDIUM-1), screenshot-script credential hardcoding (LOW-1), stale SKILL.md demo emails (LOW-2), per-render scrypt burn (LOW-3).

Now the live parity pass — the operator's priority surface. Let me load the agent-browser skill.
agent-browser is ready. Let me start the reference-side parity measurement — login first.
Logged in. Now set the mobile viewport and measure the nav panel geometry.
Panel link rows at 135/171/207/243 — matching pins. Let me measure the SEARCH row (a button).
**Reference panel: 99/135/171/207/243 — byte-exact to documented pins.** Now the search overlay "silk" set.
The panel is open. Let me click the panel's SEARCH row (@e60) to open the overlay.
The reference overlay is open (no role=dialog — the documented superset note confirmed). Let me measure the input directly.
Input: Cormorant 18px/300 + 0.6-alpha placeholder ✓. Silk rows at 214/298/382/466 ✓ (documented pin). Now prices:
Prices byte-identical: $370/$288/$470/$520. Now /shop and the detail page.
**Reference fully matches all documented pins — zero new deltas.** Now the clone-side pass: build first.
Server up: health db:up, /shop h1 "All Products". Now the clone-side parity measurement in one invocation (the session-44 lesson).
The clone login page hit its error boundary. Let me diagnose from the server log.
**The documented session-43 orphan-server trap, live**: my fresh server died on EADDRINUSE — an orphan `next-server` from a previous build holds :3000 and serves stale chunks. Executing the documented PID-kill ritual.
Fresh server owns :3000. Verifying served chunks exist on disk (the documented spot-check), then re-running login.
Chunk exists — my path check was wrong (`/_next/` vs `.next/`). Server is fresh. Re-running the clone login.
Login page renders now (orphan confirmed as root cause). Logging in with the seeded demo account for state parity.
The clone uses the documented a11y superset label "Open menu". Clicking it:
**Clone panel: 98/134/170/206/242 vs reference 99/135/171/207/243 — the documented −1px uniform tolerance, hrefs byte-identical. Mobile nav fully functional, no Tailwind v4 bug.** Now the clone overlay.
Clone overlay input: Cormorant 18px/300 + 0.6-alpha (lab form) + the dialog/type=search supersets ✓. Now the silk set:
Clone silk set: 213/297/381/465 (−1px uniform) with identical $-prices. Now clone /shop + detail.
The detail page is open. Let me quickly visually verify the shop cards render text (my DOM extraction may just be structurally blind), then measure the detail pins.
Shop grid renders correctly (19 products, bonnet-first). Now the detail page pins:
**Parity pass complete — zero new deltas. Mobile nav fully functional, no Tailwind v4 bug.** Now let me examine the MEDIUM-1 finding's code to plan the TDD fix.
Let me study the established fakeDb mock convention in session17-hardening.test.ts.
The conventions are clear. Let me examine the screenshot script's hardcoded credentials (LOW-1) and how it's invoked.
`scripts/**/*.ts` is already in tsconfig.tests.json — the conversion is clean. Let me find all references to the .mjs script.
Now let me check the advisory's dashboard call site for the LOW-3 caching design.
Let me check how existing lib seams type `$transaction` clients (the addresses lib uses interactive transactions).
The repo convention is clear (lib seam + action-owned interactive `$transaction`). Let me check the source-scan pin convention in api-boundaries.test.ts.
All conventions confirmed. Now let me write the Session 93 remediation plan. First, check the file tail.
Plan appended. Now **S93-1 TDD RED** — the failing pins for the rotation seam:
**RED confirmed** (module doesn't exist — the compile-level RED convention). Now GREEN — the seam:
Seam GREEN 3/3. Now wire the action through the transactional seam:
Now update the action's doc comment to reflect the transactional contract, and add the source pin:
Now the source pin (the api-boundaries file-reading convention) holding the action-side composition:
**S93-1 GREEN: 6/6.** Now S93-2 — convert the screenshot script to TypeScript with single-sourced credentials.
The .ts conversion needs strict typing (noImplicitAny). Let me read the full script.
Let me check restore-demo-stock.ts for the established script-typing idioms (catch handling, etc.).
Now let me check the ESLint config for rules that would affect the conversion (non-null assertions, etc.).
Now writing the converted TypeScript script:
Typecheck passes. Now update the invocation references across the docs:
S93-2 complete. Now S93-3 — the SKILL.md demo-email drift + lockstep list:
S93-3 done. Now **S93-4 TDD RED** — the advisory TTL-cache pins:
**RED confirmed** (8 failed — `resetAdvisoryCacheForTests` doesn't exist). GREEN — the TTL cache:
**S93-4 GREEN: 8/8.** All remediations implemented. Now the intermediate gates:
**758/758 unit (+9)**. Now the production build, then e2e ×2:
**E2E run 1: 92/92** — the password round-trip exercised the new transactional rotation live. Run 2:
**E2E double-green: 92/92 ×2.** Now S93-6 standing verifications — orphan-server ritual first, fresh reseed, then sitemap + screenshots in one invocation:
Sitemap 28/0-private ✓, robots ✓. Now the capture run (server + capture in one invocation per the session-44 lesson):
Root cause: the repo's package.json has no `"type": "module"` — tsx compiles to CJS, which forbids top-level await. `restore-demo-stock.ts` works because it wraps everything in `main()`. Applying the same pattern:
The body needs re-indentation inside main(). Let me fix that precisely:
**25/25 captured, zero failures.** Verifying the changed set and file integrity:
8 changed (the known raster-noise + data-dependent family). Let me verify the advisory + password surfaces via the live DOM (the run-92 approach):
Both S92-2 surfaces verified live with the new TTL cache in place. Completing the standing verifications:
All standing verifications green. Now the docs sweep — first find all count references (749 → 758):
Updating the live count references (README ×4, CLAUDE ×1) — PAD's historical records stay untouched:
Now the SKILL version bump + project_state lockstep:
Now the PAD revision block. Let me find the current revision history:
PAD v2.20 done. Now AGENTS.md — the rotation contract bullet + session range:
Now fill the REMEDIATION_PLAN Session 93 execution log:
Now the worklog Task 87:
Now the polished session log — docs/session_42.md:
Final gate chain on the complete tree before commit:
All gates green on the final tree. Now the commit — first review the change set:
Commit `f6aba96` clean (25 files). Now the SSH wrapper push — reading the procedure doc first:
I have the procedure. Let me check the environment (ssh binary / existing shim / paramiko):
No system ssh, but the paramiko shim exists in the workspace bin/. Let me verify it:
The shim is functional. Now the push sequence — key materialization, fingerprint sanity check, dry-run:
Dry-run green — auth verified, fast-forward confirmed. Real push:
## Run 93 complete — pushed to `main` @ `f6aba96` (remote verified; key shredded; no new branches)

**Cycle:** workspace refreshed (`git pull` → `913c872`, run-92 code + the raw narrative `session_41.md`) → docs review → baseline gates green (749/749 unit — docs matched reality) → **audit 93-a** (read-only, `skills/` excluded, web-application + code-review-checklist): **12/12 standing anchors PASS · run-92 surface R1–R8 8/8 · 0 CRITICAL — 1 MEDIUM + 3 LOW + 4 INFO, all substantive findings remediated**:

- **S93-1 (MEDIUM-1, TDD)**: the password rotation was three independent writes — a crash between them could leave the password changed with all old sessions alive. Now ONE `$transaction` via the new `rotateCredentialInTx` seam (+6 pins; e2e round-trip re-verified live).
- **S93-2**: `capture-screenshots.mjs` → `.ts`, the last hardcoded demo-credential consumer, now single-sourced (the tsx/CJS top-level-await lesson root-caused and fixed with the async-`main()` pattern).
- **S93-3**: SKILL.md's stale pre-rename `@homenestkitchen.com` demo emails fixed.
- **S93-4 (TDD)**: the admin advisory's scrypt burn is now TTL-cached on the negative verdict (+3 pins; positives never cached so it clears instantly on rotation).

**Parity vs the live reference (mobile 390×844, logged in): zero new deltas** — panel rows within the −1px tolerance with byte-identical hrefs, overlay/silk/shop/detail pins byte-consistent; **mobile nav fully functional, no Tailwind v4 bug**.

**Gates:** lint · typecheck · typecheck:tests · **758/758 unit (+9)** · clean build · **92/92 e2e ×2 consecutive** · sitemap 28 public-only · 25/25 screenshots · `.env.example` 9/9 · npm audit 0.

**Docs:** REMEDIATION_PLAN Session 93 · worklog Task 87 · `docs/session_42.md` · README/CLAUDE counts 758 · AGENTS.md contracts · PAD v2.20 · SKILL v2.19.0.

Verified vs. Reasoned: all gate/parity/verification claims above were executed and observed live this cycle; the audit's failure-mode analysis for S93-1 remains Reasoned (the crash window itself is not reproducible on demand).
