# Session 7 Log (Run 76) — The Clean-Build Recovery & Card-Anatomy Parity Cycle

The workspace survived between sessions; `git pull` landed the operator's
session-log commit (`1f8aea5`, docs-only: `docs/session_7.md` — the run-75
narration capture). This cycle: workspace refresh → docs review → gates
re-validation → **the pulled tree FAILED the clean build** → the S76-0 fix →
deep audit 76-a → live-reference re-measurement → the card-anatomy
remediation (S76-1..S76-12) → screenshots → the docs-truth sweep → commit +
push.

## The cycle in order

1. **Workspace refresh + docs review.** Pulled to `1f8aea5`; re-read
   AGENTS.md, CLAUDE.md, README.md, PAD v2.3, ely-beauty_SKILL.md v2.3.0,
   docs/session_6.md (the run-75 log), docs/session_7.md (the operator's
   run-75 narration), docs/REMEDIATION_PLAN.md (through Session 75),
   worklog.md. skills/ excluded from all checking per the operator contract.
2. **Gates on the pulled tree.** lint ✓ · typecheck ✓ · typecheck:tests ✓ ·
   563/563 unit ✓ — then `rm -rf .next && npm run build` **FAILED**:
   `CssSyntaxError: globals.css:2:135421: Missed semicolon`.
3. **F-0 root-caused (the pushed run-75 tree does not build clean).**
   Tailwind v4's automatic candidate scan reads EVERY non-gitignored text
   file — .md prose included. The run-75 docs sweep wrote the banner class
   into FOUR doc files with a colon (`md:aspect-[3:1]` — CLAUDE.md, PAD
   v2.3, docs/session_6.md, ely-beauty_SKILL.md); the scan compiled that
   candidate to `aspect-ratio:3:1` (invalid CSS) and the production
   build's PostCSS pass died. Run-75's final "build green" was a
   stale-cache false-green (the docs sweep ran after the last real CSS
   compile; Turbopack's cache reused the pre-sweep module). Reproduced
   standalone AND via a temporary postcss parse-dump hook (the failing
   construct: `.md\\:aspect-\\[3\\:1\\]{aspect-ratio:3:1}`). **S76-0 fix**:
   the `@source not` guard in globals.css (docs/, skills/ — the operator
   contract excludes it from compilation anyway; its SKILL.md examples were
   also leaking dead rules like `.text-\\[clamp(...)\\]` into the bundle —
   tests/, scripts/, `**/*.md`, `**/*.mdx`), the four doc typos → the slash
   form, and `tests/unit/tailwind-scan-guard.test.ts` (3 pins). Clean build
   green; 74/74 e2e green on the fixed tree.
4. **Deep audit 76-a** (read-only subagent, the web-application +
   code-review-checklist methodology): **9/9 standing code anchors PASS**,
   0 CRITICAL/HIGH/MEDIUM; 2 LOW (docs count drift 563→566; a debug
   leftover) + 3 NIT + 3 INFO. The audit's own controlled experiment
   proved the guard load-bearing (stripping `@source not` re-leaks the
   colon-form rule).
5. **Live-reference re-measurement** (agent-browser computed styles on BOTH
   sites, 390×844 + 1440×900; logged in). Frame surfaces re-verified GREEN
   (header/panel/hero/banner/sections/catalog-order/search). The audit's
   F-3 "doubled hairline" claim DISPOSED against the live DOM (the
   reference renders both hairlines). **12 new deltas measured**: the /shop
   grid gaps (16/40 vs 24/24+32/48), the card text-block anchoring (pt/leading/mt-auto),
   the product h1 scale (36 vs 48 @lg), the square-vs-pill size chips, the
   40px-vs-36px swatches, the 60×80-vs-64×80 thumbs, the non-home border-t,
   the bonnet's badge/description data, and the 1-vs-3..7 gallery image
   counts.
6. **The plan** (Session 76, S76-1..S76-12) appended to
   docs/REMEDIATION_PLAN.md with the measured-values table, validated
   against the codebase (every change site read; the schema's
   `shortDescription @default("")` and the badge's admin-owned semantics
   checked), then executed TDD-first (RED 10 unit + 3 e2e failing → GREEN).

## The change-set (S76-1 .. S76-12)

- **S76-1**: the /shop grid → `gap-6 lg:gap-x-8 lg:gap-y-12` (24/24 mobile,
  32/48 desktop — the reference's rhythm, same as the curated grid).
- **S76-2**: the ProductCard text block — `pt-4`, default name leading
  (20px), flow price (mt-auto retired; no-desc cards trail ~20px inside the
  row-normalized 447px card — the reference's exact anatomy).
- **S76-3**: the product h1 → `text-4xl lg:text-5xl` (36/48 at the lg
  breakpoint; lh 1.0 @lg — the reference's measured heading scale).
- **S76-4**: the size chips → 38px PILLS (radius-full, 1px border; active
  solid foreground + IVORY text — white was the remnant).
- **S76-5**: the color swatches → 36px with the reference's double ring
  (border-2 fg + background-2px/foreground-4px shadows; inactive the 1px
  black/15 ring).
- **S76-6**: the gallery thumbs → `aspect-[4/5] w-16` (64×80).
- **S76-7**: the non-home header gains `border-t` (the 66px mobile bar box;
  the open panel lands at y:65 like the reference).
- **S76-8**: the seed content — the bonnet's badge → null (seed + the
  one-off live-DB UPDATE — badge is admin-owned), six reference-true
  no-description products → `shortDescription: ""`, and the product page's
  metadata falls back `shortDescription || description`.
- **S76-9**: the galleries — 38 variants generated through the run-72
  brand pipeline (`scripts/gen-gallery-variants.mjs`); the VLM coherence
  review kept 9 generated sets and replaced 10 drifted sets with PIL detail
  crops (coherent by construction). All 19 products ship VLM-verified
  3-image galleries; the rail renders on every product page.
- **S76-10**: the splitWordmark JSDoc clause, BD-flavored address-dialog
  placeholders, the guard comment's src/**/*.md note.
- **S76-11**: the docs sweep (counts 576/77, this log, worklog, README,
  AGENTS, CLAUDE, PAD v2.4, SKILL v2.4.0).
- **S76-12**: evidence — gates, re-measurement, 25 screenshots, commit +
  push.

## Verification (all observed green)

- Gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · **576/576 unit** (57
  files; +13 new pins) · clean build ✓ · **77/77 e2e** (+3 geometry pins).
- The fixed surfaces re-measured GREEN against the live reference
  (computed styles, both sites): the /shop grid 48px 32px with 363×447
  cards + 48px row gaps (byte-exact); the mobile card 159×283 @ 24px gap
  (byte-exact); the card anatomy (name @+16/20, price @+44, the bonnet
  name+price only); the h1 48/48/300; the pill chips (38px, active fg +
  ivory); the swatches (36px double ring); the thumbs 64×80 @16 below the
  544×725 main; the non-home header 82px desktop (80+2).
- VLM coherence: 19/19 product galleries verified (9 generated + 10
  crop-based detail views).
- Screenshots: 25/25 regenerated in one clean pass.

## Deferrals / notes (the accepted-deviation ledger)

- The gallery image COUNT ships a uniform 3 per product (the reference
  varies 3-7; its counts are data noise) — recorded as the count
  deviation; the imagery remains the documented independently-generated
  deviation.
- The reference's search-results dropdown formats prices as `$370.00` (a
  reference quirk); the clone renders ৳ — the honest brand treatment
  (standing deviation).
- The clone's scroll lock while the panel is open stays (the invisible
  a11y superset).
- Environmental (encoded in the plan's execution log): the Tailwind .md
  scan class (S76-0 closes it); the stale `node_modules/.cache/jiti`
  breaking Turbopack's next/font import map (clear node_modules/.cache +
  .next); the S44 process-survival note still holds (background image
  generation died between shell invocations — run long jobs foreground in
  idempotent chunks).
EOF
