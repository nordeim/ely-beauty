---
name: ely-beauty
description: >
  Production-grade engineering reference for ElyBeauty — a Next.js 16
  App Router e-commerce storefront + admin console (React 19, TypeScript
  strict, Tailwind CSS v4 CSS-first, Prisma 6 + SQLite, Vitest + Playwright),
  built as a visual-and-functional superset of ely-beauty.base44.app
  (re-skinned run-72 from the HomeNest Kitchen scaffold).
  Covers the full architecture, the Tailwind v4 / CSP-nonce / env-shadowing
  trap logs, the integer-cent money contract, the tracking access-control
  model, TDD workflow, debugging playbooks, and the complete pre-ship gate
  chain. Use when extending, debugging, auditing, onboarding, or replicating
  this codebase — every pattern below was verified against a live build.
version: 2.34.0
last_updated: 2026-11-11
project_state: "844 unit tests · 92 e2e tests · lint/typecheck/typecheck:tests/build green · npm audit 0 vulnerabilities · RUN-108 (session 71 cycle): the documentation-vocabulary residue cycle — audit 108-a (12/12 standing anchors, 0 CRITICAL/HIGH/MEDIUM — 5 LOW + 3 INFO; the run-107 change-set re-verified hunk-by-hunk with no dangling references; every live-tense count claim re-verified against the filesystem/vitest run; the vitest + playwright configs verified sane against the running suites; secrets sweep clean; npm audit 0). The cycle's class: the run-107 taka-vocabulary sweep retired the Dollars identifiers in src/ — and its OWN doc sweep left the retired vocabulary alive one stratum further out, in the DOC INVENTORY (the run-107 lesson recurring): S108-1 the doc-vocabulary residue sweep (the PAD §8.1 money row still naming the retired alias and omitting the runs-82/105 describes; the seo-ld row saying cents→dollars over the centsToTaka helper; the SKILL §7.3 money-seam map still naming the retired parser and calling the conversion dollars→cents; seo-ld.test.ts's price title saying decimal-dollar — all re-worded to the current reality, one pass); S108-2 the v2.34 block's payment-intention route typo corrected (a nonexistent route named in an append-only block is an error, not history); S108-3 the §8.2 free-shipping row re-worded from the HomeNest-era dollar nag amounts to the live BDT spec values; S108-4 the admin revenue KPI's DollarSign icon swapped for the currency-neutral Banknote over ৳ values (lucide 0.525.0 ships no taka glyph — the class at the ICON stratum; order-manage-dialog's BadgeDollarSign stays, USD domain); S108-5 the PAD §8.1 table defragged. The countermeasure — the S108 vocabulary net closes the DOC stratum: the PAD/SKILL architecture sections carry no retired money vocabulary, no nonexistent route names, no stale-currency nag amounts (scoped clean per the S104-1 lesson: the SKILL frontmatter project_state is rolling narration, the PAD §11 register is frozen history — both exempt, both load-bearing). RED 6 pins observed by name then GREEN — 838 to 844 unit (+6: four doc-stratum nets in docs-counts + two source pins in layout-tokens), e2e 92 unchanged; parity zero-delta on every pinned surface; the mobile nav functional on both sites — no Tailwind v4 bug. PREVIOUS (run-107): the taka-vocabulary identifier cycle (S107-1..S107-3 — the Dollars identifiers retired across 7 src files, naming-only); PREVIOUS (run-106): the pay-button currency-domain cycle (S106-1..S106-2); PREVIOUS (run-105): the Stripe USD display seam cycle (S105-1..S105-2); PREVIOUS (run-104): the backtracking-proof grammar net cycle (S104-1..S104-2)"
tags:
  - nextjs16
  - react19
  - tailwind-v4
  - prisma
  - sqlite
  - ecommerce
  - rsc
  - tdd
---

# ElyBeauty — Project SKILL

> **How to use this document.** This is the single source of truth for working
> in this repository. `AGENTS.md` is the compact operational brief (commands +
> traps); `CLAUDE.md` the per-conversation guidance; the PAD
> (`Project_Architecture_Document.md`) the deep architecture + ADRs; this file
> is the full engineering reference that binds all three to the code, with the
> debugging playbooks and the hard-won "why" behind every invariant. When a
> section conflicts with the code, **the code and its tests win** — then fix
> the docs in the same change.

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [State & Data-Flow Deep Dive](#6-state--data-flow-deep-dive)
7. [Data Layer: Prisma, Money & the DB-Path Contract](#7-data-layer-prisma-money--the-db-path-contract)
8. [Security Model (Auth, CSP, Rate Limiting, Tracking Access)](#8-security-model)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns (with code)](#15-coding-patterns-with-code)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [The Complete TypeScript Interface Reference](#20-the-complete-typescript-interface-reference)
- [Appendix A — Architecture Decision Records](#appendix-a--architecture-decision-records)
- [Appendix B — Session History & Audit Trail](#appendix-b--session-history--audit-track)
- [Appendix C — Quick Reference Card](#appendix-c--quick-reference-card)

---

## 1. Project Identity & Design Philosophy

**What this is.** ElyBeauty is a production-grade premium-skincare e-commerce
storefront plus admin back office — a **visual-and-functional superset** of
the Base44 reference app at `https://ely-beauty.base44.app/`. "Superset" is
a hard requirement: every reference feature exists here (hero carousel,
category tiles for the four seeded families, featured/new-arrival grids,
product detail with gallery + specs + reviews, guest checkout with the
reference's single-page flow, order tracking timeline, About / Contact /
legal pages), plus features the reference lacks (wishlist, coupons,
order-status workflow with events, addresses book, full admin console,
sitemap/robots/SEO with schema.org JSON-LD rich results, web manifest +
branded error boundaries, analytics).

**Design thesis.** Editorial premium-skincare aesthetic: ivory paper
background, taupe primary (`hsl(30 12% 48%)`), serif display headings
(Cormorant Garamond via `.font-display`), hairline borders, 0-radius / 2px
geometry, generous whitespace. The reference's
sampled pixels are the spec — tokens in `src/app/globals.css` were sampled
from reference screenshots (primary pinned to `hsl(30 12% 48%)`, the taupe
ink the reference renders; background ivory `hsl(30 20% 97%)`).

**Non-negotiable design rules:**

1. **Never "improve" the pinned tokens.** `--shadow-sm` is pinned to v3
   geometry; the radius scale is pinned to the reference's measured px
   (`--radius-sm` 2px · md 4px · lg 6px · `xl` 8px · `2xl` 12px · `3xl` 16px
   — the §19 table is the authoritative copy). v4 shifted both — the pins are
   intentional.
2. **The mobile menu is a push-down panel**, conditionally mounted inside the
   fixed header element (S75-2), trimmed to the SEARCH row + the four links
   (S74-2 — no in-panel close button). It closes via the header toggle AND on
   route change; the active link carries `aria-current` ONLY — the reference
   renders no visible active treatment (S73-4). It is never a slide-over, and
   never toggled via a `hidden` class (see §9.1).
3. **No generic Bootstrap-style UI.** All primitives are shadcn-style
   (`src/components/ui/`) themed through the CSS-first token layer.
4. **Demo honesty.** The payment step is a clearly labeled demo (no real
   charges, only `cardLast4` stored) — don't "wire up" a fake success that
   looks real; the designed seam for real payments is `/api/checkout` +
   `computeOrderMoney` (see §7.3).
5. **`skills/` is excluded** from linting, typechecking, tests, and builds
   (tsconfig + eslint ignore it). Never let tooling reach into it.

## 2. Tech Stack & Environment

Locked versions (from `package.json` — keep this table in sync when bumping):

| Layer | Package | Version | Notes |
|---|---|---|---|
| Framework | `next` | ^16.1.1 | App Router, standalone output, `src/proxy.ts` CSP |
| UI runtime | `react` / `react-dom` | ^19.0.0 | RSC + client islands |
| Language | `typescript` | ^5 | strict, `noUncheckedIndexedAccess`, no `any` |
| Styling | `tailwindcss` + `@tailwindcss/postcss` | ^4 | CSS-first `@theme inline` in `globals.css`; **no tailwind.config.js** |
| Animations | `tw-animate-css` | ^1.3.5 | shadcn dialog/sheet/toast keyframes |
| Data | `prisma` / `@prisma/client` | ^6.19.3 | SQLite, 20 models, relative `file:` URL contract |
| UI primitives | `@radix-ui/*` (dialog, label, select, slot, toast) | latest | accessible shells |
| Styling utils | `class-variance-authority`, `clsx`, `tailwind-merge` | latest | the `cn()` triad |
| Icons | `lucide-react` | ^0.525.0 | only icon set |
| Charts | `recharts` | ^3.1.0 | admin revenue/analytics only |
| Payments | `stripe` + `@stripe/react-stripe-js` + `@stripe/stripe-js` | ^23.0.0 / ^7.0.0 / ^10.1.0 | the Stripe retrofit (PAY-STRIPE-1): OFF by default — 3 env vars + `STRIPE_BDT_PER_USD` gate the Card option; §7.4 carries the contract |
| Validation | `zod` | ^4.6.7 | single boundary: `src/lib/validation.ts` (v4 since S86-1; the v4 sentinel + message pins in `tests/unit/validation.test.ts`) |
| Unit tests | `vitest` + `@testing-library/*` + `jsdom` | ^4.1.12 | `tests/unit/*` |
| E2E | `@playwright/test` | ^1.64.0 | `tests/e2e/*`, standalone server on :3100 |
| Lint | `eslint` (flat) + `eslint-config-next` | ^9 | `eslint.config.mjs` |

**Runtime environment facts:**

- Node ≥ 20, npm ≥ 10. Use `npm` — the committed lockfile is `package-lock.json` (a stray `bun.lock` from the old SPA may exist but is not authoritative).
- The sandbox exports a **global `DATABASE_URL`** that shadows `.env` (§9.3).
- WebKit is **not installable** in the target sandbox — Playwright's mobile project emulates iPhone 13 on Chromium.
- Fonts are self-hosted (`Inter` variable via `next/font`, Cormorant Garamond via `.font-display` CSS var) — no external font CDN (CSP).

## 3. Bootstrapping & Configuration

```bash
npm install                # approve @prisma/engines, esbuild, unrs-resolver postinstalls if asked
cp .env.example .env       # then set AUTH_SECRET (required for production builds)
npm run db:setup           # prisma db push + seed (idempotent)
npm run dev                # http://localhost:3000 (logs tee'd to dev.log)
```

**Verify bootstrap:** `curl localhost:3000/api/health` →
`{"status":"ok","db":"up",...}` (the health route round-trips `SELECT 1`).

| Script | What it really does |
|---|---|
| `build` | `next build` **then** copies `.next/static` and `public/` into `.next/standalone/` — the standalone server needs both; forget the copy and assets 404 |
| `start` | `NODE_ENV=production node .next/standalone/server.js` — reads `PORT` (default 3000); **`.env` is copied into `standalone/` at build time**, so env changes require a rebuild |
| `db:setup` | `db push --accept-data-loss` + `tsx prisma/seed.ts` (idempotent: upserts by slug/email) |
| `test` | Vitest, node env, `tests/unit/*` |
| `typecheck:tests` | `tsc -p tsconfig.tests.json --noEmit` — the unit/e2e/seed sources are type-checked too (part of the gate chain) |
| `test:e2e` | Playwright — `webServer` boots the **standalone** build on :3100 and waits for `/api/health`; run `build` first or you test stale code |
| `lint` / `typecheck` | ESLint 9 flat / `tsc --noEmit` — both must exit 0 |

**Env vars** (`.env.example` is the contract):

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:../db/custom.db` relative to `prisma/schema.prisma` (§7.2) |
| `AUTH_SECRET` | **production: yes** | HMAC key for the session cookie; `assertAuthSecret` **throws at module load** in production if missing/equal to the dev constant (`src/lib/auth-secret.ts`, unit-tested) |
| `NEXT_PUBLIC_SITE_URL` | recommended | metadataBase, sitemap, robots canonical origin |
| `NEXT_PUBLIC_DEMO_MODE` | no | set `"false"` to hide the login demo-credentials box (`src/app/(auth)/login/login-form.tsx`) |

**Demo accounts** (seeded): admin `admin@elybeauty.com` / `Admin123!`;
customer `demo@elybeauty.com` / `Demo1234!`.

## 4. The Design System (Code-First)

Config lives **only** in `src/app/globals.css` (`@theme inline`). There is no
`tailwind.config.js` and adding one is a bug. The header comment in that file
documents the four v4 pins; the full token table is §19.

Key mechanics:

- **Colors are FULL `hsl()` values** inside `@theme inline`. Bare `H S% L%`
  triplets silently resolve to transparent (§9.2).
- `@custom-variant hover (&:hover)` restores v3 hover semantics so touch
  devices still render hover styles.
- Typography: `--font-sans` binds the `next/font` Inter variable; headings use
  `.font-display` (Cormorant Garamond) — the serif look is part of visual parity.
- Radius/shadow pins: see §1 rule 1.

## 5. Component Architecture & Patterns

144 tracked TS files (reproducible count:
`git ls-files src/ | grep -E '\.(ts|tsx)$'` — a `src/**/*.ts` GLOB
pathspec misses `src/proxy.ts` at the src root; use the ls-files form —
count refreshed S96-6 after the run-89..95 growth left the table at 127).
Component split in `src/components/`:
**15 client** (`"use client"`) and **10 server** components (25 `.tsx`
total); 41 client files
across all of `src/` (pages' interactive islands included).

| Folder | Role | Examples |
|---|---|---|
| `src/components/ui/` | shadcn-style primitives (theme-aware) | badge, button, dialog, input, label, select, textarea, toast-primitives, toaster |
| `src/components/store/` | storefront chrome + islands | header, footer, mobile-nav, hero-carousel, product-card, store-chrome (drawer), store-provider, quantity-stepper, star-rating |
| `src/app/(storefront)/` | public pages (RSC, `force-dynamic` via layout) | home, products, product/[id], cart, checkout, track-order, account, admin/*, about, contact, legal/[slug] |
| `src/app/(auth)/` | login/register (layout awaits `connection()` — §8.2) | |
| `src/app/api/` | route handlers | cart, cart/bulk, cart-summary, wishlist, checkout, coupon/apply, addresses, contact, newsletter, search, health, stripe/payment-intent, stripe/webhook |
| `src/lib/` | pure logic + singletons | db, auth, auth-secret, cart, wishlist, money, order-money, coupons, cart-quantity, order-tracking, rate-limit, settings, products, validation, csp, db-path, format, password |
| `src/lib/actions/` | Server Actions | auth, admin, reviews |
| `prisma/` | schema + seed | 20 models; seed is idempotent |
| `tests/unit/`, `tests/e2e/` | Vitest / Playwright | helpers: `tests/e2e/helpers.ts` (`gotoHydrated`) |

**The golden rule:** RSC by default; `"use client"` only for interactive
islands. Data fetching happens in Server Components via Prisma directly;
client islands fetch only through `/api/*` route handlers or Server Actions.

## 6. State & Data-Flow Deep Dive

- **Global client store** (`src/components/store/store-provider.tsx`): a
  single React context carrying `mobileNavOpen`, `searchOverlayOpen`,
  `cartDrawerOpen`, `cartCount`. It also sets `document.documentElement.dataset.hydrated`
  — the **hydration sentinel** every e2e test waits for (`gotoHydrated()` in
  `tests/e2e/helpers.ts`). Clicks before the sentinel fall back to native form
  GETs — that race produced three real bug reports during the build.
- **Cart/wishlist flow:** client island → `POST/PATCH/DELETE /api/cart` (guest
  token cookie `homenest_cart`, merged into the user's cart on login) →
  response carries `itemCount` → `setCartCount`. The header badge and the
  drawer are pure mirrors of that number.
- **Optimistic updates** follow one pattern everywhere (cart page
  `cart-lines.tsx`, drawer `store-chrome.tsx`): snapshot `prev`, optimistic
  `setState`, `setPendingId(lineId)` (per-line lock), fetch, on error roll
  back to `prev`, `finally` clear pending. Buttons `disabled={pendingId === line.id}`.
- **Toasts** (`@radix-ui/react-toast` via `useToast`): the `Toaster` is an
  **ancestor** of `{children}` in the root layout, not a sibling — a sibling
  placement breaks context reach and 500s every toast-using page (§9.5).
- **Money on the client is cosmetic.** Client totals mirror
  `computeOrderMoney`'s formula for display only; the server re-derives
  everything at `/api/checkout` (§7.3).

## 7. Data Layer: Prisma, Money & the DB-Path Contract

### 7.1 Schema shape

20 models (`prisma/schema.prisma`): `User`, `Session`, `Category`,
`ProductCategory`, `Product`, `Review`, `Cart`, `CartItem`, `Wishlist`,
`WishlistItem`, `Address`, `Order`, `OrderItem`, `OrderEvent`, `StripeEvent`,
`Coupon`, `CarouselSlide`, `StoreSetting`, `NewsletterSubscriber`,
`ContactMessage`.

Conventions:
- All money columns are **`Int` cents** (`price`, `subtotal`, `shipping`,
  `tax`, `discount`, `total`, `unitPrice`, thresholds in `StoreSetting`).
- SQLite has no enums — vocabularies (`ORDER_STATUSES`, `SHIPPING_METHODS`,
  `PAYMENT_METHODS`, `ROLES`) are `as const` arrays in `src/lib/validation.ts`
  and validated by Zod at the boundary.
- Snapshots: `OrderItem` copies `nameSnapshot` / `imageSnapshot` /
  `unitPrice` at purchase time (catalog edits never rewrite history);
  `Order.shippingAddress` is a JSON snapshot string.
- `Order.number` is `ELY-XXXXXXXX` (crypto-random base36 — the reference's
  format, run-72); allocation retries on `P2002` (`placeOrderWithRetry`).

### 7.2 The DB-path contract (pinned by `tests/unit/db-path.test.ts`)

`.env` carries `DATABASE_URL="file:../db/custom.db"`. A relative `file:` URL
resolves against `prisma/schema.prisma` — for the CLI **and** at runtime via
`src/lib/db-path.ts` — so `db:push`, `db:seed`, `next dev`, `next build`, and
the standalone server all open ONE file: `<repo>/db/custom.db`, regardless of
CWD or standalone relocation. Absolute `file:` URLs and non-SQLite URLs pass
through untouched. `db/` is git-ignored (recreate with `db:setup`).

### 7.3 The money seam

- `src/lib/money.ts`: `formatMoney` (display) + `parseAmountToCents`
  (admin input). The **only** place taka→poisha conversion happens.
- `src/lib/order-money.ts`: `computeOrderMoney({ subtotal, discount,
  shippingMethod, freeShippingThresholdCents, standardShippingCents,
  expressShippingCents, taxRatePercent })` — pure, integer, unit-tested
  (`tests/unit/order-money.test.ts` pins threshold/waive-tax/tax rounding).
- `/api/checkout` is the only caller that matters: it re-reads the cart from
  the DB, then **inside the transaction** re-reads prices from live `Product`
  rows, re-validates the coupon (`isCouponRedeemable` — active, unexpired,
  under its `maxRedemptions` cap; `timesUsed` increments with the order),
  derives subtotal from those snapshots and computes shipping/tax/total via
  `computeOrderMoney`. The client never sends an amount; card receipts
  derive from the verified PaymentIntent (the order's `cardLast4` is read
  from the intent server-side — S73-8 — never client-sent).
  Pre-transaction reads are a fast-fail UX path only — never the authority.
- Placement is **idempotent**: the client sends one `idempotencyKey`
  (`crypto.randomUUID()` per checkout visit, `Order.idempotencyKey` unique
  nullable column). A replay — same key — returns the already-placed order's
  `{ orderNumber, token }` instead of double-ordering; a `P2002` on the key
  resolves to the winning order (the retry loop only retries `number`
  collisions).
- Stock is reserved with a **conditional atomic decrement** (`updateMany`
  with `stock: { gte: qty }`, rollback when `count === 0`) — see §8.4.

### 7.4 Stripe payments (the session-61 retrofit — see docs/DEPLOYMENT.md §4)

Proper Stripe Payment functionality, ported from the `ecommerce-store`
reference and adapted to this repo's money model. **OFF by default**: with
no `STRIPE_SECRET_KEY` the checkout renders the Cash-on-Delivery flow
byte-identically — no Card option at all (`resolveStripeConfig().cardEnabled`
gates it; the e2e suite runs unconfigured and stays green untouched);
Stripe is a superset activation.

- **Config (the sentinel mirror)**: `src/lib/stripe-config.ts` is the ONE
  client-safe truth table both sides derive "configured" from —
  `resolveStripeConfig(env)` (server) and `isPublishableKeyConfigured(pk)`
  (the island's mirror) can never disagree; "set-me" placeholders are NOT
  configuration. Three env vars: `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (empty in
  `.env.example` = the demo default).
- **The mint** (`POST /api/stripe/payment-intent`): re-derives the cart +
  coupon + settings server-side through `computeOrderMoney` (money is
  server truth — nothing the client sends can move the amount), creates
  the intent with the deterministic idempotency key
  `sha256(cartId:total:snapshotHash)`, and returns the clientSecret. The
  intent's **metadata** carries the full placement input (address
  snapshot, email, name, shipping method, coupon, cartToken,
  idempotencyKey) — the webhook's rebuild contract.
- **The island** (`src/components/checkout/stripe-pay.tsx`): the combined
  Payment & Review panel (the PaymentElement must stay mounted with its
  confirm button — steps 2+3 collapse when configured + card). Card data
  NEVER touches this app (PCI SAQ-A): the element is a Stripe iframe; the
  `/pure` loader entry keeps even stripe.js from loading unless the path
  is live. `elements.submit()` → `confirmPayment({ redirect:
  "if_required" })` → the confirmed intent id rides the EXISTING
  `/api/checkout` submit (the island never places the order itself).
- **The placement** (`/api/checkout` + `placeOrderTx`): the server
  retrieves + verifies the intent (status/amount/currency) OUTSIDE the tx
  (no external call holds the SQLite write lock); `Order.
  stripePaymentIntentId` UNIQUE is the placement idempotency anchor (a
  retried submit resolves to the already-placed order); the in-tx money
  authority re-derives the total and a drift throws
  `StripeAmountMismatchError` (the residual TOCTOU guard — order, stock,
  AND the coupon burn roll back together).
- **The webhook backstop** (`POST /api/stripe/webhook`): raw-body
  signature verification (300s tolerance) → the dedup row
  (`StripeEvent.eventId` UNIQUE) commits **WITH** the placement inside
  `placeOrderTx` (the H4d/L9 rule: a transient failure rolls both back,
  the 500 makes Stripe retry the FULL placement). The failure policy
  (`classifyWebhookPlacementError`): duplicate (P2002 on
  eventId/stripePaymentIntentId/idempotencyKey) → 200 with the winner;
  permanent (CheckoutError 4xx or the amount guard — deterministic) →
  record + the `failureReason` code + the ops refund trail; transient →
  500, Stripe retries up to 3 days. `charge.refunded` is the refund
  state's SINGLE writer (the reflection updates `paymentStatus` +
  appends the `payment_refunded` OrderEvent in one tx).
- **The refund loop**: the order dialog's "Refund via Stripe" renders
  from the SAME `refundEligibility` seam that guards
  `refundOrderAction` (button and action can never disagree); the action
  fires ONE idempotent full refund (`refund:<intentId>` Stripe key) and
  NEVER writes refund state — the webhook does. `/admin/payments` is the
  operator's event ledger (a succeeded event with no linked order = the
  **Refund needed** signal; the failureReason enrichment explains why).
- **CSP**: `buildCsp({ ..., stripeConfigured })` — script-src gains
  js.stripe.com, connect-src gains api.stripe.com, frame-src (js.stripe.com
  + hooks.stripe.com) appends; unconfigured stays byte-identical (pinned
  by `tests/unit/csp.test.ts`).
- **Tests**: `stripe-config` (the mirror's truth table),
  `stripe-payment` (26 seam pins), `admin-payments` (the eligibility/
  outcome/reason derivations), the csp configured pins, and five
  real-engine `placeOrderTx` pins (paid placement + anchor P2002, the
  amount-drift rollback, the dedup-commits-with-placement, the
  dedup-rolls-back-with-failure).

## 8. Security Model

### 8.1 Auth & sessions

- Passwords: **scrypt** (N=16384, r=8, p=1, 64-byte key — OWASP 2023
  interactive baseline), format `scrypt$N$r$p$saltB64$hashB64`
  (`src/lib/password.ts`).
- Sessions are DB rows; the cookie is `homenest_session` = `<token>.<hmac>`
  where the token is 256-bit random stored **hashed** (SHA-256) and the HMAC
  is an integrity-in-depth layer keyed by `AUTH_SECRET`
  (`src/lib/auth.ts`). Comparisons are `timingSafeEqual`.
- `AUTH_SECRET` is enforced: `assertAuthSecret` throws at module load when
  `NODE_ENV=production` and the secret is missing or the dev constant
  (`src/lib/auth-secret.ts`, unit-tested in `tests/unit/auth-secret.test.ts`).
- Login is **anti-enumeration**: one uniform "Invalid email or password."
  message, and an unknown account burns a dummy scrypt verify so timing
  matches a real check (`src/lib/actions/auth.ts`). Rate-limited 10/min per
  email. Expired sessions are opportunistically purged on login.
- Registration catches Prisma `P2002` (the check-then-create race) and maps
  it to the friendly duplicate-email message. Rate-limited 5/min per email.

### 8.2 CSP nonce trap (Next 16 + `src/proxy.ts`)

The proxy stamps a **per-request nonce** CSP on every response; Next applies
the request-header nonce to the scripts it renders. A **prerendered/static
page bakes no (or build-time) nonces** → the browser silently refuses its
scripts → hydration never happens, with **zero console errors**. Symptom: a
page that loads, paints, but never hydrates.

Fix: make the route render per-request — `await connection()` in the layout
(`force-dynamic` alone did NOT de-prerender in Next 16.4). The `(auth)`
layout carries this fix with a comment; do not remove it. Pinned by the auth
e2e specs. (The 404 shell stays prerendered — accepted, it has no islands.)

### 8.3 Rate limiting (`src/lib/rate-limit.ts`)

In-memory fixed-window limiter: `rateLimit(key, limit, windowMs) → { ok,
retryAfterSec }`, opportunistic stale-bucket sweep. Single-process by design;
swap internals for a shared store if the deployment scales out (the sync
signature is the only coupling — a shared store forces async at all call
sites). The shared `clientIp()` helper derives the per-IP key from
`cf-connecting-ip` first (unless `TRUST_CF_CONNECTING_IP="false"`), then the
RIGHTMOST `x-forwarded-for` hop (the position the nearest trusted proxy
appends); missing both → `"direct"`. Wired into:
`loginAction` (10/min/email **plus 30/min/IP** — the email key alone is
attacker-chosen, and every attempt burns real scrypt CPU), `registerAction`
(5/min/email plus 30/min/IP), `changePasswordAction` (10/min/email plus
30/min/IP — the S92-2f rotation surface), `submitReviewAction` (**two-tier**:
a per-IP 20/min ceiling above the 5/min per-author tier — the shared-IP
classroom case), `/api/contact` (5/min/IP), `/api/newsletter`
(5/min/IP), `/api/coupon/apply` (30/min/IP), `/api/checkout` (20/min/IP),
`/track-order` lookups (30/min/IP), `/api/cart` POST + PATCH + DELETE and
`/api/wishlist` POST (60/min/IP — guest-reachable writes), `/api/cart/bulk`
(10/min/IP — the batch write), `/api/cart-summary` GET (120/min/IP — the
badge's per-navigation refresh), `/api/addresses` POST + PATCH + DELETE
(60/min/IP), `/api/stripe/payment-intent` (10 per 10 min, keyed user-or-IP),
and `/api/search`
GET (120/min/IP — per-keystroke typeahead). Limits are deliberately generous
so humans and the e2e suite are unaffected.

### 8.4 Order tracking access control (the HIGH-severity fix)

Order numbers are **printed on every receipt** (and crypto-random
`ELY-XXXXXXXX` since run-72 — no sequence to enumerate), so the number
alone must never unlock PII. `/track-order` requires the order number **plus
the purchase email** (`trackOrderSchema` in `src/lib/validation.ts`); the
match is case-insensitive via `emailsMatch` (`src/lib/order-tracking.ts`,
unit-tested). Wrong-email, missing-email, and unknown-number all render the
same "couldn't find an order" alert (no enumeration oracle). The checkout
success page deep-links with both fields prefilled. E2E
(`tests/e2e/shopping-flow.spec.ts`) pins the full contract: number-only →
alert + zero PII; wrong email → alert; correct pair → order timeline.

**The same bug class on `/checkout/success` (fixed session 3):** the receipt
page rendered buyer email + address + spend from a bare `?order=` param.
Now `/api/checkout` mints an **order-access token**
(`src/lib/order-access.ts` — HMAC-SHA256 of the number keyed by
`AUTH_SECRET`, domain-separated, 128-bit hex) and the page renders the full
receipt ONLY for a valid `order`+`token` pair; anything else renders the
SAME "couldn't find that order" shell — an attacker cannot even observe that
an order number exists. The page is `noindex`. Pinned by the shopping-flow
e2e (guess → locked shell + zero PII; 32-char token in the redirect URL).

### 8.5 Boundary discipline

- **Zod at every boundary** — all Server Actions and all POST/PATCH bodies.
  (`/api/cart` DELETE `?line=` and `/api/search` `?q=` are raw strings;
  read-only and ownership-scoped — accepted.)
- **Admin is role-gated server-side**: every action in
  `src/lib/actions/admin.ts` starts with `requireAdmin()`; the layout checks
  too. Client checks are UX only.
- **Checkout hardening:** malformed JSON → 400 (not 500) on every route that
  reads a JSON body (cart, checkout, wishlist, contact, newsletter,
  addresses); a quantity-0 line can never be created
  (`clampPurchaseQuantity` in `src/lib/cart-quantity.ts` — the cart PATCH
  **deletes** the line) and a stale one is rejected with 409 before pricing;
  stock decrement is a conditional atomic `updateMany` inside the
  transaction (the check-then-decrement race is closed); the PATCH response
  carries the server-clamped `quantity` so optimistic islands can mirror it.
- **Order lifecycle:** `src/lib/order-status.ts` — `cancelled` and
  `delivered` are terminal (`canTransitionOrderStatus`); moving a live order
  to `cancelled` restocks every item inside the SAME admin transaction
  (`shouldRestockOnStatusChange`), exactly once.
- **Login merges the guest cart + wishlist** (`mergeGuestCarts` in
  `src/lib/actions/auth.ts`): `getOrCreateCart`/`getOrCreateWishlist` run
  right after `createSession`, best-effort — without them a guest with a
  full cart would see a stale cart after signing in. The cart merge itself
  is planned by the pure `computeMergedQuantities` (`src/lib/cart-merge.ts`,
  unit-pinned) and applied as **one transaction** with idempotent
  final-quantity upserts — a retried merge can never double-count.
- Cookies: `httpOnly`, `SameSite=Lax`, `secure` in production
  (`homenest_session`, `homenest_cart`, `homenest_wishlist` all aligned).
- Output safety: zero `dangerouslySetInnerHTML` except the two JSON-LD data
  blocks (builder-owned, no user-authored HTML reaches them); carousel
  `ctaLink` and product `images` accept only internal paths or `http(s)`
  URLs (`safeLinkSchema` / `imageUrlSchema`) — the production CSP is
  `img-src 'self' data:`, so anything else would silently never render.
- Platform headers: `poweredByHeader: false` (no framework fingerprint),
  HSTS with `includeSubDomains`, `Permissions-Policy` disabling
  camera/microphone/geolocation/payment.
- Error surfaces: `(storefront)/error.tsx` + `global-error.tsx` render the
  branded error card — keep them dependency-free.

## 9. Anti-Patterns & Common Bugs

### 9.1 The Tailwind v4 display-utility toggle (THE mobile-nav bug)

v4 changed display-utility generation order, so JS-toggling the `hidden`
class on an element that also carries `flex`/`block` is unreliable
(tailwindlabs/tailwindcss#15884, #18653); preflight's `[hidden]` is also
`!important`. Symptom: the mobile menu opens once, then never again, or
flashes. **Rule:** never JS-toggle a display utility. Overlays/menus mount
conditionally via React state (`mobile-nav.tsx`: `if (!mobileNavOpen) return
null;`) or animate with transform/opacity. Pinned by
`tests/e2e/mobile-navigation.spec.ts` (6 assertions incl. double-open/close
cycles).

### 9.2 Bare HSL triplets in `@theme inline`

`--color-primary: 24 70% 50%` silently resolves to transparent under `@theme
inline`. Always full values: `hsl(24 70% 50%)`.

### 9.3 Environment shadowing of `DATABASE_URL`

Any `DATABASE_URL` already in the process env (shell export, CI inject)
**wins over the repo `.env`** — Prisma never overrides existing process env.
Symptom: `db/custom.db` never appears at the repo root, or rows survive
"fresh" reseeds. Diagnose:
`node -e "console.log(process.env.DATABASE_URL)"` from the repo root. Fix:
converge the paths (symlink/hardlink) or unset before DB commands.

### 9.4 Prerendered page + per-request nonce = silent non-hydration

§8.2. The trap's signature is **no console errors** — don't debug the JS,
debug the rendering mode (`x-nextjs-prerender` response header).

### 9.5 Toaster as a sibling of `{children}`

The toast context must **wrap** the page tree in the root layout. Sibling
placement 500s every toast-using page during SSR.

### 9.6 Check-then-act across an await

Stock validation via `findUnique` followed by a separate `update` is a race.
Any "validate then write" pair inside a transaction must become a single
conditional write (`updateMany` with the guard in `where`) + count check.

### 9.7 Zero-quantity ghost lines

Clamping `Math.min(qty, stock)` to 0 and persisting it creates a line that
checkout "buys" for $0 (the `stock < quantity` guard passes for `0 < 0`).
Clamp to 0 ⇒ delete the line; checkout backstops with a 409 filter.

### 9.8 Sequential IDs as an authz decision

`/track-order?number=…` used to render full PII for guessable numbers. Any
object exposed publicly needs a second, unguessable or knowledge-based factor
(here: the purchase email), or an ownership check.

### 9.9 React 19 clears uncontrolled form inputs after every action (S92-2)

`<form action={formAction}>` (with `useActionState` or a plain server
action) **resets every uncontrolled input when the action resolves** —
including on FAILURE (the state comes back, the fields come back empty).
Verified live in run 92: after a failed login, both the email and password
boxes read `""`. Any test (or script) that submits the same form a second
time must **re-fill every field**, not just the one that changed — the
password-change e2e's first run submitted an empty email this way and the
relogin "failed" with the previous attempt's stale error on screen.
Controlled inputs (`value=` + onChange) are unaffected; the demo quick-fill
box sets `.value` directly for the same reason.

## 10. Debugging Guide

| Symptom | Likely cause | Play |
|---|---|---|
| Page paints but never hydrates, **no console errors** | Prerendered shell + per-request CSP nonce (§8.2) | Check `x-nextjs-prerender` header; add `await connection()` to the route's layout |
| Mobile menu won't open/close reliably | `hidden`-class JS toggle (§9.1) | Mount conditionally; run `npx playwright test tests/e2e/mobile-navigation.spec.ts` |
| Element invisible / transparent backgrounds | Bare HSL triplet in `@theme` (§9.2) | Use full `hsl()` values |
| DB file appears in the wrong place / reseed keeps rows | env shadowing (§9.3) | Diagnose with node one-liner; converge paths |
| E2E clicks do nothing, native GET in URL | Clicks raced hydration | Use `gotoHydrated()`; never raw `goto` + click |
| Standalone assets 404 | `build` didn't copy static/public into `standalone/` | Re-run `npm run build` (the script does the copies) |
| Prod server refuses to start with AUTH_SECRET error | `assertAuthSecret` gate | Set a real `AUTH_SECRET` in `.env` (build copies it into `standalone/`) |
| Checkout returns 409 "Only N left" | Live stock lower than cart line | Expected UX; test with seeded stock |
| Toast throws / no toast renders | Toaster not an ancestor of children (§9.5) | Fix root layout nesting |
| Tests hit rate limits | Reused server across runs + tight window | Restart the standalone server, or raise the limit for local runs |

## 11. Pre-Ship Checklist

Run the full chain — it is the only gate:

```bash
npm run lint && npm run typecheck && npm run typecheck:tests && npm run test && npm run build && npm run test:e2e
```

Then verify by hand:

- [ ] `curl localhost:3000/api/health` → `"db":"up"` (server + DB contract)
- [ ] Mobile menu opens/closes twice in a row (v4 trap regression)
- [ ] Login wrong-password **and** unknown-email show the SAME message
- [ ] `/track-order?number=<valid>` alone shows the alert (no PII)
- [ ] A guest can add to cart, checkout, and see `ELY-XXXXXXXX`
- [ ] Admin console loads every section with the admin account
- [ ] `git status` shows no `.env`, `db/*.db`, keys, or `node_modules`
- [ ] New external inputs pass through a Zod schema
- [ ] Any money change has a `computeOrderMoney` / unit test counterpart

## 12. Lessons Learnt & How to Avoid Them

1. **The e2e suite is the spec.** Three production bugs (Toaster nesting,
   CSP-nonce hydration, cart-badge races) were found only by driving the real
   standalone server — unit tests were all green. Reproduce test failures
   against the standalone server before touching code.
2. **Framework migration docs are not enough; pin behavior with tests.** The
   v4 display-order bug and the nonce trap are both invisible until a test or
   a user hits them. The regression specs exist so the next agent can't
   reintroduce them by "simplifying".
3. **`force-dynamic` is not a de-prerender switch in Next 16.4** —
   `connection()` is. Don't trust names; check the response header.
4. **Money math must have exactly one home.** Every "small" formatting change
   outside `money.ts`/`order-money.ts` drifts the totals. The unit tests pin
   the seam — extend them instead of duplicating math.
5. **Anti-enumeration is a UX contract, not a crypto one.** Uniform errors
   must be genuinely uniform (message AND timing — hence the dummy scrypt
   burn), and the e2e suite asserts both paths.
6. **Document traps where they will be read** — the header of `globals.css`,
   the comment above `await connection()`, the trap log in `AGENTS.md`. A
   README-only warning gets skipped; an in-file comment at the point of
   temptation does not.
7. **Snapshot at write time.** Orders copy name/image/price so catalog edits
   and price changes never corrupt history. Don't join back to the live
   product for receipts.
8. **Idempotent seeds are a superpower.** `db:setup` anytime; the seed
   upserts by natural keys (slug/email). New fixtures = extend `prisma/seed.ts`,
   never hand-edit the DB.

## 13. Pitfalls to Avoid

- Don't add `tailwind.config.js` — CSS-first only.
- Don't remove the `connection()` pin in the `(auth)` layout.
- Don't JS-toggle `hidden`, `flex`, `block` on the same element.
- Don't "upgrade" the pinned `--shadow-sm` / radius scale / hover variant.
- Don't trust `process.env.DATABASE_URL` in the sandbox — check for shadowing.
- Don't read `.env` at runtime in standalone mode and expect repo-relative
  paths — the build copies `.env`; runtime CWD is `.next/standalone`.
- Don't return rich error detail from auth (enumeration), and don't skip the
  dummy-hash burn because tests "feel" slower.
- Don't store full card data — card data never touches this app (PCI SAQ-A
  via the Payment Element); the order stores only the intent-derived
  `cardLast4`.
- Don't commit `.env`, `db/*.db`, `*.key`, `ssh-key.txt` (gitignore enforces).
- Don't create feature branches — `main` only, Conventional Commits, atomic.

## 14. Best Practices

- **TDD order:** failing test → minimal fix → full gate chain. The repo's
  tests encode contracts (db-path, order-money, rate-limit, auth-secret,
  tracking access, cart clamp); extend them first.
- **One validation module.** New inputs = new Zod schema in
  `validation.ts` + unit test; reuse `emailSchema`/`passwordSchema`.
- **Server-first rendering:** fetch in RSC via Prisma; islands only for
  stateful UI; route handlers only for island fetches.
- **Batch DB reads** (`Promise.all` + `include`); there are no N+1s in the
  codebase today — keep it that way; cap unbounded reads with `take` where
  the UI is bounded (home grids use `take: 8`).
- **Cookies through helpers:** `CART_COOKIE` / `findCartId` / `cookieOptions`
  in `lib/cart.ts` and the wishlist equivalents — never re-hardcode names or
  flags.
- **Evidence over assertion:** a change is done when lint+typecheck+tests+
  build are green and affected e2e specs pass — not when it looks right.

## 15. Coding Patterns (with code)

### 15.1 Conditional-mount overlay (v4-safe)

```tsx
// src/components/store/mobile-nav.tsx — never toggle `hidden`
export function MobileNav() {
  const { mobileNavOpen } = useStore();
  if (!mobileNavOpen) return null;          // ← the whole trick
  return <div data-testid="mobile-menu">…push-down panel…</div>;
}
```

### 15.2 Zod boundary + action state

```ts
// src/lib/actions/auth.ts (shape)
const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
if (!parsed.success) return { error: firstError(parsed.error) };
const limit = rateLimit(`login:${parsed.data.email}`, 10, 60_000);
if (!limit.ok) return { error: `Too many sign-in attempts. Please try again in ${limit.retryAfterSec}s.` };
// uniform failure path + dummy scrypt burn for unknown accounts
```

### 15.3 Atomic stock reservation inside the order transaction

```ts
// src/app/api/checkout/route.ts — guard lives in the WHERE, not in JS
const reserved = await tx.product.updateMany({
  where: { id: item.productId, stock: { gte: item.quantity } },
  data: { stock: { decrement: item.quantity } },
});
if (reserved.count === 0) throw new CheckoutError(409, "Stock just ran out …");
```

### 15.4 Optimistic update with per-line lock and rollback

```tsx
// cart-lines.tsx / store-chrome.tsx (drawer)
const prev = lines;
setLines(optimistic); setPendingId(line.id);
try { const res = await fetch("/api/cart", {…});
  if (!res.ok) throw new Error(data.error ?? "Could not update your cart.");
  if (typeof data.itemCount === "number") setCartCount(data.itemCount);
} catch { setLines(prev); } finally { setPendingId(null); }
```

### 15.5 Hydration-gated e2e

```ts
// tests/e2e/helpers.ts
export async function gotoHydrated(page: Page, path: string) {
  await page.goto(path);
  await page.waitForSelector('html[data-hydrated="true"]');
}
```

## 16. Coding Anti-Patterns

- `any` / `as any` — banned (strict TS, lint).
- `parseFloat`/`Number()` on price fields outside `money.ts` — banned; money
  is integer cents.
- Manual `typeof x === "string"` validation for request bodies instead of Zod.
- `useState` mirrored from props via `useEffect` — use the
  adjust-during-render pattern (see `cart-lines.tsx` lines 30-34).
- Client-trusted totals/prices — the server re-derives; client mirrors only.
- Feature branches / long-lived WIP commits — `main` + atomic Conventional
  Commits only.

## 17. Responsive Breakpoint Reference

Tailwind default scale as used in the codebase:

| Breakpoint | Width | Primary usage |
|---|---|---|
| (base) | < 640px | mobile-first stack; hamburger + push-down menu; drawer is full-width |
| `sm` | ≥ 640px | 2-col forms/grids, container padding |
| `md` | ≥ 768px | product grid 2→3, checkout 2-col summary |
| `lg` | ≥ 1024px | desktop header nav appears (`hidden lg:flex`), hamburger hides (`lg:hidden`), admin sidebar rail |
| `xl` | ≥ 1280px | max content width caps; 4-col home grids |

E2E pins: desktop 1440×900 (Desktop Chrome), mobile iPhone 13 viewport on
Chromium (`playwright.config.ts`).

## 18. Z-Index Layer Map

| z | Used by |
|---|---|
| `z-10` | sticky header, badge overlays on cards |
| `z-40` | mobile nav panel (below drawer/backdrop) |
| `z-50` | cart drawer + its backdrop, Radix dialog/sheet/toast portals |
| `z-[100]` | toast viewport (must beat everything) |

Rule: overlays are portal-rendered at `z-50`; nothing custom above `z-[100]`.

## 19. Color Reference (Complete)

From `src/app/globals.css` `@theme inline` (all values exact — the ElyBeauty
re-skin palette, S96-6 resync after the table had frozen at the pre-re-skin
kitchen era):

| Token | Value |
|---|---|
| `--color-background` | `hsl(30 20% 97%)` (ivory paper) |
| `--color-foreground` | `hsl(0 0% 10%)` |
| `--color-card` | `hsl(30 20% 97%)` / `--color-card-foreground` `hsl(0 0% 10%)` |
| `--color-popover` / popover-foreground | `hsl(0 0% 100%)` / `hsl(0 0% 10%)` |
| `--color-primary` | **`hsl(30 12% 48%)`** (taupe) |
| `--color-primary-foreground` | `hsl(30 20% 97%)` |
| `--color-secondary` | `hsl(30 15% 93%)` / secondary-foreground `hsl(0 0% 10%)` |
| `--color-muted` | `hsl(30 10% 94%)` / `--color-muted-foreground` `hsl(0 0% 40%)` |
| `--color-accent` | `hsl(30 15% 93%)` (soft warm wash) |
| `--color-accent-foreground` | `hsl(0 0% 10%)` |
| `--color-destructive` | `hsl(0 84.2% 60.2%)` / destructive-foreground `hsl(0 0% 98%)` |
| `--color-border` | `hsl(30 10% 88%)` |
| `--color-input` | `hsl(30 10% 88%)` |
| `--color-ring` | `hsl(30 12% 48%)` |
| `--color-success` | `hsl(140 20% 33%)` / success-foreground `hsl(0 0% 98%)` |
| `--color-badge-sale` | `hsl(0 84.2% 60.2%)` (reference red) |
| `--color-badge-featured` | `hsl(0 0% 10%)` (BESTSELLER near-black) |
| Radius pins | sm 2px · md 4px · lg 6px · **xl 8px · 2xl 12px · 3xl 16px** |
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` (v3 geometry pin) |

The header family's only `rounded-full bg-primary` element is the cart-count
badge — a reference-matched utility-class pair, not a token; do not tokenize
it away. (The panel's green circular close button was the pre-S74-2 anatomy;
the trimmed panel closes via the header toggle.)

## 20. The Complete TypeScript Interface Reference

The load-bearing types (see each module for the rest):

```ts
// src/lib/auth.ts
export type SessionUser = { id: string; email: string; name: string; phone: string | null; role: string };

// src/lib/cart.ts
export type CartLine = { id: string; productId: string; name: string; image: string;
  unitPrice: number; quantity: number; lineTotal: number; stock: number };
export type CartSummary = { lines: CartLine[]; itemCount: number; subtotal: number };

// src/lib/order-money.ts
export type OrderMoneyInput = { subtotal: number; discount: number;
  shippingMethod: "standard" | "express"; freeShippingThresholdCents: number;
  standardShippingCents: number; expressShippingCents: number; taxRatePercent: number };
export type OrderMoney = { shipping: number; tax: number; total: number };

// src/lib/rate-limit.ts
export type RateLimitResult = { ok: boolean; retryAfterSec?: number };

// src/lib/validation.ts (schemas are the contract)
trackOrderSchema = { number: string(uppercased); email: string(lowercased) }
checkoutBodySchema = checkoutSchema & { cardLast4?: string /* ^\d{4}$/ */ }

// src/lib/actions/auth.ts
export type AuthFormState = { error: string | null };

// src/lib/actions/reviews.ts
export type ReviewActionResult = { ok: true } | { ok: false; error: string };
```

---

## Appendix A — Architecture Decision Records

Full rationale lives in `Project_Architecture_Document.md` §1; the index:

| ADR | Decision |
|---|---|
| ADR-001 | Next.js 16 App Router (not a Vite SPA, not a separate API server) |
| ADR-002 | SQLite via relative `file:../db/custom.db` resolved against `prisma/schema.prisma` |
| ADR-003 | DB-backed sessions + HMAC-signed cookie + scrypt (Auth.js/NextAuth rejected) |
| ADR-004 | Guest carts/wishlists via token cookies, claimed & merged on login |
| ADR-005 | Integer-cent money; server-side re-derivation via `computeOrderMoney` |
| ADR-006 | Per-request CSP nonces via `src/proxy.ts` (+ the prerender trap it creates) |
| ADR-007 | Tailwind v4 CSS-first theme with reference-pinned tokens + trap log |

Session-2 additions (recorded in `docs/REMEDIATION_PLAN.md`): tracking
requires number+email; `AUTH_SECRET` enforced in production; in-memory rate
limiter; atomic stock reservation; uniform login errors; demo-mode gate.

## Appendix B — Session History & Audit Trail

- **Session 1 (migration):** Vite SPA (client-only, localStorage, client-side
  SHA-256 "auth") → Next.js 16 + Prisma full-stack superset. Reference recon
  via agent-browser (13 screenshots, 8-product catalog + images scraped).
  69 unit + 28 e2e green; pushed as `87cfa40`.
- **Session 2 (remediation):** full re-audit (0 critical / 1 high /
  6 medium / 14 low); remediation plan at `docs/REMEDIATION_PLAN.md`; all
  planned fixes executed TDD-first; gates re-run green (94 unit / 28 e2e);
  screenshots refreshed; `homenest-store-s_SKILL.md` + `worklog.md` created.
- **Session 3 (hardening):** fresh deep audit (1 HIGH / 4 MEDIUM / 4 LOW);
  token-gated `/checkout/success` receipts (HMAC `order-access.ts`),
  idempotent checkout (`Order.idempotencyKey @unique`), money derived inside
  the order transaction, order-status workflow + cancel-restock, login
  cart/wishlist merge, coupon lifecycle (`expiresAt`/`maxRedemptions`/
  `timesUsed`). 115 unit + 31 e2e green.
- **Session 4:** re-validation + fresh deep audit (0 HIGH /
  1 MEDIUM / 12 LOW + nits). Per-IP auth budgets (`clientIp()`), atomic
  coupon-cap increment (`couponRedemptionWhere`), transactional cart POST
  with the shared clamp, cart/wishlist POST limiters, six FK/hot-path
  `@@index` entries, `mergeReviewAggregate` (fixes the parity-count
  collapse), create-only coupon seeding, sitemap/robots privacy contract,
  dead-script removal, `tsconfig.tests.json` (`typecheck:tests`), and the
  a11y/nit bundle (drawer Escape + focus, carousel pause-on-hover/
  reduced-motion, header `aria-expanded`, cart-lines clamp mirror).
  131 unit + 32 e2e green.
- **Session 5:** re-validation (all session-4 gates green on the
  pulled tree; visual parity + mobile nav re-verified against the LIVE
  reference) + fresh deep audit (0 HIGH / 3 MEDIUM / 6 LOW / 4 NIT; CSRF
  posture ADEQUATE). Executed TDD-first: **schema.org JSON-LD** (pure
  builders in `src/lib/seo.ts` — Product blocks + canonicals on detail
  pages, Organization + WebSite site-wide; `tests/unit/seo-ld.test.ts` +
  the new `tests/e2e/seo-platform.spec.ts`), honest receipt copy (no email
  is shipped — copy points at the receipt link + Track Order; pinned),
  branded error boundaries (`(storefront)/error.tsx` + `global-error.tsx`),
  `icon.svg` + `manifest.ts`, `poweredByHeader: false` + HSTS
  `includeSubDomains` + `Permissions-Policy`, per-IP limiters on search GET
  (120/min) + cart PATCH/DELETE (60/min), `imageUrlSchema` scheme rule on
  product images, the **transactional cart merge** (pure
  `computeMergedQuantities` planner + one `$transaction` with idempotent
  final-quantity upserts), footer social links wired from settings, and
  `bun.lock` untracked. 149 unit + 38 e2e green.
- **Session 6 (this pass):** re-validation (all session-5 gates green on
  the pulled tree; visual parity + mobile nav re-verified against the LIVE
  reference, logged in) + fresh deep audit (1 HIGH / 6 MEDIUM / 8 LOW /
  5 NIT). Executed TDD-first: **spoof-resistant `clientIp(Headers)`**
  (CF-Connecting-IP → rightmost XFF → direct; the five inline
  `split(",")[0]` copies eliminated — the HIGH), transactional wishlist
  merge + P2002-race-safe cart/wishlist creates, **site-wide OpenGraph +
  Twitter share cards** (branded `public/images/og-default.png`; product
  pages share the first product image), canonical URLs on every public
  page (`siteBaseUrl()`; `/products` facets canonicalize to the base
  listing), `imageUrlSchema` on carousel slide images, **stock-aware cart
  merge** (third clamp dimension), bounded analytics aggregation
  (`orderItem.groupBy` + pure `foldItemAggregates`/`topProducts` in
  `src/lib/analytics.ts`), **ownership-bound idempotent replay**
  (`Order.cartToken` + `replayAuthorized`), honest pagination (reviews
  `?reviews=N`, account orders `?page=N`, real totals + snap-back),
  addresses POST/DELETE limiters, settings-driven legal contact email,
  `priceValidUntil` + validation `.max()` bounds, hamburger toggle +
  carousel-dot a11y, `COUPON_STORAGE_KEY` single-sourced, stray Vite
  `index.html` removed, `docs/DEPLOYMENT.md` rewritten for this codebase.
  174 unit + 39 e2e green.
- Known accepted risks (documented, deferred): 404 shell prerendered
  without nonce (inert islands); cookie `secure` tied to NODE_ENV
  (behind-proxy deployments should revisit); shared-store rate limiter
  (mechanical swap); admin coupon UI (enforcement complete, management
  stays DB-level with create-only seeding); review radiogroup arrow-key
  roving focus (buttons remain individually operable); real email
  delivery (copy is honest; a mailer needs provider credentials + bounce
  handling — an epic); wishlist heart filled-state (feature work: needs
  wishlist ids threaded through product grids; labels name the product).

### Session 7 — data-integrity completion (2026-10-14, v1.4.0)

- Re-validated session-6 on a fresh clone: all gates green (174 unit /
  39 e2e), visual parity + mobile menu re-verified against the LIVE
  reference (logged in) — reference unchanged, clone remains the superset.
- Fresh deep audit (repo code-review-checklist 12-category scan, all lib
  modules + routes + pages read): 2 MEDIUM / 8 LOW / 3 NIT new findings.
- TDD fixes (S7-1..S7-13): guarded guest-cart/wishlist CLAIM at first
  login (cross-device e2e); `resolveReplay` ownership gate on the
  checkout P2002 recovery path; seed policy `src/lib/seed-policy.ts`
  (products refresh CONTENT only — price/stock/rating/reviewCount/badge/
  flags are admin- or traffic-owned; settings + slides create-only) with
  a live reseed verification; `siteBaseUrl()` single-sourcing (4 sites);
  legal body copy `{{contactEmail}}` tokenization (live-verified);
  `imageUrlSchema` root-relative ONLY (CSP-aligned, http(s) branch
  removed); price/compareAtPrice `.max()` bounds; address-book cap
  (20/user, friendly 409) + transactional single-default invariant;
  `jsonLdScript()` escaper on all three ld+json blocks; `newRequestId()`
  secure-context fallback for checkout keys; search/cart-summary `{error}`
  500 shape; hourly opportunistic session sweep (`sessionSweepDue`);
  wishlist hearts label the product name.
- 197 unit + 41 e2e green; 23 screenshots refreshed; DEPLOYMENT seed
  paragraph amended; AGENTS/CLAUDE/README/PAD aligned.

### Session 8 — address-book/review-integrity completion (2026-10-13, v1.5.0)

- Re-validated session-7 on the pulled tree (`636faa5`): all gates green
  (197 unit / 41 e2e), visual parity + mobile menu re-verified against the
  LIVE reference — reference unchanged, clone remains the superset.
- Fresh deep audit (read-only subagent + own verification): session-7
  fixes 12 WIRED / 1 PARTIAL (S7-8 default invariant only on the checkout
  path) / 0 MISSING; new findings 2 MEDIUM / 7 LOW / 4 NIT.
- TDD fixes (S8-1..S8-13): the account address POST runs count+create in
  ONE tx and the FIRST address auto-defaults; new `PATCH /api/addresses`
  promotes a default in-tx + per-card "Set as default" control (S8-1,
  e2e: first address prefills checkout; badge moves); transactional review
  aggregate via `growReviewAggregate` inside `db.$transaction` (S8-2);
  `src/lib/prisma-errors.ts` — `uniqueTargetField` matches field arrays,
  bare strings AND constraint-name strings so the S7-2 recovery branch can
  never silently disable (S8-3, fixture unit tests); wishlist toggle
  delete via `deleteMany` (S8-4); hero carousel derived index clamp when
  slides shrink (S8-5); wishlist bounded at 100 (`assertWishlistCap`),
  page `take`, and `POST /api/cart/bulk` — one request, one tx, shared
  clamp, 10/min limiter — replacing the limiter-fighting add-all loop
  (S8-6, e2e); noindex on cart/track-order/account/checkout/login/register
  (S8-9, e2e-pinned); category P2002 duplicate message (S8-13); dead code
  removed (`ui/sheet.tsx`, `searchOpen` context, 2 unused Radix deps)
  (S8-11); docs model count 17→18 (S8-10). Deferred: drawer focus trap
  (S8-7), login-limiter lockout tradeoff (S8-8), address dedup.
- 212 unit + 48 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/
  README/PAD/DEPLOYMENT aligned.

### Session 9 — badge/order-transition completion (2026-10-13, v1.6.0)

- Re-validated session-8 on the pulled tree (`401ec63`): all gates green
  (212 unit / 48 e2e), visual parity + mobile menu re-verified against the
  LIVE reference — reference unchanged, clone remains the superset.
- Fresh deep audit (read-only subagent + own verification): session-8
  fixes 11 WIRED / 2 accepted deferrals / 0 MISSING; new findings
  2 MEDIUM / 2 LOW / 4 NIT + 1 doc drift.
- TDD fixes (S9-1..S9-8): the store context's `cartCount` is
  `number | null` initialized `null` so the header badge falls back to the
  server-computed count on every fresh load (S9-1 — it used to initialize
  at 0, making the fallback dead code and every hard load badge-less;
  e2e `cart-badge.spec.ts` was red against the old build); guarded
  `applyOrderStatusTransition` in `order-status.ts` — the status write is
  its own guard (`updateMany` on the in-tx status), the event + restock
  derive from the guarded winner, conflicts return the accurate error
  (S9-2 — two admins cancelling the same order can no longer double-restock);
  race-safe `promoteAddressInTx` promotes FIRST via a scoped conditional
  `updateMany` and aborts on a gone row (S9-3 — no more P2025 500s, no
  stranded zero-default books); the dashboard folds bounded
  `SUM GROUP BY date(placedAt/1000,'unixepoch')` day buckets via pure
  `buildRevenueChart` (S9-4 — Prisma stores SQLite DateTimes as
  epoch-millis INTEGERs, the bare `date()` form returns NULL);
  `@@index([userId])` on Address + `@@index([expiresAt])` on Session
  (S9-5); `/api/cart-summary` metered 120/min (S9-6); search `q` clamped
  to 100 chars (S9-7); bulk plan extracted to pure `cart-bulk.ts`
  (`dedupeBulkWanted`/`planBulkUpsertQuantity`, unit-pinned) (S9-8).
  Deferred: checkout P2002 recovery-loop integration seam (helpers already
  pinned) + the carried a11y/abuse-model items.
- 229 unit + 50 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/
  README/PAD/DEPLOYMENT aligned.

### Session 10 — address-default/cart-line completion (2026-10-13, v1.7.0)

- Re-validated session-9 on the pulled tree (`fc57d39`): all gates green
  (229 unit / 50 e2e), visual parity + mobile menu re-verified against the
  LIVE reference (the reference's first carousel slide confirmed as
  "New Arrivals" by clicking its slide dot — identical to the clone;
  reference unchanged, clone remains the superset).
- Fresh deep audit (read-only subagent + own file:line verification):
  session-9 fixes 8/8 WIRED / 0 PARTIAL / 0 MISSING; new findings
  1 MEDIUM / 3 LOW / 1 NIT · 0 HIGH.
- TDD fixes (S10-1..S10-5): deleting the DEFAULT address re-promotes the
  newest remaining row in the SAME delete transaction
  (`reassignDefaultAfterDeleteInTx`, S10-1 — the old DELETE stranded the
  book at zero defaults and checkout prefill silently died; live-verified:
  delete default → next-newest auto-promoted → checkout prefill renders
  the promoted address); cart PATCH writes are scoped conditional writes
  with `count === 0` → 404 (S10-2 — a line deleted by a concurrent tab
  surfaces as "not found", never a P2025 500); the address-book cap check
  moved INSIDE the create transaction (S10-3 — `assertAddressCap(tx, …)`
  first statement, `AddressCapError` → friendly 409 from the catch, so
  concurrent POSTs at cap − 1 cannot overshoot); the guest→user wishlist
  merge plans its upserts through pure `planWishlistMerge`
  (S10-4 — order kept, already-owned skip, guest dedupe, cap truncation;
  the old loop was the one create path outside the POST cap and could
  strand overflow permanently invisible behind the page's `take`); the
  bulk add-all reports BOTH skip reasons (S10-5 — `skipped =
  goneInactive + soldOut` so the "added N of M" toast arithmetic adds up).
- 241 unit + 50 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/
  README/PAD/SKILL aligned; run narrative at `docs/session_13.md`.

### Session 11 — limiter/heart-state completion (2026-10-13, v1.8.0)

- Re-validated session-10 on the pulled tree (`98dc342`): all gates green
  (240 unit / 50 e2e — one e2e flake root-caused instead of dismissed: the
  wishlist toast locators hit the strict-mode race admin.spec fixed in
  session 9), visual parity + mobile menu re-verified against the LIVE
  reference (hero slides 1-3, trust badges, 8 categories, featured
  products identical; reference unchanged, clone remains the superset).
- Fresh deep audit (read-only subagent + own file:line verification):
  session-10 fixes 5/5 WIRED / 0 PARTIAL / 0 MISSING; new findings
  1 MEDIUM / 2 LOW / 3 NIT · 0 HIGH.
- TDD fixes (S11-1..S11-6): the review limiter is two-tier now
  (S11-1 — `reviewRateLimitKeys` gives the authoritative per-IP
  `review-ip:` 20/min ceiling that bounds author rotation + the per-author
  5/min budget; the old key embedded the client-controlled author string
  and let rotation mint fresh budgets while its comment claimed otherwise);
  wishlist hearts render the server-truth filled state (S11-2 — pages pass
  `initialInWishlist` via `getWishlistIds()` through `ProductCard`; the
  heart shows `fill-primary` + `aria-pressed` + honest Add/Remove labels
  and flips from the API response; the AGENTS.md invariant is now TRUE
  instead of weakened); wishlist.spec toast assertions follow the
  documented `.first()` convention (S11-3 — the flake that started the
  session); admin carrier tracking is a guarded write (S11-4 —
  `applyCarrierTracking`: scoped `updateMany`, `count === 0` →
  `OrderGoneError` → friendly message, event only from the guarded
  winner); the login "Forgot password?" mailto follows the admin-editable
  `settings.contactEmail` (S11-5 — the S7-5 sweep's last hardcoded
  shadow); the address cap's authoritative gate is the POST-CREATE count
  (S11-6 — on SQLite the write lock lands at the first write, so
  create-then-verify is airtight where check-then-create was not; the
  pre-create check stays as fast-fail UX).
- 246 unit + 51 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/
  README/PAD/SKILL aligned; run narrative at `docs/session_15.md`.

### Session 12 — parity-order/demo-hygiene completion (2026-10-13, v1.9.0)

- Re-validated session-11 on the pulled tree (`2d3af58`): all gates green
  (246 unit / 51 e2e), live-reference parity + mobile menu re-verified
  (logged in with the operator credentials; account/order surfaces covered
  by the clone's superset).
- **New parity finding from the live comparison**: the reference's
  `/products` default "Newest" view and home "New Arrivals" both render its
  catalog in authored order (Damascus Steel Chef Knife Set first); the
  clone rendered the REVERSE of its seed order on both surfaces (relying on
  auto-`now()` seed timestamps) while home "Featured" (`createdAt: asc`)
  matched — three surfaces disagreeing with each other.
- Fresh deep audit (read-only subagent + own file:line verification):
  session-11 fixes 6/6 WIRED; new findings 0 CRITICAL / 0 HIGH / 3 LOW /
  1 NIT, with one reported NIT ("mangled accent class") REJECTED on
  verification — the built CSS contains the compiled
  `accent-color:#d96e26` rule, proving the arbitrary utility is valid
  (a text-mangling artifact, not a code defect — verify against build
  output before trusting "dead utility" claims).
- TDD fixes: **S12-1** the checkout sweep deletes through
  `cartClearFilter` — only the ordered line ids (a bare `{ cartId }`
  deleteMany silently ate a line a concurrent tab added between the
  summary read and the sweep); **S12-2** the demo-credentials quick-fill
  (which names the seeded ADMIN account) is OFF by default in production
  builds (opt-in `NEXT_PUBLIC_DEMO_MODE="true"`, dev unchanged — verified
  live both ways on the built server); **S12-4** `/checkout/success`
  verifies the deterministic order-access token BEFORE any DB read (no
  query-weight differential to probe order existence with);
  **S12-5** `productSeedCreatedAt(index)` backdates seed rows one minute
  apart (create-only — reseeds never rewrite them) and home featured
  flipped to `desc`, so all three surfaces render the reference's authored
  order while admin-created products correctly sort as the newest.
- Coverage pins: `settingNumber` extracted pure (an empty/corrupt numeric
  setting is "missing", never "zero"); new `contact-newsletter.spec.ts`
  (the two previously-uncovered capture surfaces: UI success states + the
  400 boundary incl. malformed JSON); cart-PATCH/DELETE lost-line 404/200
  pin (S10-2); guest-wishlist → registration merge e2e (S10-4 wiring).
  The storefront spec's page-split assertions were REWRITTEN — they had
  institutionalized the reversed order (a test pinning the bug).
- 257 unit + 59 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/
  README/PAD/SKILL/DEPLOYMENT aligned; run narrative at
  `docs/session_17.md`.

### Session 13 — drawer-a11y/bundle-hygiene completion (2026-10-13, v1.10.0)

- Re-validated session-12 on the pulled tree (`8439105`): all gates green
  (257 unit / 59 e2e), live-reference parity re-verified (logged in with the
  operator credentials; the session-12 authored-order fix holds on both
  sides), mobile menu re-verified on the production build.
- Fresh deep audit (read-only subagent + own file:line verification):
  session-12 fixes 4/4 WIRED; new findings 0 CRITICAL / 0 HIGH / 1 MEDIUM /
  4 LOW / 2 NIT.
- Fixes (TDD — RED first): **S13-3** the closed cart drawer gains
  `inert={!open}` + `aria-hidden` (a transform does NOT remove elements from
  the tab order/a11y tree; `inert` is a boolean attribute, not a display
  utility); **S13-1** demo credentials moved behind a server boundary
  (`demoModeEnabled` in `src/lib/demo-mode.ts`, credentials passed as props
  ONLY when enabled — the built chunk no longer contains `Admin123!`);
  **S13-2** every awaited admin-server-action carries a `catch` → inline
  error + destructive toast; **S13-4** the review insert folds into the
  aggregate-growth transaction; **S13-7** `clientIp` gains the
  `TRUST_CF_CONNECTING_IP="false"` opt-out (default preserves the session-6
  invariant); **S13-5** three admin catches narrowed to P2025 + rethrow;
  **S13-6** `utcMonthStart` (UTC month boundary for the analytics KPI).
- New pins: `session13-hardening.test.ts` (17 cases) +
  `review-transactional.test.ts` (3 cases — REAL temp SQLite via
  `datasourceUrl`: rollback semantics for the S13-4 fold) + e2e
  (closed-drawer inert, production login bundle credential-free,
  aborted-admin-save toast).
- Lesson (Appendix B): a `"use client"` file's module scope still ships —
  gating the JSX is not gating the data. Verify "hidden" secrets against the
  BUILT CHUNK, not the source.

### Session 14 — toast-timer/boundary-pin completion (2026-10-13, v1.11.0)

- Re-validated session-13 on the pulled tree (`42a188a`): all gates green
  (277 unit / 61 e2e), live-reference parity re-verified (logged in with the
  operator credentials; reference unchanged, clone remains the superset),
  mobile menu re-verified on the production build.
- Fresh deep audit (read-only subagent + own file:line verification):
  session-13 fixes 8/8 WIRED; new findings 0 CRITICAL / 0 HIGH / 0 MEDIUM /
  0 LOW / 2 NIT — the cleanest surface in the series; 5 coverage gaps +
  2 doc-drift items (the limiter grid understated checkout 20/min,
  contact/newsletter 5/min, coupon/track 30/min; CLAUDE.md listed a phantom
  `src/components/admin/` directory; the S13-2 count was 13 blocks across
  five files, not 12).
- Fixes (TDD — RED first): **S14-1** the Toaster tracks auto-dismiss timers
  in a ref registry — manual close + unmount clear pending timers (pinned by
  the suite's FIRST COMPONENT test, `toaster.test.tsx`, jsdom docblock +
  fake timers); **S14-3** the icon-only toast close button gains
  `aria-label="Dismiss notification"` (discovered by the S14-1 test).
- Coverage pins: `api-boundaries.test.ts` (route handlers verified
  import-safe in Vitest; mocked `db`; health ok/degraded-503, newsletter
  malformed-JSON/invalid-body/429, contact 429, checkout 429 +
  `Retry-After`) + the S14-3 auth e2e profile-edit/Sign Out wiring pin
  (seed name restored afterwards).
- **S14-4 (found during the final e2e gates)**: fourteen sessions of e2e
  checkout traffic had permanently drained the traffic-owned demo stock
  (the S7-3 seed policy never refreshes it) — Damascus hit stock 0 and the
  stock-assuming pins failed. Fix: `scripts/restore-demo-stock.ts` tops
  every product back to its seed value as the e2e webServer's first command;
  `prisma/seed.ts` is direct-execution-guarded so the script can import
  `PRODUCTS` without seeding. Lesson: distinguish DATA-depletion failures
  from code regressions before touching code.
- 287 unit + 62 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/
  README/PAD/SKILL/DEPLOYMENT aligned; run narrative at
  `docs/session_21.md`.


### Session 15 — rate-limit response hygiene + robustness pins (2026-10-13, v1.12.0)

- Re-validated session-14 on the pulled tree (`0701b44`): all gates green
  (287 unit / 62 e2e), live-reference parity re-verified (logged in; the
  reference is unchanged — same nav/hero/categories, Damascus-first order;
  mobile menu open → 7-link panel → navigate → auto-close on the production
  build).
- Fresh deep audit (read-only subagent 16-a + own file:line verification):
  session-14 fixes 5/5 WIRED; older-fix spot-checks 5/5 WIRED; new findings
  **0 CRITICAL / 0 HIGH / 0 MEDIUM / 2 LOW / 3 NIT / 0 doc-drift**.
- Fixes (TDD — RED first): **S15-1** the checkout 429 pin's in-budget
  assertion was vacuous (`toHaveLength` on the loop's own array) — now
  `every(s => s !== 429)`; **S15-3** every one of the 14 metered 429
  responses now carries `Retry-After` (10 sites added; newsletter/contact
  boundary pins assert it); **S15-4** `clampSearchTerm` (pure, in
  validation.ts, unit-pinned) caps every search surface at 100 chars —
  admin products/orders previously fed unbounded `contains` terms;
  **S15-5** the hero carousel caches its MediaQueryList at module level
  (getSnapshot no longer constructs one per read); **S15-2** the restore
  harness also re-activates deactivated seed products, and the storefront
  e2e cardinality pins assert the count FORMAT + seeded slugs while the
  exact seed constants (16 / Damascus-first / 3 cookware / 8 categories)
  moved to `tests/unit/seed-catalog.test.ts` — Playwright cannot import the
  seed (its CJS transform rejects `import.meta`).
- Coverage pins: the order-number allocation-exhaustion pin (five mocked
  P2002s on the NUMBER → 500 with the replay branch never consulted —
  mocked `next/headers` cookies) and the sitemap DB-failure fallback +
  product-URL pins (mocked `db.product.findMany`).
- 299 unit + 62 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/README/
  PAD/SKILL/DEPLOYMENT aligned; run narrative at `docs/session_23.md`.


### Session 16 — modal-integrity hardening + boundary single-sourcing (2026-10-13, v1.13.0)

- Re-validated session-15 on the pulled tree (`e327c82`): all gates green
  (299 unit / 62 e2e), live-reference parity re-verified (reference
  unchanged — same nav/hero/categories, Damascus-first order; mobile menu
  open → 7-link panel → navigate → auto-close on the production build; zero
  console errors).
- Fresh deep audit (read-only subagent 17-a + own file:line verification):
  session-15 fixes 6/7 WIRED + 1 PARTIAL (S15-5 implemented but unpinned →
  S16-4); older-fix spot-checks 7/7 WIRED; new findings **0 CRITICAL /
  0 HIGH / 0 MEDIUM / 2 LOW / 2 NIT / 0 doc-drift** — the fourth
  consecutive session without a CRITICAL/HIGH/MEDIUM.
- Fixes (TDD — RED first): **S16-1** the wishlist cap was check-then-create
  (concurrent POSTs at cap − 1 both created; the P2002 loser mapped to
  `inWishlist: true`, permanently overshooting the cap) — the AUTHORITATIVE
  gate moved inside the create transaction (`createWishlistItemInTx`:
  create FIRST, count under the write lock, `WishlistCapError` rolls the
  create back; the S11-6 shape; the pre-create check is fast-fail UX only);
  **S16-3** the open cart drawer declared `aria-modal` but the background
  stayed keyboard-tabbable (the carried S8-7 deferral) — `StoreChrome` now
  renders the whole page shell (`page-shell`) with `inert={cartDrawerOpen}`
  (the layout passes main/footer through the client component as props),
  plus a Tab-wrap handler (Chromium drops focus to browser chrome at the
  last control instead of wrapping) and opener-capture/focus-restore dialog
  semantics; **S16-2** the three route-local Zod schemas hoisted into
  validation.ts (`wishlistToggleSchema`, `cartLinePatchSchema` — keeping
  the PATCH 0-deletes-line floor — `couponApplySchema`); **S16-4** the
  S15-5 MQL cache pinned by the suite's second component test
  (`hero-carousel.test.tsx`: jsdom + fake timers + per-test
  `vi.resetModules()` for the module-level cache; next/image/link stubbed).
- Coverage pins: C3/C4 wishlist route boundary + create-first ordering
  (mocked `db` + `next/headers`, unique single-hop XFF per request); C5
  carousel cache/motion pins. E2e: the S16-3 open-drawer modal pin
  (shell inert, 25 Tabs stay inside the drawer, Escape → focus returns to
  the header cart toggle).
- 313 unit + 63 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/README/
  PAD/SKILL/DEPLOYMENT aligned; run narrative at `docs/session_25.md`.


### Session 17 — admin-write guard completion + ceiling single-sourcing (2026-10-13, v1.14.0)

- Re-validated session-16 on the pulled tree (`041e877` + operator
  `session_26.md`): all gates green (313 unit / 63 e2e), live-reference
  parity re-verified (reference unchanged; clone mobile menu open → 7-link
  panel → navigate → auto-close/unmount; /products Damascus-first; demo
  login → /account; zero console errors).
- Fresh deep audit (read-only subagent 18-a + own file:line verification):
  session-16 fixes **4/4 WIRED**; older-fix spot-checks **7/7 WIRED**; new
  findings **0 CRITICAL / 0 HIGH / 0 MEDIUM / 1 LOW / 1 NIT /
  1 Informational / 1 doc-drift** — the fifth consecutive session without a
  CRITICAL/HIGH/MEDIUM.
- Fixes (TDD — RED first): **S17-1** `deleteCategoryAction` was
  check-then-write and the FK-race loss path escaped as an unhandled P2003
  (`Product.category` is a required Restrict FK) — the action now routes
  through `deleteCategoryIfEmpty` (`src/lib/admin-categories.ts`): the
  pre-count stays the fast-fail UX check (exact "N products still use this
  category." message), the delete's P2003 maps to the same in-use outcome
  with an unknown count ("A product was just added to this category."),
  unrelated errors rethrow (the S13-2 contract); `isForeignKeyViolation`
  added to `prisma-errors.ts` (duck-typed, the `isUniqueViolation`
  convention). **S17-2** the cart 99-ceiling single-sourced as
  `MAX_CART_QUANTITY` (`src/lib/cart-quantity.ts`) — consumed by the clamp,
  all three cart Zod schemas (single/patch/bulk per-line), the
  purchase-panel stepper max and the header "99+" flip (cart-merge's local
  constant now aliases it; its "must stay in sync" comment retired).
  **S17-3** (Informational, recorded not fixed) `deleteProductAction`'s
  count-race is benign by design — `OrderItem.product` is optional →
  SetNull, and consumers already model null productIds.
- Coverage pins: C6 the guarded-delete outcome mapping + the
  `isForeignKeyViolation` truth table (`session17-hardening.test.ts`); C7
  the cart DELETE `?all=1` boundary (no-cart → `{itemCount:0}` + no write;
  guest cart → cartId-scoped `deleteMany` + fresh summary — api-boundaries
  pattern). Doc-drift D-1: the session-16 execution-log checkboxes flipped.
- 324 unit + 63 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/README/
  PAD/SKILL/DEPLOYMENT aligned; run narrative at `docs/session_27.md`.


### Session 18 — checkout-address extraction + ceiling UX completion (2026-10-13, v1.15.0)

- Re-validated session-17 on a fresh clone (`14d0bbb` = `6c0d708` + operator
  `session_28.md`): all gates green (324 unit / 63 e2e). Environment: this
  sandbox re-exports a shadow `DATABASE_URL` on shell recycle and BLOCKS
  symlink creation — converged with a hard link
  `/home/z/my-project/db/custom.db` → `<repo>/db/custom.db` (one inode);
  the shadow-absent path verified schema-anchored via a move-the-shadow-dir
  probe (seed succeeded with the shadow relocated — the CLI/seed contract
  holds; the earlier "Unable to open" errors were the absolute-shadow
  passthrough hitting a path that didn't exist yet).
- Fresh deep audit (read-only subagent 19-a + own file:line verification):
  session-16 fixes **4/4 WIRED**; session-17 fixes **3/3 WIRED**; older-fix
  spot-checks **7/7 WIRED** (incl. 14/14 Retry-After + 4/4 clampSearchTerm);
  new findings **0 CRITICAL / 0 HIGH / 0 MEDIUM / 1 LOW / 2 NIT /
  1 Informational / 0 doc-drift** — the sixth consecutive session without a
  CRITICAL/HIGH/MEDIUM.
- Fixes (TDD — RED first, 9 failed / 1 coverage pin): **S18-1 (Low)** the
  checkout in-tx saveAddress block extracted to `saveCheckoutAddressInTx`
  (`src/lib/addresses.ts`, the S11-6 lib pattern) returning
  `"saved" | "at-cap"` — at cap the order STILL PLACES (S7-8). The cap gate
  deliberately STAYS the PRE-create fast-fail (the OPPOSITE of the S11-6/
  S16-1 create paths): a post-create `AddressCapError` throw here would
  roll back the ENTIRE order transaction and Prisma interactive
  transactions have no savepoints; the residual bounded race recorded as
  accepted debt (the S17-3 pattern). The carried S18-4a "saveAddress
  at-cap skip-save integration pin" (deferred since session 7) closes with
  the same test file. **S18-2 (NIT)** cart-page "+" disables at
  `min(stock, MAX_CART_QUANTITY)`, drawer "+" at 99 (the stock-less drawer
  keeps the server clamp as its stock guard), and the three cart schemas
  carry the interpolated "Quantity is limited to 99 per item." store copy
  (was Zod's default English message in the error toast). **S18-3 (NIT)**
  unused `axe-core` + `@testing-library/user-event` devDeps removed via npm.
- Live verification (agent-browser, fresh production build): reference
  unchanged (nav anatomy, hero slides, 8 categories, Damascus-first, mobile
  panel = 5 links + close); clone mobile menu open → 7-link panel + search →
  navigate → auto-close/unmount; /products Damascus-first; sitemap.xml = 25
  public URLs (no private surfaces) + robots disallows + JSON-LD intact;
  demo login → /account; a full signed-in checkout with "Save this address"
  placed ORD-2026-013 and the address book grew 1 → 2 (the "saved" outcome);
  zero console errors on a fresh session.
- 334 unit + 63 e2e green; 23 screenshots refreshed; AGENTS/CLAUDE/README/
  PAD/SKILL aligned; DEPLOYMENT.md drift-free; `.env.example` unchanged
  (no new env vars); run narrative at `docs/session_29.md`.

### Session 19 — coupon management + module-graph trap (2026-10-13, v1.16.0)
- Re-validated session-18 on a fresh clone (`9a3d22e` = `67861e3` + operator
  `session_30.md`): all gates green (334 unit / 63 e2e). Environment: the
  prior sessions' convergence symlink was found DANGLING (an old workspace
  path) — removed via node, the real dir recreated, and the shadow path
  re-converged with a hard link to `<repo>/db/custom.db` (one inode).
- Live-reference parity re-verified (reference unchanged: nav anatomy, hero
  slides, 8 categories, Damascus-first, mobile panel = 5 links + close);
  clone verified on the fresh production build: mobile menu open → 7 links
  + search → navigate → auto-close/unmount; /products Damascus-first;
  sitemap = 25 public URLs; robots + JSON-LD intact; demo login → /account;
  desktop visual parity re-confirmed; zero console errors.
- Fresh deep audit (read-only subagent 20-a + own file:line verification):
  session-18 fixes **4/4 WIRED**; older-fix spot-checks **10/10 WIRED**;
  static counts re-verified (334/35 files · 63/12 specs · 18 models ·
  11/11 requireAdmin · 14 metered sites · 13 catch blocks); new findings
  **0 CRITICAL / 0 HIGH / 0 MEDIUM / 1 LOW / 1 NIT / 2 Informational /
  0 doc-drift** — the seventh consecutive session without a
  CRITICAL/HIGH/MEDIUM.
- Fixes (TDD — RED first, 23 failed / 3 by-design pins): **S19-1 (NIT)**
  the QuantityStepper's default `max = 99` literal replaced with the
  imported `MAX_CART_QUANTITY`, pinned by a jsdom test mocking the constant
  to 7 (impossible with a retyped literal). **S19-2 (Low)** the S18-1
  extraction's unset-defaults scope restored to the pre-extraction
  `where: { userId, isDefault: true }` (the broad clause touched every row
  of the book inside the checkout tx); the session-18 pin extended.
  S19-3/S19-4 (Informational) recorded as reviewed dispositions, no change.
- **Feature (S19-5) — the admin coupon-management UI** (the increment the
  audit trail carried for two sessions): `couponInputSchema` + the pure
  `couponLabel` (single-sourced with `couponDiscount`),
  `upsertCouponAction`/`deleteCouponAction` (requireAdmin, uppercase code
  normalization matching `findActiveCoupon`, S8-13 P2002/P2025 mappings,
  S13-2 rethrows), and the role-gated `/admin/coupons` surface (list with
  usage/expiry/cap badges + the category-dialog-pattern Add/Edit island +
  delete confirm + active toggle + the admin-nav Ticket item). Orders keep
  their discount snapshot across deletes. Unit-pinned + the e2e CRUD loop
  (`admin-coupons.spec.ts`: create → apply at the cart → deactivate →
  reject → delete, leaving the seeds as found).
- **NEW TRAP (Turbopack panic)**: a `export { couponLabel } from
  "@/lib/coupons"` re-export in validation.ts (client-imported) pulled
  `db` → `@prisma/client` → `node:fs` into a browser chunk — Turbopack
  PANICKED with "chunking context does not support external modules
  (request: node:fs)" pointing at an UNRELATED route (/admin/orders).
  Diagnosed by stash-bisect (pristine baseline built clean); fix = define
  the label in coupons.ts, import it directly where needed, and record the
  client-safe module-graph rule in AGENTS.md's trap section.
- 360 unit + 64 e2e green; 24 screenshots refreshed (incl.
  `15b-admin-coupons`); AGENTS/CLAUDE/README/PAD/SKILL aligned;
  DEPLOYMENT.md drift-free; `.env.example` unchanged; run narrative at
  `docs/session_31.md`.

### Session 20 — free_shipping engine + e2e isolation (2026-10-13, v1.17.0)

- Re-validated session-19 on a fresh clone (`9ed652d` = `9dad2fc` +
  operator `session_32.md`): gates green EXCEPT one e2e failure
  (`admin-coupons.spec.ts:46`) — investigated, root-caused, and turned into
  the session's first finding (below). Environment: the sandbox re-exports
  `DATABASE_URL=file:/home/z/my-project/db/custom.db` and the convergence
  symlink pointed at the fresh clone's db dir — the FIRST `db:push` with an
  explicit `DATABASE_URL=file:../db/custom.db` override created
  `<repo>/db/custom.db`, and the pre-existing symlink resolved both paths
  onto one inode (seed verified 16/8/3/2 constants).
- Live-reference parity re-verified via agent-browser (reference unchanged
  — mobile panel = 5 links + close; logged in with the provided
  credentials); clone verified: mobile menu open → 7 links → navigate →
  auto-close/unmount; sitemap = 25 public URLs; robots + JSON-LD; desktop
  parity; zero console errors.
- Fresh deep audit (read-only subagent 21-a + own file:line verification):
  session-19 fixes **ALL WIRED** (incl. the Turbopack trap staying closed);
  older-fix spot-checks **10/10 WIRED** (14/14 Retry-After, 4/4
  clampSearchTerm, all seven guarded helpers, credential boundary, v4
  pattern, MAX_CART_QUANTITY single-sourcing); static counts re-verified
  (360/38 files · 64/13 specs · 18 models · 13 requireAdmin · 14 metered
  sites · 16 catch blocks across SIX files); new findings **0 CRITICAL /
  0 HIGH / 0 MEDIUM / 1 LOW code + 1 LOW doc / 2 NIT / 4 Informational** —
  the eighth consecutive session without a CRITICAL/HIGH/MEDIUM.
- **S20-1 (High, test reliability — the observed failure)**: the
  admin-coupons spec pinned an absolute cart-badge "1" on the DURABLE admin
  cart (a Playwright actionability re-dispatch double-fired the Add-to-Cart
  POST — badge "2"→"3" observed live) and was not idempotent (an aborted
  prior run left an active SESSION5 breaking the next create). Fixed: the
  cart is seeded through the `request` fixture with a snapshot-restore
  cleanup, the setup self-heals a leftover code via delete-before-create,
  and the cart-line leak is gone ("as found" holds). The two observed
  failures WERE the RED evidence; the isolation convention is documented in
  AGENTS.md.
- **S20-2 (Low, the audit's F1)**: the coupon active-toggle round-tripped
  EVERY field from the rendered snapshot through `upsertCouponAction`
  (silent lost-update + expiry renormalization) — replaced with the narrow
  `toggleCouponActiveAction` (writes ONLY `isActive`, P2025 narrowed,
  unknown rethrown; the `toggleProductActiveAction` precedent), unit-pinned
  in `session20-hardening.test.ts`.
- **S20-6 (feature — the audit's I1 at the engine level)**: the
  first-class `free_shipping` coupon type — `couponLabel` → "Free
  shipping", `couponDiscount` → discount 0 + `freeShipping: true`
  (minSubtotal enforced), `computeOrderMoney.couponFreeShipping` zeroes
  shipping for BOTH methods independent of the spend threshold, the
  checkout mirror + `CouponApplyResponse` carry the flag, `couponInputSchema`
  pins value at 0, the dialog offers the type (value hidden; value reset on
  type switch — S20-5), the seed row ships the real type (create-only:
  fresh DBs get it; existing DBs keep the fixed row — both work), and the
  checkout increment's atomic guard gains the always-on `isActive` clause
  (`couponRedemptionFilter` — the audit's I4). The cart hint drops the
  capped SAVE20 (S20-7). S20-3/S20-4 close the doc-drift items (catch count
  13→16 across six files; the stale seed comment).
- 379 unit + 65 e2e green (the new `free-shipping-coupon.spec.ts` pins the
  full money path through the SERVER-derived receipt's "FREE"); 24
  screenshots refreshed; AGENTS/CLAUDE/README/PAD/SKILL aligned;
  DEPLOYMENT.md drift-free; `.env.example` unchanged; run narrative at
  `docs/session_33.md`.

### Session 21 — the checkout mirror fix + the request-fixture identity trap (2026-10-14, v1.18.0)

- Re-validated session-20 on a fresh clone (`dbd8674` = `a857949` + operator
  `session_34.md`): gates green EXCEPT **63/65 e2e** — `admin-coupons` and
  `auth` profile both failed. Environment: the sandbox db symlink was
  re-pointed at the fresh clone's db dir (one inode verified); seed 16/8/3/2
  verified. Live-reference parity re-verified (reference unchanged; logged
  in with the provided credentials; mobile menu 7 links → navigate →
  auto-close; sitemap 25 URLs; robots; JSON-LD; desktop parity; zero
  console errors).
- **S21-1 (High, test reliability — the observed failure, root-caused with
  a probe matrix)**: the per-test Playwright `request` fixture is
  IDENTITY-ISOLATED — it does NOT share the browser context's cookies
  (`request.storageState()` returned an EMPTY jar while `context.cookies()`
  held the session), and the production session cookie is `Secure`, which a
  plain-HTTP API client refuses to send anyway. The S20-1 "API-seeded
  cart" therefore acted as a GUEST for its entire life: the POST landed on
  a throwaway guest cart (DB-verified `userId: null`), the /cart page (the
  admin's own cart) stayed empty, and the coupon box never rendered. It
  only ever passed on a DB whose durable admin cart already had content —
  the failure was masked, not fixed, in run-21. Fix: read `homenest_session`
  from `context.cookies()` and send it as an explicit `Cookie` header on
  every admin-identity request-fixture call (the header POST is DB-verified
  to land on the admin's cart); `page.request` is the sharing alternative
  for read-shaped calls. Documented as its own AGENTS.md trap-log entry.
- **S21-2 (Medium, test reliability — observed live)**: the auth profile
  spec's `getByText("Profile updated")` raced the session-9 strict-mode
  class (2-element resolution: toast title + the aria-live wrapper) —
  `.first()` applied to all three assertions; the setup now SELF-HEALS a
  demo name left dirty by an aborted run (the seed's `update: {}` never
  re-resets it — the self-breaking cascade observed in this run).
- **S21-3 (Medium, product — the audit's F-1, session-20 regression)**: the
  checkout mirror DROPPED the `freeShipping` flag — the S20-6 diff typed it
  on `AppliedCoupon`/`CouponApplyResponse` and read it for `shippingCost`
  but never stored it in `setCoupon`, so FREESHIP rendered full shipping
  ($6.95/$15.95) and an inflated total on the checkout page (no overcharge:
  the server re-derives in-tx; the mirror contradicted the receipt). Fix:
  the setter passes the flag through. Verified live end-to-end: mirror
  total $37.61 = subtotal + tax; shipping FREE on the review card, the
  sticky summary, AND the server receipt.
- **S21-4 (Low — the vacuous pin that let S21-3 slip through 65/65)**: the
  free-shipping spec's `getByText("FREE")` is a case-insensitive substring
  match that also hits the coupon label's "Free shipping" — replaced with
  pins scoped to the actual Shipping rows (review card `dl` + the
  `aside[aria-label="Order summary"]` `dl`, each `toHaveCount(1)` +
  `toContainText("FREE")`). The RED run against the unfixed mirror printed
  `"Shipping$6.95"` — the exact defect — before the fix turned it green.
- **S21-5/S21-6 (NITs)**: the stale "the request fixture shares the admin
  session cookies" inline comment (the exact premise S21-1 disproved)
  reworded; the `couponRedemptionFilter` doc comment no longer overclaims
  expiry coverage (expiry stays READ-guarded by the in-tx
  `isCouponRedeemable`; the sub-second expiry residue is the accepted class
  the deactivation gap was in). **S21-7 (NIT, disposition recorded)**: the
  cart's server-rendered threshold hint does not know an applied
  free_shipping coupon — no money-path impact; lifting client coupon state
  into the page is structural change for marginal benefit (S20-7
  precedent).
- Fresh deep audit (read-only subagent 22-a + own file:line verification):
  session-20 fixes WIRED (with the S21-3 gap found); defect-class sweeps
  CLEAN elsewhere (every remaining `request.*` identity site audited; every
  remaining toast assertion carries `.first()`); static counts all match
  the docs (379/38 · 65/13 · 18 models · 14 requireAdmin · 14 metered · 16
  catch blocks across six files); **0 CRITICAL / 0 HIGH / 1 MEDIUM product
  + 2 test-reliability / 1 LOW / 2 NIT / 2 Informational** — the ninth
  consecutive session without a CRITICAL/HIGH product defect.
- 379 unit + 65/65 e2e green; 24 screenshots refreshed; AGENTS (2 trap-log
  entries + the coupon invariant), CLAUDE, README, PAD (§8.2 + known issues
  #82–83), SKILL v1.18.0 aligned; DEPLOYMENT.md drift-free; run narrative
  at `docs/session_35.md`.

### Session 22 (run 23) — the coupon engine's single-lookup contract

- Fresh clone at `5835fdd`; gates re-validated green on the pulled tree
  (379/379 unit · 65/65 e2e); environment converged (sandbox DATABASE_URL
  symlink re-pointed at the clone's db dir, one inode; seeded 16/8/3/2).
- Live-reference parity re-verified via agent-browser (reference unchanged,
  logged in with the provided credentials); clone: mobile menu open → 7
  links + search → navigate → auto-close/unmount (Tailwind v4
  conditional-mount intact), sitemap 25 URLs, robots disallows + sitemap
  ref, home JSON-LD, desktop visual parity, zero console errors.
- Fresh deep audit (read-only subagent 23-a + own file:line verification):
  session-21 fixes **6/6 WIRED**; defect-class sweeps CLEAN (14/14
  requireAdmin, 14/14 metered `Retry-After`, Zod boundaries, money,
  stock reservation, order access, SEO privacy, CSP, v4 traps, module
  graph, `gotoHydrated` 14/14, toast `.first()` everywhere); static counts
  ALL matching the live docs (379/38 · 65 e2e across **14 spec files** ·
  18 models · 16/8/3/2 seed · 14 requireAdmin · 14 metered · 16 catch
  blocks across six files); **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW /
  2 NIT / 2 Informational — the tenth consecutive session without a
  CRITICAL/HIGH/MEDIUM finding, zero live-doc drift**.
- TDD S22-2 (RED 5 failed / 2 passed — `description` undefined on the
  engine result, `db.coupon.findUnique` called 2×; the response pin passed
  via the wasteful second lookup — the exact defect shape): GREEN —
  `CouponApplication`'s ok-branch + `couponDiscount`'s three success
  branches carry `description`; the route reads `applied.description`, the
  second lookup + import gone; the four exact-shape `toEqual` pins updated
  to the widened contract. S22-1: the admin-coupons spec's duplicated
  comment + 6-space indent cleaned. Dispositions: D1 the stale "13 specs"
  historical figure (append-only records stay as-written; this entry
  carries 14), D2 the S21-1 mid-abort self-correcting residue.
- Final gates: **386/386 unit · 65/65 e2e · lint/typecheck/typecheck:tests/
  build green**; manual verification on the fresh build: the cart's applied
  block renders "FREESHIP: Free standard shipping on orders over $30 —
  applied at checkout" from the single-lookup path; mobile menu
  open/navigate/auto-close; zero console errors; 24 screenshots refreshed.
- Docs aligned: AGENTS (the coupon invariant extended with the S22-2
  single-lookup contract; plan range 2..22), CLAUDE (lib entry + the
  session-22 coverage tail), README (badge 386/65 + the coverage tail),
  PAD (§8.1 row + §12 table + known issue #84), SKILL v1.19.0
  (project_state + this entry), DEPLOYMENT.md drift-free (no new env
  vars), .env.example unchanged; run narrative at `docs/session_37.md`.

### Session 23 (run 24) — the coupon-aware cart hint (S21-7 resolved)

- Fresh clone at `a7b19a1`; gates re-validated green on the pulled tree
  (386/386 unit · 65/65 e2e); environment converged (sandbox DATABASE_URL
  symlink re-pointed at the clone's db file via an atomic node call —
  shell `ln -s` is sandbox-blocked; write-sharing through both paths
  verified on one storeSetting row; seeded 16/8/3/2/3/13).
- Live-reference parity re-verified via agent-browser (reference unchanged,
  logged in with the provided credentials — Damascus-first in both
  sections, "Continue with Google" still on the reference login); clone:
  mobile menu open → 7 links + search → navigate → auto-close/unmount,
  sitemap 25 URLs, robots, JSON-LD, desktop parity, zero console errors.
- Fresh deep audit (read-only subagent 24-a + own file:line verification):
  session-22 fixes **2/2 WIRED**; defect-class sweeps CLEAN (14/14
  requireAdmin, 14/14 metered `Retry-After`, Zod boundaries, money,
  stock reservation, order access, SEO privacy, CSP, v4 traps, module
  graph, `gotoHydrated` 14/14, toast `.first()` everywhere, 16 catch
  blocks); pre-session-21 invariant spot-checks 5/5 WIRED; static counts
  ALL matching the live docs (386 unit / 39 files · 65 e2e / 14 specs ·
  18 models · 16/8/3/2/3/13 seed · 14 requireAdmin · 14 metered);
  **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW / 1 NIT / 2 Informational —
  the eleventh consecutive session without a CRITICAL/HIGH/MEDIUM finding,
  zero live-doc drift**. (PAD §8.2's "64 tests" header — stale since
  session 20 — corrected to the per-project breakdown.)
- TDD S23-2 (the S21-7 deferral PROMOTED once the defect surface had been
  clean for eleven consecutive sessions): RED — `cart-widgets.test.tsx`
  failed on the missing `CartSummaryWidgets` export; GREEN — the new
  `src/app/(storefront)/cart/cart-widgets.tsx` composite renders the hint
  from the applied-coupon state lifted through CouponBox's optional
  `onAppliedChange` callback (success → payload, not-ok/remove → null; the
  network-catch branch fires nothing; the sessionStorage CODE-string
  contract with checkout-client untouched) — an applied `free_shipping`
  coupon swaps the "Add $X more" nag + progressbar for the
  coupon-attributed block; a percent/fixed coupon leaves the threshold
  states unchanged; the page passes the SERVER facts as props (no
  hydration mismatch by construction). 5 jsdom component pins green
  through the REAL CouponBox with stubbed fetch; the free-shipping spec's
  second test pins the swap end-to-end (66/66).
- S23-1: the whitespace-only line at the checkout limiter dropped.
- Final gates: **391/391 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green**; manual verification on the fresh build: the cart hint
  swaps on FREESHIP apply and restores on remove (the "Something went
  wrong" seen mid-run was the rebuild-under-running-server artifact, not a
  code defect — the e2e suite and the fresh server both confirm); mobile
  menu open/navigate/auto-close; zero console errors; **25 screenshots**
  refreshed — the new `04b-cart-coupon-hint` evidence shot documents the
  coupon-attributed state, and the capture script's cart step now gates
  the navigation on the `cart-count` badge (the run-24 capture hit the
  click→goto race).
- Docs aligned: AGENTS (the coupon invariant extended with the S23-2
  state-lift contract + the capture-script badge gate; plan range 2..23),
  CLAUDE (the session-23 unit + e2e coverage tails), README (badge 391/66
  + the tails), PAD (§8.1 row + §8.2 header fix + §12 table + known issue
  #83 → Resolved (session 23)), SKILL v1.20.0 (project_state + this
  entry), DEPLOYMENT.md drift-free (no new env vars), `.env.example`
  unchanged; run narrative at `docs/session_38.md`.

### Session 24 (run 25) — the carried wiring-pin deferrals resolved

- Deep audit 25-a at HEAD `e0bcd23` (workspace refreshed by `git pull` —
  fast-forward `38301d3` → `e0bcd23`, the operator's session-log commits):
  session-23 fixes **2/2 WIRED** with file:line evidence; defect-class sweeps
  13/13 CLEAN; static counts ALL matching the live docs (391/40 unit · 66/14
  e2e · 18 models · 14 requireAdmin · 14 metered · 16 catch blocks · 25
  screenshots); **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW / 0 NIT / 3
  Informational — the twelfth consecutive session without a
  CRITICAL/HIGH/MEDIUM/LOW finding, zero live-doc drift** (the StrictMode
  no-op hazard on the silent-reapply effect is safe under the pinned
  `reactStrictMode: false`; the stale-code inline error and the
  non-pending-gated Enter path are pre-existing, internally consistent).
- Operator verification surfaced one NIT the subagent missed (S24-1: a
  whitespace-only line at `track-order/page.tsx:99`) and re-examined the
  carried deferrals: the session-15 "actions not import-safe in Vitest"
  rationale has been DISPROVEN by the session-19 guarded-action mock
  precedent — the S23-2 logic applies (clean defect surface + blocker gone +
  calculus flipped), so three deferrals were promoted:
  **S24-2** the review action's two-tier gate wiring pin,
  **S24-3** the /track-order page-limiter wiring pin, and
  **S24-4** the real-engine P2002 integration seam (all prior
  `uniqueTargetField` pins were synthetic — the temp-SQLite harness now
  proves a GENUINE idempotency-key collision satisfies the tolerant matcher
  against the live field-array `meta.target` shape, with cross-field
  number/key discrimination).
- RED (mutation checks) — 6 of the 11 new pins failed exactly as predicted
  (the ip-only gate; the stripped field-array branch against the real engine;
  the bypassed limiter); the RED run also hardened the mock hygiene (per-test
  `vi.resetAllMocks()` — a partially-consumed `mockReturnValueOnce` queue
  must never leak across tier-count differences). GREEN — all three wiring
  sites restored byte-for-byte; **11/11 new pins green**. S24-1 dropped.
- Final gates: **402/402 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green**; manual verification on the fresh build: the track-order
  denial shell + the tracking surface render (the EADDRINUSE'd stale server
  from a pre-rebuild start served the error boundary mid-session — killed by
  PID, one fresh server, all clean — the documented artifact class); mobile
  menu open → 7 links + search → navigate → auto-close/unmount; zero console
  errors; **25 screenshots** refreshed.
- Docs aligned: AGENTS (plan range 2..24), CLAUDE (the session-24 wiring-pin
  tail), README (badge 402/66 + the tail), PAD (§8.1 header + the three new
  rows + §12 table), SKILL v1.21.0 (project_state + this entry),
  DEPLOYMENT.md drift-free (no new env vars), `.env.example` unchanged; run
  narrative at `docs/session_40.md`.

### Session 25 (run 26) — the real-engine harness family + the doc-NIT sweep

- Deep audit 26-a at HEAD `496761e` (workspace refreshed by `git pull` —
  fast-forward `4659776` → `496761e`, the operator's session-log commit
  appending `docs/session_41.md`): session-24 fixes **4/4 WIRED** with
  file:line evidence (the whitespace scan of `track-order/page.tsx` returns
  zero; the two-tier gate consults BOTH real-derived keys before any lookup;
  the page limiter fails CLOSED before the DB read; the real-engine P2002
  seam cross-checked against `prisma-errors.ts` and the live recovery loop);
  defect-class sweeps 13/13 CLEAN; static counts ALL matching the live docs
  (402/43 unit · 66/14 e2e · 18 models · 14 requireAdmin · 14 metered · 16
  catch blocks · 25 screenshots · 3 DSIH sites); **0 CRITICAL / 0 HIGH / 0
  MEDIUM / 0 LOW / 2 NIT / 2 Informational — the thirteenth consecutive
  session without a CRITICAL/HIGH/MEDIUM/LOW finding**. Both NITs are
  documentation-class: **S25-1** the SKILL `project_state` carried the
  ENTIRE stale session-23 value glued after the session-24 value's closing
  quote (a non-idempotent doc-patch artifact from run 25; the operator
  surfaced it during the doc review — 26-a's `)"`-glued-text scan confirmed
  it was the only instance), and **S25-2** the §5 structural stats were
  frozen at the session-6 era (101/14+9/35 → measured **126/13+9/38**);
  **S25-3** (operator find) a CJK paste artifact in the PAD ADR ("—任何人
  can mint an admin", pre-existing since the original migration).
- **Plan bookkeeping (S25-4):** the carried-deferrals list still carried
  "admin coupon-management UI" — resolved back in session 19 by S19-5; the
  entry was copy-forwarded through sessions 20-24's dispositions
  unexamined. Dropped from session 25's live list (history never rewritten).
- **Two deferrals promoted** (the S24-4 temp-SQLite pattern generalized):
  **S25-5** the coupon-cap real-engine seam (`tests/unit/coupon-cap-integration.test.ts`
  — the LIVE `couponRedemptionFilter` increment shape against a REAL db:
  at-cap blocks, one-under lands, deactivated blocks, unlimited passes) and
  **S25-6** the saveAddress at-cap real-engine seam
  (`tests/unit/save-address-integration.test.ts` — "saved"/"at-cap" inside a
  REAL transaction, the no-writes-at-cap contract, the single-default
  promotion). The "review two-tier budgets e2e" deferral was DISPOSED as
  redundant coverage (S24-2's unit pin is the right altitude; an e2e would
  need 20+ submissions/min and pollute limiter state).
- RED (mutation checks) — 3 of the 7 new pins failed exactly as predicted
  against the REAL engine (the stripped `isActive` guard; the stripped cap
  clause; the no-op `assertAddressCap` — 21 rows + the default unset
  instead of "at-cap" + a frozen book); the other 4 stayed green under
  every mutation. GREEN — all mutation sites restored byte-for-byte;
  **7/7 new pins green** (409/409 unit). **S25-7**: `track-order-limiter.test.ts`
  joined the `vi.resetAllMocks()` discipline.
- Final gates: **409/409 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green**; the run's one ChunkLoadError was the documented
  stale-server artifact class (a leftover `next-server` from the prior run
  survived on :3000 and served old chunks — killed by PID, fresh server,
  zero console errors); mobile menu open → 7 links + search → navigate →
  auto-close/unmount; **25 screenshots** refreshed.
- Docs aligned: AGENTS (plan range 2..25), CLAUDE (the session-25
  harness-family tail), README (badge 409/66 + the tail), PAD (§8.1 header
  + the two new rows + §12 table + the ADR-003 paste fix), SKILL v1.22.0
  (project_state + the §5 stats refresh + this entry), DEPLOYMENT.md
  drift-free (no new env vars), `.env.example` unchanged; run narrative at
  `docs/session_42.md`.

### Session 26 (run 27) — the money-path real-engine harness + the doc-drift sweep

- Deep audit 27-a at HEAD `2e92db8` (workspace refreshed by `git pull` —
  fast-forward `32116ee` → `2e92db8`, the operator's session-log commit
  appending `docs/session_43.md`): session-25 fixes **7/7 WIRED** with
  file:line evidence; defect-class sweeps 12/13 CLEAN + 1 NIT-class
  observation; static counts ALL matching the live docs (409/45 unit ·
  66/14 e2e · 18 models · 14 requireAdmin · 14 metered · 16 catch blocks ·
  25 screenshots · 3 DSIH sites · 126 src files); **0 CRITICAL / 0 HIGH /
  0 MEDIUM / 0 LOW / 2 NIT / 2 Informational — the fourteenth consecutive
  session without a CRITICAL/HIGH/MEDIUM/LOW finding**. The NITs:
  **S26-1** the account-snapshot raw `<img>` (deliberate, inline-justified)
  vs CLAUDE.md's "`next/image` everywhere" wording (doc drift — the code
  is right; the docs now carry the exception), **S26-2** two
  double-blank-line sites in the checkout route (the S24-1 whitespace
  class, resolved structurally by the extraction). Informational: the
  dormant `OrderItem.variantLabel` display hook (DISPOSED —
  future-proofing, no action) and the run's own `01-home.png` capture
  artifact (resolved by the screenshot refresh).
- **The flagship (S26-3):** `placeOrderTx` — the money authority —
  extracted VERBATIM from the route into `src/lib/order-placement.ts` with
  the db client injected (the S18-1/S25-6 pattern generalized; structural
  `Pick<Prisma.TransactionClient, …>` tx), the route importing the three
  exports — behavior byte-equivalent (the C1/C3 boundary pins 10/10 green
  UNCHANGED). Then `tests/unit/place-order-integration.test.ts` (12 pins):
  server-derived money (the args' cosmetic mirrors carry garbage — the
  LIVE rows win), the receipt snapshots (in-tx product price/name, the
  line's image), the "placed" event, stock reservation, the read-side
  insufficient-stock fast-fail, the WRITE-side atomic decrement guard (a
  duplicate-product handoff makes the first guarded decrement the
  concurrent writer for the second — getCartSummary can never produce it,
  the tx must not over-sell regardless), the coupon burn, the
  engine-level atomic rollback (a mid-tx failure after the burn restores
  `timesUsed` — the complement of the C1 synthetic retry pin), the S12-1
  cart-clear scoping (the concurrent-tab line survives), and the S7-8
  best-effort save (the order places at the address cap; below cap the
  address saves in the SAME tx).
- RED (mutation checks) — the honest record: M1 (trust the summary's
  `unitPrice`) failed the money + receipt pins; **the first M2 run ESCAPED
  detection** — the insufficient-stock pin only exercises the READ-side
  guard, and a single-connection state harness cannot interleave a
  competing writer between the in-tx read and the guarded decrement; the
  pin family grew the duplicate-product write-guard seam and M2 went RED
  exactly as predicted; M3 (blanket cart clear) failed the concurrent-tab
  pin. 4 of the 12 pins failed exactly as predicted; the other 8 stayed
  green under every mutation. GREEN — all mutation sites restored
  byte-for-byte; **12/12 pins green (421/421 unit)**; the temp-SQLite
  family intact (10/10 across the other three harnesses).
- Final gates: **421/421 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green**; the documented stale-`next-server`-on-:3000 artifact
  killed by PID before any browser check; mobile menu open → 7 links +
  search → navigate → auto-close/unmount; sitemap 25 URLs; **25
  screenshots** refreshed.
- Docs aligned: AGENTS (plan range 2..26), CLAUDE (the session-26
  money-path tail + the documented `<img>` exception), README (badge
  421/66 + the tail), PAD (§8.1 header + the new row + §12 table), SKILL
  v1.23.0 (project_state + the §5 count + this entry), DEPLOYMENT.md
  drift-free (no new env vars), `.env.example` unchanged; run narrative
  at `docs/session_44.md`.

### Session 27 (run 28) — the 429 wiring-pin grid completed

- Deep audit 28-a at HEAD `8059a67` (fresh clone — the sandbox reset
  between runs): session-26 fixes **4/4 WIRED** with file:line evidence;
  defect-class sweeps effectively CLEAN; static counts **11/11 MATCH**
  (46 unit files · 421 unit · 14 e2e files · 66 e2e · 18 models ·
  14 requireAdmin · 14 metered · 16 catch blocks · 127 tracked TS files ·
  25 screenshots · 3 DSIH); **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW /
  2 NIT / 1 Informational — the fifteenth consecutive session without a
  CRITICAL/HIGH/MEDIUM/LOW finding.** The NITs: **S27-2** two space-only
  lines (newsletter:20, contact:24 — the whitespace-only-line variant the
  double-blank scans miss) + a triple blank run in seo-ld.test.ts:121-123
  (the class extended to tests/ for the first time). Informational: the
  `OrderTxClient` structural tx Pick names 5 models (incl. `"address"`)
  where the S26-3 plan sketch listed 4 — the 5th is REQUIRED by
  `saveCheckoutAddressInTx`; recorded, no action.
- **The flagship (S27-1):** the LAST 11 metered surfaces joined the
  route-level 429 boundary-pin grid — cart POST/PATCH/DELETE (60/min
  shared `cart:` prefix), cart/bulk (10/min), cart-summary GET (120/min),
  coupon/apply POST (30/min — the 429 body is the `CouponApplyResponse`
  shape `{ ok: false, error }`, NOT the generic sibling copy), search GET
  (120/min), wishlist POST (60/min), and the three auth-gated addresses
  handlers (60/min behind a mocked `getCurrentUser` — safe: no
  `src/lib/**` module imports `@/lib/auth`). Key mechanics: the file's
  `post()` helper appends a constant proxy hop which BECOMES the rightmost
  `x-forwarded-for` hop, so same-key describes would exhaust each other's
  budgets — every new pin uses the `nextReq()` SINGLE-HOP helper with a
  UNIQUE per-test IP (the C1 pin's isolation convention). **21/21 green on
  the first run** (the lessons pre-applied); RED verified by M1 (coupon
  30→29 → exactly the coupon pin fails) and M2 (cart 60→59 → exactly the
  three cart pins fail — the isolation proof); sites restored
  byte-for-byte. **432/432 unit.**
- S27-2: the two space-only lines stripped, the triple blank collapsed —
  zero whitespace-only lines / double-blank sites in src/ and the touched
  test file.
- Final gates: **432/432 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green**; 25 screenshots refreshed on the fresh production server;
  mobile menu open → links + search → navigate → auto-close/unmount;
  sitemap 25 URLs; zero console messages/errors.
- Docs aligned: AGENTS (plan range 2..27), CLAUDE (the session-27
  grid-completion tail), README (badge 432/66 + the tail), PAD (§8.1
  header 432 + the api-boundaries row + §12 table), SKILL v1.24.0
  (project_state + this entry), DEPLOYMENT.md drift-free (no new env
  vars), `.env.example` unchanged; run narrative at `docs/session_46.md`.

### Session 28 (run 29) — hygiene & precision pass (16th clean session)

- Deep audit 29-a at HEAD `62cfdc5` (fresh clone — the sandbox reset
  between runs; the clone tip = `a37508a` + the operator's
  `session_47.md` log commit): session-27 fixes **3/3 WIRED** with
  point-by-point evidence (all 11 new boundary pins re-verified — budgets,
  single-hop unique-IP isolation, the full 429 contract incl. the coupon
  `CouponApplyResponse` body, S15-1 slot accounting, the `@/lib/auth`
  mock reset + per-describe user override; the whitespace classes at
  zero; the docs claims match). Defect-class sweeps clean (9 fully clean
  + 4 documented-pattern-only). Static counts **11/11 MATCH**. All 8
  carried deferrals accurate. **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW /
  2 NIT / 4 Informational — the sixteenth consecutive session without a
  substantive code finding.**
- **The NITs (S28-1/S28-2):** the S27-1 comment lost its space after
  `//` (`api-boundaries.test.ts:440` — `//CouponApplyResponse`), and the
  `CouponApplyResponse` failure variant mixed member styles
  (`{ ok: false, error: string }` comma-style next to the semicolon-style
  success variant — `coupon/apply/route.ts:12`). Both fixed; the boundary
  suite green before AND after is the zero-behavior evidence (no RED
  phase is possible for comment/annotation-only changes — stated in the
  plan, not skipped silently).
- **The precision pass (S28-3):** the plan's S27-3 execution-log box was
  left unticked in run 28 although the work shipped in the same commit —
  ticked with a transparency note (recorded as Informational-2); the
  S27-1 log line's "21/21 (11 new + 10 existing)" clarified to "boundary
  CASES … 17 describes / 21 cases total in the file" (Informational-1);
  SKILL §5 now carries the reproducible count command
  (`git ls-files src/ | grep -E '\.(ts|tsx)$'` — a `src/**/*.ts` GLOB
  pathspec misses `src/proxy.ts`; Informational-4). Informational-3 (the
  review-form path drift lives in the operator's audit brief, not in any
  repo doc) recorded as a disposition, no repo change.
- Final gates: **432/432 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green**; 25 screenshots refreshed; mobile menu contract + sitemap
  25 URLs + JSON-LD + zero console messages/errors re-verified.
- Docs aligned: AGENTS (plan range 2..28), CLAUDE (the session-28 tail),
  SKILL v1.25.0 (project_state + this entry), DEPLOYMENT.md drift-free,
  `.env.example` unchanged; run narrative at `docs/session_48.md`.

### Session 29 (run 30) — the first fully-empty remediation cycle (17th clean session)

- Deep audit 30-a at HEAD `8e33006` (fresh clone — the sandbox reset
  between runs; the clone tip = `d5061c2` + the operator's
  `session_49.md` log commit): session-28 fixes **3/3 WIRED** with
  file:line evidence (the spaced comment holds; a programmatic `//\S`
  scan over src/ + tests/ found 8 string/regex-literal false-positives
  and ZERO real unspaced comments; the semicolon-style failure variant
  holds with the type-heavy files cross-checked — no mixed-style
  annotation anywhere; the docs precision items all present).
- Defect-class sweeps clean (all 13). Static counts **12/12 MATCH**
  (46/432 unit · 14/66 e2e · 18 models · 14 requireAdmin · 14 metered ·
  16 catch blocks · 127 tracked TS files · 25 screenshots · 3 DSIH · the
  boundary suite 17 describes / 21 cases). All 8 carried deferrals
  accurate; the 429 grid re-verified complete (14/14 metered surfaces
  pinned). **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW / 0 NIT /
  1 Informational — the seventeenth consecutive session without a
  substantive code finding, and the first with not even a NIT.** The
  Informational was workspace-side bookkeeping (the sandbox reset
  truncated the shared workspace log to its Task-21 snapshot; the Task
  28/29 records were restored from the repo's own worklog — the repo
  record was always complete).
- **No code changes this cycle** — the first in the project's history
  with a fully empty remediation surface. The gates ran twice (on the
  pulled tree and on the final tree) and carry the no-regression
  evidence.
- Final gates: **432/432 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green** (both runs); 25 screenshots refreshed; mobile menu
  contract + sitemap 25 URLs + JSON-LD + zero console messages/errors
  re-verified on the fresh production server.
- Docs aligned: AGENTS (plan range 2..29), CLAUDE (the session-29 tail),
  SKILL v1.26.0 (project_state + this entry), DEPLOYMENT.md drift-free,
  `.env.example` unchanged; run narrative at `docs/session_50.md`.

### Session 30 (run 31) — the second consecutive fully-empty cycle (18th clean session)

- Deep audit 31-a at HEAD `712b5e7` (fresh clone — the sandbox reset
  between runs; the clone tip = `91ea3ad` + the operator's two session-log
  commits, `session_49.md` and `session_51.md`): the session-29 docs-sweep
  claims **9/9 WIRED** with file:line evidence (plan section complete with
  all checkboxes ticked; AGENTS range 2..29; CLAUDE tail; SKILL v1.26.0
  project_state + Appendix B; session_50.md consistent with its commit;
  exactly one well-formed Task-30 worklog entry; README/PAD badges;
  `.env.example` contract; DEPLOYMENT.md drift-free).
- Defect-class sweeps clean (all 13 — including a full classification of
  all 60 Prisma write sites against the guarded family and a complete read
  of all 16 route handlers + 3 action files). Static counts **12/12
  MATCH** (46/432 unit — the 432 independently recounted from the test
  declarations · 14/66 e2e · 18 models · 14 requireAdmin · 14 metered ·
  16 catch blocks · 127 tracked TS files · 25 screenshots · 3 DSIH · the
  boundary suite 17 describes / 21 cases). All 8 carried deferrals
  accurate; the 429 grid re-verified complete (14/14, 3 spot-verified in
  full). **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW / 0 NIT /
  3 Informational — the eighteenth consecutive session without a
  substantive code finding, and the second consecutive fully-empty
  remediation surface.** All 3 Informational verified at file:line and
  disposed no-change: the drawer's silent PATCH rollback IS the documented
  L10 remediation (deliberate design); the DSIH gloss drift lives in the
  audit brief, not the repo; the mobile-nav eslint-disable rationale is
  present adjacent to the disable.
- **No code changes this cycle** — verified by `git diff --stat
  d5061c2..HEAD` showing only docs/PNGs since the last-audited tree. The
  gates run twice (pulled tree + final tree) as the no-regression
  evidence.
- Final gates: **432/432 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green** (both runs); 25 screenshots refreshed; mobile menu
  contract + sitemap 25 URLs + robots + JSON-LD + zero console
  messages/errors re-verified on the fresh production server.
- Docs aligned: AGENTS (plan range 2..30), CLAUDE (the session-30 tail),
  SKILL v1.27.0 (project_state + this entry), DEPLOYMENT.md drift-free,
  `.env.example` unchanged; run narrative at `docs/session_52.md`.

### Session 31 (run 32) — the third consecutive fully-empty cycle (19th clean session)

- Deep audit 32-a at HEAD `168d830` (fresh clone — the workspace reset
  again; the clone tip = `d41aa14` + the operator's session-log commit
  appending `docs/session_53.md` and the CLAUDE workflow section;
  `git diff d41aa14..168d830 --stat` = docs-only): the session-30
  docs-sweep claims WIRED with file:line evidence (plan section complete,
  AGENTS range 2..30, CLAUDE tail, SKILL v1.27.0 project_state +
  Appendix B, session_52/53 consistent, one well-formed Task-31 worklog
  entry, README/PAD badges, `.env.example` contract, DEPLOYMENT
  drift-free with 5/5 env vars verified against their read sites).
- Defect-class sweeps clean (all 12; the two raw query-param id DELETE
  handlers recorded as the standing accepted shape — both
  ownership-scoped compound filters with route-level boundary pins).
  Static counts **13/13 MATCH** (46/432 unit — independently recounted ·
  14/66 e2e · 18 models · 14 requireAdmin · 14 metered · 3 DSIH · 127
  tracked TS files · 25 screenshots · 16 admin-dialog catches / 6 files ·
  16 route handlers / 11 files · boundary-suite recounts). All 8 carried
  deferrals accurate; the 429 grid complete (14/14). **0 CRITICAL /
  0 HIGH / 0 MEDIUM / 0 LOW / 0 NIT / 4 Informational — the nineteenth
  consecutive session without a substantive code finding, and the third
  consecutive fully-empty remediation surface.** The 4 Informationals
  verified and disposed no-change: the raw query-param id DELETEs (the
  accepted shape); the prisma `^6.11.1` range resolving to 6.19.3
  (lockfile-coherent, semver-consistent, the tolerant matcher absorbing
  engine-shape drift); the seed.ts lint/typecheck split (deliberate);
  the operator's docs-only CLAUDE.md commit.
- **No code changes this cycle** — verified by `git diff --stat
  d41aa14..168d830` showing only docs since the last-audited tree. The
  gates run twice (pulled tree + final tree) as the no-regression
  evidence.
- Environmental notes this cycle: the sandbox now BLOCKS symlink
  creation, so the shadow `DATABASE_URL` convergence moved to per-command
  absolute-path exports (one inode, seed 16/8/3/3/13 verified); and the
  Playwright browser cache was re-paired with the lockfile
  (`@playwright/test` 1.64.0 needs chromium rev 1248 — `npx playwright
  install chromium` restored the match before the 66/66 run).
- Final gates: **432/432 unit · 66/66 e2e · lint/typecheck/typecheck:tests/
  build green** (both runs); 25 screenshots refreshed (11 dynamic-content
  deltas, 14 byte-identical); mobile menu contract + sitemap 25 URLs +
  robots + noindex + security headers + JSON-LD + zero console
  messages/errors re-verified on the fresh production server; the
  reference site's mobile push-down panel anatomy re-confirmed live.
- Docs aligned: AGENTS (plan range 2..31), CLAUDE (the session-31 tail),
  SKILL v1.28.0 (project_state + this entry), DEPLOYMENT.md drift-free,
  `.env.example` unchanged; run narrative at `docs/session_54.md`.

### Session 32 (run 33) — the fourth consecutive fully-empty cycle (20th clean session)

- Deep audit 33-a at HEAD `6e62d01` (= `a850067`, the session-31 cycle,
  + the operator's session-log commit appending `docs/session_55.md`;
  `git diff a850067..6e62d01 --stat` = docs-only, +78 lines, zero
  src/tests/prisma deltas from the last-audited tree): the session-31
  docs-sweep claims **8/8 WIRED** with file:line evidence (plan Session 31
  section complete with all boxes ticked, AGENTS range 2..31, SKILL
  v1.28.0 project_state + Appendix B, session_54/55 consistent, one
  well-formed Task-32 worklog entry, README/PAD badges, `.env.example`
  contract with all 5 env vars verified against their read sites,
  DEPLOYMENT drift-free).
- Defect-class sweeps clean (all 12 — the two raw query-param id DELETE
  handlers re-confirmed as the standing accepted shape, both
  ownership-scoped compound filters with route-level boundary pins).
  Static counts **12/13 exact MATCH + 1 count-convention gloss**: the
  "16 route handlers / 11 files" anchor counts 16 top-level route-file
  exports, which is precisely **15 HTTP handlers + 1 exported response
  type** (`CouponApplyResponse`, coupon/apply/route.ts:10) across the 11
  files — reproducible under its raw-export convention, restated in the
  precise form going forward (this entry + the Session 32 plan section);
  the historical records stay untouched. All 8 carried deferrals
  accurate; the 429 grid complete (14/14).
- **0 CRITICAL / 0 HIGH / 0 MEDIUM / 0 LOW / 0 NIT / 2 Informational —
  the twentieth consecutive session without a substantive code finding,
  and the fourth consecutive fully-empty remediation surface.** The 2
  Informationals verified and disposed no-change: (1) the route-handler
  count-convention gloss above (docs-precision, zero code impact —
  clarified in this entry, history untouched); (2) the sandbox process-env
  shadow `DATABASE_URL` pointing at a non-existent path (the documented
  Task-32 environmental trap — every DB-touching command this run
  exported the absolute repo path so the shadow and the repo contract
  resolve to ONE inode; seed 16/8/3/3/13 verified through it).
- **No code changes this cycle** — verified by `git diff --stat
  a850067..6e62d01` showing only the operator's session log since the
  last-audited tree. The gates run twice (pulled tree + final tree) as
  the no-regression evidence.
- Final gates: **432/432 unit (46 files) · 66/66 e2e (1.9m) ·
  lint/typecheck/typecheck:tests/build green** (both runs); 25
  screenshots refreshed (11 dynamic-content deltas, 14 byte-identical);
  live-reference parity re-verified via agent-browser (the reference
  logged in with the operator's credentials: Damascus-first featured
  order card-for-card, and the reference's mobile push-down panel
  anatomy confirmed live at 390×844 — nav links + search + close);
  clone verified on the fresh production server: home parity + the 4
  trust badges + JSON-LD Organization/WebSite (+ Product on detail
  pages) + zero console messages/errors + sitemap 25 URLs + robots +
  noindex on private surfaces + the full security-header set (CSP
  per-request nonce + strict-dynamic, HSTS, X-Frame-Options DENY,
  nosniff, Referrer-Policy, Permissions-Policy, no X-Powered-By) + the
  mobile menu contract intact (open → `nav[aria-label="Mobile"]` with
  exactly 7 links + the search box in the panel container + close →
  navigate → drawer unmounted, `aria-expanded` bound).
- Docs aligned: AGENTS (plan range 2..32), CLAUDE (the session-32 tail),
  SKILL v1.29.0 (project_state + this entry), DEPLOYMENT.md drift-free,
  `.env.example` unchanged; run narrative at `docs/session_56.md`.

### Session 33 (run 34) — the reference-parity cycle (S33-1)

- **The finding (live-reference drift):** the reference site re-ordered its
  catalog — /products "Newest", home New Arrivals AND home Featured now
  render Enameled Cast Iron Dutch Oven first (Dutch Oven → Glass Storage →
  Damascus → Walnut → Mixing Bowl → Copper Frying → Stand Mixer → Ceramic
  Dinner; Featured = that order filtered by the featured flag), while the
  clone still rendered the session-12 pinned Damascus-first order. The
  reference's VISIBLE catalog also shrank 16 → 8 (8 products removed
  server-side); prices/review-counts/categories/hero/mobile-menu all
  unchanged.
- **S33-1 fix (TDD, red → green):** the seed-catalog order pin
  (`tests/unit/seed-catalog.test.ts`) extended FIRST to assert the full
  8-slug reference order (red against the old seed); then the PRODUCTS
  array in `prisma/seed.ts` reordered — the 8 reference-core blocks in the
  reference's live order, the 8 superset blocks untouched as the tail
  (superset principle: never delete working content); the order-related
  comments re-anchored (seed-policy.ts, storefront.spec.ts, seed.ts);
  fresh-DB re-seed (createdAt is create-only — existing rows keep their
  order, so re-ordering requires deleting `db/custom.db` and re-running
  `npm run db:setup`).
- **Verification:** /products, Featured and New Arrivals render the
  reference's order card-for-card (agent-browser, fresh production
  server); the e2e storefront pins are order-agnostic by design and stayed
  green untouched; full gate chain green twice (pulled tree + final tree):
  lint · typecheck · typecheck:tests · 432/432 unit · build · 66/66 e2e.
- Deep audit 34-a (repo-side): 9/9 docs claims WIRED · 13/13 sweeps clean ·
  7/7 counts MATCH · 8/8 deferrals standing · 0 repo-side findings — the
  parity finding was live-reference-side, discoverable only through the
  logged-in reference comparison.
- Docs aligned: AGENTS (the S12-5 invariant reworded + plan range 2..33),
  CLAUDE (the session-33 tail + the seed-catalog pin description),
  README/PAD (the authored-order wording), SKILL v1.30.0 (project_state +
  this entry), DEPLOYMENT.md drift-free, `.env.example` unchanged; run
  narrative at `docs/session_58.md`.

### Session 34 (run 35) — the second consecutive reference-parity cycle (S34-1)

- **The finding (live-reference drift, again):** the reference site
  re-ordered its catalog a SECOND time since the original pinning —
  /products "Newest", home New Arrivals AND home Featured now render
  Damascus Steel Chef Knife Set first (Damascus → Copper Frying →
  Ceramic Dinner → Dutch Oven → Walnut → Mixing Bowl → Glass Storage →
  Stand Mixer; Featured = that order filtered by the featured flag),
  while the clone still rendered the session-33 re-aligned
  Dutch-Oven-first order. Everything else matched again: prices (all 8,
  compare-at included), review counts (±1 live-traffic noise), the 8
  category tiles, the hero carousel (3 rotating slides), the section
  anatomy, the 4 trust badges, the mobile-menu anatomy at 390×844, and
  the track-order/about surfaces — the catalog ORDER was the only delta,
  exactly the S33-1 class.
- **S34-1 fix (TDD, red → green):** the seed-catalog order pin
  (`tests/unit/seed-catalog.test.ts`) extended FIRST to the new 8-slug
  reference order (red: 1 failed | 5 passed); then the PRODUCTS array in
  `prisma/seed.ts` reordered through a persisted sandbox script
  (`reorder_seed_s34.py`) — a pure block move with a line-multiset
  purity check (97 insertions / 97 deletions, zero product-data
  changes), the 8 superset blocks untouched as the tail, and the S33-1
  move's mixed opening-brace indentation normalized to the canonical
  2-space shape; the order-related comments re-anchored
  (seed-policy.ts, storefront.spec.ts, seed.ts — now documenting the
  twice-re-aligned history); fresh-DB re-seed (createdAt is
  create-only).
- **Verification:** /products, Featured and New Arrivals render the
  reference's current order card-for-card (agent-browser, fresh
  production server); the mobile-menu contract re-verified live at
  390×844 (open → 7 links + close → navigate → panel unmounted,
  aria-expanded bound); the e2e storefront pins are order-agnostic by
  design and stayed green untouched; full gate chain green twice
  (pulled tree + final tree): lint · typecheck · typecheck:tests ·
  432/432 unit · build · 66/66 e2e.
- Deep audit 35-a (repo-side): 9/9 docs claims WIRED · 12/12 sweeps
  clean · 9/9 counts MATCH (incl. the audit's own dynamic 432/432
  re-run) · 8/8 deferrals standing · 0 repo-side findings + 3
  Informational disposed no-change (the brief-side DELETE-handler
  wording gloss — the actual accepted pair is cart `?line=` +
  addresses `?id=`; the untracked sandbox verify-seed scratch; the
  parent-worklog stub after the reset) — the parity finding was
  live-reference-side again, discoverable only through the logged-in
  reference comparison.
- Docs aligned: AGENTS (the S12-5 invariant reworded for the twice
  re-aligned history + plan range 2..34), CLAUDE (the session-34 tail +
  the seed-catalog pin description), README/PAD (the authored-order
  wording), SKILL v1.31.0 (project_state + this entry), DEPLOYMENT.md
  drift-free, `.env.example` unchanged; run narrative at
  `docs/session_60.md`.


### Session 35 (run 36) — the fifth fully-empty remediation cycle, both surfaces clean (S35-1)

- **No finding this cycle — the first cycle since the two
  reference-parity rounds where BOTH audit surfaces came back clean.**
  The live reference KEPT its catalog in the session-34-pinned
  Damascus-first order (/products "Newest" · home Featured · home New
  Arrivals all unchanged; count text "8 products found"), so there was
  no S33-1/S34-1-class re-alignment item: the clone renders all three
  surfaces card-for-card in exactly the pinned order (verified
  agent-browser against a fresh production server, logged into the
  reference with the operator's credentials). Everything else matched
  too: prices (all 8, compare-at included), review counts (the
  reference shows 412 on Damascus = the seed's authored display count;
  the clone's local DB shows 413 from run-36's own e2e
  review-submission traffic — a fresh re-seed restores 412 exactly),
  the 8 category tiles, the 3-slide rotating hero, the section
  anatomy, the 4 trust badges, the mobile-menu contract at 390×844,
  and the track-order/about surfaces.
- **Repo-side audit (36-a, read-only):** 9/9 docs claims WIRED · 11/11
  defect sweeps clean · 10/10 counts MATCH (incl. the audit's own
  dynamic 432/432 unit re-run) · 8/8 carried deferrals standing ·
  **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 3 Informational** disposed
  no-change (two environmental — the sandbox verify-seed scratch and
  the parent-worklog stub; one docs-precision — the "16 admin-dialog
  catches / 6 files" anchor's file-set convention: the five admin
  `*-dialog.tsx` files (15 catches) + `settings-form.tsx` (1), with
  the account `address-dialog.tsx`'s three catches outside the admin
  set, 18 total across dialog-named files all handled uniformly —
  restated precisely here so future audits count the intended set).
- **S35-2 (LOW — docs tooling):** the 11-checkout screenshot capture
  lost the fire-and-forget add-to-cart race in run 35 and silently
  shipped the EMPTY-CART shell at `/checkout` (the session-23/run-24
  class — the 04-cart shot got the `expectBadgeCount` gate in
  session-24, the checkout shot never did; the run-36 capture won the
  race by timing luck, and the 59KB→101KB byte flip between two
  captures of an UNCHANGED page was the race itself, surfaced by a
  VLM-assisted diff in the operator's post-audit verification).
  Fixed: the capture now awaits `expectBadgeCount(page, 1)` before
  the navigation — verified deterministic (byte-identical md5 across
  consecutive full capture runs); the shot now stably documents the
  real checkout form. Environmental note: back-to-back full capture
  runs trip the 10/min per-email login limiter — a clean single run
  after a 60s window recovers all 25.
- **S35-1 (docs sweep):** SKILL v1.31.0 → v1.32.0 (project_state
  sessions 2-35 + this entry), AGENTS plan range 2..34 → 2..35 + the
  capture-script trap note extended, CLAUDE tail, README/PAD/
  DEPLOYMENT drift checks, `.env.example` verified unchanged, the 25
  screenshots refreshed on a final single clean run (11 changed vs
  repo HEAD — the gated checkout shot, the Damascus review-count
  413→414 delta from this session's two e2e runs, and the
  admin/account dynamic deltas; 14 byte-identical), the plan's
  Session 35 section, `docs/session_62.md`, worklog Task 36. No
  changes in src/tests/prisma — the 432/66 suites carry the
  no-regression evidence by their green runs on the pulled tree AND
  on the final tree (the twice-run evidence).
- **Reference-tech-stack re-verification:** the `ecommerce-store` repo
  re-cloned at `1ffda3d` (the same commit reviewed in run 35); skills
  folders byte-identical; the sitemap/SEO comparison re-run —
  homenest's remains the stricter superset (private surfaces excluded;
  the reference's own sitemap lists login/register/wishlist;
  single-sourced `siteBaseUrl()`; DB-failure tolerance).
- Run narrative at `docs/session_61.md` (the operator's raw run-35
  log) and `docs/session_62.md` (this run).

### Session 36 (run 37) — the sixth fully-empty remediation cycle, both surfaces clean again (S36-1)

- **No finding this cycle — the second consecutive cycle with BOTH
  audit surfaces clean, and the third consecutive stable-reference
  cycle.** The live reference KEPT its catalog in the session-34-
  pinned Damascus-first order (/products "Newest" · home Featured ·
  home New Arrivals all unchanged; count text "8 products found"), so
  there was no S33-1/S34-1-class re-alignment item: the clone renders
  all three surfaces card-for-card in exactly the pinned order
  (verified agent-browser against a fresh standalone server, logged
  into the reference with the operator's credentials). All 8 prices
  re-verified to the cent (199.99 / 89.99 / 119.99 / 149.99 / 79.99 /
  54.99 / 42.99 / 349.99 + the Damascus -29% compare-at), review
  counts (reference 412 = the seed's authored display count; the
  clone's local DB 416 from accumulated e2e review traffic across
  runs — a fresh re-seed restores 412 exactly), the 8 category tiles,
  the 3-slide rotating hero, the 4 trust badges, the mobile-menu
  contract at 390×844 verified on BOTH sides (the reference's
  push-down panel + navigate-closes; the clone's Tailwind v4
  conditional-mount, 7 links, unmount-on-navigate, aria-expanded),
  and the track-order/about surfaces. The clone's SEO re-verified
  live: sitemap 25 URLs, robots disallow set, noindex on private
  surfaces, health ok/db-up.
- **Repo-side audit (37-a, read-only):** 9/9 docs claims WIRED · 11/11
  defect sweeps clean · 10/10 counts MATCH (incl. the audit's own
  dynamic 432/432 unit re-run, 20.16s) · 8/8 carried deferrals
  standing · **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 2 Informational**
  disposed no-change (one environmental — the parent-worklog stub;
  one informational — the Appendix B session-35 entry citing
  session_62 but not session_63, an inherent commit-chronology
  artifact: the operator's raw log lands as a post-push commit, so
  pre-push Appendix B entries cannot cite it). 36-a's untracked
  verify-seed scratch item RESOLVED — the workspace survived this
  cycle (git pull refresh only, the first non-reset environment since
  the reset streak), so the working tree was fully clean at cycle
  start.
- **S36-1 (docs sweep):** SKILL v1.32.0 → v1.33.0 (project_state
  sessions 2-36 + this entry), AGENTS plan range 2..35 → 2..36,
  CLAUDE tail, README/PAD/DEPLOYMENT drift checks, `.env.example`
  verified unchanged, the 25 screenshots refreshed on a final single
  clean run captured AFTER the final-tree e2e so the pushed shots
  match the committed DB state (9 changed vs repo HEAD — the Damascus
  review-count 414→417 delta from run-36's final-tree e2e runs plus
  this cycle's two e2e runs, and the admin/account dynamic deltas
  incl. the order count 20→25; 16 byte-identical — including both
  order-bearing card grids where the review-count text is the only
  pixel delta, and the S35-2-gated 11-checkout shot byte-stable
  across both of this cycle's captures), the plan's Session 36
  section,
  `docs/session_64.md`, worklog Task 37. No changes in
  src/tests/prisma — the 432/66 suites carry the no-regression
  evidence by their green runs on the pulled tree AND on the final
  tree (the twice-run evidence).
- **Reference-tech-stack re-verification:** the `ecommerce-store` repo
  re-checked at `1ffda3d` (still up to date with its origin/main —
  the same commit reviewed in runs 35/36); skills folders
  byte-identical; the sitemap/SEO comparison re-run — homenest's
  remains the stricter superset.
- Run narrative at `docs/session_63.md` (the operator's raw run-36
  log) and `docs/session_64.md` (this run).

### Session 37 (run 38) — the seventh fully-empty remediation cycle, both surfaces clean for the third consecutive time (S37-1)

- **No finding this cycle — the third consecutive cycle with BOTH
  audit surfaces clean, and the FOURTH consecutive stable-reference
  cycle.** The live reference KEPT its catalog in the session-34-
  pinned Damascus-first order (/products "Newest" · home Featured ·
  home New Arrivals all unchanged; count text "8 products found"), so
  there was no S33-1/S34-1-class re-alignment item: the clone renders
  all three surfaces card-for-card in exactly the pinned order
  (verified agent-browser against a fresh standalone server, logged
  into the reference with the operator's credentials). All 8 prices
  re-verified to the cent with their compare-at values and discount
  badges (199.99/279.99 −29% · 89.99/129.99 −31% · 119.99/159.99 −25%
  · 149.99/199.99 −25% · 79.99 · 54.99/69.99 −21% · 42.99 ·
  349.99/429.99 −19%), review counts (reference 412 = the seed's
  authored display count; the clone's local DB 418 from accumulated
  e2e review traffic across runs — a fresh re-seed restores 412
  exactly), the 8 category tiles, the 3-slide rotating hero ("Sale Up
  to 40% Off" observed mid-rotation), the 4 trust badges, the
  mobile-menu contract at 390×844 verified on BOTH sides (the
  reference's push-down panel + navigate-closes; the clone's Tailwind
  v4 conditional-mount, 7 links, close button + search box present,
  unmount-on-navigate), and the track-order/about surfaces. The
  clone's SEO re-verified live: sitemap 25 URLs, robots disallow
  set, noindex on private surfaces, health ok/db-up.
- **Repo-side audit (38-a, read-only):** 9/9 docs claims WIRED · 11/11
  defect sweeps clean · 10/10 counts MATCH (incl. the audit's own
  dynamic 432/432 unit re-run, 20.10s) · 8/8 carried deferrals
  standing · **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 2 Informational**
  disposed no-change (one environmental — the parent-worklog stub,
  now RESOLVED: the workspace survived for the second consecutive
  cycle and the sandbox worklog carried the in-progress Task-38
  record; one informational — README/PAD carry the accurate 432/66
  test-count badges while the plan-range/SKILL-version strings live
  in AGENTS/CLAUDE/SKILL per the long-standing doc layout, a
  layout-consistency note, not drift).
- **S37-1 (docs sweep):** SKILL v1.33.0 → v1.34.0 (project_state
  sessions 2-37 + this entry), AGENTS plan range 2..36 → 2..37,
  CLAUDE tail, README/PAD/DEPLOYMENT drift checks, `.env.example`
  verified unchanged, the 25 screenshots refreshed on a final single
  clean run captured AFTER the final-tree e2e so the pushed shots
  match the committed DB state (the run-36/37 discipline), the plan's
  Session 37 section, `docs/session_66.md`, worklog Task 38. No
  changes in src/tests/prisma — the 432/66 suites carry the
  no-regression evidence by their green runs on the pulled tree AND
  on the final tree (the twice-run evidence). Plus **S37-2**, a LOW
  docs-tooling fix surfaced during this cycle's screenshot refresh:
  the 04b capture's coupon-toast animation frame made the shot
  run-to-run byte-non-deterministic (pixel-diff isolated the only
  differing region to the toast itself — not the S35-2 content-race
  class); the capture now waits for the toast's 4s auto-dismiss,
  verified deterministic by a byte-identical md5 across consecutive
  capture runs (the S35-2 pin style).
- **Reference-tech-stack re-verification:** the `ecommerce-store` repo
  re-checked at `1ffda3d` (still up to date with its origin/main —
  the same commit reviewed in runs 35/36/37); skills folders
  byte-identical (md5-verified); the sitemap/SEO comparison re-run —
  homenest's remains the stricter superset.
- Run narrative at `docs/session_65.md` (the operator's raw run-37
  log) and `docs/session_66.md` (this run).

### Session 38 (run 39) — the eighth fully-empty remediation cycle, both surfaces clean for the fourth consecutive time (S38-1)

- **No finding this cycle — the fourth consecutive cycle with BOTH
  audit surfaces clean, and the FIFTH consecutive stable-reference
  cycle.** The live reference KEPT its catalog in the session-34-
  pinned Damascus-first order (/products "Newest" · home Featured ·
  home New Arrivals all unchanged; count text "8 products found"), so
  there was no S33-1/S34-1-class re-alignment item: the clone renders
  all three surfaces card-for-card in exactly the pinned order
  (verified agent-browser against a fresh standalone server, logged
  into the reference with the operator's credentials). All 8 prices
  re-verified to the cent with their compare-at values and discount
  badges (199.99/279.99 −29% · 89.99/129.99 −31% · 119.99/159.99 −25%
  · 149.99/199.99 −25% · 79.99 · 54.99/69.99 −21% · 42.99 ·
  349.99/429.99 −19%), review counts (reference 412 = the seed's
  authored display count; the fresh-clone re-seed restores 412
  exactly), the 8 category tiles, the rotating hero ("Sale Up to 40%
  Off" observed mid-rotation), the 4 trust badges, the mobile-menu
  contract at 390×844 verified on BOTH sides (the reference's
  push-down panel + navigate-closes; the clone's Tailwind v4
  conditional-mount, 7 links, the green circular close button RENDERED
  44×44, the panel's own search box RENDERED 209×40, unmount-on-
  navigate — an unscoped document-wide query had matched the HEADER's
  desktop search input (hidden on mobile) and false-alarmmed hidden;
  the panel-scoped re-check and the e2e `panel.getByRole("searchbox")`
  pin are the correct methodology), and the track-order/about
  surfaces. The clone's SEO re-verified live: sitemap 25 URLs, robots
  disallow set, noindex on all 8 probed private surfaces, health
  ok/db-up.
- **Repo-side audit (39-a, read-only):** 9/9 docs claims WIRED · 12/12
  defect sweeps clean · 10/10 counts MATCH (incl. the audit's own
  dynamic 432/432 unit re-run, 19.77s, plus an empirical temp-DB
  verification that concurrent interactive Prisma transactions
  serialize under the single-process deployment) · 8/8 carried
  deferrals standing · **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 3
  Informational** disposed no-change (a phrasing gloss on the
  deliberate empty-catch census — precisely **7 src comment-only
  swallows + 1 test**, the prior narratives' "8 + test" shorthand
  counted the test twice; the documented admin layout-level gating
  design; the SQLite per-single-process serialization scope).
- **S38-1 (docs sweep):** SKILL v1.34.0 → v1.35.0 (project_state
  sessions 2-38 + this entry), AGENTS plan range 2..37 → 2..38,
  CLAUDE tail, README/PAD/DEPLOYMENT drift checks, `.env.example`
  verified unchanged, the 25 screenshots refreshed on a final single
  clean run captured AFTER the final-tree e2e so the pushed shots
  match the committed DB state (the run-36/37/38 discipline), the
  plan's Session 38 section, `docs/session_68.md`, worklog Task 39.
  No changes in src/tests/prisma — the 432/66 suites carry the
  no-regression evidence by their green runs on the pulled tree AND
  on the final tree (the twice-run evidence).
- **Environment (fresh-clone recovery, the run-34/35 pattern):** the
  sandbox RESET again after two surviving cycles — `.env` rewritten
  (the `file:../db/custom.db` contract + a strong random AUTH_SECRET;
  the standalone production server enforces `assertAuthSecret`, so
  the dev fallback would refuse to boot under `npm run start`),
  `npm install` (588 packages), `db:setup` re-seeded (the Damascus-
  first order re-confirmed straight from the seed), and the Playwright
  chromium-1248 cache re-paired. The per-command absolute-export
  `DATABASE_URL` convergence applied to `next build` too (without it
  the sitemap's static generation logs `prisma:error 14` against the
  shadow path — the build still succeeds via the documented DB-failure
  tolerance, but the sitemap would miss the 16 product URLs).
- **Reference-tech-stack re-verification:** the `ecommerce-store` repo
  re-cloned at `1ffda3d` (still up to date with its origin/main — the
  same commit reviewed in runs 35/36/37/38); skills folders
  byte-identical (md5-verified); the sitemap/SEO comparison re-run —
  homenest's remains the stricter superset.
- **Environment (third-consecutive surviving workspace):** git pull
  refresh only — `.env`, the repo-root `db/custom.db` (verified to
  match the pushed run-39 state: 16 products, 10 orders,
  Damascus-first pinned order, reviewCount 414 / stock 24),
  `node_modules`, and the chromium-1248 cache all intact; the only
  standing recovery item is the per-command absolute-export
  `DATABASE_URL` convergence for the sandbox's process-level shadow
  (applies to `next build` too — the sitemap's static generation
  otherwise logs `prisma:error 14` and loses the 16 product URLs).
- **Reference-tech-stack re-verification:** the `ecommerce-store` repo
  re-checked at `1ffda3d` (still up to date with its origin/main — the
  same commit reviewed in runs 35–39); skills folders byte-identical
  (md5-verified); the sitemap/SEO comparison re-run — homenest's
  remains the stricter superset.
- Run narrative at `docs/session_69.md` (the operator's raw run-39
  log) and `docs/session_70.md` (this run).

### Session 39 (run 40) — the ninth fully-empty remediation cycle, both surfaces clean for the fifth consecutive time (S39-1)

- **No finding this cycle — the fifth consecutive cycle with BOTH
  audit surfaces clean, and the SIXTH consecutive stable-reference
  cycle.** The live reference KEPT its catalog in the session-34-
  pinned Damascus-first order (/products "Newest" · home Featured ·
  home New Arrivals all unchanged; count text "8 products found") for
  the sixth consecutive cycle — no S33-1/S34-1-class re-alignment
  item. All 8 prices re-verified to the cent WITH compare-at values
  and discount badges (199.99/279.99 −29% · 89.99/129.99 −31% ·
  119.99/159.99 −25% · 149.99/199.99 −25% · 79.99 · 54.99/69.99 −21%
  · 42.99 · 349.99/429.99 −19%); review counts match the seed's
  authored display counts exactly (412/234/203/367/142/187/156/298);
  the 8 category tiles, the rotating hero ("New Arrivals" first,
  "Sale Up to 40% Off" mid-rotation 4.5s later), the 4 trust badges,
  and the mobile-menu contract at 390×844 verified on BOTH sides —
  the reference's navigate-closes verified with a REAL Playwright
  click on the panel link (a synthetic `dom.click()` on
  `a[href="/products"]` had hit the hidden DESKTOP nav's first
  matching link and left the panel mounted — a testing artifact, not
  reference behavior); the clone's contract verified with 16/16
  automated checks (7 links · Close-menu 44×44 @330,78 · panel
  search box 209×40 @16,80 · unmount-on-navigate), plus the clone's
  full SEO surface re-verified live (sitemap 25 URLs, robots
  disallow set, noindex 8/8 private surfaces, health ok/db-up).
- **Repo-side audit (40-a, read-only):** 9/9 docs claims WIRED · 12/12
  defect sweeps clean · 10/10 counts MATCH (incl. the audit's own
  dynamic 432/432 unit re-run, 21.63s) · 8/8 carried deferrals
  standing · **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 3 Informational**
  (all audit-brief citation glosses — the verification-only-cycle
  2-box convention; the login-limiter's actual home in
  `src/lib/actions/auth.ts:85-91` vs the brief's `src/lib/auth.ts`;
  the button-based ARIA radiogroup shape vs the brief's "native
  radio inputs") all disposed no-change. The audit also hunted fresh
  surfaces (no open redirects — all 6 `redirect()` calls static; all
  `fetch()` same-origin; no client component importing db/prisma;
  timing-safe HMAC with length guard; health degraded-503 path; no
  undocumented env vars in src) — all clean.
- **S39-1 (docs sweep):** SKILL v1.35.0 → v1.36.0 (project_state
  sessions 2-39 + this entry), AGENTS plan range 2..38 → 2..39,
  CLAUDE tail, README/PAD/DEPLOYMENT drift checks, `.env.example`
  verified unchanged, the 25 screenshots refreshed on a final single
  clean run captured AFTER the final-tree e2e AND after
  `restore-demo-stock` re-topped the demo stock (the S14-4 healthy
  state — the run-39 discipline), the plan's Session 39 section,
  `docs/session_70.md`, worklog Task 40. No changes in
  src/tests/prisma — the 432/66 suites carry the no-regression
  evidence by their green runs on the pulled tree AND on the final
  tree (the twice-run evidence).

### Session 40 (run 41) — the tenth fully-empty remediation cycle, both surfaces clean for the sixth consecutive time (S40-1)

- **No finding this cycle — the sixth consecutive cycle with BOTH
  audit surfaces clean, and the SEVENTH consecutive stable-reference
  cycle.** The live reference KEPT its catalog in the session-34-
  pinned Damascus-first order (/products "Newest" · home Featured ·
  home New Arrivals all unchanged; count text "8 products found") for
  the seventh consecutive cycle — no S33-1/S34-1-class re-alignment
  item. All 8 prices re-verified to the cent WITH compare-at values
  and discount badges (199.99/279.99 −29% · 89.99/129.99 −31% ·
  119.99/159.99 −25% · 149.99/199.99 −25% · 79.99 · 54.99/69.99 −21%
  · 42.99 · 349.99/429.99 −19%); review counts match the seed's
  authored display counts exactly (412/234/203/367/142/187/156/298 —
  the reference renders them parenthesized next to the category,
  e.g. "(412)" on Damascus); the 8 category tiles (extracted via
  their `/products?category=` deep links), the rotating hero ("New
  Arrivals" first, "Sale Up to 40% Off" mid-rotation ~5s later), the
  4 trust badges, and the mobile-menu contract at 390×844 verified
  on BOTH sides — the reference's hamburger (the rightmost icon-only
  header button, 36×36 at x338,y14) → push-down panel with 5 nav
  links (each 358×44 stacked from y121) + the icon-only "Search
  products..." search BUTTON (40×28 at x16,y81); toggle-closes; and
  navigate-closes verified with a REAL Playwright click on the
  panel's Products link (URL → /products, panel unmounted, re-checked
  defensively: zero visible panel links AND zero panel search
  buttons); the clone's contract verified with 16/16 automated
  checks (7 links · Close-menu 44×44 @330,78 · panel search box
  209×40 @16,80 · unmount-on-navigate), plus the clone's full SEO
  surface re-verified live (sitemap 25 URLs, robots disallow set,
  noindex 8/8 private surfaces, health ok/db-up, home h1 renders).
- **Repo-side audit (41-a, read-only):** 9/9 docs claims WIRED · 12/12
  defect sweeps clean · 10/10 counts MATCH (incl. the audit's own
  dynamic 432/432 unit re-run, 19.86s, plus lint ✓ · typecheck ✓ ·
  typecheck:tests ✓ as extra permitted gates) · 8/8 carried
  deferrals standing · **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 2
  Informational** (both brief-side citation glosses — the
  git-ls-files pathspec convention: the documented 127 tracked src
  TS files is the true count, a bare `src/**/*.ts` pathspec drops
  zero-depth `src/proxy.ts` on this git build; the redirect anchor =
  6 textual occurrences, 5 executable + 1 comment) both disposed
  no-change. The audit also hunted fresh surfaces (redirects
  static/role-derived; 4 `router.push` sites same-origin incl. the
  server-minted order+token pair; all 15 `fetch()` same-origin; no
  client component importing db/prisma; timing-safe HMAC with length
  guard; health degraded-503; demo credentials server-side props
  only; zero Math.random/@ts-ignore/innerHTML writes;
  `target="_blank"` hardened) — all clean.
- **S40-1 (docs sweep):** SKILL v1.36.0 → v1.37.0 (project_state
  sessions 2-40 + this entry), AGENTS plan range 2..39 → 2..40,
  CLAUDE tail, README/PAD/DEPLOYMENT drift checks, `.env.example`
  verified unchanged, the 25 screenshots refreshed on a final single
  clean run captured AFTER the final-tree e2e AND after
  `restore-demo-stock` re-topped the demo stock (the S14-4 healthy
  state — the run-39/40 discipline), the plan's Session 40 section,
  `docs/session_72.md`, worklog Task 41. No changes in
  src/tests/prisma — the 432/66 suites carry the no-regression
  evidence by their green runs on the pulled tree AND on the final
  tree (the twice-run evidence).

### Session 41 (run 42) — the eleventh fully-empty remediation cycle, both surfaces clean for the seventh consecutive time (S41-1, S41-2)

- **No finding this cycle — the seventh consecutive cycle with BOTH
  audit surfaces clean, and the EIGHTH consecutive stable-reference
  cycle.** The live reference KEPT its catalog in the session-34-
  pinned Damascus-first order (/products "Newest" · home Featured ·
  home New Arrivals all unchanged; count text "8 products found") for
  the eighth consecutive cycle — no S33-1/S34-1-class re-alignment
  item. All 8 prices re-verified to the cent WITH compare-at values
  and discount badges (199.99/279.99 −29% · 89.99/129.99 −31% ·
  119.99/159.99 −25% · 149.99/199.99 −25% · 79.99 · 54.99/69.99 −21%
  · 42.99 · 349.99/429.99 −19%); review counts match the seed's
  authored display counts exactly (412/234/203/367/142/187/156/298 —
  the reference renders them parenthesized next to the category);
  the 8 category tiles, the rotating hero ("Sale Up to 40% Off"
  observed mid-rotation), the 4 trust badges, and the mobile-menu
  contract at 390×844 verified on BOTH sides — the reference's
  hamburger (36×36 at x338,y14) → push-down panel with 5 nav links
  (each 358×44 stacked from y121) + the icon-only search BUTTON
  (40×28 at x16,y81); toggle-closes; navigate-closes verified with a
  REAL Playwright click on the panel's Products link (URL →
  /products, panel unmounted, re-checked defensively); the clone's
  contract verified with 15/15 automated checks (7 links · Close-menu
  44×44 @330,78 · panel search box 209×40 @16,80 · unmount-on-
  navigate) plus the clone's full SEO surface re-verified live
  (sitemap 25 URLs, robots disallow set, noindex 8/8 private
  surfaces, health ok/db-up, home h1 renders).
- **Repo-side audit (42-a, read-only):** 9/9 docs claims WIRED · 12/12
  defect sweeps clean · 10/10 counts MATCH (incl. the audit's own
  dynamic 432/432 unit re-run, 19.97s, plus lint ✓ · typecheck ✓ ·
  typecheck:tests ✓ as extra permitted gates) · 8/8 carried
  deferrals standing · **0 CRITICAL/HIGH/MEDIUM/LOW + 1 NIT + 4
  Informational**. The NIT is a genuine latent docs-quality defect
  inside the documented state (not drift from it): PAD §1.2's
  Technology Stack Summary still carried blueprint-time counts ("131
  tests" / "32 tests") contradicting the same document's §8.1 (432)
  and §12 (432 unit · 66 e2e) — the S25-2 stale-stats class,
  pre-existing since the session-6-era authoring and never surfaced
  in 40 cycles of audits — **fixed as S41-2** (the two cells now
  carry 432/66 aligned with §8.1/§12). The 4 Informational are
  brief-side citation glosses disposed no-change (the 2-box
  both-checked execution-log shape for verification-only cycles; the
  single legitimate console.error's home at `(storefront)/error.tsx:15`
  — the health route's degraded-503 path logs nothing; the
  git-ls-files pathspec convention — the documented 127 tracked src
  TS files is the true count, a bare `src/**/*.ts` pathspec drops
  zero-depth `src/proxy.ts` on this git build; the redirect anchor =
  6 textual occurrences, 5 executable + 1 comment). The audit also
  hunted fresh surfaces (redirects static/role-derived; 4
  `router.push` sites same-origin incl. the server-minted order+token
  pair; all 15 `fetch()` same-origin; no client component importing
  db/prisma; timing-safe HMAC with length guard; health degraded-503;
  demo credentials server-side props only; zero
  Math.random/@ts-ignore/innerHTML writes; `target="_blank"`
  hardened) — all clean.
- **S41-2 (NIT, docs-only):** the PAD §1.2 stale-stats cell fixed —
  "Node-env suite (432 tests; grew with every remediation session —
  see §8.1)" and "66 tests incl. the Tailwind v4 mobile-nav
  regression guard" — the Technology Stack Summary, §8.1 and §12 now
  agree.
- **S41-1 (docs sweep):** SKILL v1.37.0 → v1.38.0 (project_state
  sessions 2-41 + this entry), AGENTS plan range 2..40 → 2..41,
  CLAUDE tail, README/DEPLOYMENT drift checks, `.env.example`
  verified unchanged, the 25 screenshots refreshed on a final single
  clean run captured AFTER the final-tree e2e AND after
  `restore-demo-stock` re-topped the demo stock (the S14-4 healthy
  state — the run-39/40/41 discipline), the plan's Session 41
  section, `docs/session_74.md`, worklog Task 42. No changes in
  src/tests/prisma — the 432/66 suites carry the no-regression
  evidence by their green runs on the pulled tree AND on the final
  tree (the twice-run evidence). Environmental note: the fresh-clone
  recovery pattern applied again (the sandbox reset — .env rewrite,
  npm install, db:setup, chromium-1248 re-pairing) with the
  per-command absolute-export DATABASE_URL convergence standing.
- **Parity-script methodology refinements (recorded for future
  cycles):** measure the mobile-panel geometry only AFTER the mount
  animation settles (waitForTimeout(700) past visibility —
  transform none; mid-animation reads give y≈73–77 and false-alarm
  the documented 78/80 pins as drifted), and target the panel's
  search box as `input[placeholder="Search products..."]` — a
  `role="search"` locator matches the 314-wide wrapping FORM, not
  the 209-wide input. With those corrections the run-39/40/41
  geometry reproduces exactly.

### Session 42 (run 43) — the twelfth fully-empty remediation cycle, both surfaces clean for the eighth consecutive time (S42-1, S42-2)

- **No finding this cycle — the eighth consecutive cycle with BOTH
  audit surfaces clean, and the NINTH consecutive stable-reference
  cycle.** The live reference KEPT its catalog in the session-34-
  pinned Damascus-first order (/products "Newest" · home Featured ·
  home New Arrivals all unchanged; count text "8 products found") for
  the ninth consecutive cycle — no S33-1/S34-1-class re-alignment
  item. All 8 prices re-verified to the cent WITH compare-at values
  and discount badges (199.99/279.99 −29% · 89.99/129.99 −31% ·
  119.99/159.99 −25% · 149.99/199.99 −25% · 79.99 · 54.99/69.99 −21%
  · 42.99 · 349.99/429.99 −19%); review counts match the seed's
  authored display counts exactly (412/234/203/367/142/187/156/298 —
  the reference renders them parenthesized next to the category);
  the 8 category tiles, the rotating hero ("New Arrivals" observed
  mid-rotation), the 4 trust badges, and the mobile-menu contract at
  390×844 verified on BOTH sides — the reference's hamburger (36×36
  at x338,y14) → push-down panel with 5 nav links (each 358×44
  stacked from y121) + the icon-only search BUTTON (40×28 at
  x16,y81); toggle-closes (verified by clicking the hamburger again
  — 5 links → 0); navigate-closes verified with a REAL Playwright
  click on the panel's Products link (URL → /products, panel
  unmounted, re-checked defensively); the clone's contract verified
  with 15/15 automated checks (7 links · Close-menu 44×44 @330,78 ·
  panel search box 209×40 @16,80 · unmount-on-navigate — the
  run-42 settle-wait + input[placeholder] methodology applied)
  plus the clone's full SEO surface re-verified live (sitemap 25
  URLs, robots disallow set, noindex 8/8 private surfaces, health
  ok/db-up, home h1 renders).
- **Repo-side audit (43-a, read-only):** 10/10 docs claims WIRED ·
  12/12 defect sweeps clean · 12/12 counts MATCH (incl. the audit's
  own dynamic 432/432 unit re-run, 22.37s, plus lint ✓ · typecheck ✓
  · typecheck:tests ✓ as extra permitted gates) · 8/8 carried
  deferrals standing · **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 5
  Informational**. The 5 Informational: the four standing brief-side
  citation glosses re-confirmed (the execution-log shape — the
  Session 41 log is 3-box all-checked because it carried the S41-2
  fix, the 2-box convention applies to pure verification-only
  cycles; the git-ls-files pathspec convention — the documented 127
  tracked src TS files is the true count, a bare `src/**/*.ts`
  pathspec drops zero-depth `src/proxy.ts` on this git build; the
  redirect anchor = 6 textual occurrences, 5 executable + 1 comment;
  the single legitimate console.error's home at
  `(storefront)/error.tsx:15`) plus one new observational note (the
  dynamic unit duration 22.37s vs the 19.97–21.63s prior-cycle
  range — sandbox load variance; 432/432 fully green; no action) —
  all disposed no-change. The audit also hunted fresh surfaces
  (redirects static/role-derived; 4 `router.push` sites same-origin
  incl. the server-minted order+token pair; all 15 `fetch()`
  same-origin; no client component importing db/prisma; timing-safe
  HMAC with length guard; health degraded-503; demo credentials
  server-side props only; zero Math.random/@ts-ignore/innerHTML
  writes; `target="_blank"` hardened) — all clean.
- **S42-2 (LOW, docs-tooling — found during the screenshot refresh,
  the S37-2 class):** the `21-mobile-menu-open` capture flipped bytes
  run-to-run — two back-to-back re-captures (same server, same DB,
  seconds apart) differ by the SAME band structure (the photographic
  hero region, the header's backdrop-blur band, the evenly-spaced
  category-tile photo bands — 12.6% of pixels) while the VLM confirms
  the CONTENT is identical and the mobile-menu geometry pins are
  EXACT. Root cause: the panel mount re-rasterizes the photographic
  content behind it, and screenshotting before the re-raster settles
  catches it mid-flight. Fix (the S35-2/S37-2 precedent shape):
  `scripts/capture-screenshots.ts`'s shot-21 flow now waits 700ms
  past the panel mount (the parity-script methodology). Verified
  deterministic: consecutive settled captures byte-identical (md5
  `5e59d090…`), a reduced-motion freeze reproduces the same bytes
  (the settled state IS the natural slide-1 rest state), a 3200ms
  stress capture reproduces it, and the final clean run landed on it.
- **S42-1 (docs sweep):** SKILL v1.38.0 → v1.39.0 (project_state
  sessions 2-42 + this entry), AGENTS plan range 2..41 → 2..42,
  CLAUDE tail, README/DEPLOYMENT drift checks, `.env.example`
  verified unchanged (all 5 env vars re-verified against their read
  sites by the audit, no undocumented vars), the 25 screenshots
  refreshed on a final single clean run captured AFTER the
  final-tree e2e AND after `restore-demo-stock` re-topped the demo
  stock (the S14-4 healthy state — the run-39/40/41/42 discipline),
  the plan's Session 42 section, `docs/session_76.md`, worklog Task
  43. No changes in src/tests/prisma — the 432/66 suites carry the
  no-regression evidence by their green runs on the pulled tree AND
  on the final tree (the twice-run evidence). Environmental note:
  the fresh-clone recovery pattern applied again (the sandbox reset
  — .env rewrite, npm install, db:setup, chromium-1248 re-pairing)
  with the per-command absolute-export DATABASE_URL convergence
  standing (the cycle's build ran clean with zero prisma:error
  lines; sitemap 25 URLs live-verified on the running server).

### Session 43 (run 44) — the thirteenth fully-empty remediation cycle, both surfaces clean for the ninth consecutive time (S43-1, S43-2)

> The run/plan numbering drift is documented in `docs/session_52.md`;
> this cycle executed the plan's "Session 43" section; the narrative is
> `docs/session_78.md` and the operator's raw log is `docs/session_77.md`.

- **Cycle shape:** the thirteenth consecutive verification-only cycle on
  the remediation surface. Gates green on the pulled tree AND the final
  tree (the twice-run evidence): lint · typecheck · typecheck:tests ·
  432/432 unit (19.99s pulled / final-tree re-run) · build (zero
  `prisma:error`) · 66/66 e2e (1.9m). Both audit surfaces clean for the
  ninth consecutive cycle: the live reference kept its catalog in the
  session-34-pinned Damascus-first order for the TENTH consecutive cycle
  (navigate-closes AND toggle-closes verified with REAL clicks; hero
  rotation observed; login verified), and the clone passed the
  consolidated 13/13 parity grid with the run-39/40/41/42 geometry
  reproducing EXACTLY.
- **Deep audit 44-a (read-only subagent):** 8/9 docs claims fully WIRED
  + 1 partial, 12/12 defect sweeps clean, 12/12 counts MATCH (incl. the
  audit's own dynamic 432/432 re-run at 20.16s plus lint/typecheck/
  typecheck:tests as extra permitted gates), 8/8 carried deferrals
  standing, fresh hunts all clean — **0 CRITICAL/HIGH/MEDIUM/LOW +
  1 NIT + 4 Informational.**
- **S43-1 (NIT, docs-only — the audit's one finding):** the SKILL
  frontmatter's `project_state` range phrase missed its session-42 bump —
  the S42-1 sweep claimed "(project_state sessions 2-42)" in three
  places (the plan, the Appendix B entry, the commit message) but the
  phrase itself still read "post-remediation sessions 2-41" at v1.39.0.
  Git history proves the lockstep convention (5511f1d→2-38, 6c7fc3d→2-39,
  5828a76→2-40, 732ea36→2-41, then the stall). Fixed this cycle by the
  catch-up: 2-41 → 2-43 (the missed intermediate value folds into the
  catch-up; documented in the plan's Session 43 dispositions).
- **S43-2 (docs sweep):** SKILL v1.39.0 → v1.40.0 (project_state
  sessions 2-43 via the S43-1 catch-up + this entry), AGENTS plan range
  2..42 → 2..43, CLAUDE tail, README/DEPLOYMENT drift checks,
  `.env.example` verified unchanged, the 25 screenshots refreshed on a
  final single clean run captured AFTER the final-tree e2e AND after
  `restore-demo-stock` re-topped the demo stock (the S14-4 healthy
  state — the run-39..43 discipline), the plan's Session 43 section,
  `docs/session_78.md`, worklog Task 44. No changes in
  src/tests/prisma — the 432/66 suites carry the no-regression evidence.
- **Environmental note (capture discipline, the session-43 refinement):**
  `pkill -f "standalone/server.js"` misses the forked
  `next-server (vNN)` child that owns the port — after a rebuild, a
  stale next-server serves HTML referencing wiped chunks (the
  auth-surface shots 500 on chunk loads → hydration timeouts while
  static pages still render; the nohup'd replacement dies silently on
  EADDRINUSE). After any rebuild: kill the port owner by PID
  (`ss -tlnp`), re-top the demo stock, verify the fresh server's PID
  start time, and spot-check its served chunk URLs exist on disk
  before capturing. Recorded in AGENTS.md's screenshot-discipline
  line; the re-run captured all 25 green on the first pass.
- **Audit Informational notes (disposed no-change, recorded for future
  briefs):** (1) the tool-result display pipeline strips the two-char
  sequence `[h` from displayed output — `a[href]` displays as `aref]`;
  byte-level `includes()` checks prove both suspect strings are intact
  in the source (store-chrome.tsx's focus-trap selector, mobile-nav's
  `[hidden]` comment) — future audits must verify bracket-bearing
  strings at byte level, never by eye; (2) the dynamic unit duration
  20.16s sits within the prior 19.77–22.37s range; (3) the standing
  git-ls-files convention — the 127 anchor = 53 `.ts` + 74 `.tsx`
  (`grep -cE '\.tsx?$'`); (4) the repo's git-tracked `worklog.md`
  carries Task 43 (the sandbox parent-worklog is the fresh-cycle stub
  — the documented reset pattern).

### Session 44 (run 45) — the fourteenth fully-empty remediation cycle, both surfaces clean for the tenth consecutive time (S44-1)

- **Pulled tree** `3ac0c63` (= `80ba386` + the operator's
  `docs/session_79.md` raw run-44 log; zero src/tests/prisma deltas).
  Fresh-clone recovery again: `.env` rewritten (the `file:../db/custom.db`
  contract + a strong random `AUTH_SECRET`), `npm install`, `db:setup`
  (16/8/3/3/13 + admin/demo users; the fresh-seed state verified —
  16 products / 0 orders / the seeded Damascus-first pinned order /
  Damascus reviewCount 412 / stock 24), chromium-1248 re-paired.
  Gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ ·
  432/432 unit (19.87s) · build (22/22 static, zero prisma:error) ·
  66/66 e2e (1.9m).
- **Reference alignment:** the ecommerce-store repo re-cloned at
  `1ffda3d` (same commit as runs 35–44); its skills/ folder re-verified
  IDENTICAL (0 diff lines, 2598 = 2598 files, skills-catalog md5
  `f69408bf…`, identical byte-size); homenest's sitemap/SEO remains
  the stricter superset. No adoption gaps.
- **Live-reference parity: NO FINDING** — the pinned order held for
  the ELEVENTH consecutive cycle (/products count "8 products found",
  all 8 prices + compare-at + badges + review counts exact; Featured
  6 + New Arrivals 8 card-for-card; the 8 category tiles, rotating
  hero, 4 trust badges; the mobile-menu contract at 390×844 verified
  on BOTH sides — toggle-closes AND navigate-closes with REAL clicks,
  the empty-toast-container overlay intercepting one first attempt
  dismissed by the clean-page reset; login verified with the
  operator's identity + order history).
- **Clone parity: 13/13 PASS** — the run-42 grid (settle-wait +
  panel-scoped-locator + `input[placeholder]` methodology) with zero
  parity gaps; the run-39/40/41/42/43 geometry reproducing EXACTLY
  (Close-menu 44×44 @330,78; panel search INPUT 209×40 @16,80;
  unmount-on-navigate; Featured = the featured-flag subset — the
  script-side expectation fixed to indices [0,1,2,3,5,7] of the
  pinned order, a parity-tooling refinement only).
- **Deep audit 45-a (read-only subagent):** 8/8 docs claims WIRED;
  12/12 defect sweeps clean; 12/12 counts MATCH (incl. the dynamic
  432/432 re-run, 20.96s, plus lint/typecheck/typecheck:tests as
  extra permitted gates); 8/8 deferrals standing; fresh hunts all
  clean; **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 4 Informational** — the
  second fully-NIT-free audit after session-42. The 4 Informational:
  the untracked run-45 parity scratch (workspace-side, moved out of
  the repo before the commit), the sandbox parent-worklog stub state,
  the dynamic unit duration 20.96s (within the prior range), and the
  tool-display `[h`-stripping artifact re-confirmed at byte level.
- **S44-1 (docs sweep):** SKILL v1.40.0 → v1.41.0 (project_state
  sessions 2-44 + this entry), AGENTS plan range 2..43 → 2..44 + the
  process-lifetime note on the screenshot-discipline line, CLAUDE
  session-44 tail, README/PAD/DEPLOYMENT drift-checked (all accurate
  — unchanged), `.env.example` verified unchanged, the 25 screenshots
  refreshed on a final single clean run captured AFTER the final-tree
  e2e AND after `restore-demo-stock` re-topped the demo stock, the
  plan's Session 44 section written, `docs/session_80.md`, worklog
  Task 45. No code changes.
- **Environmental note (recorded in AGENTS.md/the plan/here):** this
  sandbox generation kills ALL child processes when a tool-call shell
  exits — even `setsid` + `nohup` + `disown` does not keep the
  standalone server alive between separate tool invocations (the
  server binds, serves one call's requests, then dies; a later curl
  hits ECONNREFUSED). The discipline: run the standalone server AND
  every server-dependent check (parity scripts, capture runs) inside
  ONE bash invocation, killing the `next-server` child by pattern at
  the end of the same call. Zero repo-side impact.

### Session 45 (run 46) — the fifteenth fully-empty remediation cycle, both surfaces clean for the eleventh consecutive time (S45-1)

- **Pulled tree** `79396b4` (= `77c68ff` + the operator's
  `docs/session_81.md` raw run-45 log; zero src/tests/prisma deltas).
  This cycle the workspace SURVIVED (no sandbox reset — the recovery
  pattern unneeded): `.env` intact (the `file:../db/custom.db`
  contract + a strong random `AUTH_SECRET`), `node_modules`
  populated, `db/custom.db` carrying the documented run-45
  post-capture state (16 products / 10 orders / 12 users / Damascus
  reviewCount 414 / stock 24 / the seeded Damascus-first pinned
  order verified newest-first), chromium-1248 already paired. Gates
  on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ ·
  432/432 unit (20.35s) · build (22/22 static, zero prisma:error) ·
  66/66 e2e (1.9m).
- **Reference alignment:** the ecommerce-store repo re-verified at
  `1ffda3d` (git-fetch confirms still current — the same commit as
  runs 35–45); its skills/ folder re-verified IDENTICAL (0 diff
  lines, 2598 = 2598 files, skills-catalog md5 `f69408bf…`);
  homenest's sitemap/SEO remains the stricter superset. No adoption
  gaps.
- **Live-reference parity: NO FINDING** — the pinned order held for
  the TWELFTH consecutive cycle (/products count "8 products found",
  all 8 prices + compare-at + badges + review counts exact; Featured
  6 + New Arrivals 8 card-for-card; the 8 category tiles, rotating
  hero, trust badges; the mobile-menu contract at 390×844 verified
  on BOTH sides — toggle-closes AND navigate-closes with REAL
  clicks; login verified with the operator's identity + order
  history).
- **Clone parity: 14/14 PASS** — the run-42 grid (settle-wait +
  panel-scoped-locator + `input[placeholder]` methodology) with zero
  parity gaps; the run-39/40/41/42/43/45 geometry reproducing
  EXACTLY (Close-menu 44×44 @330,78; panel search INPUT 209×40
  @16,80; unmount-on-navigate). Parity-tooling refinement: the
  run-45 scratch's check 6 (the first-8 prices + compare-at
  byte-identical assertion) was computed-but-unasserted — run 46's
  grid wires it as a real 14th check (script-side, zero repo
  impact, the scratch moved out of the repo before the commit).
- **Deep audit 46-a (read-only subagent):** 8/8 docs claims WIRED;
  12/12 defect sweeps clean; 12/12 counts MATCH (incl. the dynamic
  432/432 re-run, 20.42s, plus lint/typecheck/typecheck:tests as
  extra permitted gates); 8/8 deferrals standing; fresh hunts all
  clean; **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 3 Informational** — the
  THIRD fully-NIT-free audit after session-42 and session-44. The 3
  Informational: the untracked run-46 parity scratch (workspace-side,
  moved out of the repo before the commit), the dynamic unit duration
  20.42s (within the prior range), and the tool-display `[h`-stripping
  artifact re-confirmed at byte level.
- **S45-1 (docs sweep):** SKILL v1.41.0 → v1.42.0 (project_state
  sessions 2-45 + this entry), AGENTS plan range 2..44 → 2..45,
  CLAUDE session-45 tail, README/PAD/DEPLOYMENT drift-checked (all
  accurate — unchanged), `.env.example` verified unchanged, the 25
  screenshots refreshed on a final single clean run captured AFTER
  the final-tree e2e AND after `restore-demo-stock` re-topped the
  demo stock, the plan's Session 45 section written,
  `docs/session_82.md`, worklog Task 46. No code changes.

### Session 46 (run 47) — the sixteenth fully-empty remediation cycle, both surfaces clean for the twelfth consecutive time (S46-1)

- **Pulled tree** `8d1da10` (= `40ae1d2` + the operator's
  `docs/session_83.md` raw run-46 log; zero src/tests/prisma deltas).
  This cycle the sandbox workspace was RESET — the documented
  fresh-clone recovery pattern applied in full: `git clone` (HTTPS),
  `.env` rewritten from `.env.example` + a strong random
  `AUTH_SECRET`, `npm install` green, `db:setup` re-seeded (16
  products / the fresh seed's Damascus-first pinned order
  newest-first with the authored review counts
  412/234/203/367/142/187/156/298 / stock 24), chromium-1248
  re-paired, paramiko 5.0.0 installed for the SSH-wrapper push.
  Gates on the pulled tree: lint ✓ · typecheck ✓ ·
  typecheck:tests ✓ · 432/432 unit (20.32s) · build (22/22 static,
  zero prisma:error — count-verified) · 66/66 e2e (1.9m).
- **Reference alignment:** the ecommerce-store repo re-verified at
  `1ffda3d` (git-fetch confirms still current — the same commit as
  runs 35–46); its skills/ folder re-verified IDENTICAL (0 diff
  lines, 2598 = 2598 files, skills-catalog md5 `f69408bf…`);
  homenest's sitemap/SEO remains the stricter superset. No adoption
  gaps.
- **Live-reference parity: NO FINDING** — the pinned order held for
  the THIRTEENTH consecutive cycle (/products count "8 products
  found", all 8 prices + compare-at + badges + review counts exact;
  Featured 6 + New Arrivals 8 card-for-card; the 8 category tiles,
  rotating hero, trust badges; the mobile-menu contract at 390×844
  verified on BOTH sides — toggle-closes AND navigate-closes with
  REAL clicks, the documented empty-toast-overlay first-click
  intercept dismissed by the clean-page reset; login verified with
  the operator's identity + order history).
- **Clone parity: 14/14 PASS** — the run-46 grid reproduced as the
  run-47 scratch with the clone-correct selector methodology
  (article-scoped h3 name extraction — text-based parsing grabs
  badge/category prefixes; `aria-labelledby` section targeting;
  `data-testid="mobile-menu"` panel scoping — a `[role='dialog']`
  alternative matches the cart drawer; settle-BEFORE-measure) with
  zero parity gaps; the run-39/40/41/42/43/45/46 geometry
  reproducing EXACTLY (Close-menu 44×44 @330,78; panel search INPUT
  209×40 @16,80; unmount-on-navigate). The scratch moved out of the
  repo before the commit (the documented scratch class).
- **Deep audit 47-a (read-only subagent):** 8/8 docs claims WIRED;
  12/12 defect sweeps clean; 12/12 counts MATCH (incl. the dynamic
  432/432 re-run, 22.39s, plus lint/typecheck/typecheck:tests as
  extra permitted gates); 8/8 deferrals standing; fresh hunts all
  clean; **0 CRITICAL/HIGH/MEDIUM/LOW/NIT + 3 Informational** — the
  FOURTH fully-NIT-free audit after session-42, session-44 and
  session-45. The 3 Informational: the untracked run-47 parity
  scratch (workspace-side, moved out of the repo before the
  commit), the dynamic unit duration 22.39s (0.02s above the prior
  19.77–22.37s range — sandbox load variance; the range widens to
  19.77–22.39s going forward), and the long RSC page templates
  (product detail ~292 lines, admin orders ~215 — the documented
  accepted shape, the logic seams in src/lib small and focused).
- **S46-1 (docs sweep):** SKILL v1.42.0 → v1.43.0 (project_state
  sessions 2-46 + this entry), AGENTS plan range 2..45 → 2..46,
  CLAUDE session-46 tail, README/PAD/DEPLOYMENT drift-checked (all
  accurate — unchanged), `.env.example` verified unchanged, the 25
  screenshots refreshed on a final single clean run captured AFTER
  the final-tree e2e AND after `restore-demo-stock` re-topped the
  demo stock, the plan's Session 46 section written,
  `docs/session_84.md`, worklog Task 47. No code changes.

### Session 47 (run 48) — the first findings-bearing cycle since session-34: the new audit surfaces (a11y tree + Lighthouse) found three genuine semantic-a11y gaps, all fixed TDD with zero visual delta

- **S47-1 (MEDIUM, TDD):** the (auth) layout carried zero `<main>`
  landmarks — the reference's login page HAS one (verified live:
  main=1, nav=0, headings=H1; its main IS the full-page flex
  container) and Lighthouse's `landmark-one-main` fails the clone's
  login. Red e2e pin first (auth.spec.ts: main count 1 on /login AND
  /register, the Sign in / Create account controls inside it), then
  the outermost wrapper div → `<main>` in
  `src/app/(auth)/layout.tsx` — zero visual delta (div → main
  renders identically), proven at raster level by the byte-identical
  05-login screenshot across the fix.
- **S47-2 (LOW, TDD):** the star-rating announcement
  (`aria-label="Rated 4.9 out of 5"`) sat on a role-less `<span>` —
  prohibited ARIA (Lighthouse `aria-prohibited-attr`, every card +
  PDP + home). The reference's ratings carry NO labels at all
  (screen-reader silence), so the clone's intent was better but
  illegal. Red unit pins first (star-rating.test.tsx ×3), then
  `role="img"` on the rating span — the canonical legal pattern; the
  label becomes the image's accessible name, the Stars stay
  aria-hidden decorations.
- **S47-3 (LOW, TDD):** the card media link's accessible name
  (product name only) omitted its VISIBLE badge text ("-29%",
  "Featured") — WCAG 2.5.3 Label in Name (Lighthouse
  `label-content-name-mismatch`). Red unit pins first
  (product-card.test.tsx ×3), then the label composes
  `${product.name}, ${visibleBadges}` folding the rendered badge
  strings verbatim; the name stays non-rendered (the 01-home /
  02-products screenshots byte-identical across the fix).
- **The classification discipline (the transferable method):** run
  Lighthouse against the REFERENCE too and cross-reference the
  failure sets — reference-home a11y 79 (button-name,
  color-contrast, heading-order, link-name), reference-products 86,
  reference-login 100. A failure BOTH sides share is a parity
  constraint (color-contrast: the reference's own home fails the
  same classes — "Shop Now" button, badges, category labels;
  heading-order h1→h3: both sides). A failure only the reference
  has is a clone-better axis (button-name/link-name; the carousel
  dots: the clone's 8px named + aria-current vs the reference's 6px
  unnamed). A failure only the clone has is a genuine gap (all three
  fixed above).
- **Post-fix evidence:** a11y tree audit 64/64 on the main
  landmark; Lighthouse a11y home 93 / products 95 / login 96 /
  product-detail 96 (from 89/91/94/93) with `landmark-one-main`,
  `aria-prohibited-attr` and `label-content-name-mismatch` ALL
  resolved; the clone parity grid 16/16 PASS (the run-39..47
  geometry reproducing EXACTLY); the live reference's pinned order
  holding (14th consecutive cycle pre-reset + 15th at the
  post-recovery compact re-verification); gates green twice — the
  pulled tree 432/432 · 66/66, the final tree 438/438 (the +6 unit
  pins; 23.97s, the range widening to 19.77–23.97s) · 67/67 e2e
  (the +1 pin; 2.0m).
- **Deep audit 48-a (read-only subagent): 8/9 PASS** — the fixes,
  tests, counts (its own dynamic 438/438 re-run + the static
  67 = 61 desktop + 6 mobile-navigation count), scratch cleanliness,
  env-doc match, doc structure, and security spot-checks all verified;
  its ONE finding — three current-state count anchors missed by the
  initial sweep (README's `test:e2e` comment, PAD §1.2's E2E row,
  PAD §8.2's header with the stale "60 desktop" split) — fixed
  immediately as a docs-only follow-up (66→67, 60→61).
- **S47-4 (docs sweep):** SKILL v1.43.0 → v1.44.0 (project_state
  sessions 2-47 + this entry + the 438/67 count anchors), AGENTS
  plan range 2..46 → 2..47, CLAUDE unit-bullet session-47 tail,
  README/PAD count anchors (432→438 · 66→67, plus the audit-found
  stragglers), `.env.example` re-verified (all 5 env vars — unchanged,
  no new env surface), the
  25 screenshots refreshed on a final single clean run captured
  AFTER the final-tree e2e AND after `restore-demo-stock` re-topped
  the demo stock (4 changed — the traffic-owned dynamics only: 03
  product-detail's e2e review rows, 12/17 admin's fresh-DB order
  dynamics, 15b's FREESHIP redemption digits; 04b `6ed62e85…` the
  ELEVENTH consecutive byte-identical pin, 11-checkout `b71a8e74…`,
  21-mobile-menu-open `5e59d090…`, and 05-login/01-home/02-products
  byte-identical — the raster-level zero-visual-delta proof for all
  three fixes), the plan's Session 47 section written,
  `docs/session_86.md`, worklog Task 48.

### Session 48 (run 49) — the seventeenth fully-empty cycle, the first fully-empty cycle on the expanded audit surface

- **Cycle class:** SEVENTEENTH fully-empty remediation cycle — zero
  changes in src/tests/prisma; the docs-only S48-1 sweep. The FIRST
  fully-empty cycle on the EXPANDED audit surface (the two session-47
  surfaces — the a11y tree audit + the reference-cross-referenced
  Lighthouse — re-ran and found nothing genuine).
- **Fresh-clone recovery #3 in five cycles** (the sandbox workspace
  reset between runs): clone at `3264aef` (= `248ae11` + the
  operator's session-log commit; zero src/tests/prisma deltas), `.env`
  rewritten + random AUTH_SECRET, npm install, `db:setup` re-seed,
  chromium-1248 re-paired, paramiko 5.0.0 installed. Gates green:
  lint · typecheck · typecheck:tests · **438/438 unit** (21.69s) ·
  build 22/22 static zero prisma:error · **67/67 e2e** (2.0m).
- **Both audit surfaces clean:** the a11y tree audit 8 pages × 8
  checks at 59/64 with mains=1 on ALL 8 pages (the S47-1 fix verified
  standing); the 5 non-passing checks all reference-matched VERIFIED
  LIVE this cycle — the reference's own login page renders navs=0 AND
  its register page navs=0 (the standalone split-screen auth design on
  both sides; the clone's register main=1 vs the reference's mains=0 is
  the clone-better axis), and the heading skips remain the documented
  session-47 parity constraints. Lighthouse a11y **93/95/96/96
  reproducing the session-47 post-fix baselines EXACTLY**; the login
  seo 63 is `is-crawlable` on the intentional noindex (the S8-9
  private-surface design); the perf scores 67/68/93/67 informational.
- **Live-reference parity: NO FINDING — the SIXTEENTH consecutive
  pinned cycle.** All 8 prices + compare-at + badges + review counts
  re-verified to the cent; home Featured 6 + New Arrivals 8
  card-for-card; the mobile-menu contract verified with REAL clicks
  (toggle-closes AND navigate-closes; the 5 panel links 358×44 from
  y121 exact). **A new parity-tooling false alarm resolved:** the
  first reference panel-scoped query returned ORD-* order links
  inside its "panel" — traced to the leftmost header icon button
  being the ACCOUNT button (it navigates to /account, where the
  orders live) and the panel selector catching the page wrapper; the
  reference's mobile panel is exactly the documented 5-link contract
  — no mobile-panel orders feature exists to mirror. Lesson: scope
  reference-side panel queries to the panel's own interactive set
  (the 358-wide links from y121), not to a container heuristic.
- **Clone parity grid 16/16 PASS** (the run-48 grid reproduced as the
  run-49 scratch, workspace-side; the run-39..48 geometry reproducing
  EXACTLY — Close-menu 44×44 @330,78, panel search 209×40 @16,80, 7
  guest links, unmount-on-navigate).
- **Deep audit 49-a (read-only subagent): 8/9 PASS** — the three
  session-47 fixes, the new test files, the count anchors, the
  `.env.example` ↔ process.env match, and the security spot-checks all
  verified; its dynamic 438/438 re-run at 22.50s inside the audit;
  the static 67 = 61 desktop + 6 mobile-navigation count verified.
  **Its one FAIL (LOW): the run's own a11y scratch residue at the
  repo root — disposed by the documented scratch-class move before
  the commit (the audit catching it pre-commit is the discipline
  working as designed).** 2 Informational disposed no-change (the
  CLAUDE.md citation gloss — its convention is enumerative bullets
  without numbers, nothing stale; the unit duration in range).
- **S48-1 (docs sweep):** SKILL v1.44.0 → v1.45.0 (project_state
  sessions 2-47 → 2-48 + this entry), AGENTS plan range 2..47 →
  2..48, CLAUDE.md session-48 tail, README/PAD/DEPLOYMENT
  drift-checked (all verified accurate — unchanged; the 438/67
  anchors stay accurate), `.env.example` re-verified by the audit
  (unchanged, git-tracked), the plan's Session 48 section,
  `docs/session_88.md`, worklog Task 49, the 25 screenshots
  refreshed on a final single clean run captured AFTER the final-tree
  e2e AND after `restore-demo-stock` re-topped the demo stock (8
  changed — the traffic-owned dynamics only: 01/02's Damascus
  review-count digits band 412→414 on the fresh seed, 03's e2e review
  rows, 12/14/17's fresh-DB order dynamics, 15b's FREESHIP
  redemption digits, 19's cart-badge band; 17 byte-identical incl.
  the deterministic pins 04b `6ed62e85…` the TWELFTH consecutive
  byte-identical cycle, 11-checkout `b71a8e74…`,
  21-mobile-menu-open `5e59d090…`, and 05-login/10-register — the
  raster-level proof the S47-1 fix stays visually inert).

### Session 49 (run 50) — the eighteenth fully-empty cycle, the second fully-empty cycle on the expanded audit surface, and the fifth fully-NIT-free deep audit

- **Cycle class:** EIGHTEENTH fully-empty remediation cycle — zero
  changes in src/tests/prisma; the docs-only S49-1 sweep. The SECOND
  fully-empty cycle on the EXPANDED audit surface (the two
  session-47 surfaces — the a11y tree audit + the
  reference-cross-referenced Lighthouse — re-ran and found nothing
  genuine), and the deep audit came back **10/10 PASS fully NIT-free
  (the FIFTH after session-42, -44, -45 and -46 — no scratch-residue
  FAIL this cycle)**.
- **Fresh-clone recovery #4** (the sandbox workspace reset between
  runs): clone at `dd50475` (= `c30ea08` + the operator's
  session_89.md raw-log commit; zero src/tests/prisma deltas,
  `git diff`-verified), `.env` rewritten + random AUTH_SECRET, npm
  install, `db:setup` re-seed (the authored review counts
  412/234/203/367/142/187/156/298 verified on the fresh seed),
  chromium-1248 re-paired, paramiko 5.0.0 installed. Gates green:
  lint · typecheck · typecheck:tests · **438/438 unit** (22.13s) ·
  build 22/22 static zero prisma:error · **67/67 e2e** (1.9m).
- **Both audit surfaces clean:** the a11y tree audit 8 pages × 8
  checks at **59/64** with mains=1 on ALL 8 pages (the S47-1 fix
  verified standing); the 5 non-passing checks all reference-matched
  (the heading skips on products/cart/track-order — the reference's
  own h1→h3 skips identical; the nav-landmark on login/register —
  the reference's own auth pages render navs=0, verified live in
  session-48). Lighthouse a11y **93/95/96/96 reproducing the
  session-47/48 post-fix baselines EXACTLY**; the login seo 63 is
  `is-crawlable` on the intentional noindex; the perf scores
  69/65/98/70 informational (sandbox-load variance vs 67/68/93/67).
- **Live-reference parity: NO FINDING — the SEVENTEENTH consecutive
  pinned cycle.** All 8 prices + compare-at + badges + review counts
  re-verified to the cent; home Featured 6 + New Arrivals 8
  card-for-card; the rotating hero observed mid-rotation (Elevate
  Your Kitchen → the New Arrivals slide — matching the clone's
  seeded 3-slide set); the mobile-menu contract verified with REAL
  clicks (toggle-closes AND navigate-closes; the 5 panel links
  358×44 from y121 exact; the 3 icon buttons 36×36 at
  x250/x294/x338, y14).
- **Clone parity grid 16/16 PASS** (the run-49 grid reproduced as
  the run-50 scratch; the run-39..49 geometry reproducing EXACTLY —
  Close-menu 44×44 @330,78, panel search 209×40 @16,80, 7 guest
  links, unmount-on-navigate). **Two tooling lessons recorded:**
  (1) a bare `textContent` price regex over `querySelectorAll('*')`
  double-matches a no-compare-at card's price-row CONTAINER as a
  second price (`$79.99/$79.99`) — extract prices with a LEAF-NODE
  walk (elements with zero children); the DOM itself was proven
  correct by diagnostic. (2) product-detail URLs are cuid-based
  (`/product/<cuid>` — the card links and the sitemap both use
  `product.id`); probing by SLUG hits the 404 page, whose own
  heading structure (h1 "Page Not Found" → the footer's h3 brand)
  false-alarmmed a heading skip in the a11y scratch's first pass.
- **Deep audit 50-a (read-only subagent): 10/10 PASS — zero findings
  at every severity.** Tree identity, the three session-47 fixes in
  source, the newest test files (typed, cleanup'd, mocked at the
  right boundaries), the static 67 = 61 + 6 across 14 specs with
  zero test.only/skip/fixme/todo, the count anchors, the
  `.env.example` ↔ process.env match (all 5 vars), the security
  spot-checks, the auth e2e pin, the scratch-residue check (clean
  porcelain), and package.json deps — all verified; the dynamic
  **438/438 re-run at 21.95s** inside the audit. 3 Informational
  disposed no-change (the gitignored `server.log` e2e-webServer
  leftover; a proactive flag on the `db.ts` `as unknown as`
  Prisma-singleton cast for future grep-based audits; the duration
  in range).
- **S49-1 (docs sweep):** SKILL v1.45.0 → v1.46.0 (project_state
  sessions 2-48 → 2-49 + this entry), AGENTS plan range 2..48 →
  2..49, CLAUDE.md session-49 tail, README/PAD/DEPLOYMENT
  drift-checked (all verified accurate — unchanged; the 438/67
  anchors stay accurate), `.env.example` re-verified by the audit
  (unchanged, git-tracked), the plan's Session 49 section,
  `docs/session_90.md`, worklog Task 50, the 25 screenshots
  refreshed on a final single clean run captured AFTER the
  final-tree e2e AND after `restore-demo-stock` re-topped the demo
  stock (4 changed — the traffic-owned dynamics only: 03's e2e
  review rows with this run's Date.now() titles, 12/17's fresh-DB
  order/date/revenue dynamics, 15b's FREESHIP redemption digits —
  the run-44 4-changed class; 21 byte-identical incl. the
  deterministic pins 04b `6ed62e85…` the THIRTEENTH consecutive
  byte-identical cycle, 11-checkout `b71a8e74…`,
  21-mobile-menu-open `5e59d090…`, 05-login/10-register, AND
  01-home/02-products/14-admin-orders/19-account — the fresh-DB
  traffic folded to the committed raster state this cycle).

### Session 50 (run 51) — 2026-10-18 — the nineteenth near-fully-empty cycle, the third on the expanded surface, and the S50-1 chart-settle capture fix

**State:** deep audit 51-a on the fresh-clone recovery tree at `36f1128`
(sandbox reset #5): **9/9 PASS fully NIT-free** (the sixth) with the
dynamic 438/438 re-run at 22.80s inside the audit; both expanded audit
surfaces re-ran with ZERO genuine findings (a11y tree 59/64 — the
documented baseline reproducing exactly, mains=1 on all 8 pages, the 5
non-passing checks reference-matched; Lighthouse a11y 93/95/96/96 —
the post-fix baselines reproducing exactly); the live reference kept
the session-34-pinned Damascus-first order for the eighteenth
consecutive cycle (all 8 prices + compare-at + badges + review counts
to the cent, Featured 6 + New Arrivals 8 card-for-card, hero rotation
observed, the mobile-menu contract verified with real clicks —
toggle-closes AND navigate-closes); the clone parity grid 16/16 with
the run-39..50 geometry reproducing exactly. Gates green on the pulled
tree AND the final tree (438/438 at 21.94s/22.09s · 67/67 e2e at
1.9m/2.0m · build 22/22 with zero prisma:error).

**S50-1 (LOW, docs-tooling — the S37-2/S42-2 animation-frame class on
a new surface):** the two chart-bearing screenshots
(12-admin-dashboard, 17-admin-analytics) were run-to-run
byte-non-deterministic against an UNCHANGED database — three distinct
12-md5s across two consecutive capture runs (`d65af93b` committed ·
`571775dc` · `6c6963b1`) and 17 flipping between runs, with the DB
verified unchanged before and after. Root cause: both pages render
recharts charts (RevenueChart's AreaChart; the analytics Bar/Pie
charts) whose ~1500ms mount animations run on local timers —
`waitForLoadState("networkidle")` fires while the animation is still
drawing, so the screenshot catches a variable animation frame. Fix:
the capture script waits 2000ms past networkidle for the two
chart-bearing shots; verified deterministic by 25/25 byte-identical
shots across consecutive capture runs, with the settled 12/17 rasters
(`99dc1d33`/`e45615d6`) reproducing again on the final clean run
after a DB wipe + reseed + e2e cycle — four capture runs, one raster
state.

**Lessons recorded:**
1. **Chart-bearing screenshot captures must outlast chart animations.**
   `networkidle` says nothing about client-side animation timers —
   recharts' default mount animation is ~1500ms AFTER hydration. Any
   capture of a chart-bearing page needs a settle wait sized past the
   animation (or an `isAnimationActive={false}` prop, which was NOT
   chosen here to avoid a src-side change in a docs-tooling fix).
2. **±1-LSB text-AA raster noise exists and is disposable.** A
   transient 05-login variant (45 pixels, every delta a plus-or-minus
   1 RGB-unit shift in text anti-aliasing, no layout/content change)
   appeared exactly once in the first capture of a fresh sandbox
   generation and never reproduced in 9 subsequent attempts (6/6 in a
   dedicated bistability probe + run B + the final clean run all
   reproduce the committed raster exactly). Classification recipe:
   pixel-diff the variant vs the committed raster; if every delta is
   ±1 LSB inside glyph AA bands with zero structural movement, it is
   environmental raster noise — verify reproducibility of the
   committed state, then dispose no-change.
3. **The seed's traffic-ownership (S7-3) applies to capture planning.**
   `db:setup` re-runs NEVER reset stock/reviewCount/order history —
   to reproduce the documented "fresh seed + one e2e run" raster
   class, the git-ignored `db/custom.db` must be deleted first (the
   fresh-clone recovery state), then db:setup, then the e2e run, then
   restore-demo-stock, then the capture.

### Session 51 (run 52) — 2026-10-18 — the twentieth near-fully-empty cycle, the fourth on the expanded surface, and the S51-1 seeded-coupon order determinism fix

**What happened:** the twentieth audit cycle ran the full protocol on
the surviving workspace (no sandbox reset): the pulled tree
(`4d8b096` = run-51's `e90352c` + the operator's session_93.md
raw-log commit) reproduced the documented state exactly — gates
438/438 · 67/67 · build 22/22 zero prisma:error; the reference
repo re-verified at `1ffda3d` with skills parity; the live reference
kept its session-34-pinned Damascus-first order for the NINETEENTH
consecutive cycle (all 8 prices + compare-at + badges + review
counts to the cent, Featured 6 + New Arrivals 8 card-for-card, hero
rotation observed, the mobile-menu contract verified with REAL
clicks); the clone parity grid 16/16; the a11y tree audit 59/64
baseline exact; Lighthouse a11y 93/95/96/96 baselines exact; deep
audit 52-a 10/10 PASS fully NIT-free (the seventh). ONE genuine
repo-side finding — **S51-1**: run 52's screenshot refresh flipped
the 15b-admin-coupons raster (11,876 pixels) against the documented
final-capture DB state. A VLM read of both crops isolated the delta:
the SAVE20 and FREESHIP cards had swapped grid positions — every
card's content identical. Root cause: the seed's coupon loop created
its three rows within ~1ms (SAVE20 .091Z and FREESHIP .091Z — a
genuine tie), and /admin/coupons lists coupons
`orderBy: { createdAt: "desc" }` on SQLite's millisecond-precision
DateTime strings — a same-ms tie has no deterministic tie-break, so
the card order flipped run-to-run with the insert loop's clock
ticks. The products have been immune since session-12
(productSeedCreatedAt's 60-second spacing); the coupons never got
the twin. **Fix (TDD, 6/6 RED → GREEN):** the new pure
`couponSeedCreatedAt(index, now)` helper in src/lib/seed-policy.ts
(first-listed newest, successors backdated 60s apart — no tie
possible), the COUPONS array reordered into the admin DISPLAY order
(FREESHIP → SAVE20 → WELCOME10, the order the page has shipped since
session-19) and now exported (the PRODUCTS precedent), and the
upsert's create branch carries the deterministic createdAt while
update stays `{}` — existing databases untouched (the S4-8/S7-3
create-only policy; admin-created coupons still sort newest via
their real now()). Pinned by tests/unit/session51-hardening.test.ts
(the helper contract + the array order + the three lifecycle
shapes). Verified end-to-end: fresh wipe → seed → the DB's desc
order reads FREESHIP/SAVE20/WELCOME10 with distinct 60s-spaced
timestamps; the full capture sequence then reproduced 24/25
byte-identical screenshots — 15b back at the committed FREESHIP-first
raster EXACTLY, the sole changed shot being 03-product-detail (the
documented Date.now() e2e-review-row class). Final-tree gates:
444/444 unit (49 files, 22.42s) · 67/67 e2e · build 22/22 zero
prisma:error. The adjacent-seed-surface audit found no other
unpinned createdAt-desc consumer (products 60s-spaced, slides sort by
an explicit sortOrder column, settings keyed, categories with no
createdAt-desc consumer).

**Lessons recorded:**
1. **Every `orderBy: <timestamp>` consumer needs tie-proof seed
   data.** SQLite DateTime strings carry millisecond precision — any
   seed loop that inserts multiple rows consumed by a
   timestamp-ordered query MUST space those rows' timestamps beyond
   the precision (the productSeedCreatedAt/couponSeedCreatedAt 60s
   spacing), or the display order is a coin flip on insert timing.
   Audit for the class whenever a page sorts by createdAt/updatedAt.
2. **A content-level screenshot diff in a "stable" raster is a
   finding, not noise.** The ±1-LSB raster-noise class (run 51's
   05-login) shows tiny scattered glyph-AA shifts with zero
   structural movement; a REAL order/content change shows
   thousands of pixels in structured bands (row-aligned regions).
   Pixel-count + band-shape classification separates the classes in
   one look; a VLM crop read confirms the semantic delta in one
   step.
3. **The seed's export surface is the test surface.** Exporting
   COUPONS (the PRODUCTS precedent) is what makes the array order
   pinnable in Vitest — the seed's execution guard means Playwright
   can never import it (the S15-2 lesson), so the unit suite is the
   only place the authored order can regress-guard.

### Session 52 (run 53) — 2026-10-18 — the twenty-first cycle, the fifth fully-empty on the expanded audit surface

The first cycle with NOTHING to fix at any severity since the S51-1
coupon fix: deep audit 53-a 10/10 PASS fully NIT-free (the EIGHTH);
both expanded surfaces clean (the a11y tree mains=1 on ALL 8 pages;
Lighthouse a11y 93/95/96/96 reproducing the post-fix baselines
EXACTLY); the live reference pinned for the TWENTIETH consecutive
cycle; the clone parity grid 16/16; all gates green on the
fresh-clone recovery tree (444/444 · 67/67 · build 22/22 zero
prisma:error); 25/25 screenshots green with 24 byte-identical (the
sole delta the documented traffic-owned 03 review-row band).
**Lesson (audit-tooling): declare the heading-walk scope before
counting heading skips.** The run-53 a11y scratch walked FULL-DOM
heading sequences (footer included), flagging a wishlist-page h1→h3
skip the documented 59/64 baseline never carried — the page body is
h1-only and the FOOTER's h3 logo follows it, so any h1-only page
(cart/wishlist/track-order) "skips" under a full-DOM walk. A
main-scoped walk reproduces the documented baseline exactly (only
the in-main products h1→h3 skip plus the auth nav-landmark pair
remain). The reference cross-check settles the class: its own cart
has NO h1 (h2 → h4 footer, a worse skip), its track-order is h1 →
h4 (worse), and its /wishlist 404s entirely (the clone's wishlist
is de-facto superset surface with nothing to match). Record the
walk scope with every skip count, and prefer main-scoped walks for
page-content verdicts — the footer's own heading scale is a
site-wide structural choice, not a per-page defect.
**Lesson (parity-tooling): pin the review-count check to DB truth,
not the seed baseline.** A hardcoded "412" review-count pin fails
on any DB that has served the e2e suite (the seed 412 + one e2e
review = 413 — the documented traffic-owned class) — read the
expected values from the DB in the same script run and assert
displayed == DB-truth, noting the seed baseline separately. Same
class as the run-49 leaf-node price-walk refinement: the grid
exists to catch clone-vs-reference gaps, not to re-flag documented
traffic.

### Session 53 (run 54) — 2026-10-19 — the twenty-second cycle: the S53-1 lazy-image capture-gate fix + the first reference-unavailable cycle (environmental)

One repo-side fix — in the capture tooling, not the app: the first
screenshot pass of the run produced a `02-products.png` 660,937
pixels (21.1%) off the committed raster — two 290px content bands
(grid rows 2-3) that pure-Node pixel-diff classified CONTENT-level
and VLM reads isolated to **blank product photos with every
text/price/badge element identical**. All 25 images existed on disk;
the DB refs were unchanged; the parity grid had just verified the
live rendering. Root cause: the 02 shot gated only on
`data-hydrated` — the fullPage raster can expand past every
`loading="lazy"` card at once and outrun the below-fold decodes
(rows 1+4 won the race; rows 2-3 lost it — the probabilistic
signature of the S35-2/S37-2/S42-2/S50-1 capture-gate family, now
on the lazy-image surface). Fix: `waitForImages(page)` in
`scripts/capture-screenshots.ts` — promote every `<img>` to
`loading="eager"` (per spec, flipping a not-yet-loaded lazy image
to eager STARTS its load) and gate on `document.images` complete
with `naturalWidth > 0` (15s timeout — a genuinely broken image
fails the capture loudly), +120ms decode settle — applied inside
`shoot()` for `mode === "full"` (ONE insertion point covering every
structurally-exposed full-page shot; viewport shots load eagerly).
Verified RED → GREEN: the re-capture ran 25/25 green with 02 back at
ZERO changed pixels and the sole delta the documented traffic-owned
03 review-row band (664 pixels, y1168-1178).
**Lesson (capture-tooling): gate full-page rasters on image decode,
not on hydration or networkidle.** `networkidle` fires BEFORE the
screenshot expands the viewport — lazy below-fold images only START
loading at fullPage-capture time, so any pre-screenshot network
wait is structurally blind to them. The eager-promotion trick
(`img.loading = "eager"`) deterministically starts every pending
lazy load without scrolling (no layout perturbation, no sticky-
element raster risk), and the `complete && naturalWidth > 0` gate
fails loudly on genuinely broken images instead of shipping a blank
raster. Any future full-page shot with images inherits the gate for
free via `shoot()`.
**Lesson (environmental): the live reference can go AWAY — record
availability separately from parity.** Run 54 is the first cycle in
21+ where `nest-culinary-hub.base44.app` was UNAVAILABLE (HTTP 503
+ the Base44 "publish the app in Builder" shell on every path,
stable across ~3 minutes of browser+curl retries — unpublished, not
a transient outage). The protocol held: the documented pins (which
the seed embodies, DB-verified every cycle) carried every
expectation, and the run-53 live verification (same day) remained
the standing baseline. Record the availability state in the session
narrative + plan disposition — do NOT treat a down reference as a
parity regression or block the cycle on it.

### Session 54 (run 55) — 2026-10-19 — the twenty-third cycle: the second reference-unavailable cycle + the UTC-day-drift screenshot class; zero repo-side findings

Zero repo-side findings at any severity, zero changes in
src/tests/prisma — the second consecutive zero-finding cycle on the
app surface, and both expanded audit surfaces clean for the seventh
consecutive cycle. The live reference stayed UNAVAILABLE (HTTP 503,
the same Base44 unpublished shell as run 54 — the second consecutive
cycle; the run-53 same-day live verification remains the standing
baseline and the seed-embodied pins, DB-verified on the fresh seed,
carried every expectation). The operator's 35866d1 refresh of the
skills/ folder (9 new files: replicate-web-app v3-v5.1,
full-page-screenshot, README, reference-run) was identified and
dispositioned: the homenest skills/ is now an operator-curated
superset (2607 = the reference's 2598 + 9; the shared catalog md5
IDENTICAL), excluded from every gate, referenced by zero app code.
**Lesson (screenshot classification): date-band diffs are the
UTC-day-drift class — classify by VLM-reading the band text, not by
pixel count.** Run 54's capture ran 2026-10-18 UTC while run 55's
ran 2026-10-19 UTC, and the 3 changed shots (03-product-detail
review-row dates, 14-admin-orders five order-row date cells,
12-admin-dashboard revenue-chart date-axis labels) were ALL the same
semantic: every date-rendering surface legitimately rendered "Oct
19" where the committed raster read "Oct 18" — the rasters
faithfully display this run's DB truth (the review rows, the order
rows, and the chart's sliding 14-day window are all
Date.now()-owned by design; the deterministic pins — 04b, 11, 21,
05, 10, 15b, 02 — all stayed byte-identical). Byte-identity on
date-bearing shots across cycles requires a same-UTC-day capture,
which is inherently uncontrollable: the recipe is pixel-diff band/x
localization → VLM read of the band text → classify by semantics
(the "Oct 18 → Oct 19" read settles it in one step). A diff-scale
jump on date-bearing shots is EXPECTED when the UTC day boundary is
crossed between the committed raster and the new capture — it is
not a regression and must not trigger a code or tooling change.

### Session 55 (run 56) — 2026-10-19 — the twenty-fourth cycle: the third reference-unavailable cycle + the same-UTC-day capture confirming the drift model; zero repo-side findings

Zero repo-side findings at any severity, zero changes in
src/tests/prisma — the third consecutive zero-finding cycle on the
app surface, and both expanded audit surfaces clean for the EIGHTH
consecutive cycle (a11y mains=1 on all 8 pages, both walk scopes
reproducing the documented reference-matched classes exactly;
Lighthouse a11y 93/95/96/96 reproducing the post-fix baselines
EXACTLY; deep audit 56-a 10/10 fully NIT-free — the eleventh). The
live reference stayed UNAVAILABLE for the THIRD consecutive cycle
(HTTP 503, the same Base44 unpublished shell, stable across
immediate + delayed ~45s retries — environmental; the run-53 live
verification remains the standing baseline and the seed-embodied
pins, DB-verified on the fresh seed at both the S51-1 coupon order
and the Damascus-first catalog order with all 8 pinned
prices/review-counts, carried every expectation). The clone parity
grid ran at 20/20 (12 static + 8 mobile checks, three script-side
methodology corrections en route: the /products card h3s wrap their
names in anchors so the extraction must strip nested tags, page-1
pagination renders 12 of the 16 "found" cards, and home section
scoping must match the section HEADING not any body text — zero
repo impact). **This cycle's capture ran on the SAME UTC day
(2026-10-19) as the committed run-55 rasters, and the result
confirms the session-54 UTC-day-drift model exactly: the three
run-55-changed date-bearing shots (12-admin-dashboard,
14-admin-orders, and 03's date band) all returned to byte-identity
— 24/25 byte-identical, 04b at its NINETEENTH consecutive
byte-identical cycle, 02-products at the S53-1 byte-identity for
the third consecutive cycle. The sole changed shot 03-product-detail
(662 pixels, the single 11-row band at y1168-1178, x227-309) was
VLM-read down to the semantic cell: the band renders the e2e
review-row's REVIEW ID — "Review 1792389757207" committed vs
"Review 179245013799" this run — the timestamp-derived identifier
of THIS run's own e2e-created review, the documented
traffic-owned class at its finest granularity (the ID embeds
Date.now()). Lesson: the review-ID band is the irreducible
run-to-run delta on 03 — even a same-UTC-day capture cannot make
it byte-identical because each run's e2e mints a fresh review row;
classify any 11-row band at y~1168 on 03 as this class first and
confirm with a VLM read of the ID text.**

### Session 56 (run 57) — 2026-10-20 — the twenty-fifth cycle: the fourth reference-unavailable cycle + the S56-1 docs-correction discovery; the UTC-day-drift model firing on schedule

ONE Low docs-only finding this cycle (the first repo-side finding in four
cycles) — S56-1: the run-56 docs sweep CLAIMED the SKILL project_state
opening-range bump "sessions 2-54 → 2-55" in the plan Session 55 section,
the repo worklog Task 56, AND commit bddf5f2's message, but the edit never
landed in the file (grep: zero occurrences of "sessions 2-55"; the opening
still read "sessions 2-54" while the line's own tail narrated session-55).
Lesson 1: a docs-sweep claim is not a docs-sweep landing — after any sweep
that claims a textual bump, grep the file for the new literal before
committing (the deep-audit's docs-claims point now does exactly this).
Lesson 2: claim-vs-file mismatches compound silently — e912024's identical
claim (2-53 → 2-54) DID land, so the pattern break at bddf5f2 was invisible
until an agent re-read the opening range verbatim. The fix: one edit bumping
the stale opening directly to 2-56 (covering both the missed 2-55 and this
cycle), recorded here and in the plan. Everything else reproduced the
documented state: the live reference UNAVAILABLE for the FOURTH consecutive
cycle (HTTP 503, environmental); the clone grid 20/20; both expanded
surfaces clean for the ninth consecutive cycle (a11y mains=1 all 8 pages,
Lighthouse a11y 93/95/96/96 exact); deep audit 57-a 10/10 with the S56-1
Low + 3 Informational; 25/25 capture green on the first pass with 22/25
byte-identical — the capture crossed the UTC day boundary (2026-10-19 →
2026-10-20 UTC), so the UTC-day-drift class fired exactly on schedule: the
3 changed shots (03/12/14) all VLM-classified to "Oct 19, 2026" →
"Oct 20, 2026" date cells, and the 03 review-ID band (1792450137997 →
1792454423798) at its irreducible class. Forensics note: a small-crop VLM
read misread the 14-admin-orders email as "guest12@example.com" — the
DB-verified truth is the hardcoded guest2@example.com in both rasters; a
3x-upscaled wide-crop re-read restored the correct transcription.
Lesson 3: for tiny table-cell text, upscale crops before the VLM read and
cross-check against the DB — a single small-crop read is not evidence.**

### Session 57 (run 58) — 2026-10-20 — the twenty-sixth cycle: the fifth reference-unavailable cycle + the fresh-clone recovery after sandbox reset #10; zero repo-side findings

ZERO repo-side findings this cycle (the second consecutive zero-finding
cycle after the S56-1 correction). The sandbox reset for the tenth time —
the documented fresh-clone recovery pattern: git clone to abad563 (= the
pushed run-57 output + the operator's raw-log commit adding
docs/session_105.md ONLY), environment rebuilt (.env + fresh AUTH_SECRET,
db:setup with all seed pins DB-verified, chromium-1248, paramiko 5.1.0),
gates green (444/444 unit at 21.45s · build 22/22 zero prisma:error ·
67/67 e2e at 2.0m on the fresh DB, the run doubling as the documented
traffic generator). The live reference UNAVAILABLE for the FIFTH
consecutive cycle (HTTP 503, environmental). The clone grid 20/20; both
expanded surfaces clean for the tenth consecutive cycle; deep audit 58-a
10/10 (1 NIT + 1 Informational, both disposed no-change).

**Three script-side methodology lessons (zero repo impact), recorded for
the next fresh-scratch rebuild:**

Lesson 1 — a FAIL whose detail string looks correct is a script bug until
proven otherwise: the mobile first-8 check printed all 8 matching product
names yet reported FAIL, because the pin array in the mobile script was
plain strings while the check called `PINNED[i].name` (undefined —
`includes(undefined)` is false). Extraction code must match its own data
shapes; a detail line that renders correctly does not validate the
assertion path.

Lesson 2 — y-axis pixel pins are chromium-build-dependent: this
chromium generation renders the header at 65px where run-39's rendered
66px, shifting the mobile panel's Close-menu/search-input y positions by
1-3px while x/width/height hold EXACTLY (330/44/44 and 16/209/40). Pin
x/size exactly, carry a small y tolerance, and let the pinned e2e
contract (which asserts behavior, not pixels) carry the real weight.

Lesson 3 — audit URLs must match the route contract: the product-detail
route is /product/[id] with a cuid (a slug URL 404s), and the not-found
page itself renders main + h1 — so a naive mains=1 check PASSES on the
wrong page. Derive audit URLs from the route contract (or the sitemap),
never from human-readable slugs, and spot-check the rendered h1 text.

Also recorded: the Lighthouse login-seo drift 63 → 66 — the only failing
audit is still the intentional is-crawlable noindex (verified by
failing-audit inspection); the drift is score-weighting variance across
lighthouse builds (the fresh --no-save install pulled a newer build than
previous runs). Informational, no repo action. And the capture-class
insight: a same-UTC-day capture on both sides still shows the three
run-specific deltas (the cross-midnight order dates, the seed-date
cells, the review-ID band) — only smaller (1009/155/516 px vs run 57's
933/9513/15927); run 57's e2e had crossed UTC midnight, so its
ORD-2026-001 rendered "Oct 19, 2026" where this run's (DB-verified Oct
20 02:51:46 UTC) renders "Oct 20, 2026" — the rasters faithfully
display each run's DB truth.

### Session 58 (run 59) — 2026-10-20 — the twenty-seventh cycle: the sixth reference-unavailable cycle + the fresh-clone recovery after sandbox reset #11; zero actionable findings, the README enumeration corrected

ZERO findings at Critical/High/Medium/Low this cycle (the third
consecutive). The sandbox reset for the eleventh time — the documented
fresh-clone recovery pattern: git clone to d7299da (= the pushed run-58
output + the operator's raw-log commit adding docs/session_107.md ONLY),
environment rebuilt (.env + fresh AUTH_SECRET, db:setup with all seed
pins DB-verified, chromium-1248, paramiko 5.1.0), gates green (444/444
unit at 21.52s · build 22/22 zero prisma:error · 67/67 e2e at 2.0m on
the fresh DB, the run doubling as the documented traffic generator). The
live reference UNAVAILABLE for the SIXTH consecutive cycle (HTTP 503,
environmental). The clone grid 24/24; both expanded surfaces clean for
the eleventh consecutive cycle; deep audit 59-a 9/10 (1 NIT + 2 docs
notes — the README:122 enumeration corrected as S58-1, the rest
no-change).

**Four script-side methodology lessons (zero repo impact), recorded for
the next fresh-scratch rebuild:**

Lesson 1 — the health endpoint carries TWO fields: `status` ("ok") and
`db` ("up"). A health check that reads `health.ok` silently fails while
the server is perfectly healthy — read the actual response shape before
asserting on it (run 58's lesson said "the field is db"; the full truth
is status+db, one per assertion).

Lesson 2 — the mobile panel's locators MUST be scoped to the panel
container (`div[data-testid='mobile-menu']`): the header hamburger
toggles its OWN aria-label to "Close menu" when the panel is open (so an
unscoped `button[aria-label='Close menu']` resolves to the 40×40 header
button, not the 44×44 panel close button), and the header's desktop
search input shares the panel input's aria-label (hidden on mobile, so
boundingBox() returns null). Shared aria-labels require container
scoping.

Lesson 3 — fractional utility widths render sub-pixel in some chromium
builds: the panel search input's `w-2/3 max-w-xs` computes to 209.33px
in this generation (the pin is 209). Pixel pins on layout-derived widths
carry the same build-dependent class as the y-axis pins — ±1px on
fractional widths, ±3px on y, EXACT on integers (x=16, height=40, the
close button 44×44).

Lesson 4 — lighthouse on the manual-chromium debug port must run
per-page in SEPARATE invocations: the batched single-invocation loop
exited 1 for every page after the first (browser/tab contention on the
shared debug port), while sequential runs all passed. Batch convenience
loses to sequential reliability on shared-browser tooling.

Also recorded: the a11y imgsNoAlt check must count only imgs MISSING
the alt attribute entirely — the hero-carousel backgrounds and
product-gallery thumbnails carry the intentional decorative `alt=""`
pattern (their slide text renders as visible overlay), which is CORRECT
a11y; counting empty alt as a violation produced false FAILs on
home/product-detail while the raw server HTML had zero genuinely-missing
alt attributes. And the capture-class observation: a same-UTC-day AND
same-clock-window capture (both runs' e2e placing ORD-2026-001 on Oct 20
UTC, both seeds stamping template reviews Oct 20 UTC) returns
12-admin-dashboard and 14-admin-orders to byte-identity — 24/25
byte-identical, the highest since run 55, with the irreducible 03
review-ID band (1792464746805 → 1792484456078, 553 px in the documented
y1168-1178 band, DB-verified) as the sole delta.

### Session 59 (run 60) — 2026-10-21 — the twenty-eighth cycle: the SEVENTH consecutive reference-unavailable cycle (environmental) + the fresh-clone recovery after sandbox reset #12; zero actionable repo-side findings

The fresh-clone recovery tree (9761468 = 3a2bb20 + the operator's
session_109.md raw-log commit only, 1 file / 83 insertions, zero
src/tests/prisma deltas) rebuilt the environment and ran the full protocol
twice-clean: gates green (lint · typecheck · typecheck:tests · 444/444
unit at 22.30s · build 22/22 static zero prisma:error · 67/67 e2e at
1.9m, the run doubling as the documented traffic generator — 5 orders /
17 reviews / Damascus 413 / FREESHIP 1 / latest ORD-2026-005, all
DB-verified before restore-demo-stock re-topped Damascus 21→24 + French
Rolling Pin 43→44). Deep audit 60-a (read-only subagent): **10/10 PASS —
0 Critical/High/Medium/Low + the standing `as unknown as` ×4 NIT
disposed no-change** — the FIFTEENTH consecutive clean audit. The clone
parity grid **53/53 discrete checks PASS** (42 static + 11 mobile) with
two script-side methodology corrections (zero repo impact): the
products-grid card root is an `<article>` (`main .grid > article` — a
`> div` child selector resolves zero cards), and the Damascus review pin
on the POST-e2e DB is 413 (412 seed + 1 e2e-minted) — the parity grid
runs against the traffic-bearing DB, so the pin must be the post-e2e
value. The a11y tree audit: **50/50 CLEAN on all 8 pages** with one
script-side correction — `type="hidden"` Server Action internals
($ACTION_REF_/$ACTION_KEY) are not form inputs and never need labels;
excluding them from the inputsNoLabel check removes a false-FAIL class
the documented baseline never counted. Lighthouse a11y
**93/95/96/96 EXACT** (home/products/login/product-detail, sequential
per-page manual-chromium runs; login seo 63 = the intentional
is-crawlable noindex + the standing color-contrast component only).
Screenshots: **25/25 green on the FIRST pass** (the S53-1 image gate,
seventh consecutive cold-server cycle) and **24/25 byte-identical** —
04b-cart-coupon-hint 6ed62e85… at its TWENTY-THIRD consecutive
byte-identical cycle; the sole changed shot 03-product-detail (757 px,
0.0212%, the single 11-row band at y1168-1178 x227-313 — the exact
documented band geometry) VLM-classified and DB-cross-checked: the
review-ID band "Review 1792484456078" → "Review 1792537355751" — this
run's own e2e-minted row (DB: "E2E review 1792537355751" @
2026-10-20T23:02:36Z) — the irreducible class, zero repo action. THE
LIVE REFERENCE REMAINED UNAVAILABLE for the SEVENTH consecutive cycle
(HTTP 503 with the Base44 publish-the-app shell, 10723 bytes, stable
across immediate + delayed ~45s retries — environmental); the run-53
live baseline + the seed-embodied pins carried every expectation. The
reference repo re-verified at 1ffda3d (in sync, cloned OUTSIDE the repo
tree) and the skills comparison re-confirmed (the operator-curated
superset 2607 = 2598 + 9, catalog md5 identical) + the sitemap/SEO
comparison re-confirmed (the stricter superset, no adoption gaps).

**Appendix B session-59 lessons (the tooling-discipline class):**

1. **Never pipe a hashing pass through `tee | head`** — the byte-identity
   report initially read 7/25 because `md5sum … | tee file | head -8`
   let `head` close the pipe early: md5sum died of SIGPIPE mid-run and
   the "pre-capture" file held only 8 of 25 hashes, so every missing
   entry compared as "changed". Byte-verify against `git show HEAD:<path>`
   piped to the same hasher instead — the ground truth is the git object,
   not a side-file of hashes. (The pixel-diff of "changed" shots
   immediately exposed the contradiction — 0-pixel diffs with "different"
   md5s — the tell that the comparison substrate, not the rasters, was
   wrong.)
2. **The parity-grid card locator must match the authored root element**
   — ProductCard renders `<article>`, so `main .grid > div` resolves
   zero cards. When a locator returns 0 nodes on a page that visibly
   renders the target, dump the actual DOM (`page.locator('main').count()
   + h3 texts`) before suspecting the page.
3. **Server Action `type="hidden"` internals are not inputs** — the
   login/register forms mount $ACTION_REF_1/$ACTION_1:0/$ACTION_1:1/
   $ACTION_KEY hidden inputs that no label can or should name. a11y
   input-label checks must exclude `el.type === "hidden"` or every
   server-action form page false-FAILs at exactly 4.
4. **The parity-grid pin list carries the post-e2e Damascus value (413)**
   — the seed pins the fresh DB at 412, but the grid runs after the
   traffic-generating e2e minted its +1 review. Derive pins from the DB
   state the surface under test actually renders, and record which state
   (seed vs post-e2e) each pin belongs to.

**Appendix B session-60 lessons (the UTC-day-band superset + the
tooling-availability layer class):**

1. **A UTC-day-crossing capture changes THREE bands on 03-product-detail,
   not one** — when the capture UTC-day differs from the committed
   raster's (run 60 captured Oct 20 UTC, run 61 Oct 21 UTC), the diff
   spans the irreducible review-ID band (y1168-1178) PLUS the two
   template-review date-label bands (y1111-1121 and y1285-1295, each a
   narrow ~42px "Oct 20, 2026 → Oct 21, 2026" digit drift) — the seed
   stamps its template reviews at seed TIME, so their rendered dates
   cross the day boundary with the capture. The session-54 UTC-day-drift
   model generalizes: expect the review-ID band + N date-label bands on
   03, the order-date cells on 14, AND the chart-axis slide on 12.
2. **The 12-admin-dashboard revenue chart slides its whole day-window
   with the calendar** — the rolling 14-day window's x-axis labels ALL
   shift one day (Oct 7-19 → Oct 8-20) when the capture date advances
   past UTC midnight, tooltip date and active dot included, with the
   chart-line area re-rendering beneath (8 pixel bands, 0.50% of the
   raster). The date-bearing class extends beyond date CELLS to
   rolling-window chart AXES; classify by the DB's order placedAt truth,
   not by band count.
3. **npm audit became RUNNABLE in this sandbox (deep audit 61-a)** — the
   standing "audit tooling absent" expectation no longer holds: it
   reports 11 advisories, ALL in dev/test/CLI chains (vitest→tinypool
   2-critical; eslint-config-next→fast-glob/micromatch/braces;
   prisma-CLI→@prisma/config→deepmerge-ts), ZERO production reachability
   — proven three ways (@prisma/client's empty dep map, the standalone
   bundle's node_modules contents, no prisma.config.ts exercising the
   path). Disposition: documented accepted debt; a future major-bump
   cycle (vitest ^5, prisma ^7 when stable — both breaking, full gate
   re-run) is the dedicated fix, NOT an urgent patch.
4. **Verify tooling availability per-LAYER after any sandbox event** —
   the repo-local workspace (node_modules, db/, the venv + ssh shim, the
   reference clone) survived this cycle while the global npm tooling
   (lighthouse) did not; "environment survived" is a per-layer claim —
   probe each tool before the step that needs it rather than assuming a
   full rebuild or a full survival.
### Session 61 (run 62) — 2026-10-21 — the Stripe payments retrofit (a FEATURE cycle): proper Stripe Payment functionality ported from the ecommerce-store reference

The operator commissioned the retrofit of real Stripe payments using the
`ecommerce-store` implementation as the reference template (that repo's
PAY-STRIPE-1/2, PAY-OPS-2, REASON-TRAIL-1, REFUND-ACTION-1 sessions). The
design invariants ported intact: OFF-by-default with the unconfigured demo
path byte-identical (444 pre-existing unit + 67 e2e untouched and green —
the e2e checkout pins ARE the unconfigured-parity proof); money is server
truth (the intent amount minted from the live cart + coupon + settings
through `computeOrderMoney`; the placement verifies pre-tx AND the in-tx
authority re-derives with the `StripeAmountMismatchError` guard); idempotency
everywhere (deterministic intent keys, the `Order.stripePaymentIntentId`
UNIQUE anchor, the `StripeEvent.eventId` dedup row committed WITH the
placement — the H4d/L9 rule, pinned at engine level by the
dedup-rolls-back-with-failure integration test); the webhook failure policy
(duplicate/permanent/transient — with THIS repo's addition that an
`idempotencyKey` P2002 is duplicate, not transient, because the webhook
placement carries the client's checkout key; a transient answer would
500-loop Stripe retries against a deterministic collision); PCI SAQ-A (the
Payment Element iframe + the `/pure` lazy loader — zero stripe.js traffic
unless the path is live); the sentinel mirror config; and the refund loop's
single-writer rule (the action fires, the webhook's `charge.refunded`
reflection writes). **52 new unit tests (444 → 496):** the mirror's truth
table, 26 seam pins, the eligibility/outcome/reason derivations, the csp
configured pins (with the unconfigured byte-identity pin), and five
real-engine placeOrderTx pins. Gates: lint · typecheck · typecheck:tests ·
496/496 at 22.4s · build 22/22 static zero prisma:error · 67/67 e2e at 1.8m
+ a configured-mode smoke (dummy keys: the CSP family on the live header,
the webhook's 400 Missing/Invalid signature contract, the mint's 400/409
gates, the admin-payments guard shell). Schema: two additive Order columns +
the StripeEvent table — zero data motion. See §7.4 + docs/session_113.md.

**Appendix B session-61 lessons (the integration-port class):**

1. **Port the invariants, not the code** — the reference's placement
   derives money pre-tx; this repo's `placeOrderTx` is the in-tx authority,
   so the port needed an in-tx amount guard the reference doesn't have.
   When transplanting a payment integration, map EACH reference guarantee
   onto the target's own money path rather than copying the control flow.
2. **A deterministic unique collision must never classify transient** —
   the webhook's placement carries the client's idempotencyKey (this repo's
   replay-ownership design), so its P2002 is a duplicate of THIS checkout,
   not a retryable race. Every unique anchor the placement writes needs an
   explicit place in the failure policy — an unclassified anchor becomes a
   Stripe retry loop against a wall.
3. **The demo path is the compatibility contract** — the unconfigured
   default staying byte-identical is what lets 67 e2e pins double as the
   no-regression proof for a payment retrofit. Feature gates that keep the
   old path as the default (superset activation) turn the existing suite
   into the regression harness for free.
4. **Write-once per-visit values belong in lazily-initialized state, not
   refs** — the mint snapshot serializes the checkout idempotency key
   during render; `useRef` values cannot be read during render under the
   react-hooks/refs rule. `useState(() => generate())` is the
   behavior-identical, lint-legal form for write-once visit keys.


### Session 62 (run 63) — 2026-10-21 — the thirtieth remediation cycle: the docs-trail integrity cycle (the committed-conflict-marker defect) + the Stripe-retrofit raster debt paid

The fresh-clone recovery after sandbox reset #13 surfaced the first
documentation-trail defect in 115 sessions of sweeps: the operator's raw-log
commit (a306b4e) landed `docs/session_113.md` carrying COMMITTED git
conflict markers — it pasted the conflicted rebase file while simultaneously
saving both sides separately (session_114.md = the Stripe narrative,
byte-identical to the incoming side; session_115.md = the raw log), leaving
the conflicted file itself in the tree. Deep audit 63-a found it (9/9 code
anchors PASS — the defect was docs-only) and the fix was content-preserving:
keep the unique run-61 raw-log side, delete the duplicated narrative side.

**Lessons:**

1. **A committed conflict marker is its own defect class — add a standing
   grep.** No existing gate looked for `^(<<<<<<<|=======|>>>>>>>)` in the
   tree; 115 sessions of docs sweeps checked content accuracy but never
   marker hygiene. The sweep now greps the whole repo every cycle — zero
   cost, and the class can never land again. When resolving, verify BOTH
   sides' content first (diff against sibling files) so the unique side is
   preserved — a naive "take theirs" would have destroyed the only copy of
   the run-61 raw log.
2. **A feature commit that changes ANY rendered surface must refresh the
   rasters in the SAME cycle.** Run 62 (the Stripe retrofit) added the
   admin sidebar "Payments" nav but committed zero screenshots — its
   8 admin-shot rasters then predated the sidebar, so the next cycle's
   byte-diff fired on 9 shots at once (the sidebar-insertion band pattern:
   ~44px-spaced 14-16px label bands + the shifted active pill, sidebar-only
   x-extent, content areas pixel-identical). The raster refresh is not
   optional debt: it is the visual proof the feature's surfaces render.
3. **The worklog separator discipline.** Run 62's Task 62 entry landed
   without the `---` separator + `Task ID:` header — the append-only log's
   grep anchors (`^Task ID:`) then miss it. The sweep now verifies the last
   entry parses cleanly before appending the next.
4. **The verifier-rebuild lessons compound.** The git-ignored research/
   scratch dies with every sandbox reset; rebuilding the parity grid
   re-encounters the SAME script-side classes (the pagination split — page 1
   renders 12 cards while the "16 products found" text carries the catalog
   pin; the auth-pair navs=0 expectation — the (auth) layout intentionally
   renders no storefront chrome). Encode the corrections IN the rebuilt
   scripts, not in your head: the persisted verifier is the only memory
   that survives the reset.
### Session 63 (run 64) — 2026-10-21 — the thirty-first remediation cycle: the second SURVIVING-workspace continuation + the traffic-owned-pin hardening cycle

The workspace survived for the second consecutive cycle — and the persisted
`research/` verifiers survived with it, the first cycle where the parity grid
did NOT need rebuilding. Deep audit 64-a: 9/9 anchors PASS, zero actionable
findings (three informational NITs, all documented intentional behavior).

**Lessons:**

1. **Hard pins on traffic-owned values are verifier debt — encode the
   tolerance in the script.** The static grid's Damascus-card pin
   `\(41[23]\)` failed at 414: each e2e run adds exactly +1 Damascus
   review, so any pin written against a snapshot count is stale one cycle
   later. The fix is the traffic-tolerant range pin `\(41[2-9]\)` — and
   per the session-62 verifier-rebuild lesson, the correction lives IN the
   persisted script, not in the operator's head. When you write a pin on a
   value that documented traffic grows, pin the CLASS (range/format), never
   the instant.
2. **The warm-server capture flake class — run the capture exactly ONCE
   per cold server start.** Repeated capture passes on a warm server hit
   `page.waitForURL` timeouts on admin routes (14/16 flaked on second/third
   passes while the cold first pass was fully green) — and every extra pass
   OVERWRITES the good rasters, so a trailing flake leaves the worse set on
   disk. The S53-1 cold-server discipline therefore means one thing more:
   the capture is a single-shot gate; if it flakes, restart the server cold
   and re-run — never chain captures on one warm server.
3. **The symlink convergence outlives the per-command export.** The
   documented env-shadow dispositions are "converge (symlink) or unset";
   runs 61–63 used per-command absolute exports (every DB command
   re-prefixed). The symlink variant (`ln -sfn <repo>/db
   /home/z/my-project/db`) converges BOTH env winners onto the one file
   with a single setup — and it survives across commands, subshells, and
   the backgrounded standalone server. Prefer it whenever the shadow points
   at a stable nonexistent path outside the repo.
4. **A byte-identical admin set is the raster-debt receipt.** Run 63 paid
   the Stripe-raster debt; this cycle's 24/25 byte-identical diff (all nine
   admin shots included) is the proof the debt stayed paid. The receipt
   pattern generalizes: after any raster refresh, the NEXT cycle's
   byte-diff should return to the single-band traffic-owned changes — if it
   fires on structural regions instead, a rendered surface changed without
   a capture, and that is a new raster-debt cycle.

### Session 64 (run 65) — 2026-10-21 — the thirty-second remediation cycle: the fresh-clone recovery after sandbox reset #14 + the orphaned-server hardening cycle

Deep audit 65-a: 9/9 anchors PASS, zero actionable findings (two
informational notes, both documented intentional behavior). The parity
grid was REBUILT from scratch (57/57 = 39 static + 18 mobile — the
rebuilt grid carries four more static pins than the run-64 count,
including the split-out guest cart-button anatomy and extra SEO pins) and
the agent-browser a11y-tree cross-check was added as a supplementary
surface. The live reference stayed dark for the ELEVENTH consecutive
cycle (HTTP 503, environmental).

**Lessons:**

1. **Kill the standalone server by PORT OWNER, never by command-line
   pattern.** `pkill -f "node .next/standalone/server.js"` silently
   missed the server because Next.js renames the process title to
   `next-server (v16.4.0)`. The orphan (parented to init) then served TWO
   poisoned properties to the e2e webServer's `reuseExistingServer` path:
   its SQLite connection held the DELETED pre-reseed DB inode (the
   reseed's `rm db/custom.db` makes a new file; the orphan keeps reading
   the old one — order-number pins broke at ORD-2026-006+), and its
   in-memory rate limiter accumulated login budgets across runs so
   login-dependent specs got 429-rejected on the next run. The fix:
   resolve the listening pid with `ss -tlnp` (or `pkill -f next-server`)
   and verify the port is free before any DB-adjacent sequence.
2. **A gate that drops from 67 to ~37 with login `toHaveURL` failures
   while guest-only specs stay green is the stale-server signature.** The
   first capture-sequence e2e run returned 37/67 with exactly that shape.
   Diagnose the SERVER before touching code or tests: check for an
   unexpected listener on the port, check `ss -tlnp` for a
   longer-than-expected process age, and confirm the DB the server
   actually reads (a stale inode reads old users/orders). After the
   correct kill + fresh reseed, the re-run returned to exactly 67/67 at
   1.9m with the exact documented traffic class — zero code changes.
3. **The raster-noise micro-class: 51 px (0.0039%) of anti-aliasing with
   zero content delta is a receipt, not a regression.** The 10-register
   shot changed across four micro-bands (y176-178, y191-199, y700-708,
   y721-723); both band crops VLM-classified as anti-aliasing/pixel noise
   with identical text. Chromium font rasterization carries run-to-run
   variance at the sub-glyph level; byte-identity expectations should
   treat this class like the UTC-day drift class — document the band
   extent and the VLM verdict, refresh the raster, move on.
4. **The agent-browser daemon saves relative screenshot paths against the
   DAEMON's cwd, not the client's.** A relative `screenshot name.png`
   landed in the daemon's working directory (and the daemon does not
   `mkdir -p` — an absolute path into a missing directory errors). Save
   screenshots to an absolute path under an existing directory, or
   relocate the file afterwards — the captures are supplementary
   research artifacts under git-ignored `research/`, never docs rasters.

### Session 65 (run 66) — 2026-10-21 — the thirty-third remediation cycle: the fresh-clone recovery after sandbox reset #15 + the verifier-expectation hardening cycle

Deep audit 66-a: 9/9 anchors PASS, zero actionable findings (the
nineteenth consecutive clean audit, verified anchor-by-anchor with
file:line evidence). The parity grid was REBUILT from scratch (61/61 =
43 static + 18 mobile — this composition carries four more static pins
than the run-65 count, all green) and the agent-browser a11y-tree
cross-check re-run clean. The live reference stayed dark for the TWELFTH
consecutive cycle (HTTP 503, environmental). Zero orphaned-server
incidents — the kill-by-port-owner discipline applied preventively at
every server transition.

**Lessons:**

1. **A verifier that clicks a client-side-router link must waitForURL
   before pinning the destination surface.** A `next/link` click
   schedules an async client-side navigation; a script that clicks a
   product-card heading and immediately checks destination-page anatomy
   (In Stock / Buy Now / Customer Reviews) runs against the
   still-rendered ORIGIN page — every such check "fails" while the app
   is perfectly healthy. This cycle's four initial static-grid failures
   were ALL this class (plus a stale heading-string guess): fixed in the
   verifier with `page.waitForURL(/\/product\//)`, zero repo impact.
   The general rule: after ANY click-triggered navigation in a
   verification script, gate on the URL change, never on
   waitForLoadState alone (networkidle may already be resolved).
2. **`alt=""` is CORRECT for decorative images — an a11y img check must
   use `hasAttribute("alt")`, never truthiness of `getAttribute`.** The
   hero-carousel slides and the gallery thumbnails intentionally ship
   `alt=""` (the slide overlay text and the thumbnail buttons' own names
   carry the accessible semantics; the inactive slides are
   aria-hidden). `!img.getAttribute("alt")` conflates the empty-but-
   present attribute (correct) with an absent attribute (a real defect)
   — the first a11y run reported 6 phantom failures across home +
   product-detail, all of them the correct decorative pattern.
3. **A reproducible raster-noise band-position signature is itself the
   classification evidence.** 10-register's 51-px delta landed at the
   IDENTICAL y-positions as run-65's VLM-classified receipt (y176-178,
   y191-199, y700-708, y721-723) — chromium's font-rasterization noise
   is deterministic enough on the same pipeline that the matching band
   signature replaces the VLM pass: same byte count, same band extents,
   same zero-content-delta conclusion, raster refreshed as the receipt.
4. **The twelfth consecutive dark-cycle disposition holds.** The live
   reference (HTTP 503, Base44 publish shell, ~10632 bytes, stable
   across immediate + delayed ~45s retries) remains environmental; the
   documented parity baseline (the committed screenshots + the
   seed-embodied pins + the parity grid) continues to carry every
   expectation. When the reference returns, the next cycle re-baselines
   against it.

### Session 68 (run 69) — 2026-10-23 — the thirty-sixth remediation cycle: the fresh-clone recovery + the timing-tolerant-verifier cycle

Deep audit 69-a: 9/9 anchors PASS, zero actionable findings (the
twenty-second consecutive clean audit, verified anchor-by-anchor with
file:line evidence; the standing conflict-marker grep gate CLEAN on its
seventh consecutive cycle; the operator's `a0deef7` delta verified as
docs/session_127.md + skills/ only — src/tests/prisma untouched). The
parity grid was REBUILT from scratch at **73/73 (51 static + 22
mobile)** — the strict throw-on-false `vis()` helper upgraded to
**timing-tolerant polling** (`locator.waitFor({ state: "visible" })`)
after the RSC DOM-swap race class unmasked below; strictness preserved
(the helper still THROWS on timeout — never a vacuous PASS). The a11y
tree audit 48/48 CLEAN (8 pages × 6 checks, the cuid detail URL). The
agent-browser cross-check rebuilt at **28/28** (the mobile surface with
the viewport applied and asserted, the full panel anatomy, the scroll
lock engaging/releasing, the route-change close, the panel + desktop
search flows, the product-detail anatomy on the cuid route, ZERO
console/page errors). The live reference stayed dark for the FIFTEENTH
consecutive cycle (HTTP 503, 10339 bytes, stable across immediate +
delayed ~45s retries — environmental). The skills comparison recorded
the operator's curation delta: the superset grew 2757 → **2770 files**
(13 more operator-owned: ExtractWisdom + stock-analysis-skill, zero
reference files missing).

**Lessons:**

1. **The RSC DOM-swap race class.** A single-shot `isVisible()`
   check fired immediately after `waitForURL()` raced the
   client-side-router payload swap: the URL had changed but the old
   page's DOM was still mounted, so a healthy "Artisan Copper Frying
   Pan" heading matched ZERO elements. The e2e layer never sees this
   because `expect(loc).toBeVisible()` RETRIES for ~5s. Strict
   verifiers must do the same: `await loc.waitFor({ state: "visible",
   timeout: 8000 })` — polling, not single-shot — while still THROWING
   on timeout. Strictness and timing-tolerance are independent axes:
   the run-67 lesson made checks throw; this cycle's lesson makes them
   wait.
2. **The seed-pin sort-direction class.** "Damascus-first" is defined
   on the **`/products` "Newest" default sort — `createdAt` DESC**
   (the seed backdates `createdAt` so the seed-list order IS the
   newest-first order). A seed-pin verifier that orders `createdAt`
   ASC puts Damascus LAST (position 15 of 16) and false-alarms
   "catalog order broken". Pin direction must match the documented
   sort semantic — the DB was correct the whole time.
3. **The same-route panel-open class.** Clicking the "Products" panel
   link while ALREADY on /products changes no pathname, so the
   mobile-nav route-change close effect correctly does NOT fire — the
   panel stays open BY DESIGN. A verifier sequencing the
   route-change-close check must navigate from a DIFFERENT route
   (home → products, exactly like the e2e spec); otherwise it
   double-faults: a false "panel did not close" FAIL, followed by a
   hamburger toggle that CLOSES the still-open panel and starves the
   next panel-dependent check of its DOM.
4. **The UTC-day drift receipt, second consecutive firing.** 22/25
   byte-identical; the 3 changed shots all pixel-band + DB-exact
   classified: 03-product-detail's three 11-row traffic-owned
   review-ID bands (y1111-1121/y1168-1178/y1285-1295, this run's
   e2e review `1792714509797` @ 2026-10-23T00:15:10Z) +
   12-admin-dashboard (the revenue-chart day-label axis band + 5
   uniform 11-row recent-orders bands) + 14-admin-orders (5 uniform
   11-row date bands) — this run's e2e minted its 5 orders
   2026-10-23T00:14-15Z vs the ground truth's Oct-22 capture. Also
   encoded from the audit subagent: **`rg` with NO path argument
   blocks indefinitely on this sandbox's non-TTY stdin** (killed at
   100-240s twice while explicit-path runs finish in ~0.02s) — always
   pass the explicit `.` path.

### Session 67 (run 68) — 2026-10-22 — the thirty-fifth remediation cycle: the fresh-clone recovery after sandbox reset #17 + the strict-verifier hardening cycle

Deep audit 68-a: 9/9 anchors PASS, zero actionable findings (the
twenty-first consecutive clean audit, verified anchor-by-anchor with
file:line evidence; the standing conflict-marker grep gate CLEAN on its
sixth consecutive cycle). The parity grid was REBUILT from scratch at
**66/66 (44 static + 22 mobile)** — with every visibility pin upgraded
to a STRICT throw-on-false helper, which unmasked the cycle's two new
verifier classes (below) that had let an entire product-detail section
"pass" against a 404 page in the first draft. The a11y tree audit
48/48 CLEAN (8 pages × 6 checks, the cuid detail URL). The
agent-browser cross-check rebuilt at **29/29** with its own two CLI
classes (the device-support list and the snapshot ref format, below).
The live reference stayed dark for the FOURTEENTH consecutive cycle
(HTTP 503, environmental). The skills comparison recorded the
operator's curation delta: the superset grew 2607 → **2757 files**
(the operator's `6d69618` commit added ~150 skill files and
deliberately evolved 20 shared ones — the catalog md5 divergence is
operator-intentional, zero reference files missing).

**Lessons:**

1. **The bare-`isVisible()` vacuous-pass class.** A Playwright
   locator's `isVisible()` resolves `false` WITHOUT throwing — a
   check harness that only try/catches its callback records **PASS for
   "not visible"**. The first grid draft "passed" an entire
   product-detail section (price, In Stock, Add to Cart, Customer
   Reviews…) against what turned out to be a **404 page**. Every
   visibility pin must THROW on false — wrap with a `vis()` helper
   (`if (!(await loc.isVisible())) throw …`) or use
   `await expect(loc).toBeVisible()`. Same family as the session-20
   vacuous `getByText("FREE")` pin and the session-66 strict-mode
   phantom-fail: **verify the verifier** — a rebuilt grid that passes
   everything on the first run has probably not yet earned its pass.
2. **The product-cuid route class.** The detail route is
   `/product/[id]` where `id` is the seeded **cuid** — the seed's
   `slug` ("damascus-steel-chef-knife-set") is a SEPARATE field and
   `curl /product/<slug>` returns 404. Three independent verifiers
   (the parity grid, the a11y audit, the agent-browser cross-check)
   all hardcoded the slug URL and audited a 404 page. Resolve the cuid
   from the DB before building the URL, or navigate by clicking a
   product card (the e2e pattern).
3. **The agent-browser 0.39.0 device-support + ref-format classes.**
   `set device "iPhone 13"` fails SILENTLY ("Unknown device" on
   stderr) and leaves the DESKTOP viewport live — supported devices
   are iPhone 15/16/16 Pro/17, iPad, Pixel 9, Galaxy S25; prefer the
   deterministic `set viewport 390 844`. And snapshot lines print
   `[ref=eNN]` while interactions consume `@eNN` — extract refs with
   `grep -o 'ref=e[0-9]*'`, never a literal `@e` grep. Always assert
   `window.innerWidth` after setting a viewport before trusting the
   mobile surface.
4. **The UTC-day drift receipt (the run-62 class fired again).**
   Run 67's admin shots were byte-identical because its e2e traffic
   and capture shared the Oct-21 UTC day with the ground truth; this
   run's e2e minted its 5 orders on Oct 22 UTC (DB-exact:
   ORD-2026-001…005 all placedAt 2026-10-22T06:15-16Z vs the ground
   truth's Oct-21 timestamps), so **12-admin-dashboard** (the
   14-day revenue chart's day labels + the recent-orders dates) and
   **14-admin-orders** (the 5 order rows' dates) legitimately diff —
   22/25 byte-identical with all 3 changed shots traffic-owned
   (03-product-detail's review-ID bands included). Same-UTC-day
   captures restore byte-identity; a boundary-crossing capture
   legitimately shifts every date-rendering surface.

### Session 66 (run 67) — 2026-10-21 — the thirty-fourth remediation cycle: the fresh-clone recovery after sandbox reset #16 + the rebuilt-grid verifier-hardening cycle

Deep audit 67-a: 9/9 anchors PASS, zero actionable findings (the
twentieth consecutive clean audit, verified anchor-by-anchor with
file:line evidence). The parity grid was REBUILT from scratch at 64/64
(43 static + 21 mobile — three more mobile pins than the run-66 count,
all green; the mobile grid encodes the full Tailwind v4 contract:
conditional mount, toggle-closes, scroll lock, the bg-primary active
pill, the panel search flow, no horizontal overflow at 390px). The a11y
tree audit 48/48 CLEAN (8 pages × 6 checks). The agent-browser
cross-check re-run clean (the mobile-nav cycle via the interactive a11y
tree, the panel search flow, the product-detail anatomy, ZERO
console/page errors). The live reference stayed dark for the THIRTEENTH
consecutive cycle (HTTP 503, environmental). Zero orphaned-server
incidents — the kill-by-port-owner discipline applied preventively at
every server transition.

**Lessons:**

1. **A strict-mode multi-match silently converts to a phantom FAIL
   under `.catch(() => false)`.** "New Arrivals" names BOTH the rotating
   hero-slide h1 AND the grid-section h2 — a `getByRole("heading", {
   name: "New Arrivals" })` match throws Playwright's strict-mode
   violation, and a verifier whose checks are wrapped in
   `.catch(() => false)` reports it as a content failure while the app
   is perfectly healthy. Disambiguate with `.last()` / section scoping
   / `exact: true` — and treat any rebuilt-grid failure on a string
   that plausibly appears twice in the DOM as a strict-mode suspect
   BEFORE suspecting the page.
2. **The home h1 is the ROTATING HERO SLIDE TITLE, not the brand.**
   The brand lives in the header link (`link "HomeNest home"` in the
   a11y tree); the h1 renders whichever carousel slide is active (New
   Arrivals / Elevate Your Kitchen / Sale Up to 40% Off) and rotates on
   the auto-advance timer. A verifier pinning "h1 contains the brand"
   fails phantom AND is raster-timing-dependent. Pin the brand on the
   header link, and pin the hero by its REGION (`getByRole("region", {
   name: "Featured collections" })`) — which also exposes the next
   trap: an aria-labelled `<section>` gets the implicit `region` role
   in the a11y tree but NEVER carries a literal `role="region"`
   attribute, so the CSS attribute selector `[role="region"]` matches
   nothing. Use role-based locators, not role-attribute selectors.
3. **`db:setup` NEVER resets live data — the fresh 0/16/2 baseline
   requires deleting `db/custom.db` FIRST.** `prisma db push` (no
   schema change) + the content-only seed (S7-3 upserts, create-only
   coupons/settings) leaves orders/reviews/users/coupon-redemptions
   exactly as traffic left them — this cycle's first "reseed" still
   carried 5 orders / 17 reviews / 7 users / FREESHIP 1, and only
   `rm db/custom.db` restored the documented baseline. A seed-pin
   verifier that does not itself assert the baseline counts
   (orders=0/users=2) silently verifies a traffic-laden DB.
4. **The thirteenth consecutive dark-cycle disposition holds** (the
   same HTTP 503 Base44 publish shell, stable across immediate +
   delayed ~45s retries — environmental; the documented parity
   baseline continues to carry every expectation).

- **Session 73 (run 73, session 2 of the ely-beauty repo): the first
  post-re-skin verification cycle.** Gates on the pulled tree 512/512 ·
  69/69 all green. Deep audit 73-a (read-only, skills/ excluded):
  9/9 code anchors PASS — the re-skin preserved every hardened invariant
  mechanically — with 3 MEDIUM / 5 LOW / 4 INFO findings, almost all
  run-72 regressions. Live-reference parity re-baselined (online): home/
  shop/product/footer/mobile-menu strong; three measured deltas. All
  fixed TDD-first (512 → 536 unit):
  **S73-1** city-tier shipping was client-trusted (`shippingMethodForCity`
  had NO server-side caller — the checkout route, the Stripe mint, and the
  webhook all trusted the body/metadata field, contradicting the documented
  "server re-derives in-tx" invariant): the placement now derives the tier
  IN-TX from `args.address.city`; `PlaceOrderArgs.shippingMethod` and
  `checkoutSchema.shippingMethod` are GONE; the mint/webhook/route derive
  from the address; integration-pinned (Chattogram → express ৳130 whatever
  the body claimed, Dhaka/whitespace/empty-city cases).
  **S73-2** the login cart-merge's stock clamp was dead code (the plan keys
  are `productId|variant` but the stock map was keyed by plain productId —
  the S6-6 clamp never fired): the new pure `stockMapForCompositeKeys`
  seam keys the map with the planner's own keys; `splitBulkKey` + the
  merge split take the substring after the FIRST pipe (a variant label may
  itself contain "|").
  **S73-3** the legal pages carried kitchenware copy and a "prices in US
  dollars" claim on a ৳ BDT store: rewritten for skincare/BDT/COD (refunds
  via bKash/Nagad/bank transfer; beauty-safety language).
  **S73-4** the reference renders NO active-link highlight anywhere
  (measured live: desktop + panel links all rgb(26,26,26), no
  aria-current) — the clone's `text-primary` highlight came from a
  hydration-unsafe `window.location.search` read that also marked all
  three /shop-derived links active simultaneously: removed; `aria-current`
  survives only on the panel's exact-path no-query links (invisible a11y
  superset); the e2e pin re-pinned (aria-current present, NO standalone
  text-primary token, same computed color as an idle link).
  **S73-5** the reference's shop header stacks the count under the title
  (h1 `text-4xl lg:text-6xl`, container `py-12 lg:py-20`); the clone
  right-aligned it in a tighter block: matched.
  **S73-6** micro-label tracking: the reference measures 1.2px @12px
  (0.1em) on nav/CTA/panel links and the globals.css comment itself says
  "1.2px tracking" — the utility shipped 0.12em (1.44px): fixed to 0.1em
  everywhere (eyebrow-label + panel links).
  **S73-7** `PurchasePanel` recorded only the color on both-dimension
  products (`selectedColor || selectedSize`): the reference's massager
  page renders BOTH rows and its cart line records BOTH selections
  (verified live — "Pink" + "Size: Black"); the panel now composes
  `"Color / Size"` via the pure `composeVariantLabel` seam, and the cart
  PAGE renders the line's variant label (the drawer already did).
  **S73-8** `PAYMENT_METHODS` accepted `paypal` and a crafted `card` body
  with any 4-digit last4 placed an unpaid "card" order: the enum is
  `card|cod`; card REQUIRES a verified Stripe intent; the dead paypal
  branches + the stale "Order numbers are sequential" comment removed.
  **S73-9** the address dialog defaulted country to "United States" on a
  Bangladesh-only store: "Bangladesh".
  **S73-10** residual sweep: package.json name/description (homenest →
  ely-beauty), `CarouselSlide.ctaLink` default `/products` → `/shop`,
  `Category.iconGradient` kitchenware-orange default → neutral stone,
  account initials fallback "H" → "E", admin tags/image-suggestions
  placeholders, the `homenest_coupon` sessionStorage key → `ely_coupon`
  (the three homenest_* COOKIE names stay — renaming would orphan active
  sessions), `ProductCard`'s unused `inWishlist` prop.
  **S73-12** (found validating S73-7) the docs claimed "products CRUD (+
  colors/sizes)" but `productInputSchema` had no variant fields — variants
  were seed-only: `colorOptions` [{name ≤28, hex #AABBCC}] + `sizes`
  [≤28] added (bounds chosen so any composed label stays inside the cart's
  60-char variant bound — unit-pinned), the action writes the JSON
  columns, the admin dialog gained Colors ("Name:#hex" per line) + Sizes
  (comma-separated) editors hydrated from the live rows.
  Traps encoded: (1) a live reference can CONTRADICT its own clone's
  documented parity claims — re-measure, don't trust the run's own pins
  (the run-72 "active link = text-primary (reference parity)" note was
  wrong); (2) zod strips unknown keys — a schema-removed field still
  PARSES when clients keep sending it, so the removal is backward-safe but
  the strip must be pinned (`"field" in parsed.data === false`); (3) a
  not.toHaveClass(/text-primary/) regex false-matches the `hover:text-
  primary` variant — assert the whitespace-delimited token
  (/(?:^|\s)text-primary(?:\s|$)/); (4) an interface field removal is a
  compile-time blast radius (tsc -p tsconfig.tests.json catches every
  test fixture) — remove the field from the type FIRST, then let the
  compiler enumerate the call sites.

- **Session 76 (run 76, session 6 of the ely-beauty repo): the
  clean-build recovery & card-anatomy parity cycle.** Gates on the pulled
  tree: lint/typecheck/563 unit green — then the CLEAN build FAILED
  (`globals.css:2:135421: Missed semicolon`). **F-0**: Tailwind v4's
  automatic candidate scan reads .md prose; the run-75 docs sweep's
  colon-form `md:aspect-[3:1]` (four doc files) compiled to invalid
  `aspect-ratio:3:1` and broke the production build while Turbopack's
  warm cache masked it in run-75 (the false-green class). Fixed
  TDD-first with the `@source not` guard + the doc typos +
  `tailwind-scan-guard.test.ts` (3 pins incl. a real compile). Deep
  audit 76-a: 9/9 anchors PASS, 0 C/H/M (the F-3 "doubled hairline"
  deduction DISPOSED against the live DOM — the reference renders both
  hairlines). The live re-measurement found 12 card/variant deltas —
  fixed TDD-first (563 → 576 unit, 74 → 77 e2e):
  **S76-1** the /shop grid → `gap-6 lg:gap-x-8 lg:gap-y-12` (363px
  cards, 48px row gaps — the curated grid's rhythm).
  **S76-2** the card text block → `pt-4` + text-sm's DEFAULT name
  leading + a FLOW price (mt-auto retired; no-desc cards trail ~20px
  inside the row-normalized 447px card — the reference's anatomy).
  **S76-3** the product h1 → `text-4xl lg:text-5xl` (48px/1.0 @lg).
  **S76-4** the size chips → 38px PILLS, active solid fg + IVORY text.
  **S76-5** the swatches → 36px with the measured double ring
  (border-2 fg + bg-2px/fg-4px shadows; inactive the black/15 ring).
  **S76-6** the thumbs → `aspect-[4/5] w-16` (64×80).
  **S76-7** the non-home header gains `border-t` (66px mobile bar box).
  **S76-8** the seed data parity (bonnet badge → null + the live-DB
  UPDATE — badge is admin-owned; six no-desc products → ""; the
  metadata `shortDescription || description` fallback).
  **S76-9** the galleries: 38 variants via `scripts/gen-gallery-variants.mjs`;
  the VLM coherence review kept 9 generated sets, replaced 10 drifted
  sets with PIL detail crops — 19/19 products ship VLM-verified
  3-image galleries.
  Every fixed surface re-measured byte-exact (shop grid 48px 32px,
  cards 363×447 + mobile 159×283, h1 48/48/300, chips 38px pill, thumbs
  64×80, header 82 desktop). Encoded traps:
  1. **Prose is a compile input.** Tailwind v4's candidate scan reads
     every non-gitignored text file — a class-like string in a session
     log can generate invalid CSS and break the clean build. Guard with
     `@source not`; pin with a REAL compile assertion (presence-only
     pins can't see the generated CSS).
  2. **A warm Turbopack cache can false-green a broken tree.** The docs
     sweep ran after the last real CSS compile and the cache reused the
     pre-sweep module. After ANY change to scan-visible files (docs
     included), a CLEAN build (rm -rf .next) is the only honest gate.
  3. **A stale node_modules/.cache/jiti breaks next/font** ("queries
     have exactly one entry") — clear node_modules/.cache + .next
     before suspecting code.
  4. **VLM-verify generated imagery against its main shot** —
     generation drifts on material/shape (the gua-sha took 3 attempts
     before the crop fallback); crops of the main are coherent by
     construction.
  5. **The e2e should pin SCALES, not box heights, for text that
     wraps** (the h1's 48px/48px typography is the invariant; the box
     height depends on the product name's wrap).

- **Session 75 (run 75, session 5 of the ely-beauty repo): the
  container-gutter & responsive-header parity cycle.** Gates on the
  pulled tree 550/550 · 70/70 all green. Deep audit 75-a (read-only,
  skills/ excluded): 9/9 anchors PASS, 0 CRITICAL/HIGH code (2 MEDIUM
  docs-truth + 4 LOW residuals). The whole-page live re-measurement
  found the SHARED LAYOUT FRAME differed — run-74 had measured each
  surface in isolation and missed the frame they sit in. Fixed
  TDD-first (550 → 563 unit, 70 → 74 e2e):
  **S75-1** `container-page` re-pinned as the reference's measured
  UNIVERSAL gutter (`max-w-7xl px-6 lg:px-16` — 1152px content @1440)
  — one rule aligned every consumer at once.
  **S75-2** the responsive header `h-16 lg:h-20` (64/80px) + the
  reference's main clearance `pt-20 lg:pt-24` + **the mobile panel
  moved INSIDE the fixed header element** (the reference's DOM order —
  flush below the bar at any clearance; the run-72
  solid-bar-while-open workaround retired; the bar stays transparent
  over the hero with the panel open, like the reference).
  **S75-3..9** the measured home/product/hero/footer geometry (tiles
  264px in gap-6 lg:gap-8, banner aspect-[21/9] md:aspect-[3/1] =
  1152×384, product gap-8 lg:gap-16 = 544px columns, hero h1
  leading-[1.1] mobile / 1.0 desktop with the md breakpoint, footer
  py-16 lg:py-24, the real WhatsApp brand glyph).
  **S75-10b (H-1)** `couponLabel`'s fixed branch rendered `$6.95 off`
  on a ৳ store (customer-facing cart/checkout/admin labels — the
  run-72 money sweep missed the seam); now formats through
  `formatMoney`. Plus the residual family: the Stripe Element
  appearance re-mapped to the current tokens, the admin charts' orange
  → taupe with ৳ axis ticks (was `$`), the 404 `Sparkles`, the favicon
  re-anchored, `aria-haspopup="menu"`, `splitWordmark`.
  The fixed surfaces re-measured byte-exact against the live
  reference (sections y:900/566/128px, tiles 264×198, shop h1 @y:176,
  panel @y:64 with 24px content padding, footer 96px).
  The four encoded traps:
  1. **Measure the shared frame, not just the surfaces.** Fourteen
     surface pins can all pass while the page gutter, the header
     height, and the section rhythm — the frame every surface sits in
     — quietly differ. Walk the WHOLE page (container classes, section
     paddings, grid gaps, clearance stacking) against the reference,
     not just the components you changed.
  2. **An element-level `px-*` on a `container-page` consumer LOSES to
     the container's own padding in stylesheet order** (both are
     utilities; the later-declared container rule wins). Consumers
     never redeclare horizontal padding — the gutter is single-sourced
     (the run-75 mobile-panel bug: `px-6` on the element rendered
     16px because container-page's `px-4` won).
  3. **A fixed-position parent changes everything for overlay
     children.** Moving the mobile panel inside the fixed header made
     it immune to the page-shell's content clearance — and retired a
     four-session-old workaround. When an overlay drifts relative to
     the bar, check WHO OWNS the positioning context before adding
     offsets.
  4. **The sandbox's system-thread budget can exhaust and masquerade
     as a code failure.** The temp-SQLite harnesses'
     `npx prisma db push` failed with `spawn EAGAIN` /
     `pthread_create: Resource temporarily unavailable` — abandoned
     agent-browser Chromium daemons held ~500 threads. Kill the
     daemons (`pkill -f .agent-browser/browsers`), re-run, and the
     suite goes green with zero code changes. Check
     `cat /proc/loadavg` (the total-threads figure) before blaming
     the harnesses.

- **Session 74 (run 74, session 3 of the ely-beauty repo): the
  measured-geometry parity cycle.** Gates on the pulled tree 536/536 ·
  69/69 all green. Deep audit 74-a (read-only, skills/ excluded):
  9/9 anchors PASS with 1 HIGH (dormant — the Stripe USD/BDT
  conflation) + 5 LOW + 4 INFO. The live reference re-measured
  surface-by-surface (agent-browser computed styles + VLM side-by-side):
  the catalog UNCHANGED (19 published products — 6 new rows are
  unpublished ৳0.1 drafts), but 14 geometry deltas fixed TDD-first
  (536 → 550 unit, 69 → 70 e2e):
  **S74-1** the hero: `h-screen min-h-[600px]` + the content column
  `max-w-3xl px-6` ON ONE ELEMENT (768−48 = 720px content — the exact
  width that wraps the 96px title to two lines like the reference's
  720×192 measurement; a max-w wrapper WITHOUT the padding lets the
  725px text fit one line and silently drops the wrap).
  **S74-2** the mobile panel: trimmed to the reference's SEARCH +
  4-links anatomy — and the retired Wishlist link was the codebase's
  ONLY /wishlist navigation (grep before removing a "redundant" link);
  the entry now lives in the footer SUPPORT column (every viewport).
  **S74-3** the shop pills: sharp 0-radius `py-2` (34px), the ACTIVE
  pill borderless solid text-background with NO thumbnail, inactive
  hairline+muted; a NATIVE `<select>` for sort (the reference's own
  element) in a hairline-bordered band; the page column's `gap-8` +
  the band's `mb-4` = the reference's 48px rhythm (mind the container
  gap when matching a measured margin).
  **S74-4** image aspects: card 1:1, tile 4:3, gallery 3:4 sharp on
  `bg-muted` — three different ratios on three surfaces, all measured.
  **S74-5** the purchase column: STACKED full-width — outlined ADD TO
  CART (transparent + 1px foreground border) above the filled BUY IT
  NOW (foreground bg, Zap icon), radius 2px, the heart below.
  **S74-11 (audit F-1, the HIGH)** the Stripe card path minted USD
  intents whose amount equaled the BDT poisha count (৳288 → $288.00):
  `STRIPE_BDT_PER_USD` gates the Card option (keys AND rate;
  `resolveStripeConfig().cardEnabled`), `stripeChargeAmount(totalPoisha,
  rate)` is the single conversion seam (mint + both verifies + the in-tx
  guard), the interface renamed to `amountUsdCents` (the conflation is
  now a type error), and the idempotency key hashes the CONVERTED amount
  (a rate change must mint a fresh intent, never replay a stale one).
  Traps encoded: (1) a previous run's MEASURED conclusion can be wrong —
  run-73 measured "pills match"; re-measurement found 0-radius vs
  rounded-full (keep the raw computed-style evidence in the plan table,
  and re-measure any pinned geometry at the start of a cycle);
  (2) an FX-denominated payment path on a re-skinned store must re-derive
  its currency semantics with the re-skin — the USD retrofit survived
  two runs unnoticed because it was dormant (no keys) and its unit tests
  mocked the intent; (3) full-page screenshots of FIXED-position headers
  paint the header where the viewport WAS (scroll state leaks into the
  capture — scroll to top before fullPage); (4) a lazy below-the-fold
  image reports naturalWidth 0 until scrolled — verify with a scroll
  before declaring it broken; (5) the VLM misreads ৳ as "LE" and
  reference-SPA lazy sections as "empty grids" — always confirm its
  claims against the DOM before acting on them.

## Appendix C — Quick Reference Card

```bash
# full gate chain (the only gate)
npm run lint && npm run typecheck && npm run typecheck:tests && npm run test && npm run build && npm run test:e2e

# db
npm run db:setup                 # push + idempotent seed
node -e "console.log(process.env.DATABASE_URL)"   # env-shadowing check

# e2e single spec / mobile regression
npx playwright test tests/e2e/mobile-navigation.spec.ts

# screenshots for docs (server on :3000)
npx tsx scripts/capture-screenshots.ts

# standalone smoke
npm run start & curl localhost:3000/api/health

# push (see docs/how-to-git-push-using-ssh-wrapper_SKILL.md)
python3 docs/ssh_git_wrapper_v3.py push origin main
```

Key files: `src/lib/demo-mode.ts` · `src/lib/settings-schema.ts` · `src/lib/db-path.ts` · `src/lib/money.ts` ·
`src/lib/order-money.ts` · `src/lib/rate-limit.ts` (incl. `clientIp`) ·
`src/lib/order-tracking.ts` · `src/lib/order-access.ts` ·
`src/lib/order-status.ts` · `src/lib/coupons.ts` (incl.
`couponRedemptionWhere`) · `src/lib/review-aggregate.ts` ·
`src/lib/auth-secret.ts` ·
`src/app/api/checkout/route.ts` · `src/components/store/mobile-nav.tsx` ·
`src/app/globals.css` · `prisma/seed.ts` · `tests/e2e/helpers.ts`

### Session 69 (run 70) — 2026-10-23 — the thirty-seventh remediation cycle: the fresh-clone recovery + the 404-hydration fix cycle

The FIRST findings-bearing src cycle in thirty-five sessions (the last
was session-34's catalog re-alignment). Deep audit 70-a: 9/9 anchors
PASS (the twenty-third consecutive clean audit; the conflict-marker
gate CLEAN on its eighth consecutive cycle) with ONE comment-only NIT
(S69-1) — and the run-70 parity grid, rebuilt from scratch with a NEW
404-route surface that no prior verification layer had ever visited,
caught a genuine functional defect (S69-2). The skills comparison
recorded the operator's dual-side curation: the clone's superset is
now **2809 = 2770 reference + 39 operator-owned** (the operator's
`7d5c83a` added skills/pdf-old-20260806 — markdown + .py/.sh/.js/.tex
scripts, fully fenced by the five-gate exclusion), and the operator
ALSO synced the reference repo to `bb2dc8e` ("update skills", 193
files) — the 20 previously-diverged shared files are now byte-identical
and the two skills-catalog md5s MATCH for the first time since the
divergence was recorded.

**Fixes:**

- **S69-2 (Medium, TDD):** the prerendered `not-found.tsx` shell baked
  no per-request CSP nonce into its script tags, so every hard 404
  logged a burst of ~16 CSP violations to the console and the route
  never hydrated — the exact class the (auth) layout documents, on a
  route no prior grid/e2e/a11y surface ever visited (the run-70 parity
  grid added a branded-404 check and its "zero console errors" gate
  localized all 16 violations to `/no-such-route-xyz`). Fixed the
  documented way: `await connection()` in `not-found.tsx` forces
  per-request rendering of `/_not-found` (the route table now shows
  `ƒ /_not-found`; the other 22 static shells unchanged; build green,
  zero prisma:error). Pinned TDD-first: the new seo-platform e2e test
  ("the branded 404 hydrates on the server") timed out RED on the
  pre-fix build and passed GREEN post-fix — 68/68 e2e (67 → 68).
- **S69-1 (NIT, comment-only):** `StripeAmountMismatchError`'s
  docstring claimed /api/checkout maps the in-tx throw to the
  "cart changed" copy — but only the PRE-TX amount drift returns that
  409; the in-tx throw is not a CheckoutError, so the route's
  fallback answers the generic customer-safe 500 copy. The corrected
  comment now states both mappings and why the tx still rolls back.

**Verification surfaces:** the rebuilt **67/67 parity grid** (45
static + 22 mobile, now including the branded-404 + 404-hydration
checks), the **agent-browser cross-check rebuilt at 55/55** (mobile
viewport asserted, full panel anatomy, scroll lock cycle, route-change
close, panel + desktop search flows, product-detail anatomy on the
cuid route, the 404 hydration, ZERO console/page errors), the **a11y
tree audit 48/48 CLEAN** (8 pages × 6 checks), gates green twice
(pulled tree and final tree: lint · typecheck · typecheck:tests ·
496/496 unit · build 22/22 static zero prisma:error · **68/68 e2e** —
the run doubling as the traffic generator: 5 orders / 17 reviews /
Damascus 413 / FREESHIP 1, all DB-verified). Sitemap/SEO
stricter-superset re-confirmed by source read on both sides; the live
reference stayed dark for the SIXTEENTH consecutive cycle (HTTP 503,
environmental).

**Screenshots:** the documented final-capture sequence on the
normalized DB (rm-before-reseed → one e2e as the traffic generator →
restore-demo-stock → the single cold capture after the 60s
login-limiter window): **25/25 green, zero failures** — **24/25
byte-identical**, the highest since the drift class was identified:
this run's e2e minted its orders on the SAME UTC day as the committed
ground truth, so the UTC-day drift class did NOT fire (12 and 14 back
at byte-identity). The sole delta: **03-product-detail, 527 px
(0.0148%) in the single documented 11-row review-ID band y1168-1178**
— this run's e2e-minted review row ("E2E Reviewer" @
2026-10-23T03:29:29Z vs the ground truth's `1792714509797` @
00:15:10Z), DB-exact.

**Lessons:**

1. **The never-visited-surface class.** Twenty-two consecutive clean
   audits and a 73-check grid can coexist with a broken route if no
   verification layer ever loads it — every prior grid pinned the
   pages the reference ships, and nobody hard-loads a 404. New
   verification surfaces should include the EDGE routes (404,
   error.tsx, malformed URLs), not just the catalog. The CSP-nonce
   hydration trap is not exclusive to form-bearing pages: a static
   shell that needs its Links to behave like the rest of the app must
   render per-request.
2. **The refs-change-on-rerender class (agent-browser).** Snapshot
   refs are re-minted on every re-render — a ref saved before a state
   change (panel open/close) goes stale and clicks the wrong element
   or times out. Toggles must use `find role … --name` and panel
   members must come from a scoped snapshot (`-s "[data-testid=…]"`)
   taken AFTER the state change, re-snapshotting at every step.
3. **The verifier-expectation family (script-side, zero repo
   impact).** `#new-arrivals` is the H2 id — the product cards live in
   the `section[aria-labelledby="new-arrivals"]` wrapper, so an
   id-scoped card query returns 0. The newsletter form lives on the
   HOME page, not the footer. The register heading is "Create Your
   Account". The panel search placeholder is "Search products..." WITH
   the ellipsis. The detail "Add to Cart" is a multi-match (purchase
   panel + related-product cards) — use `.first()` or scope. And the
   browser's own document-404 status log on a 404 test URL is correct
   behavior for ANY site — exempt exactly that message class on the
   404 route, nothing else.
4. **The same-UTC-day capture window.** The UTC-day drift class fires
   only when the capture crosses a day boundary from the ground
   truth's mint — capturing on the same UTC day returns 12/14 to
   byte-identity (24/25 this cycle, the highest since run 55). The
   e2e-as-traffic-generator + capture sequence inherits the current
   UTC day naturally; only cross-midnight runs legitimately diff.

Key files: `src/app/not-found.tsx` · `tests/e2e/seo-platform.spec.ts` ·
`src/lib/stripe-payment.ts` · `src/app/(auth)/layout.tsx` (the
documented pattern) · `scripts/capture-screenshots.ts` ·
`docs/session_130.md` · `research/parity-grid.mjs` (git-ignored) ·
`research/agent-browser-crosscheck.sh` (git-ignored)

### Session 70 (run 71) — 2026-10-23 — the thirty-eighth remediation cycle: the fresh-clone recovery + the clean-verification cycle

The operator's `e573a2a` added only `docs/session_131.md` (the run-70 raw
log) — `src/tests/prisma` byte-identical to `ff65bd2`. Every gate green on
the pulled tree (lint · typecheck · typecheck:tests · 496/496 unit · build
green zero prisma:error, 22/22 static · 68/68 e2e at 1.9m). Deep audit 71-a:
**9/9 anchors PASS, ZERO actionable findings — the twenty-fourth consecutive
clean audit**; the conflict-marker gate CLEAN on its **ninth** consecutive
cycle. The live reference stayed dark (HTTP 503 — the **seventeenth**
consecutive cycle, environmental). Zero changes in `src/`; the change-set is
the 1 traffic-owned screenshot (03-product-detail's review-ID band) + this
docs sweep.

**Lessons this cycle:**

1. **The combobox-vs-select class (verifier-side).** The products-page
   filters are Radix `Select` components — they render as
   `role="combobox"` BUTTONS carrying aria-labels ("Filter by category",
   "Sort products"), NOT native `<select>` elements. A verifier asserting
   `select` count > 0 phantom-fails a healthy page. Assert the aria-labels
   (or the combobox role), never the native tag.
2. **The static-responsive-pair class (verifier-side).** The mobile panel's
   `lg:hidden` CONTAINS the word "hidden" — a `\bhidden\b` regex
   false-matches it and phantom-fails the Tailwind v4 contract check. The
   v4 trap is about JS-TOGGLING display utilities; a static breakpoint
   pair never toggled by JS is the documented ALLOWED pattern. Assert the
   exact standalone token — `/(^|\s)hidden(\s|$)/` — plus the
   conditional-mount (absent-from-DOM-when-closed) behavior, which is the
   real contract.
3. **The page-aware landmark expectation (verifier-side).** The `(auth)`
   layout deliberately ships ONLY `<main>` (S47-1 — the reference's login
   carries no storefront chrome); a blanket banner+main+contentinfo check
   falsely fails login/register. Landmark expectations must be per-layout,
   not site-wide.
4. **agent-browser CLI lessons (the eval-quoting family).** `eval` output
   is JSON-QUOTED — `"mounted" !== mounted` in a shell comparison; strip
   the quotes before asserting. `find label` is AMBIGUOUS when two
   elements share an aria-label (the panel search and the desktop header
   search are both "Search products") — it fills the wrong one; drive
   such elements by their scoped-snapshot ref, re-parsed right before
   use. The a11y-tree snapshot hides input PLACEHOLDERS — eval the
   attribute instead. And `find role button box --name` returns empty —
   use `eval` + getBoundingClientRect for geometry. (Supersedes the
   run-70 refs-re-mint rule where they overlap: the named-find for
   toggles stays valid.)

Key files: `scripts/capture-screenshots.ts` · `docs/session_132.md` ·
`research/parity-grid.mjs` (git-ignored) · `research/a11y-audit.mjs`
(git-ignored) · `research/agent-browser-crosscheck.sh` (git-ignored)

- **Session 79 (run 79, session 13 of the ely-beauty repo): the
  overlay focus-management, fresh-sheet & body-hardening cycle.**
  Gates on the pulled tree 613/613 · 79/79 · clean build — all
  green (docs matched reality). Deep audit 79-a (read-only,
  skills/ excluded): **12/12 standing anchors PASS, 0
  CRITICAL/HIGH code defects** — 2 MEDIUM (the search overlay never
  restored focus on close — the focused input unmounts with the sheet
  and focus drops to <body>, unlike the CartDrawer's openerRef
  contract; and every JSON API route parsed `await request.json()`
  UNBOUNDED with the rate limiter engaging only AFTER a successful
  parse — oversized/garbage payloads were never metered and buffered
  whole into memory, 9 route files / 10 parse sites) + 5 LOW (no
  Tab-wrap on the overlay; the close button/input lacked the drawer's
  focus-visible treatments; the header search button carried neither
  aria-expanded nor aria-haspopup; AGENTS.md's kitchen-catalog
  fragment + stale rate-limit grid) + 6 INFO. The live re-measurement
  (both sites, both viewports, logged in) re-verified every pinned
  surface byte-exact — the operator's mobile-menu priority included
  (panel y:64 h:213, header 277/278, links 14px/1.4px @36px rhythm,
  SEARCH row) — and measured TWO new deltas on the search surface:
  **D-1** the row price rides the DISPLAY SERIF (the reference's
  computed "Cormorant Garamond", serif 14px/300 right-aligned on both
  viewports; the clone kept text-sm font-light but rode Inter — the
  ฿-vs-$ currency stays the standing S77 deviation) and **D-2** the
  reference RESETS the overlay on close/reopen (query "" + 0 rows +
  focus on the input; the clone persisted the previous query/results
  because the never-unmounted component never reset — its comment
  even claimed "re-mounts fresh", describing the reference, not the
  component). Fixed TDD-first (RED 12 → GREEN; 613 → 634 unit,
  79 → 82 e2e): `font-display` on the price span; the reset rides
  the render-time prev-open adjustment (the react-hooks/set-state-in-
  effect-clean form lint enforces — setState during render, React's
  "storing information from previous renders"); openerRef capture +
  restore on close; the drawer's Tab-wrap keydown handler scoped to
  the overlay; focus-visible rings on the close button + input;
  aria-expanded/aria-haspopup="dialog" on the header button; and the
  bounded `parseJsonBody` seam (`src/lib/json-body.ts`: content-type
  gate, declared-length fast-fail, streamed-read cancel past 32KB,
  null-for-malformed keeping the routes' exact 400 envelope) with the
  per-route limiters moved BEFORE the parse on all 9 JSON routes.
  **A finding retracted live**: the drawer's wrap selector READ as
  `aref]` through the bash output pipeline — byte-level verification
  (`'aref]' in src` → False) proved the file always carried
  `a[href]`; the "corruption" was the `[h`-eating display artifact the
  run-78 log had already recorded. The layout-tokens pin stays as a
  regression guard. **A latent TEST flaw surfaced and fixed**: the
  api-boundaries `post()` helper put the per-test IP in the LEFTMOST
  (spoofable) xff hop — every request funneled into ONE shared
  198.51.100.1 bucket, masked by the old parse-before-limit order
  (invalid bodies never reached the limiter); with the limiter first,
  garbage IS metered, so the helper now puts the per-test IP in the
  RIGHTMOST (trusted) hop the clientIp contract actually reads.
  **Encoded traps**: (1) Verify source bytes with the Read tool or a
  Python probe — the bash display pipeline eats `[h`-shaped
  fragments and mangles selectors; a hand-transcribed "repro" of a
  mangled string proves nothing about the file. (2) Parity includes
  state lifecycles, not just geometry — the reference's reset-on-
  reopen was invisible until close/reopen was actually exercised.
  (3) `react-hooks/set-state-in-effect` is right: prop-change resets
  belong in the render-time adjustment pattern, not effects. (4)
  Reordering a limiter before a parse changes which requests consume
  budget — audit every test that shares an IP bucket when you do it.
  (5) The reference's footer SHOP column links legacy slugs
  (skincare/body_care) its own Category API doesn't know — the
  clone's working-links superset is the deliberate deviation.

- **Session 78 (run 78, session 12 of the ely-beauty repo): the
  search-overlay reachability & micro-parity cycle.** Gates on the
  pulled tree 599/599 · 77/77 · clean build — all green (docs matched
  reality). Deep audit 78-a (read-only, skills/ excluded,
  web-application + code-review-checklist methodology): **9/9 anchors
  PASS, 0 CRITICAL/HIGH code defects** — 3 MEDIUM (the overlay's
  result list had NO scroll container: ~784px of rows over a 664px
  viewport with nothing scrollable; the store-provider scroll-lock
  comment claimed "any overlay" while the code locked panel+drawer
  only; CLAUDE.md still said "74 e2e") + 4 LOW (the overlay's missing
  dialog semantics/inert; two stale backdrop-blur-sm comments; the
  undocumented eslint-chain moderates in the audit ledger; the
  half-repaired S76-9 historical line) + 1 NIT accepted (LIKE
  wildcards unescaped — the LIVE reference behaves identically, so
  escaping would diverge; parameterized + take-8 bounded).
  The live re-measurement (both sites, both viewports) re-verified
  every S75/S76/S77 pinned surface GREEN byte-exact (the operator's
  mobile-menu priority included: panel y:64 h:213/214, 4×14px links
  @36px rhythm, SEARCH row, toggle/navigate-close) and measured FOUR
  new deltas on the search surface: **D-1** the list container (the
  reference's `mt-6 space-y-1 max-h-[60vh] overflow-y-auto` —
  scrollH 668 vs clientH 506 with 8 rows), **D-2** the 1-char floor
  (the reference returns its capped 8-row set for "e"), **D-3** the
  rows' 2px corners (its `rounded-md` computes to 2px under the shadcn
  radius scale), **D-4** the no-results copy (`No products found for
  "zzzzq"`). Fixed TDD-first (RED 12 → GREEN; 599 → 613 unit, 77 →
  79 e2e): the list gained `mt-6 flex flex-col gap-1 overflow-y-auto
  max-h-[60vh]` (byte-exact: both sites 506.4px cap, 668/506 scroll
  geometry), the floor dropped to ONE character (route `!q` + overlay
  `< 1`), the rows gained `rounded-[2px]`, the copy matched, and the
  overlay gained `role="dialog"` + `aria-modal` with StoreChrome's
  shell inert widened to `cartDrawerOpen || searchOverlayOpen` (the
  invisible a11y superset — the reference ships no dialog semantics;
  the overlay renders OUTSIDE the inert shell). The overlay still
  deliberately does NOT lock body scroll (the recorded reference
  deviation — session-10; the comment now states the real contract).
  **Encoded traps**: (1) A full-screen overlay needs its OWN scroll
  surface — `fixed inset-0` never scrolls and the page behind it does
  not move it; cap the list (max-h-[60vh]) and let it scroll itself,
  exactly like the reference. (2) Parity includes FAILURE copy and
  INPUT FLOORS, not just happy-path geometry — the reference's
  1-char typeahead and its no-results verb were invisible until
  measured. (3) Tailwind radius scales are theme-relative: the
  reference's `rounded-md` = 2px (shadcn `--radius .25rem` − 2px)
  while v4's default `rounded-md` = 6px — pin MEASURED pixel values
  (`rounded-[2px]`), not scale names, when the themes differ. (4)
  Comments quoting retired class names (`backdrop-blur-sm` after the
  xs refinement) are prose-scan landmines — the S78-6 pin now forbids
  them in the chrome sources.

- **Session 77 (run 77, session 10 of the ely-beauty repo): the
  search-overlay parity & dependency-hygiene cycle.** Deep audit 77-a:
  9/9 anchors PASS, 0 critical code defects — the real findings were
  dependency health (next 16.4.0's 3 critical CVEs; the accepted zod
  risk), the push-target cluster stale at TWO generations (the wrapper's
  DEFAULT_REMOTE pointed at task-management; the runbook override taught
  homenest-store-s — an operator following the docs verbatim pushed to
  the wrong repo), and docs-truth residue (CLAUDE.md's stale test
  counts, the "16-product catalog" claim vs the actual 19, the plan's
  "21 products"). The live re-measurement found ONE delta family: the
  search surface. **Encoded traps**: (1) Tailwind v4's `backdrop-blur`
  scale is RENAMED from v3 — the reference's `backdrop-blur-sm`
  (4px) is the clone's `backdrop-blur-xs`; v4's `sm` is 8px. Measure
  the computed `backdrop-filter`, not the class name. (2) Playwright's
  `devices["iPhone 13"]` viewport is 390×**664** (the visible-viewport
  approximation), not the 390×844 screen — pin overlay geometry against
  `page.viewportSize()`, never the memorized screen size. (3) A
  source-pin comment must not QUOTE the retired pattern it forbids
  (`top-16`, the removed component's name, the bare constructor) — the
  negative `not.toContain` matches prose as readily as code (the
  run-76 guard-comment class, again). (4) An ordering change in a
  search API is a test-fixture blast radius: the e2e frame tests
  resolved "any in-stock product" via `q=silk` + `results[0]`; the
  authored-order flip made results[0] the SOLD-OUT bonnet. Resolve
  test fixtures with single-hit terms (`q=pillowcase`), not
  first-result assumptions. (5) `npm audit fix` (no --force) is the
  safe lane: in-range bumps only; the breaking-major fixes (zod 4,
  vitest 5) are deliberate epics, not drive-by upgrades — record the
  accepted risks in a ledger (AGENTS.md), not in silence.

- **Session 80 (run 80, session 15 cycle of the ely-beauty repo): the
  overlay empty-state, no-results centering & webhook raw-body cycle.**
  Gates on the pulled tree 634/634 · 82/82 · clean build — all green
  (docs matched reality; the fresh-clone environment rebuilt: the
  DATABASE_URL ambient shadow converged via the documented symlink,
  AUTH_SECRET generated, db:setup re-run). Deep audit 80-a (read-only,
  skills/ excluded): **12/12 standing anchors PASS, 0 CRITICAL/HIGH
  code defects** — 1 LOW (the Stripe webhook buffered the full body
  before signature verification: unbounded request.text() on an
  unauthenticated, unmetered route — memory-amplification DoS on a
  Stripe-configured deploy; the S79-7 seam's stated goal unmet on
  this one path) + 3 INFO (npm-audit family phrasing; LIKE wildcards
  — documented accepted parity; the two window-scoped Tab-wrap
  listeners — unreachable double-open through the inert shell). The
  live re-measurement (agent-browser, logged in, 390×844 + desktop):
  every S74..S79 pinned surface re-verified GREEN (the mobile panel
  y:64 h:214 rows @36px rhythm; the overlay Cormorant input + serif
  price + fresh-sheet + 60vh cap; the detail-page Inter 24px ৳ price;
  the shop pills) and **the shop catalog order re-verified 19/19
  positions identical to the seed's authored order — the run-79
  "re-baseline if the reference re-orders" concern closed**. TWO new
  deltas measured on the reference's EMPTY/FAILURE states: D-80-1 the
  empty-query hint (Start typing to search our collection,
  text-sm text-muted-foreground py-8 text-center, 14px centered —
  the clone rendered NOTHING on empty) and D-80-2 the no-results
  copy's exact bytes (straight ASCII quotes codepoint 34, NO
  trailing period, the SAME centered py-8 family — the clone's
  curly quotes + period + left-aligned pt-4 were the un-measured
  residue). Fixed TDD-first (RED 16 → GREEN; 634 → 650 unit, 82 → 85
  e2e): the hint gated on the query (fresh open AND the fresh-sheet
  reset land on it; gone the moment the query is non-empty), the
  codepoint-exact no-results copy (the &quot; entity renders the
  straight quote — react/no-unescaped-entities forbids the raw form
  in JSX text), and the bounded readRawBody seam (64 KB cap:
  declared content-length fast-fail + streamed byte-count cancel
  mid-read, string | null → 400 "Payload too large." feeding
  constructEvent; the only sanctioned request.text() site is the
  seam module itself). Docs: AGENTS.md (the S80 contract lines + the
  raw-body seam note + the 2..80 range), CLAUDE/README (650/85),
  PAD v2.8, SKILL v2.8.0, REMEDIATION_PLAN Session 80, session_16,
  worklog Task 74. 25 dev-server screenshots regenerated + validated.
  **New traps encoded**: (1) the [h-eating bash display artifact
  struck AGAIN in this session's own probes — a codepoint-level
  probe (JSON.stringify + codePointAt listing) is the only
  trustworthy form for verifying quote-bearing strings; (2) parity
  includes the EMPTY state, not just results and failure copy —
  measure what a surface renders at its zero-content state; (3) a
  Request body can be read once — tests that exercise a body seam
  twice must mint two Request objects (ReadableStream is locked
  after the first read); (4) react/no-unescaped-entities forbids raw
  quotes in JSX text — the &quot; entity renders the identical
  codepoint, and source pins must assert the entity form.

- **Session 81 (run 81, session 17 cycle of the ely-beauty repo): the
  category-model, dual-filter & one-page-grid cycle.** Gates on the
  pulled tree 650/650 · 85/85 · clean build — all green (docs matched
  reality). Deep audit 81-a (read-only, skills/ excluded): **12/12
  standing anchors PASS, 0 CRITICAL/HIGH/MEDIUM code defects** — 3 LOW
  (the webhook's bare JSON.parse(meta.shipping) escaping to the outer
  catch → transient misclassification → 500 + Stripe retry loop with no
  StripeEvent refund trail; three stale comments — the
  parseDollarsToCents "no production module imports it" claim that
  product-dialog/coupon-dialog/settings-form all falsify, the
  track-order "sequential" comment contradicting the ELY- crypto-random
  numbers, the rate-limit "rejected requests do not extend the count"
  wording; the readBodyTextBounded no-stream fallback capping UTF-16
  code units, not bytes) + 2 INFO (the no-results-during-debounce
  window = documented reference parity; the dependency ledger
  unchanged). Run-80's S80-1/2/3 all verified regression-free. The
  live re-measurement (agent-browser, logged in, both viewports)
  re-verified every pinned surface AND — reading the reference's
  public entity API with the operator's session — captured its
  authoritative category model: the dual-system fix landed TDD-first
  (RED 33 → GREEN): the ProductCategory junction + templateCategory,
  the reference's exact memberships (Beauty Tools 7 incl. the
  dual-member cleansing brush, Brush & Combs 3, Bestsellers 4, Gift
  Sets 0, six uncategorized), resolveCategoryFilter's dual mode
  (display-slug → junction filter + the category name as h1;
  anything else → template equality + h1 "Shop" + no active pill),
  the nav + footer template links (Beauty Tools →
  ?category=skincare, Brush & Combs → ?category=body_care, the
  footer's Skincare/Body Care/Gift Sets), the detail eyebrow
  ("skincare"/"lip care", underscores → spaces), the 3-newest-
  excluding-self "Complete the Ritual", PER_PAGE 24 (the one-page
  grid — the reference renders all 19 with no pager), the centered
  Cormorant empty state ("No products found" 24px/300 +
  "Check back soon for new arrivals."), the banner CTA → plain /shop,
  the guarded parseShippingMetadata seam, the byte-counting
  no-stream fallback, and the admin multi-select (checkbox group,
  zero-or-more categories, junction writes inside the product
  transaction; restore-demo-stock rebuilds seed wiring as the e2e
  backstop). 677/677 unit · 88/88 e2e · clean build; the mobile panel
  re-verified byte-exact ±1px with the new links; 25 dev-server
  screenshots regenerated + validated. Docs: AGENTS.md (the S81
  contract lines + the 2..81 range), CLAUDE/README (677/88), PAD
  v2.9, SKILL v2.9.0, REMEDIATION_PLAN Session 81, session_18,
  worklog Task 75. **New traps encoded**: (1) the reference's own
  public entity API (readable with the operator's logged-in session)
  is the authoritative source for DATA-MODEL parity — link-color
  probing found the shape, the API confirmed it exactly; (2) a
  destructive schema change (FK → junction) flows through the
  documented `db:push --accept-data-loss` + a reseed that rebuilds
  the wiring — the convergence path IS the migration story; (3) a
  two-request nonce probe proves nothing (each request mints its own
  nonce — compare header and body from ONE request); (4) a wedged
  dev-server/browser pair (Fast Refresh loop, scripts never
  hydrating) is a tooling artifact — restart both before suspecting
  the code (the production build's e2e is the truth); (5) an e2e
  that MUTATES demo data must self-revert AND ride a restore-script
  backstop, or suite re-runs poison their own pins.

- **Session 82 (run 82, session 19 cycle of the ely-beauty repo): the
  overlay price-format parity & admin-undo cycle.** Fresh-clone
  workspace (npm install, .env with a generated AUTH_SECRET, db:setup,
  the ambient DATABASE_URL shadow converged via the documented
  symlink); gates on the pulled tree 677/677 · 88/88 · clean build —
  all green (docs matched reality). Deep audit 82-a (read-only
  subagent, web-application + code-review-checklist methodology,
  skills/ excluded): **12/12 standing anchors PASS, 0
  CRITICAL/HIGH/MEDIUM code defects** — 3 LOW (the ProductCategory
  schema comment claiming "Both FKs Restrict" while productId is
  declared Cascade; the seed CATEGORIES comment still claiming "the
  clone links the real slugs" — contradicted by the S81-3 template
  links; the admin dialog's Radix Select having NO deselect path — a
  set template category was irrevocable through the UI) + 8 INFO
  (incl. the unordered categories[0] reads behind firstCategoryName —
  JSON-LD/dashboard/analytics nondeterminism for the dual-member
  product; the unmapped P2003 in upsertProductAction's catch; the
  non-transactional double-reading restore-script wiring rebuild;
  the sets empty-grid confirmed on the live reference as
  parity-intentional). The live re-measurement (agent-browser 0.41.1,
  logged in, mobile 390×844 + desktop 1440×900): every S74..S81
  pinned surface re-verified GREEN (the mobile panel byte-exact ±1px
  — rows 89/125/161/197/233 vs the clone's 88/124/160/196/232, the
  template links, toggle-close, SEARCH-row → overlay, route-change
  close; the overlay anatomy; the shop 19/19 authored order; the
  detail ৳370 Inter 24px/600 + "skincare" eyebrow; "Complete the
  Ritual" = Bonnet/Curler/Bamboo Square; the footer slugs) AND
  **measured ONE new delta (D-82-1): the overlay row price renders
  the Base44 template's USD format — "$370.00" (ASCII U+0024,
  codepoint-verified, always two decimals) in the Cormorant
  14px/300** — while the reference's grid/detail prices stay ৳. The
  prior "font-light ৳ price" pin had imputed the grid currency. The
  fix landed TDD-first (RED 15 across 4 files → GREEN): the pure
  `formatOverlayPrice(cents)` in `src/lib/money.ts` consumed ONLY by
  the overlay's result rows (every other money surface keeps
  formatMoney's ৳), the admin "None" option through the pure
  `normalizeTemplateCategory` seam (`src/lib/validation.ts`) with
  the detail-eyebrow fallback e2e, the ordered `productCategoryInclude`
  (`satisfies Prisma.ProductInclude` — a readonly `as const` orderBy
  array is REJECTED by Prisma's include type, the GREEN-phase
  typecheck catch), the P2003 branch in upsertProductAction
  (isForeignKeyViolation, the S17-1 pattern), the transactional
  single-read restore-script rebuild, and the two comment
  corrections. Result-set parity confirmed: "silk" → the same 4
  products in the same order on both sites. 691/691 unit (+14) ·
  90/90 e2e (+2) · clean build; 25 dev-server screenshots
  regenerated + validated; .env.example re-verified (no new env
  vars). Docs: AGENTS.md (the S82-1 price contract + the 2..82
  range), CLAUDE/README (691/90), PAD v2.10, SKILL v2.10.0,
  REMEDIATION_PLAN Session 82, session_20, worklog Task 76.
  **New traps encoded**: (1) a prior session's PARITY PIN can carry
  an imputed value — when a pinned surface's bytes disagree with a
  fresh codepoint-level measurement, the live bytes win (re-verify
  the pin's provenance before "restoring" it); (2) `as const` on a
  Prisma include breaks the moment it carries an orderBy — readonly
  arrays are rejected by ProductInclude; `satisfies
  Prisma.ProductInclude` keeps the literal shape AND validates it;
  (3) an e2e pin asserting a DISPLAYED CURRENCY must pin the
  codepoint, not the glyph — the $/৳ distinction is invisible in a
  screenshot diff and both render in most console fonts; (4) the
  overlay's `<ul>` list container broke a div-scoped measurement
  probe — scope DOM probes to the element you verified exists, and
  re-snapshot before trusting an empty result.

- **Session 83 (run 83, session 20 cycle of the ely-beauty repo): the
  e2e concurrency-isolation & USD-remnant cycle.** The gates
  re-validation on the pulled 3d567ad tree reproduced a 2-of-6-runs
  e2e flake (2 failures × 2 full-suite runs, both victims green in
  isolation and on the following runs) — the cycle's discovery.
  Root-caused with full error evidence + the read-only audit 83-a's
  independent verification into THREE failure modes: (1) the admin
  products search is a native GET form, and the spec's four
  search-then-click sequences clicked the Edit button (a client
  island) while the Enter-triggered navigation was still in flight —
  the click landed on the outgoing document or the new one
  pre-hydration, the dialog never opened, and the test aborted
  MID-MUTATION; (2) the two Gua Sha tests hold OBSERVABLE WINDOWS on
  the shared SQLite DB (S81-11 adds the Bestsellers dual membership —
  bestsellers 4→5 for the test's public-page verification navigations;
  S82-3 clears the template category — skincare 12→11) that
  fullyParallel storefront count pins land inside; (3) both tests
  full-row-upsert the SAME product through upsertProductAction (the
  action always writes templateCategory AND rebuilds the membership
  junction from the dialog's snapshot), so concurrent saves silently
  revert each other's axis. An aborted revert leaves durable dirt
  until the next fresh-server restore (the backstop runs only at
  webServer start; CI's workers: 1 masked the whole class). The fix
  set (S83-1..S83-5, TDD-first, RED 7 → GREEN): the serialized
  admin-catalog Playwright project (workers: 1, testMatch
  admin.spec.ts, excluded from desktop-chromium — projects run
  sequentially so the mutations execute alone after every reader);
  the gated searchProductsAndOpenDialog helper (waitForURL on the
  form-GET q= URL + the html[data-hydrated] sentinel before the Edit
  click — the gotoHydrated convention applied to the post-Enter
  navigation); the S81-11 self-heal opening (heals a leftover
  Bestsellers membership before pinning the seed shape — verified
  end-to-end: dirt seeded → heals + passes → post-run state
  seed-clean); the analytics inline select's nested orderBy (the one
  surface the S82-4 determinism fix never reached, plus the
  products.ts comment correction); and the USD/US remnant sweep (the
  dead United States fallbacks in the addresses POST + the account
  snapshot display, the $0.00 AOV zero-state → formatMoney(0)). The
  live reference re-measured: ZERO new parity deltas (the mobile
  panel ±1px on both sites, the overlay $X.00 rows byte-exact, the
  shop/detail/footer surfaces holding). Gates: lint ✓ · typecheck ✓ ·
  typecheck:tests ✓ · 698/698 unit (+7: the e2e-infrastructure pins
  ×3 + the analytics/USD-remnant pins ×4) · clean build ✓ · 90/90
  e2e ×3 consecutive full-suite runs. Docs: PAD v2.11, session_22,
  worklog Task 77, AGENTS/CLAUDE/README counts + the e2e-ordering
  note, REMEDIATION_PLAN Session 83.
  **New traps encoded**: (1) a native-GET form's Enter navigation
  needs the SAME hydration gate as gotoHydrated before clicking a
  client island — Playwright's actionability checks do not cover
  React hydration, and an assertion (auto-retrying across the
  navigation) is safe where a click is not; (2) a shared-DB e2e
  suite's MUTATION WINDOWS are concurrency hazards for every parallel
  count pin — serialize the mutating spec into its own project
  (projects run sequentially) rather than weakening the pins; (3) a
  full-row upsert makes same-entity tests clobber each other under
  fullyParallel (each save carries its own stale snapshot of ALL the
  axes) — the same-product constraint is invisible until two tests
  touch the same row; (4) CI's workers: 1 can mask an entire
  local-only flake class — a suite green in CI is not evidence of
  determinism on multi-worker runs; (5) a source-pin test forbidding
  a string must not quote that string in the FIXING comment (the
  comment re-introduces the match).

- **Session 84 (run 84, session 22 cycle of the ely-beauty repo): the
  overlay-input parity & self-heal-closure cycle.** Gates re-validation
  all green on the pulled tree (90/90 e2e on the FIRST run — run 83's
  serialized admin-catalog project holding). Deep audit 84-a: 12/12
  standing anchors PASS, 0 CRITICAL/HIGH, 1 MEDIUM (M-1: the self-heal
  discipline asymmetric — reused-server dirt met the storefront readers
  before admin-catalog could heal; S82-3 lacked the per-test heal),
  1 LOW (L-1: dollar-worded copy that survived the S83-5 USD sweep),
  3 INFO. Live-reference re-measurement: every pinned surface GREEN,
  zero deltas — plus TWO new micro-deltas measured on the overlay
  INPUT (D-84-1: the reference's font-light — computed 300 on both
  viewports — vs the clone's default 400; D-84-2: the reference's
  /60-dimmed placeholder vs the clone's full opacity) and one found on
  the clone (S84-1b: Chromium's native search-cancel glyph, pixel-
  cluster evidence at x300-309 @390px — the reference's plain-text
  input renders nothing there). The fixes (TDD, RED 5+1 → GREEN): the
  input's font-light + placeholder /60 (one line), the cancel-button
  suppression (scoped globals.css rule; type=search stays for the
  searchbox role), the globalSetup heal (probes :3100, restores the
  catalog BEFORE any project when a server is already listening —
  verified end-to-end: dirt LIVE on the reused server → 22/22 →
  seed-clean), the symmetric S82-3 opening heal, and the taka rewording
  (validation.ts ×4 + coupon-dialog ×2 + comments). Suite 698 → 704
  unit; 90/90 e2e ×3 consecutive. Encoded traps: (1) a parity sweep is
  only as complete as its MEASURED axes — the overlay input's weight
  and placeholder opacity were never compared across five cycles of
  overlay pins (sizes, leadings, and geometry were); add the axis to
  the pins the moment it is measured; (2) `reuseExistingServer` skips
  the webServer COMMAND entirely — any heal wired into the command
  never fires on a reused server; harness-level heals belong in
  globalSetup, not the webServer command; (3) a native widget glyph
  (search-cancel button) is invisible to every DOM-level pin —
  pixel-cluster analysis of a screenshot is the evidence form that
  catches it; (4) worded-copy remnants survive literal-grep sweeps
  (the S83-5 patterns matched strings, not phrasing) — sweep the
  CONCEPT (currency wording), not just its symbols.

- **Session 85 (run 85, session 24 cycle of the ely-beauty repo): the
  admin taka-copy completion & comment-scope cycle.** Gates
  re-validation all green on the pulled tree (704/704 unit, 90/90 e2e
  on the FIRST run). Deep audit 85-a: 12/12 standing anchors PASS, the
  run-84 change-set all correct, 0 CRITICAL/HIGH/MEDIUM — 2 LOW
  (L-1: the dollar-worded admin copy surviving BOTH the S83-5 and
  S84-4 sweeps — product-dialog's labels/errors and settings-form's
  error/helpers; L-2: the S84-1b comment's "nothing else uses them"
  claim — three admin GET-form search inputs share type=search), 3
  INFO (the restore script's independent db-path pin; two
  dollar-worded code comments). Live-reference re-measurement: every
  pinned surface GREEN, ZERO new parity deltas; the clone probe
  byte-parity on both viewports with the S79-4 focus-visible ring's
  first positive visual evidence (the a11y superset caught at a
  lenient <180 gray threshold — run-84's <120 threshold missed the
  ≈125-gray ring; not a delta). The fixes (TDD, RED 4 → GREEN):
  S85-1 the product dialog's two labels + two parse errors → taka,
  S85-2 the settings form's threshold error + three helpers → taka,
  S85-3 seven comment rewordings (the concept census the S84-4
  trap-4 lesson demanded — sweep the CONCEPT, not the symbols:
  the settings doc comment, the coupons page display note, the
  checkout zero-line guard, the cart-quantity zero-item note, the
  money alias doc, the SEO converter doc, the coupon type-switch
  hazard example), S85-4 the globals.css suppression comment stating
  its real app-wide scope (admin search inputs covered deliberately;
  no rule change), S85-5 AGENTS.md's DATABASE_URL contract naming
  scripts/restore-demo-stock.ts as the second lockstep site of the
  db-location truth. Suite 704 → 708 unit; 90/90 e2e ×2 consecutive
  (3 green runs total counting the prior session's post-fix run on
  the identical change-set — the workspace was recycled mid-cycle and
  the change-set re-landed on a fresh clone with every gate
  re-verified). Encoded traps: (1) a copy sweep scoped to one dialog
  (S84-4b fixed only coupon-dialog) leaves the sibling dialogs
  carrying the same heritage — sweep the whole UI family, not the
  file the audit happened to name; (2) an internal-name-keeping
  reword (the *Dollars fields, parseDollarsToCents, centsToDollars)
  must RECORD the heritage in the fixing comment, or the next sweep
  re-flags it; (3) a CSS rule's blast radius extends past the surface
  it was written for — app-wide selectors deserve an app-wide scope
  note naming every covered surface; (4) a sandbox recycle mid-cycle
  is survivable when the change-set is fully documented — re-land,
  re-run every gate, and count only the re-verified runs as evidence.

- **Session 86 (run 86, session 27 cycle of the ely-beauty repo): the zod
  3→4 migration cycle.** The standing deferred debt (deferred since S27)
  retired, driven by the unpatchable HIGH advisory GHSA-mrhx-c7xc-m3w5
  (memory exhaustion validating oversized constrained collections —
  fixed only in zod ≥4.6.7; v3 is end-of-line; zod is a prod-direct
  dependency). Audit 86-a: 12/12 standing anchors PASS, run-85
  regression-free, 0 CRITICAL code defects — 1 HIGH (the advisory), 2
  LOW (the HomeNest kitchenware placeholder trio; the dead exports
  stripePublishableKey + ROLES), 6 INFO. The exhaustive zod census
  (runtime-probed against the installed package's v4 build before the
  bump): exactly one hard break — stripe-payment's single-arg
  `z.record(z.string())` — plus three deprecation classes
  (`.email()` ×1, `{ message: }` refine/enum params ×3,
  `z.ZodIssueCode.custom` ×3) and v4's rewritten DEFAULT texts for
  un-messaged checks; `.default()` chain semantics changed but all 30
  repo sites probed value-identical. Live-reference re-measurement
  (both viewports, logged in): every pinned surface GREEN, ZERO new
  parity deltas — plus two a11y supersets recorded, not reverted (the
  state-aware menu-toggle label; the overlay rows as real Link hrefs).
  The fixes (TDD, RED 4 → GREEN; 708 → 717 unit; 90/90 e2e ×2
  consecutive): S86-1 `npm install zod@^4.6.7` + the two-arg z.record
  fix + the v4 sentinel pin (`typeof z.email === "function"`) + the
  first webhook-metadata test (the dormant-break repro), S86-2 the
  deprecation modernization (the emailSchema pipe restructure,
  probe-verified message-identical across the full battery;
  ZodIssueCode → "custom"; {message:} → {error:}), S86-3 the
  message-policy acceptance DOCUMENTED (the ~50 un-messaged backstop
  checks keep v4 defaults: both v3/v4 texts are technical zod-speak,
  11 form files carry client maxLength caps, the checkout's three raw
  inputs are the only uncapped surface, zero test pins existed),
  S86-4 the kitchenware placeholder trio → the store's own conventions
  (rosehip-glow-serum / ELY-020 / bamboo spec lines), S86-5 the dead
  exports deleted (typecheck as the pin), S86-6 the BD-localization
  copy (the account phone → +880 1712 345678; the order dialog →
  Pathao, RedX, Sundarban… + a format-neutral tracking dummy). The
  zod advisory GONE from npm audit (the remaining 11 = the accepted
  dev-only families). Encoded traps: (1) a census probed against a
  PREVIEW subpath (zod/v4 inside 3.25.76) can mis-predict the shipping
  major — the single-arg z.record mis-binds to the KEY position and
  throws at parse in the preview, but 4.6.7 keeps it as deprecated
  v3-compat; fix to the two-arg idiom anyway (deprecated single-arg
  invites the v5 removal) and pin the BEHAVIOR, not the crash mode;
  (2) dormant breaks evade tests whose fixtures never exercise the
  branch — no earlier webhook test event carried metadata, so the
  record schema's parse path was never executed; the metadata pin is
  the repro; (3) a stale standalone server + a rebuilt .next/ means
  in-memory server code serving mismatched on-disk client chunks —
  hydration error states that look exactly like a code regression
  (the e2e suite, which spins its own fresh server, staying green is
  the differential that localized it); kill by PID (ss -tlnp), not by
  pattern-guess pkill; (4) a major-version bump rewrites default
  error texts — decide the message policy EXPLICITLY and record the
  rationale; the explicit messages are the migration's real contract.

- **Session 87 (run 87, session 29 cycle of the ely-beauty repo): the
  lost-config build-resilience cycle.** The operator handed over
  `docs/build_error.txt` — a Next 16.4.5 Turbopack build dying with 312
  module-not-found errors (311 `@/`-alias imports + `tw-animate-css`) and 15
  `@apply`/`@utility` "Unknown at rule" warnings — while the repo itself was
  green on a fresh full clone (lint/typecheck/typecheck:tests/717 unit/build
  all pass). The diagnosis discipline that found it: (1) trust the repo
  first — verify the reported-missing files are tracked (they were), so the
  failure is environmental; (2) build a scenario matrix with ONE shared
  install (`cp -al` hardlink copies) and bisect the signature — minus
  tsconfig.json → exactly the 311 `@/` errors; minus postcss.config.mjs →
  the @apply warnings + the tw-animate-css error; minus both → the
  operator's log reproduced signature-for-signature; (3) rule out the
  plausible-but-wrong theories by DIFFERENT signature, not by argument —
  `npm ci --omit=dev` hard-fails EARLY on the missing `@tailwindcss/postcss`
  plugin (1 error, not 312) and still installs typescript via prisma; the
  Next 16 `find-root.js` workspace-marker root inference loses to our
  `outputFileTracingRoot` pin and logs root warnings absent from the
  operator's log. The mechanism: their tree materialization drops files
  untouched since the 2026-10-12 initial migration — exactly the two
  build-critical root configs (tsconfig.json, postcss.config.mjs), while
  everything recently modified (package.json, next.config.ts, src/**)
  survived. The fix must therefore LIVE IN THE SURVIVORS: (1)
  `turbopack.resolveAlias` carries the `@/*` alias in next.config.ts itself
  (matrix-verified 311→0 — Turbopack reads aliases from root config, while
  bare node_modules imports keep resolving file-relative, which is why ONLY
  `@/` imports died); (2) a fallback registry
  (`scripts/ensure-build-configs.mjs` CONFIG_FALLBACKS — write-if-missing-or
  -empty, NEVER overwrite) embedding the five 2026-10-12-vintage configs,
  each canonical file carrying a header comment naming its restore path
  (documentation + the recency hedge); (3) the seven gated npm scripts chain
  the bootstrap first. The drift alarm is the TDD pin
  (tests/unit/build-config-resilience.test.ts, 8 tests: registry↔canonical
  byte-sync + temp-dir restore behavior + the script chain). Acceptance
  beyond the gates: 4/4 poison-tree builds GREEN on fresh installs —
  including the operator's exact both-missing tree — with the restored
  tsconfig byte-identical and the standalone server's 92KB CSS carrying
  compiled `@apply` output (the real proof the tailwind pipeline survived).
  Lessons: (a) a wall of module-not-found errors pointing at FILES THAT
  EXIST IN THE REPO is a checkout-integrity signal, not a code signal —
  verify tracked-ness before touching code; (b) reproduce the operator's
  environment as a matrix of minimal deltas; one shared install +
  hardlinked variants makes each probe a 90-second build; (c) resilience
  belongs in the files proven to survive the failure; (d) two sources of
  truth (canonical + registry) demand a pin, or they WILL drift.

- **Session 88 (run 88, session 30 cycle of the ely-beauty repo): the
  npm-audit retirement cycle.** The operator's `docs/start_server_log.txt`
  first VERIFIED the run-87 fix in the field — a from-scratch rebuild
  (`rm db/custom.db` + `rm -rf .next` + fresh install + `db:setup`) built
  green (13.6s compile, TypeScript pass, 22/22 static pages) and reseeded
  the exact catalog — and then re-surfaced the two signals this cycle
  retired: `npm install` reporting 11 vulnerabilities (9 moderate, 2
  critical; the run-86-recorded "accepted dev-only families") and
  `db:setup` printing "Generated Prisma Client (v6.12.0)" against the
  lockfile's 6.19.3 runtime (the CLI/client skew). The decomposition:
  tinypool 1.1.1 (2 CRITICAL — prototype-pollution→RCE worker gadgets; a
  DIRECT vitest-3 dependency) + @vitest/mocker 3.2.7 (2 moderate — path
  traversal + code injection; vitest 3.2.7 is inside the vulnerable
  0.0.95–4.1.10 range) + minimatch 10.2.6 nested under
  @typescript-eslint/typescript-estree 8.72.1 (7 moderate packages via
  eslint-config-next; the GHSA-g3hv-75wg-m249 patch lives ONLY in ≥11.0.1
  while typescript-estree@latest still declares ^10.2.2 — an npm override
  is the only path). The fixes: S88-1 vitest → ^4.1.12 (carries the
  patched mocker 4.1.12 AND drops tinypool entirely — one major-version
  bump retires all four advisories; NOT the anticipated vitest 5); S88-2
  the scoped overrides `"@typescript-eslint/typescript-estree": {
  "minimatch": "^11.0.5" }` and — after the prisma alignment itself
  surfaced the newly-published GHSA-ggr8-5vv4-36mx (deepmerge-ts <8.0.0
  via @prisma/config, in range from prisma 6.13; the operator's 6.12.0
  sat below it) — `"@prisma/config": { "deepmerge-ts": "^8.0.2" }`
  (verified at runtime: @prisma/config's only usage is the stable
  `deepmerge` named export; db:setup regenerates + reseeds cleanly);
  S88-3 prisma + @prisma/client aligned at ^6.19.3 (db:setup now prints
  6.19.3 == 6.19.3) with the allowScripts entries refreshed in lockstep;
  S88-4 the 10 pins in `tests/unit/toolchain-versions.test.ts` — every
  assertion reads the LOCKFILE, not the declared ranges (a caret range
  keeps a stale resolution forever): the prisma CLI↔client
  version-equality skew alarm, the vitest floor (lockfile + declaration),
  tinypool absent-or-≥2.1.2, mocker absent-or-≥4.1.12, minimatch outside
  7.0.0–11.0.0, deepmerge-ts ≥8.0.0, and the two override drift alarms.
  The one source change: vitest 4 types `vi.fn()` as
  `Mock<Procedure | Constructable>`, which broke
  `session17-hardening.test.ts`'s `satisfies CategoryWriteClient` — the
  mocks now carry the seam's exact function types; the other 63 test
  files (725 tests, 7 jsdom-pragma suites, 13 vi.mock modules) ran
  UNCHANGED. Acceptance: `npm audit` → 0 vulnerabilities; gates lint ·
  typecheck · typecheck:tests · 735/735 unit (+10) · clean build ·
  90/90 e2e ×2 consecutive (the first attempt's 79 failures were the
  fresh sandbox's missing Playwright browsers — environmental) · sitemap
  28 public-only · 25/25 screenshots (19 byte-identical — the
  dependency-only parity signal) · .env.example 9/9. Audit 88-a: 12/12
  anchors PASS, run-87 regression-free, 4 INFO (all executed this
  cycle). Live reference re-measured on mobile 390×844: panel rows
  ±1px with byte-identical hrefs, overlay input Cormorant 18px/300 with
  the /0.6-alpha placeholder on both sites, the silk set ±1px ×4 in the
  same panel-open state (the run-87 pins were the panel-closed state —
  both states now recorded), /shop 19 unique cards bonnet-first, detail
  ৳370 Inter 24px/600 — zero new parity deltas; the type=search +
  role=dialog supersets present, not reverted. Docs: AGENTS.md S77-10
  ledger (both ACCEPTED families → RETIRED), PAD v2.16, CLAUDE/README
  735 counts, session_32.md, worklog Task 82, REMEDIATION_PLAN Session
  88. **Lessons:** read the lockfile, not the ranges — a caret range can
  keep a vulnerable resolution forever; a version ALIGNMENT can move you
  INTO a newly-published advisory's range (re-audit after every
  dependency touch, including your own fixes); and dependency-only
  cycles still deserve the full parity re-measurement — 19 byte-identical
  screenshots are the cheapest drift alarm there is.

- **Session-record boundary (S96-8): runs 89–108 live in the PAD revision
  blocks.** This appendix's per-session trail ends at Session 88 (run 88);
  from run 89 onward the per-run record moved to the PAD's append-only
  revision blocks (v2.17–v2.35) + `docs/REMEDIATION_PLAN.md`'s session
  sections + the `docs/session_NN.md` logs — the trail continues there
  (run 89: the worklog/docs-verification consolidation; 90: the
  coupon-label format cycle; 91: the API force-dynamic cycle; 92: the
  production-deploy hardening; 93: rotation atomicity; 94: stripe-replay
  ownership; 95: the reference-content resync; 96: the SEO-fallback
  completion + the run-96 doc-de-drift cycle; 97: the auth-secret hardening
  + the doc-de-drift completion cycle; 98: the enumeration-lockstep &
  payment-prose de-drift cycle; 99: the dangling-pointer class net &
  payment-prose completion cycle; 100: the stale-existence-claim net &
  citation-hygiene cycle; 101: the plan-range lockstep net cycle; 102: the
  paraphrase-proof grammar net cycle; 103: the two-sided grammar net
  cycle; 104: the backtracking-proof grammar net cycle; 105: the Stripe USD display-seam
  cycle; 106: the pay-button currency-domain cycle; 107: the taka-vocabulary
  identifier cycle; 108: the documentation-vocabulary residue cycle). This note is the signpost so a
  future reader knows where the trail continues — the historical entries
  above are deliberately left in their era-accurate wording.
- **Docs-reset boundary (S99-4, audit 99-a D2; reworded S100-1 — the
  original note's bounded-range existence claim about the surviving
  session files was falsified by the post-reset log series the very
  cycle that added it): the pre-reset survivors are
  `docs/session_1..53.md`; the post-reset ElyBeauty log series resumed
  at `session_54.md` (run-99) and continues forward — each cycle's run
  log and the operator's raw narratives land interleaved, so the
  series' tail grows every cycle.** The HomeNest-era session files this
  appendix's narratives cite (`session_54`–`session_90`,
  `session_100`–`session_132`, …) were dropped in the run-72 ElyBeauty
  re-skin docs reset — those numbers now collide with the LIVE
  post-reset files of the same name, so an appendix cite of
  "session_54" is NOT a pointer to today's `session_54.md`; the
  pointers were valid when written and the narratives are era-accurate
  history. Follow a dangling appendix pointer to
  `docs/REMEDIATION_PLAN.md`'s session sections (the surviving full
  trail) — and to the live-tense docs' pointers, which the S99-1 class
  net pins to files that exist.
