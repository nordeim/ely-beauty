# Session 20 Log (Run 82) — The Overlay Price-Format Parity & Admin-Undo Cycle

The workspace was RESET (fresh clone at `515bfa5` — the sandbox had been
recycled), so this run rebuilt the environment first: npm install, `.env`
from `.env.example` with a generated `AUTH_SECRET`, `db:setup` (19
products / 4 categories / memberships 7/3/4 / templates 12/3/4), the
ambient `DATABASE_URL` shadow converged via the documented symlink, and
the Playwright chromium binaries installed. The cycle: gates
re-validation on the pulled tree → deep audit 82-a → live-reference
re-measurement → the Session 82 plan → TDD remediation (S82-1..S82-7) →
the clone verification → screenshots off the dev server → the docs sweep
→ commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** Fresh clone; re-read README,
   AGENTS.md, CLAUDE.md, PAD v2.9, ely-beauty_SKILL.md v2.9.0,
   session_18/session_19, worklog, the REMEDIATION_PLAN through Session
   81, and the skills catalog (web-application, code-review-checklist,
   tdd, clone-app-pat-pro, agent-browser, the Tailwind v4 skills).
   skills/ excluded from all checking per the operator contract; the
   homenest-store-s repo spot-cloned for the tech-stack patterns (the
   direct ancestor — identical stack, nothing new to port).
2. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 677/677 unit ✓ · clean build ✓ · 88/88 e2e ✓ —
   the docs' claimed state matched reality exactly.
3. **Deep audit 82-a** (read-only subagent; the web-application +
   code-review-checklist methodology): **12/12 standing anchors PASS,
   0 CRITICAL/HIGH/MEDIUM** — 3 LOW (L-1 the ProductCategory schema
   comment claiming "Both FKs Restrict" while productId is declared
   Cascade; L-2 the stale seed comment contradicting the S81-3
   template-slug nav links; L-3 the admin dialog's Radix Select having
   no deselect path for a set template category) + 8 INFO (incl.
   INFO-2 the unordered `categories[0]` reads behind firstCategoryName;
   INFO-4 the unmapped P2003 in upsertProductAction; INFO-5 the
   non-transactional double-reading restore-script rebuild). Run-81's
   changes verified regression-free.
4. **Live-reference re-measurement** (agent-browser 0.41.1, logged in
   with the operator credentials, mobile 390×844 + desktop 1440×900):
   every S74..S81 pinned surface re-verified GREEN — the mobile-menu
   priority surface byte-exact ±1px (panel y:64 h:214, rows @36px
   rhythm 89/125/161/197/233, 14px/1.4px uppercase, the template
   links, toggle-close, the SEARCH row → the full-screen overlay,
   route-change close), the overlay anatomy (the Cormorant input
   18px/300 mobile + 24px desktop, the column x:384 w:672, the
   506.4px list cap, the 80px/2px rows, the hint, the no-results
   copy), the shop 19/19 authored order, the detail page (৳370 Inter
   24px/600, the "skincare" eyebrow), "Complete the Ritual" (the
   Bonnet/Curler/Bamboo Square set), the footer template slugs, and
   the `?category=sets` empty grid (h1 "Shop" — audit INFO-1 confirmed
   parity-intentional on the live reference).
5. **The discovery (D-82-1)**: the overlay row price renders the
   Base44 template's **USD format** — `$370.00` / `$288.00` /
   `$470.00` — a literal ASCII dollar (U+0024, codepoint-verified),
   the same numeric value as the ৳ grid price, always two decimals,
   in the Cormorant 14px/300 font-light. The reference's grid/detail
   prices stay ৳ whole-taka. The clone unified on ৳ everywhere, so
   its overlay price diverged. The prior "font-light ৳ price" pin had
   imputed the grid currency — the reference's rendered bytes are the
   truth (the replicate-as-observed precedent).
6. **The plan** (Session 82, S82-1..S82-7) appended to
   docs/REMEDIATION_PLAN.md, validated against the codebase (every
   change site named and pre-read), then executed TDD-first (**RED 15
   failing across 4 files → GREEN**).
7. **One GREEN-phase correction**: the ordered `productCategoryInclude`
   initially carried `as const` — Prisma's include type REJECTS a
   readonly orderBy array (the typecheck caught it immediately);
   `satisfies Prisma.ProductInclude` keeps the literal shape AND
   validates it. The source pin was updated to match.
8. **Result-set parity confirmed**: "silk" → the same 4 products in
   the same order on both sites (Bonnet, Pillowcase, Sandalwood
   Paddle Oval, Crystal Hair Remover).

## The change-set (S82-1 .. S82-7)

- **S82-1 (D-82-1)**: the pure `formatOverlayPrice(cents)` in
  `src/lib/money.ts` (`$` + en-US grouping + always-2-decimals —
  37000 → `$370.00`, 47050 → `$470.50`, 0 → `$0.00`), consumed ONLY
  by `search-overlay.tsx`'s result rows. Every other money surface
  keeps `formatMoney`'s ৳ whole-taka form (verified: the grid card
  ৳370, the detail ৳370 Inter 24px/600). Unit truth table ×4, the
  overlay render pins updated, the source pins, and the e2e codepoint
  pin (the row price's first character is U+0024 + the `.00` suffix).
- **S82-2 (audit L-1/L-2)**: the schema junction comment corrected to
  the declared FK split (categoryId Restrict / productId Cascade); the
  seed CATEGORIES comment updated to the measured template-slug
  mapping. Source-pinned.
- **S82-3 (audit L-3)**: the dialog's Template-category select gains
  a "None" `SelectItem`; the submit narrowing routes through the pure
  `normalizeTemplateCategory` seam (`src/lib/validation.ts` —
  "none"/""/stray → null). The e2e clears the Gua Sha's template
  category, verifies the detail eyebrow falls back to "Beauty Tools",
  and reverts (self-cleaning).
- **S82-4 (audit INFO-2)**: `productCategoryInclude` ordered by the
  category's `sortOrder` (name tie-break) — the first display category
  (JSON-LD, the dashboard low-stock label, analytics attribution) is
  deterministic for the dual-member product.
- **S82-5 (audit INFO-4)**: `upsertProductAction`'s catch maps P2003
  through the existing `isForeignKeyViolation` seam to "A selected
  category no longer exists." (the pre-check's message).
- **S82-6 (audit INFO-5)**: `restore-demo-stock.ts` — the per-product
  double read merged (the wiring rides the first select) and the
  delete-then-create rebuild wrapped in one `db.$transaction`.
- **S82-7**: 25 dev-server screenshots regenerated + validated;
  `.env.example` re-verified against every code-referenced env var (no
  new vars); the full docs sweep.

## The clone verification (every fixed surface vs the reference)

The overlay price: the clone renders `$370.00` (cp 36, Cormorant
14px/300 — the reference's exact bytes) with 4/4 result rows in the
same order. The grid keeps `৳370`; the detail keeps `৳370` Inter
24px/600. The mobile menu (the operator's priority surface): rows
88/124/160/196/232 vs the reference's 89/125/161/197/233 — ±1px, the
template links, toggle-close, SEARCH-row → overlay, route-change
close all verified working. The admin clear path: the Gua Sha's
template category clears through None and the eyebrow falls back to
"Beauty Tools".

## Gates (all observed green)

lint ✓ · typecheck ✓ · typecheck:tests ✓ · **691/691 unit** (+14) ·
clean build ✓ · **90/90 e2e** (+2: the S82-1 codepoint pin, the S82-3
admin clear-and-revert). Two GREEN-phase pin updates were needed: the
e2e mobile-navigation + storefront specs' overlay price assertions
carried the old ৳ expectation (the format change's counterparts).

## Encoded traps (new this run)

1. A prior session's PARITY PIN can carry an imputed value — when a
   pinned surface's bytes disagree with a fresh codepoint-level
   measurement, the live bytes win (re-verify the pin's provenance
   before "restoring" it).
2. `as const` on a Prisma include breaks the moment it carries an
   orderBy — readonly arrays are rejected by `ProductInclude`;
   `satisfies Prisma.ProductInclude` keeps the literal shape AND
   validates it.
3. An e2e pin asserting a DISPLAYED CURRENCY must pin the codepoint,
   not the glyph — the $/৳ distinction is invisible in a screenshot
   diff and both render in most console fonts.
4. Scope DOM measurement probes to an element you verified exists (a
   div-scoped probe missed the overlay's `<ul>` list container); and
   re-snapshot before trusting an empty probe result.
