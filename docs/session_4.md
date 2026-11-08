# Session 3 (Run 74) — The Measured-Geometry Parity Cycle

The workspace survived between sessions; `git pull` landed the operator's
session-log commit (`211c0e2`, docs-only: `docs/session_3.md`). This cycle:
workspace refresh → docs review → gates re-validation → deep audit 74-a →
live-reference surface-by-surface re-measurement → a 14-delta TDD parity
sweep → the Stripe FX gate → screenshots → docs sweep → commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** Pulled to `211c0e2`; re-read
   AGENTS.md, CLAUDE.md, README.md, PAD v2.1, ely-beauty_SKILL.md v2.1.0,
   docs/session_2.md (the run-73 log), docs/session_3.md (the operator's
   run-73 narration capture), docs/REMEDIATION_PLAN.md (through Session 73),
   worklog.md. skills/ excluded from all checking per the operator contract.
2. **Environment.** The sandbox `DATABASE_URL` shadow re-confirmed converged
   (the shadow path and the repo `db/custom.db` are the same inode); `.env`
   carries `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo
   root; `.env.example` documented all 9 env vars (10 after this run —
   `STRIPE_BDT_PER_USD`).
3. **Gates on the pulled tree — ALL GREEN.** lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 536/536 unit ✓ · build ✓ zero errors · 69/69 e2e ✓.
4. **Deep audit 74-a** (read-only subagent, the web-application +
   code-review-checklist methodology): **9/9 standing code anchors PASS**
   with **1 HIGH (dormant) / 5 LOW / 4 INFORMATIONAL**. The HIGH: the
   Stripe card path minted USD intents whose amount equaled the BDT poisha
   count (a ~120× overcharge the moment keys are set). The conflict-marker
   gate CLEAN; the session-log commit verified docs-only.
5. **Live-reference re-measurement** (agent-browser computed styles +
   VLM side-by-side; the reference ONLINE, logged in): the catalog
   UNCHANGED (19 published products — the entity API's 6 "new" rows are
   unpublished ৳0.1-junk drafts; all titles/prices/variants/order match the
   seed). But surface-by-surface measurement found **14 geometry deltas**
   — run-72 built close-but-not-exact, and run-73's own "pills match"
   conclusion failed re-measurement (the S73-encoded re-measure-don't-
   trust-pins trap firing as designed). Every VLM claim was confirmed or
   refuted against the DOM before acting (the ৳-as-"LE" misread, the
   reference-SPA's unpainted lazy sections, the fixed-header-in-fullPage
   capture artifact, and the lazy below-the-fold banner were all
   non-findings).
6. **Remediation plan** (Session 74, S74-1..S74-14) appended to
   docs/REMEDIATION_PLAN.md with the full measured-values table, validated
   against the codebase, then executed TDD-first: the RED batch ran
   15-failing before any implementation.

## The change-set (S74-1 .. S74-14)

- **S74-1 (hero)**: `h-screen min-h-[600px]`; the content column
  `max-w-3xl px-6` on ONE element (720px content — the exact width that
  wraps the 96px title to two lines, byte-exact with the reference's
  720×192 measurement); lh 1; the 24px/43px text-block gaps.
- **S74-2 (mobile panel)**: SEARCH + the four nav links ONLY (the Sign
  In/Wishlist/Admin rows were scaffold heritage — the reference's panel
  ends at ABOUT); `border-b` below the panel; `gap-4` rhythm; the header
  icons hover with opacity (no chip backgrounds; the 44px hit areas stay).
  The wishlist entry moved to the footer's SUPPORT column — the retired
  panel link was the codebase's ONLY /wishlist navigation.
- **S74-3 (shop pills + sort)**: sharp 0-radius `py-2` pills (the ACTIVE
  pill borderless solid `text-background` with no thumbnail; inactive
  hairline + muted with 16px thumbs); a NATIVE `<select>` for sort (the
  reference's own element) in the hairline-bordered band.
- **S74-4 (image aspects)**: card 1:1, category tile 4:3, gallery 3:4 on
  `bg-muted` (sharp, no border) with 3:4 thumbs and the 2px selected ring.
- **S74-5 (purchase column)**: stacked full-width — outlined ADD TO CART,
  filled BUY IT NOW (Zap icon, matching the reference's lightning), the
  heart below; radius 2px.
- **S74-6 (detail page)**: the category eyebrow above the title (12px/
  1.2px/muted); DESCRIPTION / HOW TO USE / INGREDIENTS as micro-label
  headings.
- **S74-7 (badges)**: split corners (Bestseller `left-4`, Sale `right-4`),
  `py-1.5 px-3`, weight 500, 0.1em tracking, `text-background` on the
  featured badge.
- **S74-8/S74-9/S74-10**: the footer SUPPORT column plain text with
  `hover:text-foreground`; the WhatsApp float 56×56 z-50; `.link-cta`
  restyled to the border-b treatment (14px/400, surface-paired borders);
  VIEW ALL as the muted micro-label (hidden below sm); the logo recolored
  to the reference's gradient anchors (#c99a3a / #d95577).
- **S74-11 (Stripe FX gate — audit F-1)**: `STRIPE_BDT_PER_USD` gates the
  Card option (keys AND rate, or COD-only); `stripeChargeAmount` is the
  single poisha→USD-cent seam (mint, checkout verify, webhook verify, and
  the in-tx amount guard all derive through it); the interface renamed
  `amountUsdCents`; the idempotency key hashes the converted amount.
  Documented in `.env.example` + `docs/DEPLOYMENT.md`.
- **S74-12 (residuals)**: the zod `country` default → Bangladesh; the zod
  `iconGradient` default → stone; the kitchenware placeholder sweep; the
  cart-page variant label matches the drawer; the merge split
  single-sourced through `splitBulkKey`; the stale `@@unique` comment; the
  e2e `shippingMethod` field annotated as the deliberate strip pin.
- **S74-13 (catalog)**: the massager title matches the reference's authored
  casing ("Full silicon scalp massager"); reseeded via the content-only
  seed policy.

## Verification (all observed green)

- Gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · **550/550 unit**
  (55 files; +14 pins) · build ✓ zero errors · **70/70 e2e** (the
  re-pinned mobile-nav contract, the native-select sort pin, the new
  footer-wishlist pin; the FX integration cases in the unit suite).
- The fixed surfaces re-measured GREEN against the live reference
  (computed styles, both sites): hero 900px + h1 720×192 two-line + the
  text gaps; pills 34px/0-radius/borderless-active/hairline-inactive; the
  panel text byte-exact with border-b + 16px gaps; the purchase column
  stacked/outlined/filled at radius 2px; the eyebrow 12px/1.2px/muted;
  gallery 3:4; cards 1:1; badges split-corner; the footer plain; the
  float 56×56.
- Screenshots: 25/25 regenerated in one clean pass.

## Deferrals / notes (the accepted-deviation ledger)

- The Bonnet renders a Bestseller badge; the reference's own card renders
  none because its tag is the TYPO "bastseller" (the ৳11-compare
  precedent: we do not replicate reference data noise).
- The massager's SIZE label shows the selected value; the reference's
  shows none (ours doubles as the aria-live announcement — the honest
  superset).
- Single-image galleries (the reference carries 4–7 CDN photos per
  product — the documented imagery deviation; the thumbnail mechanics are
  wired and render with 2+ images).
- The gold ornamental wave at the reference's hero bottom is baked into
  their hero photo (imagery, not code).
- The reference's footer SHOP links (Skincare/Body Care) are its own
  template remnants — not cloned (documented since run-72).
