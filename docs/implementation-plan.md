# Implementation Plan — Run 72: The ElyBeauty Re-Skin

> **Mission.** Transform the HomeNest Kitchen codebase (the scaffold) into a
> production-ready, enterprise-grade clone of `https://ely-beauty.base44.app/` —
> a visual-parity, functional-superset re-skin. Companion dossier:
> `docs/reference-investigation.md` (live evidence, 2026-11-08).
> Executed TDD-first where behavior changes; every gate re-run before push.

## 0. Governing decisions (best-recommendation dispositions)

| # | Question | Decision |
|---|---|---|
| D1 | Reference renamed? | No — `ely-beauty.base44.app` is a **different Base44 app** (premium skincare, BDT) from the dead `nest-culinary-hub` (kitchenware). The repo becomes the ElyBeauty clone; HomeNest is the scaffold. |
| D2 | Product imagery | The reference hotlinks a third-party Shopify CDN (`feyorabangladesh.com`). The clone ships **independently generated imagery** (asset-laundering avoidance per `skills/replicate-web-app`). Layout/typography/color carry the parity. |
| D3 | Routes | `/products` → **`/shop`** (reference parity; `/products` 301-redirects). `/product/[id]`, `/cart`, `/checkout`, `/account`, `/about`, `/login`, `/register` unchanged. Superset surfaces (`/wishlist`, `/track-order`, `/contact`, `/legal/[slug]`, `/admin`) kept. |
| D4 | Category slugs | Reproduce the reference's observed URL slugs exactly (`skincare`, `body_care`, `sets`, `bestseller`) with its display names (Beauty Tools, Brush & Combs, Gift Sets, Bestsellers) — as-observed cloning of the template-remnant mapping. |
| D5 | Currency | BDT **৳**, whole-taka display (`৳288`). Internal math stays **integer cents** (৳1 = 100 cents) — the hardened money contract is untouched. |
| D6 | Shipping | Reference: City-tier — Dhaka ৳70, outside ৳130, "Enter city to calculate" before input. Implemented exactly; amounts admin-configurable (superset). Free-shipping **coupon** still zeroes it; the spend-threshold hint uses a ৳3,000 admin-editable threshold (superset, coupon-aware as before). |
| D7 | Payment | Reference is Cash-on-Delivery only → default build ships **COD only** (parity). Stripe Payment Element renders as an extra option **only when configured** (superset; demo card form retired — COD is the demo path). All session-61 money invariants kept. |
| D8 | Order numbers | `ORD-YYYY-NNN` → **`ELY-XXXXXXXX`** (8-char uppercase base36, crypto-random, UNIQUE column, collision-retry — same discipline as before). |
| D9 | Variants | New: `Product.colors` (`[{name,hex}]`), `Product.sizes` (`string[]`), `CartItem.variant`/`OrderItem.variant` (snapshot). Detail page renders COLOR swatches or SIZE buttons; selection carries to cart/checkout/order. |
| D10 | Google button | Rendered for parity, **disabled with tooltip** ("Google sign-in is not configured on this clone") — no OAuth secrets in the repo. |
| D11 | Mobile nav | Keep the hardened Tailwind-v4 contract (conditional mount — never `hidden`-toggle, scroll lock, aria-label flip, route-change close, active pill) and re-skin to the reference's ivory push-down panel + in-panel search flow. Visual parity + stricter a11y. |
| D12 | Hero | Single full-bleed editorial hero (one generated image, dark romantic skincare still-life), centered white Cormorant headline, underlined uppercase CTA. The carousel engine is retained (superset: admin can add slides → dots/rotation activate) seeded with ONE slide so default render = static hero parity. |
| D13 | Test counts | Unit suite updated in place (kitchenware pins → ElyBeauty pins + new variant/shipping/order-number pins). Docs counts updated lockstep with the observed green run. |
| D14 | Demo accounts | `admin@elybeauty.com` / `Admin123!`, `demo@elybeauty.com` / `Demo1234!` (same pattern, new domain). |

## 1. Workstreams (execution order)

### WS1 — Design tokens & fonts
- `src/app/globals.css`: swap `@theme inline` values to ElyBeauty (background `hsl(30 20% 97%)`, primary `hsl(30 12% 48%)`, foreground `hsl(0 0% 10%)`, muted-foreground `hsl(0 0% 40%)`, border/input `hsl(30 10% 88%)`, destructive `hsl(0 84.2% 60.2%)`, success `hsl(140 20% 33%)`, radius `0.25rem`) — **full `hsl()` values** (trap #2), keep the `--shadow-sm` pin (trap #5).
- `src/app/layout.tsx`: `next/font` — **Cormorant Garamond** (300–600) → `--font-display`; **Inter** (300–600) → `--font-sans`.
- Badges: `BESTSELLER` (near-black pill), `SALE` (red pill).

### WS2 — Schema + seed
- Prisma: `Product += colors Json?, sizes Json?, shortDescription String?, howToUse String?, ingredients String?`; `Category += imageUrl String?, subtitle String?`; `CartItem += variant String?`; `OrderItem += variant String?`; `Settings` (key-value) += hero/ritual/whatsapp/shipping keys.
- `prisma/seed.ts`: 19 products / 4 categories (D4 slugs) / settings (`ElyBeauty`, `helloelybeauty@gmail.com`, `01787385459`, whatsapp `8801787385459`, BDT, shipping 70/130, threshold ৳3000) / 3 coupons / 1 hero slide. Reference order = seed `createdAt` backdating (grid "Newest" order preserved). Money: taka→cents. Stock, compare-at (only when > price), tags→badges (`bestseller`/`sale`) mapped from the fetched reference data.

### WS3 — Original imagery (generated)
- Hero (1), ritual banner (1), about (1), 4 category tiles, 19 product images, logo wordmark (SVG), favicon, og-default. Warm ivory/taupe/rose-gold editorial mood, consistent lighting. Saved under `public/images/`.

### WS4 — Chrome re-skin
- `logo.tsx` (wordmark), `header.tsx` (transparent-over-hero on `/`, solid ivory + hairline border elsewhere; white nav text over hero; 80px; uppercase ls-1.2px links), `mobile-nav.tsx` (ivory push-down panel, Search row + 4 links, in-panel search flow), `footer.tsx` (4 columns: brand blurb + social circles / SHOP / COMPANY / SUPPORT incl. email + phone; bottom bar with © + Privacy/Terms), new `whatsapp-float.tsx` (green circular, settings-driven).

### WS5 — Storefront surfaces
- Home: hero (single-slide carousel), "Shop by Ritual" tiles, "Curated for You" grid (VIEW ALL), ritual banner.
- `/shop`: "All Products" + count, category filter pills (active = solid near-black), sort combobox (Newest/Price asc/Price desc/Name A-Z — reference labels), 3-col editorial grid (borderless cards, badges, swatch dots, 1-line description, price + strike).
- Product detail: BACK TO SHOP, gallery + thumbs, variant selector (COLOR: <name> swatches / SIZE buttons), qty stepper, ADD TO CART + BUY IT NOW (adds + routes to checkout), DESCRIPTION / HOW TO USE / INGREDIENTS sections, "Complete the Ritual" related grid.
- Cart drawer ("Your Bag (N)") + cart page (superset, re-skinned).
- Checkout: single-page parity form (CONTACT / SHIPPING ADDRESS / PAYMENT METHOD — COD radio / Order Notes) + ORDER SUMMARY sidebar with live shipping by city tier; PLACE ORDER — ৳NNN. All hardened invariants kept (server-derived money, idempotency key, cart-clear filter, ownership-bound replay, token-gated receipt).
- `/checkout/success`: thank-you + token-gated receipt (superset keeps full receipt; headline "Thank You!").
- Account: "My Account" + user + Sign Out + **ORDER HISTORY** (ELY- cards) with superset profile/address sections below.
- Login/Register: reference copy ("Welcome back" / "Create your account"), Google button (D10), demo quick-fill (dev-only).
- Search: desktop overlay + mobile in-panel (live results, ৳ prices).
- About ("Beauty, Redefined" + value props), Contact, Legal, Track Order, Wishlist, 404: re-skinned, ElyBeauty copy.
- `manifest.ts`, `robots.ts`, `sitemap.ts` (/shop), JSON-LD (BDT, `siteBaseUrl` unchanged), metadata.

### WS6 — Admin console (superset)
- Same surfaces, ElyBeauty tokens/nav; product dialog += colors/sizes editors; settings += hero/ritual/whatsapp/shipping keys; carousel manager (single seeded slide).

### WS7 — Money / orders plumbing
- `money.ts`: ৳ symbol, whole-taka (`৳288`), cents math unchanged; `order-number` → ELY- generator (+ retry); shipping tiers (`dhaka`/`outside`, city match normalized: "dhaka" prefix); checkout summary mirror (city-driven, "Enter city to calculate"); order model += variant snapshots; emails `@elybeauty.com`.

### WS8 — Tests (TDD where behavior changes)
- Update: seed-catalog (19 products/order/category pins), storefront, shopping-flow, auth (emails), mobile-navigation (new panel anatomy + labels), seo-platform (site name/sitemap), money (৳), order-number (ELY-), coupons (৳), hero-carousel (single-slide), db-path (unchanged), cart-widgets (hint threshold ৳).
- New pins: variant carry-through (unit: cart/checkout plans; e2e: select color → drawer → checkout summary → receipt), shipping tiers (unit + e2e Dhaka/outside), COD-only default payment (unit + e2e), WhatsApp float (e2e), /products→/shop redirect (e2e), footer anatomy (e2e).
- Full chain: `lint → typecheck → typecheck:tests → test → build → test:e2e` (exact counts recorded).

### WS9 — Verification & parity
- agent-browser pass on the running build vs `research/live/*.png` (home/shop/product/checkout/login/register/account/mobile panel/search), console-error clean, mobile contract re-verified (390px).
- Screenshot capture (`scripts/capture-screenshots.mjs` updated) → `docs/screenshots/`.

### WS10 — Docs & delivery
- `AGENTS.md`, `CLAUDE.md`, `README.md`, `Project_Architecture_Document.md` regenerated per `skills/{agents-md,claude-md,readme-md,project-architecture-document-md}/SKILL.md`; SKILL renamed `homenest-store-s_SKILL.md` → `ely-beauty_SKILL.md` (v2.0.0 — the re-skin); REMEDIATION_PLAN session-71 section; worklog Task 72; `.env.example` verified.
- Commit 1 (codebase) → push via `docs/ssh_git_wrapper_v3.py --remote git@github.com:nordeim/ely-beauty.git`; docs+screenshots+worklog → commit 2 → push. `main` only.

## 2. Deviations Ledger (clone vs reference)

| Deviation | Why |
|---|---|
| Product/hero/category imagery independently generated | Reference hotlinks third-party CDN; no asset laundering |
| Mobile nav keeps scroll-lock + aria-label flip + conditional mount | Superset a11y; visuals unchanged |
| Search results show ৳ (reference shows `$` in that one surface) | Reference-internal inconsistency; ৳ is the store currency |
| `bastseller` tag typo → `bestseller` | Reference data-entry typo, normalized |
| Bamboo-Oval compare-at ৳11 (noise) not rendered | Compare-at renders only when > price |
| Google button disabled w/ tooltip | No OAuth credentials in-repo |
| Superset features (cart page, wishlist, reviews, coupons, track-order, contact, legal pages, admin console, SEO suite, Stripe-ready payments, 496+ tests) | The superset contract — kept, re-skinned |
| Single hero image both viewports (reference uses two) | Generated-imagery deviation (D2/D12); carousel engine can add slides |
| Order `status` vocabulary kept (pending→…→delivered/cancelled) | Superset admin workflow; reference shows "Pending" |

## 3. Risks & mitigations

- **Schema churn** → `db push --accept-data-loss` + fresh reseed is the documented dev flow; seed is idempotent.
- **Kitchenware-pinned tests** → updated in the same commit as the seed (counts lockstep; no test deleted, only re-pinned).
- **Tailwind v4 traps** → tokens full-hsl, no `tailwind.config.js`, no display-utility toggling, `--shadow-sm` pin kept, `space-y`/`mt` interplay re-checked on the new panel (trap #4).
- **CSP nonce hydration** (static shells) → new/changed routes keep `await connection()` where per-request rendering is required.
- **Screenshot determinism** → capture gates (badge wait, toast dismiss, panel settle, image decode) ported to the new surfaces.

## 4. Definition of Done

1. Gates green with observed output (lint / typecheck / typecheck:tests / unit / build / e2e — counts in docs).
2. agent-browser parity pass on the production build: no console errors, mobile contract verified, key surfaces match the dossier.
3. Screenshots regenerated under `docs/screenshots/`.
4. All five docs + SKILL + worklog + plan aligned; `.env.example` correct; no secrets committed (`git status` clean of `.env`, `db/*.db`, keys).
5. Two commits pushed to `main` via the SSH wrapper; remote ref verified == local HEAD.
