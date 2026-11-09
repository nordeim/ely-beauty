# Session 22 Log (Run 83) — The E2E Concurrency-Isolation & USD-Remnant Cycle

The workspace SURVIVED the sandbox recycle (git pull a201bf0 → 3d567ad,
the operator's session-log commit adding session_21.md) — node_modules,
`.env`, the symlink-converged `db/`, and the seeded database all intact.
The cycle: gates re-validation (which surfaced the cycle's discovery) →
deep audit 83-a → live-reference re-measurement → the Session 83 plan →
TDD remediation (S83-1..S83-5) → the self-heal verification →
screenshots → the docs sweep → commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** Git pull to 3d567ad; re-read
   AGENTS.md, CLAUDE.md, README.md, PAD v2.10, ely-beauty_SKILL.md
   v2.10.0, session_20.md (the polished Run 82 log), session_21.md (the
   raw Run 82 narrative), the worklog tail, and the REMEDIATION_PLAN
   through Session 82. Run 82 complete and pushed @ a201bf0; this
   cycle is Run 83. skills/ excluded from all checking per the operator
   contract; the web-application + code-review-checklist skills read
   for methodology.
2. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 691/691 unit ✓ · clean build ✓ — and the e2e
   suite **reproduced a 2-failure flake in 2 of 6 full runs** (both
   victims green in isolation, in the 2-file combo, and on the
   following runs). The docs claimed 90/90; the code was unchanged
   since run 82's verified 90/90 push — a genuine concurrency race,
   not a regression.
3. **The root-cause isolation** (full error evidence captured on the
   second reproduction): three failure modes, one family —
   - **Mode 1 — the ungated post-search Edit click.** The admin
     products search is a native GET form; `search.press("Enter")`
     navigates, and the spec's four search-then-click sequences
     clicked the Edit button (a client island) while that navigation
     was still in flight. The observed failure: `expect(dialog).
     toBeVisible()` timing out with the call log showing the
     `?q=Gua+Sha` navigation still finishing — the click landed on the
     outgoing document or the new one pre-hydration, the dialog never
     opened, and the test aborted MID-MUTATION leaving durable catalog
     dirt (the Gua Sha's Bestsellers membership) behind.
   - **Mode 2 — observable mutation windows.** S81-11 holds
     bestsellers at 5 and S82-3 holds skincare at 11 for the seconds
     each test spends navigating the public storefront to verify its
     edit — windows the parallel storefront count pins ("4 products" /
     "12 products") landed inside.
   - **Mode 3 — the same-product clobber** (found by audit 83-a): both
     tests full-row-upsert the SAME Gua Sha through
     `upsertProductAction` (the action always writes `templateCategory`
     AND rebuilds the membership junction from the dialog's snapshot),
     so concurrent saves silently revert each other's axis.
   - **The aggravator**: the `restore-demo-stock.ts` backstop runs
     only at webServer start — an aborted revert leaves dirt across
     runs until a fresh server start; CI's `workers: 1` masks the
     whole class (why it surfaced on local multi-worker runs only).
4. **Deep audit 83-a** (read-only subagent, the web-application +
   code-review-checklist methodology): **12/12 standing anchors PASS,
   the run-82 delta 7/7 PASS, 0 CRITICAL/HIGH/MEDIUM production-code
   defects** — 1 HIGH (the flake class, independently verified and
   extended with mode 3), 1 LOW (F-2: the analytics inline select
   missing the S82-4 orderBy + the products.ts comment overclaim), 1
   INFO (F-3: the dead `|| "United States"` fallback). No collision
   pairs outside the admin-catalog family (reviews/wishlist/coupons/
   shopping-flow checked and cleared).
5. **Live-reference re-measurement** (agent-browser, logged in, mobile
   390×844 + desktop 1440×900): every pinned surface re-verified
   GREEN — the mobile panel rows 89/125/161/197/233 (36px rhythm,
   14px/1.4px uppercase, ending at ABOUT, toggle-close, SEARCH-row →
   overlay, route-change close), the overlay's "silk" set (4 rows,
   `$370.00`-family prices, ASCII cp 36, two decimals, Cormorant
   14px/300; the desktop input 24px/300, column x:384 w:672), the
   shop's 19-card one-page grid ("All Products", bonnet-first), the
   detail's ৳370 Inter 24px/600 + "skincare" eyebrow, the nav/footer
   template slugs. **ZERO new parity deltas** — the reference is
   unchanged since run 82. The clone probe: 8/8 server-side checks
   (health, sitemap 28 urls public-only, robots, JSON-LD, OG,
   canonical, shop order, search API) + the mobile panel
   88/124/160/196/232 (±1px) + the overlay rows byte-exact.
6. **The plan** (Session 83, S83-1..S83-6) appended to
   docs/REMEDIATION_PLAN.md, validated against the codebase (every
   change site named and pre-read), then executed TDD-first (**RED 7
   failing across 2 files → GREEN**).
7. **One GREEN-phase correction**: the S83-5 fixing comment initially
   quoted the banned `|| "United States"` literal — the source pin
   caught its own comment (the match re-introduced by the fix); the
   comment reworded. Encoded as trap 5 in the SKILL entry.

## The change-set (S83-1 .. S83-5)

- **S83-1 (the root fix)**: `playwright.config.ts` gains the
  `admin-catalog` project — `testMatch: /admin\.spec\.ts/`,
  `workers: 1`, Desktop Chrome 1440×900 — and `desktop-chromium`'s
  `testIgnore` extends to admin.spec.ts. Playwright runs projects
  SEQUENTIALLY, so the mutation-bearing spec executes alone, after
  every read-only project has finished: no window is ever observable
  by a concurrent reader, and same-file parallelism (the clobber) is
  eliminated. Pinned by `tests/unit/e2e-infrastructure.test.ts`.
- **S83-2 (mode 1)**: the shared `searchProductsAndOpenDialog` helper
  gates the native-GET navigation (`waitForURL` on the form-encoded
  `q=` URL + the `html[data-hydrated]` sentinel — the gotoHydrated
  convention applied to the post-Enter navigation) before the Edit
  click; all four former bare sequences route through it. The
  safe sibling (Enter followed by an auto-retrying assertion) is
  unchanged.
- **S83-3 (dirt tolerance — the S20-1 discipline)**: S81-11's opening
  self-heals a leftover Bestsellers membership (uncheck + save +
  reopen through the helper) before pinning the seed shape — a
  reused-server rerun after an aborted revert no longer fails.
- **S83-4 (audit F-2)**: the analytics select's nested `categories`
  gains the S82-4 orderBy (deterministic category attribution for the
  dual-member product); the `products.ts` comment corrected to name
  the real `firstCategoryName` consumers (JSON-LD, dashboard, detail
  eyebrow) and note analytics owns its ordered select.
- **S83-5 (audit F-3 + sweep)**: the addresses POST passes the schema
  country straight through (the dead US fallback removed); the account
  snapshot display falls back to "Bangladesh"; the analytics AOV
  zero-state renders `formatMoney(0)` (৳0, no `$` remnant).

## The verification

- **The self-heal, end-to-end**: the Bestsellers dirt seeded directly
  into the DB, the admin spec run against a REUSED server (no restore
  backstop) — S81-11 healed (8.0s), passed, and the post-run state
  verified seed-clean (template "skincare", memberships
  ["Beauty Tools"]).
- **Stability**: **90/90 e2e ×3 consecutive full-suite runs** post-fix
  (the admin spec now under `[admin-catalog]`), after the 2-of-6
  flake rate on the pulled tree.
- **Gates (all observed green)**: lint ✓ · typecheck ✓ ·
  typecheck:tests ✓ · **698/698 unit** (+7) · clean build ✓.
- **Evidence**: 25 dev-server screenshots regenerated + validated
  (25/25 dimension/size checks); `.env.example` re-verified (9/9 env
  vars covered, no new vars); the scratch probe scripts removed; the
  sitemap/robots/JSON-LD/OG/security surfaces verified on the running
  server.

## Encoded traps (new this run)

1. A native-GET form's Enter navigation needs the SAME hydration gate
   as gotoHydrated before clicking a client island — Playwright's
   actionability checks do not cover React hydration, and an
   auto-retrying assertion is safe across a navigation where a click
   is not.
2. A shared-DB e2e suite's MUTATION WINDOWS are concurrency hazards
   for every parallel count pin — serialize the mutating spec into its
   own project (projects run sequentially) rather than weakening the
   pins.
3. A full-row upsert makes same-entity tests clobber each other under
   fullyParallel — each save carries its own stale snapshot of ALL the
   axes; the same-product constraint is invisible until two tests
   touch the same row.
4. CI's `workers: 1` can mask an entire local-only flake class — a
   suite green in CI is not evidence of determinism on multi-worker
   runs.
5. A source-pin test forbidding a string must not quote that string in
   the FIXING comment (the comment re-introduces the match).
