# Session 14 Log (Run 79) — The Overlay Focus-Management, Fresh-Sheet & Body-Hardening Cycle

The workspace SURVIVED between sessions (no sandbox reset), so this
cycle started from `git pull` at `1b46d3a` (the run-78 session-log
commit). The cycle: workspace refresh → docs review → gates
re-validation → deep audit 79-a → live-reference re-measurement (incl.
the operator's mobile-menu priority surface) → the Session 79 plan →
TDD remediation (S79-1..S79-10) → screenshots off the dev server →
the docs sweep → commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** `git pull` (fast-forward to
   `1b46d3a`); re-read AGENTS.md, CLAUDE.md, README.md, PAD v2.6,
   ely-beauty_SKILL.md v2.6.0, docs/session_12.md,
   docs/session_13.md, worklog.md, the REMEDIATION_PLAN through
   Session 78, the skills catalog + the web-application /
   code-review-checklist methodology. skills/ excluded from all
   checking per the operator contract.
2. **Environment (survived)**: `node_modules`, `.env`
   (`DATABASE_URL="file:../db/custom.db"`), and `db/custom.db` at the
   repo root all present; the ambient `DATABASE_URL` shadow remains
   converged via the documented symlink (same inode).
3. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 613/613 unit ✓ · clean build ✓ · 79/79 e2e ✓
   — the docs' claimed state matched reality exactly.
4. **Deep audit 79-a** (read-only subagent; the web-application +
   code-review-checklist methodology): **12/12 standing code anchors
   PASS, 0 CRITICAL/HIGH code defects**; 2 MEDIUM (the search
   overlay never restores focus on close — the repo's own CartDrawer
   modal standard does; and every JSON API route parses
   `request.json()` UNBOUNDED with the rate limiter engaging only
   AFTER the parse — 9 route files / 10 parse sites) + 5 LOW (no
   Tab-wrap on the overlay; the close button/input lack the drawer's
   focus-visible treatments; the header's search button carries
   neither aria-expanded nor aria-haspopup; AGENTS.md's stale
   kitchen-catalog fragment; the "14 metered sites" rate-limit grid)
   + 6 INFO (the overlay's persisted state across reopen, the
   transient no-results copy during debounce, LIKE wildcards —
   accepted parity, the db:push shell-env trap — documented, no
   docs-counts gate, session-log hygiene).
5. **Live-reference re-measurement** (agent-browser 0.41.2, both
   sites, 390×844 + 1440×900, logged in with the operator
   credentials): every S74..S78 pinned surface re-verified GREEN —
   **including the operator's mobile-menu priority surface** (panel
   y:64 h:212-214 inside the fixed 278px header, inner `px-6 py-6
   space-y-4`, 4 links 14px/1.4px/20px @36px rhythm, the SEARCH row
   opening the shared overlay, the bar staying transparent while
   open). The shop pills (5×34px, 0-radius, 16px thumbs, solid
   active), the detail anatomy (gallery + SIZE-variant row + ADD TO
   CART / BUY IT NOW + Complete the Ritual), and the footer map all
   matched. **TWO new deltas measured on the search surface**: D-1
   the row price rides the DISPLAY SERIF (the reference's computed
   "Cormorant Garamond" 14px/300 right-aligned on BOTH viewports —
   the clone rode Inter) and D-2 the reference RESETS the overlay on
   close/reopen (query "" + 0 rows — the clone persisted the previous
   query + results). The reference's `$370.00` overlay pricing
   re-confirmed as the documented standing ৳ deviation (S77); its
   footer SHOP column links legacy slugs (skincare / body_care) its
   own Category entity API does not know — the clone's working-links
   superset is the deliberate kept deviation (INFO, recorded).
6. **A finding retracted mid-cycle (the discipline working)**: the
   CartDrawer's Tab-wrap selector READ as `aref]` through the bash
   output pipeline — invalid CSS that would throw on every Tab
   keydown. Byte-level verification (`'aref]' in src` → False,
   `'a[href]' in src` → True, git-clean) proved the file always
   carried the correct `a[href]`: the `[h`-eating display artifact
   the run-78 log had already recorded. The hand-transcribed jsdom
   probe (which threw, as expected for the mangled string) never read
   the file. No code change; the layout-tokens pin stays as a
   regression guard; the environment lesson is re-encoded in the
   SKILL's trap log.
7. **The plan** (Session 79, S79-1..S79-10) appended to
   docs/REMEDIATION_PLAN.md, validated against the codebase (every
   change site named and pre-read), then executed TDD-first (RED 12
   failing → GREEN).

## The change-set (S79-1 .. S79-10)

- **S79-1 (D-1)**: the overlay's row price gained `font-display` —
  the reference's computed Cormorant 14px/300, right-aligned flow
  unchanged (text-sm font-light kept). E2E pins the computed
  font-family contains "Cormorant".
- **S79-2 (D-2)**: the fresh sheet — the overlay resets `query` +
  `results` when it closes. The reset rides the render-time prev-open
  adjustment ("storing information from previous renders"); the first
  draft put it in an effect and the repo's
  `react-hooks/set-state-in-effect` lint correctly rejected it (the
  carousel trap note generalizes). Clearing `query` also drops any
  in-flight typeahead response through the debounce cleanup's
  `cancelled` flag. The stale "re-mounts fresh" comment now states
  the real contract.
- **S79-3 (A-1)**: `openerRef` capture at the open flip + focus
  restoration on close — the CartDrawer's modal contract, now on
  both chrome modals (the focused input used to unmount with the
  sheet and drop focus to `<body>`).
- **S79-4 (A-3 + A-4)**: the overlay gained the drawer's Tab-wrap
  keydown handler (scoped to the overlay element) +
  `focus-visible:ring-2 focus-visible:ring-ring` on the close button
  + a paired visible focus treatment on the input.
- **S79-5 (the aref] phantom — retracted)**: see (6) above. No code
  change; the source pin forbids the mangled form forever.
- **S79-6 (A-5)**: the header's search button gained
  `aria-expanded={searchOverlayOpen}` + `aria-haspopup="dialog"` (the
  menu + cart buttons already carried the pair).
- **S79-7 (A-2)**: the bounded JSON body seam — `src/lib/json-body.ts`
  (`parseJsonBody`): non-`application/json` content-types refused
  (all first-party clients + tests already send it — swept before
  enforcing), declared content-length over 32 KB fast-fails, streamed
  bodies past the cap are cancelled mid-read, malformed JSON returns
  null (the routes' byte-identical 400 envelope). All 9 JSON route
  files migrated (no `request.json()` call remains — source-pinned);
  the per-route limiters moved BEFORE the parse so garbage is
  metered. **A latent TEST flaw surfaced and fixed**: the
  api-boundaries `post()` helper placed the per-test IP in the
  LEFTMOST (spoofable) xff hop — every request funneled into ONE
  shared 198.51.100.1 bucket, masked by the old parse-before-limit
  order (invalid bodies never consumed budget). The helper now
  places the per-test IP in the RIGHTMOST (trusted) hop the clientIp
  contract reads.
- **S79-8 (A-6 + A-7)**: AGENTS.md docs-truth — the kitchen-catalog
  fragment rewritten for the ElyBeauty 19-product bonnet-first
  authored order; the rate-limit grid corrected to the 15 real sites
  (incl. stripe-intent 10/10min); the "session-2..77" range → 79.
- **S79-9 (docs sweep)**: this log, the worklog Task 73 entry, the
  REMEDIATION_PLAN Session 79 section + execution log, AGENTS.md
  (the S79 contract lines + the Zod-boundary seam note), CLAUDE.md
  (634/82), README (counts), PAD v2.7, ely-beauty_SKILL.md v2.7.0
  (project_state + the Session 79 Appendix B entry).
- **S79-10 (evidence)**: every fixed surface verified — the serif
  price + fresh-sheet + focus restoration are e2e-pinned against the
  production build; the mobile panel re-measured byte-exact (±1px)
  via `scripts/measure-parity.mjs`; 25 screenshots regenerated off
  the DEV server (`npm run dev` + the capture script in one
  invocation — all 25 ✓); full gates green.

## Gates (all observed green)

lint ✓ · typecheck ✓ · typecheck:tests ✓ · **634/634 unit** (61
files; +21: the overlay pins ×6, the layout-token S79 pins ×7, the
json-body truth table ×8) · clean build ✓ · **82/82 e2e** (+3: the
serif-price computed-style pin, the fresh-sheet + focus-restoration
pin, the header-button dialog-state pin).

## Encoded traps (new this run)

1. The bash output pipeline EATS `[h`-shaped fragments — a selector
   that displays as `aref]` may actually be `a[href]`. Verify source
   bytes with the Read tool or a Python probe; a hand-transcribed
   "repro" of a mangled string proves nothing about the file.
2. Parity includes STATE LIFECYCLES, not just geometry — the
   reference's reset-on-reopen was invisible until close/reopen was
   actually exercised on the live site.
3. `react-hooks/set-state-in-effect` is right: prop-change resets
   belong in the render-time adjustment pattern, not effects.
4. Reordering a limiter before a parse changes WHICH requests consume
   budget — audit every test that shares an IP bucket when you do it
   (the shared-bucket helper flaw was masked for 27 sessions).
5. Price fonts are part of the measured surface: the reference
   renders the overlay price in the display serif while the shop/
   detail pages ride the body font — measure per-surface.
