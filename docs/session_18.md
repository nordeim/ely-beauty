# Session 18 Log (Run 81) — The Category-Model, Dual-Filter & One-Page-Grid Cycle

The workspace SURVIVED this time (the run-80 environment persisted:
node_modules, the `.env` with its generated `AUTH_SECRET`, the
converged `DATABASE_URL` symlink, and the seeded db) — `git pull`
brought exactly one commit (`2c3a646`, the session_17.md log). The
cycle: gates re-validation on the pulled tree → deep audit 81-a →
live-reference re-measurement **+ the reference's public entity API**
→ the Session 81 plan → TDD remediation (S81-1..S81-12) → the clone
verification → screenshots off the dev server → the docs sweep →
commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** `git pull` (fast-forward to
   `2c3a646`); re-read README, AGENTS.md, CLAUDE.md, PAD v2.8,
   ely-beauty_SKILL.md v2.8.0, docs/session_16.md, docs/session_17.md,
   worklog.md, the REMEDIATION_PLAN through Session 80. skills/
   excluded from all checking per the operator contract.
2. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 650/650 unit ✓ · clean build ✓ · 85/85 e2e ✓
   — the docs' claimed state matched reality exactly.
3. **Deep audit 81-a** (read-only subagent; the web-application +
   code-review-checklist methodology): **12/12 standing anchors PASS,
   0 CRITICAL/HIGH/MEDIUM** — 3 LOW (L-1 the webhook's bare
   `JSON.parse(meta.shipping)` escaping to the outer catch, which
   classifies it transient → 500 + Stripe retry loop with no
   StripeEvent refund trail; L-2 three stale comments — the
   `parseDollarsToCents` "no production module imports it" claim that
   three admin dialogs falsify, the track-order "sequential" comment,
   the rate-limit wording; L-3 the `readBodyTextBounded` no-stream
   fallback capping UTF-16 units) + 2 INFO. Run-80's S80-1/2/3 all
   verified regression-free.
4. **Live-reference re-measurement** (agent-browser 0.41.1, logged in
   with the operator credentials, mobile 390×844 + desktop): every
   S74..S80 pinned surface re-verified GREEN — the mobile-menu
   priority surface byte-exact ±1px, the overlay's full anatomy, the
   catalog order 19/19, the detail h1/price/variant chips, the footer
   headings. THEN the discovery: probing the reference's link targets
   (home tiles link by category ENTITY ID; the nav links
   `?category=skincare` / `body_care`) revealed a dual category
   system — and **the reference's public entity API
   (`/api/entities/Product`, `/api/entities/Category`, read with the
   operator's logged-in session) confirmed it authoritatively**:
   every product carries `category_ids` (an ARRAY — the cleansing
   brush in TWO categories, six products in none) AND a `category`
   STRING (skincare / lip_care / body_care) that the breadcrumb
   renders and the footer/nav slug filters filter. The 20th API
   product is `is_published: false` — the 19-product catalog is
   correct.
5. **The deltas measured** (the never-measured category-model
   residue): the pill result sets (clone 10/6/3 vs reference 7/3/4
   with the dual membership), the h1 under filters ("All Products"
   always vs the category name / "Shop"), the nav + footer link
   targets, the detail eyebrow (display category vs template
   "skincare"/"lip care"), the 12/page pager vs the one-page grid,
   the dashed empty box vs the reference's centered Cormorant
   anatomy, the same-category related pieces vs the 3-newest rule,
   and the gift-sets banner CTA vs plain `/shop`.
6. **The plan** (Session 81, S81-1..S81-12) appended to
   docs/REMEDIATION_PLAN.md, validated against the codebase (every
   change site named and pre-read), then executed TDD-first
   (**RED 33 failing across 7 files → GREEN**).
7. **The [h-eating bash display artifact struck AGAIN** — a
   `rg` for the hydration marker displayed `data-n` where the file
   carries `data-hydrated`; the codepoint probe (JSON.stringify)
   proved the file correct, exactly as the trap log warns.

## The change-set (S81-1 .. S81-12)

- **S81-1 (the data model)**: the `ProductCategory` junction
  (`@@id([productId, categoryId])`, both FKs Restrict) replacing the
  single `categoryId` FK, plus `Product.templateCategory` (skincare |
  lip_care | body_care). Seed: the reference's exact memberships
  (Beauty Tools 7 — Gua Sha, Threading, Derma Roller, Derma Stamp,
  Mask Applicator, the dual-member cleansing brush, Ice Bowl; Brush &
  Combs 3; Bestsellers 4; Gift Sets 0; six uncategorized) +
  templateCategory 12/3/4. A reseed rebuilds the wiring
  (delete-then-create — the old FK rode the same content-refresh
  policy), so the EXISTING dev db converged with one `db:seed` run
  (verified: 7/3/4 memberships, the dual, the six, 12/3/4 templates).
- **S81-2 (the dual filter mode)**: `resolveCategoryFilter` +
  `queryProducts` — an active display slug filters the junction
  (h1 = the category's NAME, its pill active); anything else filters
  `templateCategory` equality (h1 "Shop", NO pill active). The shop
  page's h1 rides the resolution.
- **S81-3 (the links)**: the nav (desktop + mobile panel) links
  Beauty Tools → `/shop?category=skincare`, Brush & Combs →
  `/shop?category=body_care`; the footer SHOP column is the
  reference's All Products / Skincare / Body Care / Gift Sets →
  template slugs.
- **S81-4 (the eyebrow)**: `templateCategory.replace(/_/g, " ")` in
  the eyebrow-label style ("skincare" / "lip care"), falling back to
  the first display category, then nothing. The JSON-LD category
  carries the first display category name.
- **S81-5 (the one-page grid)**: `PER_PAGE` 12 → 24 — all 19
  products render on one page (no pager), the pager surviving as the
  >24 superset.
- **S81-6 (the empty state)**: the reference's centered
  `text-center py-20` anatomy — the Cormorant 24px/300
  "No products found" paragraph + the muted "Check back soon for new
  arrivals." sub-copy; the dashed box, icon, hint copy and
  clear-filters link retired.
- **S81-7 (the ritual)**: "Complete the Ritual" = the 3 newest
  active products excluding self (createdAt desc) — the reference's
  rule, verified on the Bonnet AND the Pillowcase.
- **S81-8 (the CTA)**: the ritual banner links plain `/shop`.
- **S81-9 (audit L-1)**: the guarded `parseShippingMetadata` seam —
  unparseable `meta.shipping` returns null so `addressSchema` fails
  and the route takes the metadata-unusable PERMANENT path (event
  recorded + the ops refund trail), never the transient 500.
- **S81-10 (audit L-2/L-3)**: the three stale comments corrected;
  the no-stream body fallback counts bytes via `TextEncoder`.
- **S81-11 (the admin surfaces)**: the product dialog's category
  checkbox MULTI-select (zero-or-more; the template category select
  joins it), the upsert writes junction rows inside the product
  transaction, `deleteCategoryIfEmpty` counts junction rows, and
  `restore-demo-stock.ts` rebuilds the seed wiring before e2e runs
  (the mutating admin e2e's backstop — the test also self-reverts).
- **S81-12 (evidence + docs)**: 25 dev-server screenshots
  regenerated + validated; `.env.example` re-verified against every
  code-referenced env var (no new vars); the full docs sweep.

## The clone verification (every fixed surface vs the reference)

`/shop`: h1 "All Products" + "19 products" + 19 cards + NO pager +
the All-Products pill solid. `?category=beauty-tools`: h1 "Beauty
Tools" + "7 products" + its pill solid. `?category=skincare`: h1
"Shop" + "12 products" + NO pill active. The nav: Beauty Tools →
`?category=skincare`, Brush & Combs → `?category=body_care`. The
footer SHOP: Skincare / Body Care / Gift Sets → template slugs. The
Pillowcase detail: eyebrow "lip care"; the ritual shows the Bonnet,
the Curler, and the Bamboo Square (the 3 newest excluding self).
`?category=gift-sets`: "0 products" + the centered empty state. The
banner CTA: `/shop`. The mobile panel: y:64 h:213 (±1px), rows @36px
rhythm 88/124/160/196/232 (reference 89/125/161/197/233), 14px
uppercase, the template links — the operator's priority surface
working exactly as expected.

## Gates (all observed green)

lint ✓ · typecheck ✓ · typecheck:tests ✓ · **677/677 unit** (+27) ·
clean build ✓ · **88/88 e2e** (+3: the nav template-filters, the
empty-state anatomy, the admin multi-select; the pagination test
reworked to the one-page grid). One GREEN-phase regression the e2e
caught immediately: the rewritten products.ts dropped the colon from
the "Name: A-Z" sort label — restored byte-exact.

## Encoded traps (new this run)

1. The reference's own public entity API (readable with the
   operator's logged-in session) is the authoritative source for
   DATA-MODEL parity — link-target probing found the shape; the API
   confirmed it exactly (including the dual membership and the
   unpublished 20th product).
2. A destructive schema change (FK → junction) flows through the
   documented `db:push --accept-data-loss` + a reseed that rebuilds
   the wiring — the convergence path IS the migration story (the
   existing dev db converged with one seed run).
3. A two-request nonce probe proves nothing — each request mints its
   own nonce; compare the CSP header and the script nonce from ONE
   request.
4. A wedged dev-server/browser pair (Fast Refresh loop, scripts
   never hydrating, "Resource temporarily unavailable") is a tooling
   artifact — restart both before suspecting the code; the
   production build's e2e suite is the truth.
5. An e2e that MUTATES demo data must self-revert AND ride a
   restore-script backstop, or suite re-runs poison their own pins.
6. Parity includes the DATA MODEL, not just rendered pixels: which
   products belong to which filter is a measured surface like any
   other — the pills' result sets are content.
