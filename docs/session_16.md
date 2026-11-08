# Session 16 Log (Run 80) — The Overlay Empty-State, No-Results Centering & Webhook Raw-Body Cycle

The workspace had been RESET (fresh clone at `8feb3d1` — the run-79
session-log commit), so this cycle rebuilt the environment from zero:
`npm install` → `.env` from the example (AUTH_SECRET generated — the
production build refuses the dev fallback) → `npm run db:setup` → the
ambient `DATABASE_URL` shadow converged via the documented symlink
(same inode at `<repo>/db/custom.db`). The cycle: environment rebuild →
docs review → gates re-validation → deep audit 80-a → live-reference
re-measurement (incl. the operator's mobile-menu priority surface) →
the Session 80 plan → TDD remediation (S80-1..S80-6) → screenshots off
the dev server → the docs sweep → commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** Fresh clone (HEAD `8feb3d1`,
   main); re-read README, AGENTS.md (commands, the DATABASE_URL
   contract, the Tailwind v4 trap log, the architecture invariants),
   CLAUDE.md (headers), PAD v2.7, ely-beauty_SKILL.md v2.7.0 (the
   project_state), docs/session_14.md, docs/session_15.md (the run-79
   raw notes), worklog.md, the REMEDIATION_PLAN through Session 79.
   skills/ excluded from all checking per the operator contract.
2. **Environment rebuild (fresh clone)**: `npm install` (12 advisories
   — the documented accepted ledger, unchanged) · `.env` from the
   example with a generated `AUTH_SECRET` (the build's module-load
   gate threw on the empty example value — the documented production
   refusal working as designed) · `db:setup` (19 products / 4
   categories / 11 settings / 3 coupons seeded) · the ambient
   `DATABASE_URL=file:/home/z/my-project/db/custom.db` shadow
   converged via the documented symlink (`/home/z/my-project/db/
   custom.db` → `<repo>/db/custom.db`, same inode) so the CLI and the
   runtime open ONE file regardless of which env wins.
3. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 634/634 unit ✓ · clean build ✓ · 82/82 e2e ✓
   (after installing the Playwright chromium headless shell the
   mobile-navigation project needs) — the docs' claimed state matched
   reality exactly.
4. **Deep audit 80-a** (read-only subagent; the web-application +
   code-review-checklist methodology): **12/12 standing code anchors
   PASS, 0 CRITICAL/HIGH code defects** — 1 LOW (the Stripe webhook
   buffered the full body BEFORE signature verification: unbounded
   `request.text()` on an unauthenticated, unmetered route —
   memory-amplification DoS on a Stripe-configured deploy; the
   unconfigured default 400s before any read so the demo build is
   unaffected) + 3 INFO (the npm-audit family phrasing; LIKE
   wildcards — documented accepted parity; the two window-scoped
   Tab-wrap listeners — unreachable double-open through the inert
   shell). Secrets sweep clean; no injection/XSS/path-traversal/
   auth-bypass findings; the run-79 S79-1..S79-10 fixes all verified
   present and correctly implemented.
5. **Live-reference re-measurement** (agent-browser 0.41.1, logged in
   with the operator credentials, mobile 390×844 + desktop): every
   S74..S79 pinned surface re-verified GREEN — **including the
   operator's mobile-menu priority surface** (panel y:64 h:214, rows
   14px/1.4px uppercase @36px rhythm 125/161/197/233 — the clone
   measures 64/213 and 124/160/196/232, ±1px) — the overlay's
   Cormorant input 18px/300, the serif row price 14px/300 ($ the
   documented standing deviation), the fresh-sheet reset on reopen,
   the 60vh-capped 8-row list, the detail-page Inter 24px ৳ price,
   and **the shop catalog order 19/19 positions identical to the
   seed's authored order — the run-79 "re-baseline if the reference
   re-orders" concern closed**. **TWO new deltas measured on the
   reference's EMPTY/FAILURE states**: D-80-1 the empty-query hint
   (`Start typing to search our collection`, class
   `text-sm text-muted-foreground py-8 text-center`, 14px centered,
   84px box — the state a fresh open AND the fresh-sheet reset land
   on; the clone rendered NOTHING on empty) and D-80-2 the
   no-results copy's exact bytes (`No products found for "zzzzq"` —
   straight ASCII quotes codepoint 34, NO trailing period, the SAME
   centered py-8 family; the clone's curly quotes + period +
   left-aligned pt-4 were the un-measured residue).
6. **The [h-eating display artifact struck AGAIN, twice** — first on
   the audit's S79-5 read-back, then on THIS session's own parity
   probes: a layout-tokens pin and a chrome selector both DISPLAYED
   as mangled through the bash pipeline while the files carry the
   correct bytes. Byte-level verification (JSON.stringify +
   codePointAt listing — the only trustworthy probe form) proved
   both correct; no phantom findings were actioned. The trap log's
   lesson re-validated: codepoint-level probes, always.
7. **The plan** (Session 80, S80-1..S80-6) appended to
   docs/REMEDIATION_PLAN.md, validated against the codebase (every
   change site named and pre-read), then executed TDD-first (RED 16
   failing → GREEN).

## The change-set (S80-1 .. S80-6)

- **S80-1 (D-80-1)**: the overlay renders the reference's hint at
  query `""` — `Start typing to search our collection` with
  `py-8 text-center text-sm text-muted-foreground`. It is gated on
  the QUERY (not results): a fresh open AND the S79-2 fresh-sheet
  reset land on it, and it disappears the moment the query becomes
  non-empty. Pinned by 4 unit tests + 2 e2e specs.
- **S80-2 (D-80-2)**: the no-results copy is the reference's exact
  bytes — `No products found for "query"` with straight ASCII quotes
  (the `&quot;` entity — `react/no-unescaped-entities` forbids the
  raw form in JSX text, and the entity renders the identical
  codepoint), no trailing period, and the centered py-8 style (the
  hint's own class family; the left-aligned pt-4 rhythm retired).
  Codepoint-verified against the live reference's DOM. Pinned by the
  rewritten S78-4 unit pin + 2 new unit tests + 1 e2e spec (computed
  text-align + padding + the exact codepoints).
- **S80-3 (audit 80-a L-1)**: the bounded RAW-body seam —
  `readRawBody(request, cap)` in `src/lib/json-body.ts` (the shared
  `readBodyTextBounded` byte-walk extracted under both seams): a
  declared content-length over the 64 KB cap fast-fails before any
  read, a streamed body past the cap is CANCELLED mid-read, `string |
  null` keeps the webhook's 400 family, and NO content-type gate
  (constructEvent needs the exact raw bytes and owns the payload's
  meaning). The webhook route migrated from `request.text()`; null
  renders 400 `Payload too large.` — an unauthenticated POST can no
  longer force full buffering before constructEvent can reject the
  signature. Pinned by the 7-case raw-body truth table + the source
  pins (no `request.text()` outside the seam module). The zod 3→4
  migration epic remains documented deferred debt (a major-version
  schema migration deserves its own dedicated cycle).
- **S80-4 (docs sweep)**: AGENTS.md (the S80 contract lines + the
  raw-body seam note + the session-2..80 range), CLAUDE.md (650/85),
  README (counts), PAD v2.8 (the revision block), ely-beauty_SKILL.md
  v2.8.0 (project_state + the Session 80 Appendix B entry), this log,
  the worklog Task 74 entry, the REMEDIATION_PLAN Session 80
  execution log.
- **S80-5 (evidence)**: 25 screenshots regenerated off the DEV server
  (`npm run dev` + the capture script in one invocation — all 25 ✓,
  dimensions + non-blank ratios validated); the clone-side hint +
  no-results + panel verified against the live reference's
  codepoints/styles via the standalone build.
- **S80-6 (verification)**: `.env.example` re-verified against every
  code-referenced env var (DATABASE_URL, AUTH_SECRET,
  NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_DEMO_MODE, TRUST_CF_CONNECTING_IP,
  the Stripe quartet — all present, optional ones commented);
  final full gate chain green.

## Gates (all observed green)

lint ✓ · typecheck ✓ · typecheck:tests ✓ · **650/650 unit** (61
files; +16: the hint ×4, the centered no-results ×2, the raw-body
truth table ×7, the source pins ×3) · clean build ✓ · **85/85 e2e**
(+3: the fresh-open hint, the fresh-sheet-lands-on-the-hint, the
straight-quote centered no-results).

## Encoded traps (new this run)

1. The bash pipeline's `[h`-eating artifact struck this session's OWN
   probes — a codepoint-level probe (JSON.stringify + codePointAt
   listing) is the only trustworthy verification for quote-bearing
   strings; a raw `includes()` result displayed through bash proves
   nothing.
2. Parity includes the EMPTY state: what a surface renders at its
   zero-content state (the hint) is as much a measured surface as
   its results and failure copy.
3. A `Request` body can be read ONCE — a test that exercises a body
   seam twice must mint two Request objects (`ReadableStream is
   locked` after the first read).
4. `react/no-unescaped-entities` forbids raw quotes in JSX text; the
   `&quot;` entity renders the identical codepoint, and source pins
   must assert the ENTITY form (asserting the raw-quote form would
   fail against the lint-clean source).
