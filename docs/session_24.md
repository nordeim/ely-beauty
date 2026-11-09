# Session 24 Log (Run 84) — The Overlay-Input Parity & Self-Heal-Closure Cycle

The workspace survived the sandbox recycle (git pull 18aee4a → d2f20c0,
the operator's session-log commit adding session_23.md, the raw run-83
narrative) — node_modules, `.env`, the symlink-converged `db/`, and the
seeded database all intact. The cycle: gates re-validation → deep audit
84-a → live-reference re-measurement (which found the cycle's deltas) →
the Session 84 plan → TDD remediation (S84-1..S84-5, two RED mini-
cycles) → the end-to-end heal verification → screenshots → the docs
sweep → commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** Git pull to d2f20c0; re-read
   AGENTS.md, CLAUDE.md, README.md, PAD v2.11, ely-beauty_SKILL.md
   v2.11.0, session_22.md (the polished Run 83 log), session_23.md (the
   raw Run 83 narrative), the worklog tail, and the REMEDIATION_PLAN
   through Session 83. Run 83 complete and pushed @ 18aee4a; this
   cycle is Run 84. skills/ excluded from all checking per the operator
   contract; the web-application + code-review-checklist skills read
   for methodology.
2. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 698/698 unit ✓ · clean build ✓ · **90/90 e2e on
   the FIRST full run** — run 83's serialized admin-catalog project
   holding; no flake to reproduce this cycle.
3. **Deep audit 84-a** (read-only subagent): 12/12 standing anchors
   PASS, the run-83 change-set S83-1..S83-5 all correct, 0
   CRITICAL/HIGH/MEDIUM production-code defects — 1 MEDIUM (M-1: the
   self-heal discipline asymmetric — reused-server catalog dirt met the
   storefront count pins before the admin-catalog project could heal;
   S82-3 lacked the per-test heal), 1 LOW (L-1: the dollar-worded copy
   that survived the S83-5 USD sweep), 3 INFO.
4. **Live-reference re-measurement** (agent-browser, logged in, mobile
   390×844 + desktop 1440×900): every pinned surface GREEN and the
   reference unchanged — the mobile panel rows 89/125/161/197/233 with
   the S81-3 content byte-verified again (SEARCH + Shop → /shop,
   "Beauty Tools" → ?category=skincare, "Brush & Combs" →
   ?category=body_care, About → /about — labels AND hrefs),
   toggle-close, SEARCH-row → overlay (z-70, bg .95, blur 4px,
   Cormorant 18px/300), the "silk" set ($370.00/$288.00/$470.00/
   $520.00, cp 36, two decimals, Cormorant 14px/300, 80px rows, the
   Bonnet's no-desc row), route-change close, /shop "All Products" +
   19 one-page bonnet-first, the desktop nav hrefs, the desktop
   overlay input 24px/300 (column x:384 w:672), the detail ৳370 Inter
   24px/600 + "skincare" eyebrow, the footer template slugs
   (skincare/body_care/sets; --accent = --secondary = 30 15% 93%, so
   the row-hover class-name difference renders identically). The
   clone-side probe: 8/8 server checks, the panel 88/124/160/196/232
   (±1px), the overlay rows 4×80px byte-exact. **Two NEW micro-deltas
   measured on the overlay INPUT** — D-84-1: the reference's
   `font-light` (computed 300 on both viewports) vs the clone's
   default 400; D-84-2: the reference's /60-dimmed placeholder vs the
   clone's full opacity — plus **one clone-side glyph found on the
   typed row**: Chromium's native search-cancel button (pixel-cluster
   evidence at x300-309 @390px; the reference's plain-text input
   renders nothing between the typed text and the Close icon).
5. **The plan** (Session 84, S84-1..S84-5) appended to
   docs/REMEDIATION_PLAN.md, validated against the codebase (every
   change site named and pre-read), then executed TDD-first — **RED 5
   → GREEN**, then a second mini-cycle **RED 1 → GREEN** for the
   cancel-button suppression after the pixel-cluster evidence.

## The change-set (S84-1 .. S84-5)

- **S84-1 (D-84-1 + D-84-2, one line)**: the search overlay's input
  gains `font-light` and swaps `placeholder:text-muted-foreground` →
  `placeholder:text-muted-foreground/60`. Pinned by a new
  search-overlay component-test pin (with a negative-lookahead ban on
  the un-dimmed form — the bare utility is a substring of the /60
  form); the D-1b S75 pin updated for the new class order.
- **S84-1b (the native glyph)**: a scoped `globals.css` rule
  suppresses `input[type="search"]::-webkit-search-cancel-button` —
  `type="search"` stays (the searchbox role the e2e pins target), the
  Close button stays the sheet's only close affordance. Verified
  visually: the pixel clusters before the fix (26-41 icon / 61-83
  "silk" / 300-309 glyph / 343-352 Close) → after the fix only the
  icon, the text, and the Close remain.
- **S84-2 (audit M-1, the structural closure)**:
  `playwright.config.ts` gains `globalSetup` → `tests/e2e/
  global-setup.ts` probes :3100 and runs the idempotent
  `restore-demo-stock.ts` when a server is already listening (the
  reused-server case; a fresh start's restore stays the webServer
  command's own). **Verified end-to-end**: template + membership dirt
  seeded and confirmed LIVE on the reused standalone server (skincare
  count 11) → the storefront spec 22/22 GREEN (the heal fired before
  the readers) → the post-run state seed-clean (template skincare,
  memberships [beauty-tools], skincare 12).
- **S84-3 (audit M-1, the per-test symmetry)**: S82-3's opening
  self-heals a leftover cleared template — if the Template combobox
  reads None (the trigger renders None as both the null placeholder
  and the "none" item, so one textContent condition covers both dirt
  shapes), select Skincare + save + reopen through the gated helper.
  With S84-2 in place this is defense-in-depth: the harness-level heal
  covers the reused-server window; the per-test heal keeps the spec
  self-sufficient (the S20-1/S83-3 discipline).
- **S84-4 (audit L-1)**: the taka rewording — validation.ts's four
  money-bound messages ("under ৳1,000,000"), the coupon dialog's two
  fixed-value errors ("a taka amount of ৳0.01 or more" / "a taka
  amount, like 25.00"), and the two dollar-worded comments reworded
  (never quoting the banned literals in the fixing comments — the
  S83-5 trap-5 lesson).

## The verification

- **Gates (all observed green)**: lint ✓ · typecheck ✓ ·
  typecheck:tests ✓ · **704/704 unit** (+6) · clean build ✓ ·
  **90/90 e2e ×3 consecutive full-suite runs** (+ the cycle's opening
  first run = 4 total green e2e runs this session).
- **The overlay input, re-measured post-fix on both viewports**: 18px/
  300 mobile + 24px/300 desktop Cormorant, placeholder 0.6 alpha, the
  rows byte-exact ($370.00 family), the mobile panel 88/124/160/196/
  232 (±1px) unchanged.
- **Evidence**: 25 dev-server screenshots regenerated + validated
  (25/25, none undersized); `.env.example` re-verified (9/9 env vars —
  no new vars this cycle); the post-fix probe + the pixel-cluster
  analysis recorded in the REMEDIATION_PLAN execution log.
- **Docs sweep**: REMEDIATION_PLAN (checkboxes + execution log),
  AGENTS.md (the S84 e2e-ordering note), CLAUDE.md (704 pins), README
  (704 counts + badge), PAD v2.12, ely-beauty_SKILL.md v2.12.0
  (project_state + the Session 84 Appendix B entry), this log, worklog
  Task 78.

## Encoded traps (new this run)

1. A parity sweep is only as complete as its MEASURED axes — the
   overlay input's weight and placeholder opacity were never compared
   across five cycles of overlay pins (sizes, leadings, and geometry
   were). Add the axis to the pins the moment it is measured.
2. `reuseExistingServer` skips the webServer COMMAND entirely — any
   heal wired into the command never fires on a reused server;
   harness-level heals belong in globalSetup, not the webServer
   command.
3. A native widget glyph (the search-cancel button) is invisible to
   every DOM-level pin — pixel-cluster analysis of a screenshot is the
   evidence form that catches it.
4. Worded-copy remnants survive literal-grep sweeps (the S83-5
   patterns matched strings, not phrasing) — sweep the CONCEPT
   (currency wording), not just its symbols.
