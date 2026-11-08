# Session 12 Log (Run 78) — The Search-Overlay Reachability & Micro-Parity Cycle

The workspace had been reset between sessions, so this cycle started
from a fresh clone at `1ccecc5` (the operator's run-77 log commits).
The cycle: workspace refresh → docs review → environment convergence
(the documented ambient `DATABASE_URL` shadow, resolved with the
symlink) → gates re-validation → deep audit 78-a → live-reference
re-measurement → the Session 78 plan → TDD remediation
(S78-1..S78-10) → screenshots → the docs sweep → commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** Fresh clone (the sandbox had
   been recycled); re-read AGENTS.md, CLAUDE.md, README.md, PAD v2.5,
   ely-beauty_SKILL.md v2.5.0, docs/session_10.md,
   docs/session_11.md, docs/REMEDIATION_PLAN.md (through Session 77),
   worklog.md, the skills catalog + the web-application / tdd /
   agent-browser / tailwind-patterns / code-review-checklist skills.
   skills/ excluded from all checking per the operator contract.
2. **Environment.** `.env` created from `.env.example` (fresh
   AUTH_SECRET); `db/` at the repo root; the sandbox's ambient
   `DATABASE_URL=file:/home/z/my-project/db/custom.db` shadowed the
   repo `.env` — converged with the documented symlink (same inode),
   after which `db:setup` seeded the 19-product catalog and the
   standalone health probe went `db:up`.
3. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 599/599 unit ✓ · clean build ✓ · 77/77 e2e ✓
   (after installing the Playwright chromium binaries the fresh
   sandbox lacked). Docs' claimed state = reality.
4. **Deep audit 78-a** (read-only subagent; the web-application +
   code-review-checklist methodology): **9/9 standing code anchors
   PASS, 0 CRITICAL/HIGH code defects**; 3 MEDIUM (the overlay's
   result list has no scroll container — 8 capped rows overflow the
   664px e2e viewport permanently unreachable; the store-provider
   scroll-lock comment claims "any overlay" while the code locks
   panel+drawer only; CLAUDE.md still says "74 e2e") + 4 LOW (the
   overlay's missing dialog semantics + shell inert; two stale
   `backdrop-blur-sm` comments; the undocumented eslint-chain
   moderates in the ledger; the half-repaired S76-9 historical line)
   + 1 NIT accepted (LIKE wildcards — the reference behaves
   identically; escaping would diverge) + 2 INFO.
5. **Live-reference re-measurement** (agent-browser, both sites,
   390×844 + 1440×900, logged in): every S75/S76/S77 pinned surface
   re-verified GREEN byte-exact — **including the operator's
   mobile-menu priority surface** (panel y:64 h:214, 4×14px links
   @36px rhythm, the SEARCH row, toggle/navigate-close behaviors, the
   Tailwind v4 conditional-mount pattern). **FOUR new deltas
   measured on the search surface**: D-1 the list container (the
   reference's `mt-6 space-y-1 max-h-[60vh] overflow-y-auto` —
   scrollH 668 vs clientH 506 with 8 rows; the clone's uncapped
   `flex flex-col gap-1`); D-2 the 1-char floor (the reference
   returns its capped 8-row set for "e"; the clone floored at 2);
   D-3 the rows' 2px corners (its `rounded-md` under the shadcn
   radius scale); D-4 the no-results copy (`No products found for
   "zzzzq"` vs the clone's `No products match`).
6. **The plan** (Session 78, S78-1..S78-10) appended to
   docs/REMEDIATION_PLAN.md, validated against the codebase (every
   change site named and pre-read), then executed TDD-first (RED
   12 failing → GREEN).

## The change-set (S78-1 .. S78-10)

- **S78-1**: the overlay's result list gained the reference's scroll
  geometry — `mt-6 flex flex-col gap-1 overflow-y-auto max-h-[60vh]`
  (byte-exact: both sites cap at 506.4px @844vh; the 8-row
  broad-term list scrolls its own 668px inside the 506px box).
- **S78-2**: the search floor dropped to ONE character — the route's
  gate became `if (!q)` and the overlay's debounce floor `< 1`.
- **S78-3**: the rows gained `rounded-[2px]` (the reference's
  computed 2px, pinned as an arbitrary value — v4's default
  rounded-md is 6px and would drift).
- **S78-4**: the no-results copy matched the reference's exact
  shape (`No products found for "zzzzq".`).
- **S78-5**: the invisible a11y superset — `role="dialog"` +
  `aria-modal="true"` + `aria-label` on the overlay, and StoreChrome's
  shell inert widened to `cartDrawerOpen || searchOverlayOpen`.
- **S78-6**: comment accuracy — the scroll-lock comment states the
  real contract (the overlay deliberately does not lock — the
  reference does not either); the two stale `backdrop-blur-sm`
  comments corrected to `xs`.
- **S78-7**: docs-truth — CLAUDE.md's "74 e2e" corrected; the
  REMEDIATION_PLAN S76-9 garbled historical line repaired
  (`→ [main, v2, v3] for all 19 products`).
- **S78-8**: the dependency-risk ledger gained the accepted
  `@typescript-eslint/*` moderate chain (9 moderates, dev-only).
- **S78-9**: the docs sweep — AGENTS.md (the S78 search-surface
  contract), CLAUDE.md (613/79), README (counts + the search row +
  the reachability guard), PAD v2.6, ely-beauty_SKILL.md v2.6.0,
  this log, the worklog entry.
- **S78-10**: evidence — gates, re-measurement, screenshots, commit
  + push.

## Verification (all observed green)

- Gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · **613/613 unit**
  (60 files; +14 new pins) · clean build ✓ · **79/79 e2e** (+2: the
  mobile 8-row reachability guard — the capped list must scroll on
  the 664px viewport; the desktop scroll/dialog-geometry pin).
- The fixed surfaces re-measured GREEN against the live reference
  (computed styles, both viewports): the list container (mt-6,
  max-h 506.4px, overflow auto, the 668/506 scroll geometry —
  byte-exact), the 1-char "e" → 8 capped rows, the 2px row corners,
  the no-results copy, the dialog role + the shell-inert superset.
- The mobile navigation menu — the operator's priority surface —
  re-verified byte-exact (panel y:64 h:213/214, 4×14px links @36px
  rhythm, the SEARCH row opening the shared overlay, the panel
  staying open underneath, toggle/navigate-close behaviors), and
  the Tailwind v4 conditional-mount pattern holds (no JS-toggled
  display utilities anywhere).

## Deferrals / notes (the accepted-deviation ledger)

- The zod 3→4 and vitest 4→5 migrations stay planned epics
  (AGENTS.md's dependency-risk ledger now also documents the
  accepted `@typescript-eslint/*` moderate chain).
- The search prices render ৳ (the reference's `$370.00` is its own
  quirk — the standing currency deviation).
- The clone's scroll lock while the mobile panel is open stays (the
  invisible a11y superset); the full-screen search overlay
  deliberately does NOT lock scroll (the reference does not either)
  — the capped list scrolls instead since S78-1.
- LIKE wildcards (`%`/`_`) stay unescaped on the search surface —
  the live reference behaves identically (measured), so escaping
  would diverge; parameterized + take:8 bounded.
- The overlay's dialog semantics are the repo's invisible-superset
  lane, NOT reference parity (the reference ships none).
EOF
