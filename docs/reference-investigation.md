# Reference Investigation — ElyBeauty (`ely-beauty.base44.app`)

> Run-72 dossier. Investigated live on 2026-11-08 with agent-browser (logged in as
> the operator-supplied account). This file is the `docs/reference-investigation.md`
> deliverable required by `skills/replicate-web-app/SKILL.md`. Confidence labels:
> **Verified** (observed live), **Reasoned** (inferred from evidence), **Assumed**.

## 0. Target identity

| Field | Value |
|---|---|
| Origin | `https://ely-beauty.base44.app/` |
| App | ElyBeauty — "A high-fashion, editorial e-commerce platform curated for premium skincare, focusing on tactile luxury and a seamless, immersive shopping experience." |
| Platform | Base44 (SPA + REST entity API, app id `6a23664e21e33a182d44575e`) |
| Locale | Bangladesh — BDT (৳) prices, `Country: Bangladesh` fixed on checkout, phone `01787385459`, WhatsApp `wa.me/8801787385459` |
| Prior identity | The old reference `nest-culinary-hub.base44.app` (HomeNest Kitchen) returns HTTP 503; this is a **different app**, not a rename of the same one. The repo's existing codebase is the scaffold; the mission is a re-skin to ElyBeauty. |

Live status at investigation time: HTTP 200 (the 17-cycle Base44 outage is over).

## 1. Design language (Verified — computed styles)

| Token | Reference value (computed) |
|---|---|
| `--background` | `30 20% 97%` → `rgb(249,247,246)` warm ivory |
| `--foreground` | `0 0% 10%` → `rgb(26,26,26)` |
| `--primary` | `30 12% 48%` → `rgb(137,122,108)` warm taupe (place-order button measured `rgb(137,122,108)`) |
| `--primary-foreground` | `30 20% 97%` |
| `--muted-foreground` | `0 0% 40%` → `rgb(102,102,102)` (compare-at price color) |
| `--border` / `--input` | `30 10% 88%` → `rgb(227,224,221)` |
| `--destructive` | `0 84.2% 60.2%` |
| `--success` | `140 20% 33%` |
| `--radius` | `.25rem` (4px — sharp editorial corners) |
| Display/heading font | **Cormorant Garamond** (serif), weights 300–600 via Google Fonts |
| Body font | **Inter**, weights 300–600 |
| H1 (hero) | Cormorant 96px / 300 / ls −1.92px / white over hero image |
| H2 (sections) | Cormorant 48px / 300 / ls −0.96px / `rgb(26,26,26)`; banner variant 60px white |
| Product card title (h3) | Cormorant 36px / 300 (category tiles); grid card titles smaller (Cormorant, ~18px class-driven) |
| Nav links / labels | Inter 12px / 500 / ls 1.2px / UPPERCASE |
| Price (detail) | Inter 24px/600 `rgb(26,26,26)`; compare-at 14px/400 `rgb(102,102,102)` |
| Grid price | Inter 14px/500 |
| Header | FIXED, 80px, transparent over hero (no bg/shadow/border even with mobile panel open) |
| Cards | NO border, NO radius, NO shadow — clean editorial grid |
| Footer | bg `rgb(249,247,246)` (same as page), 4 columns + social |

Reference ships the shadcn-style **bare HSL triplet** tokens (v3 convention). Our
clone keeps its full `hsl()` values in `@theme inline` (the Tailwind v4 trap #2)
with the reference's triplet VALUES.

## 2. Routes / information architecture (Verified)

| Route | Content |
|---|---|
| `/` | Fixed transparent header → single-image hero ("The Art of Radiance" / "Luxury botanicals. Clinical precision. Your skin, elevated." / CTA "SHOP THE COLLECTION") → "Shop by Ritual" 4 category tiles → "Curated for You" product grid (VIEW ALL) → "Complete Your Ritual" full-bleed banner ("THE SIGNATURE SET" eyebrow, "DISCOVER SETS" CTA) → footer → floating WhatsApp chat link |
| `/shop` | h1 "All Products" + "19 products" count; category filter buttons (ALL PRODUCTS / BEAUTY TOOLS / BRUSH & COMBS / BESTSELLERS / GIFT SETS, each with category image); sort combobox (Newest / Price: Low to High / Price: High to Low / Name A-Z); product grid |
| `/shop?category=<slug>` | Filtered grid (slugs observed: `skincare`, `body_care`, `sets` — template-remnant slugs whose display names were re-labeled) |
| `/product/[id]` | BACK TO SHOP; image gallery (main + up to 7 thumbs); h1 title; price + compare-at; variant selector (COLOR: <name> swatch buttons or SIZE buttons); qty stepper; ADD TO CART; BUY IT NOW; DESCRIPTION; "Complete the Ritual" related products |
| `/about` | "Beauty, Redefined" h1, story paragraph, "Our collection" image, 3 value props (Clean Formulas / Sustainable / Results-Driven), EXPLORE OUR PRODUCTS CTA |
| `/checkout` | Single-page form: CONTACT (Full Name, Email, Phone) / SHIPPING ADDRESS (Address, Apartment optional, City/District, ZIP optional, Country=Bangladesh) / PAYMENT METHOD (Cash on Delivery) / Order Notes; ORDER SUMMARY sidebar (line items w/ variant + qty, Subtotal, Shipping, Total); "PLACE ORDER — ৳NNN" |
| `/account` | "My Account", user name/email, Sign Out, ORDER HISTORY (order cards: `ELY-XXXXXXXX` id, date, Pending, total, line summary) |
| `/login` | "Welcome back", Continue with Google, Email/Password, Forgot password?, Log in, Create one |
| `/register` | "Create your account", Continue with Google, Email/Password/Confirm, "Create account", "Log in" link |

No separate cart page (drawer only), no wishlist, no reviews, no search results
page (in-overlay results), no admin surface at this URL, no legal pages, no
contact page, no order-tracking page. **The existing clone is already a
functional superset on all of those** — keep them (superset contract).

## 3. Header / navigation (Verified)

- Desktop: SHOP · BEAUTY TOOLS · BRUSH & COMBS · ABOUT (left), logo image (center, 40px), Search · Account · Cart (right).
  - BEAUTY TOOLS → `/shop?category=skincare`; BRUSH & COMBS → `/shop?category=body_care` (template-remnant mapping — replicate as-observed).
- Mobile (≤lg): hamburger `Toggle menu` (`lg:hidden p-2 -ml-2 text-white`), logo, search, account, cart.
- Mobile panel: push-down `div.px-6.py-6.space-y-4` under the transparent header; items: Search button (icon + label, swaps panel to a search input + "Close search" + live results) then 4 uppercase links (`block text-sm tracking-widest uppercase text-foreground hover:text-primary transition-colors`).
- Menu closes on route change (Verified: search-result click navigated and panel closed).
- No scroll lock observed (body overflow stayed `visible` with panel open), no aria-expanded flip on the toggle, no active-link pill. **Our clone keeps its stricter contract** (conditional mount, scroll lock, aria-label flip) as superset behavior — visual parity is unaffected.

## 4. Commerce behavior (Verified)

- Cart: add-to-cart opens a drawer "Your Bag (N)" (line, Remove, qty steppers, CHECKOUT). Badge "Cart with N items".
- Variants: products carry `colors` (array of `{name, hex, image_url}`) and/or `sizes` (comma string). Detail page renders COLOR swatch buttons (selected name shown as "COLOR: Pink") or SIZE buttons. Selected variant carries into checkout summary ("Pink", "Qty: 1").
- Shipping: computed from City/District — **Dhaka ৳70, outside Dhaka ৳130** (Verified both); "Enter city to calculate" before a city is typed.
- Payment: **Cash on Delivery** ("Pay with cash when your order arrives") only.
- Orders: `ELY-` + 8-char alphanumeric (Verified `ELY-MW774C50`), status Pending, visible in account ORDER HISTORY. One verification order was placed (clearly named "Clone Verification", Dhaka, ৳358) — operator may delete it.
- Sold-out products (stock 0) still render in the grid (no hide).
- Prices: BDT floats; grid/search show `৳NNN` (search overlay shows `$NNN.00` — reference-internal inconsistency; clone uses ৳ consistently).
- No coupons/offers in the reference data (`Offer` entity empty). Clone keeps its coupon engine as superset (seeded coupons stay admin-facing).

## 5. Catalog data (Verified — fetched from the public entity API)

- 19 products, 4 categories: `Beauty Tools` (slug `beautytools`), `Brush & Combs` (slug `brush_combs`), `Bestsellers ` (trailing space, slug `Bestseller`), `Gift Sets` (slug `sets`).
- Products (title / ৳price / ৳compare / stock / categories / tags / variants):
  1. Premium Double Sided Ruffles Silk Hair Bonnet / 370 / — / 0 / Bestsellers / `bastseller` (sic) / sizes
  2. Pure Satin Silk Pillowcase – For Hair & Skin / 288 / 350 / 19 / Bestsellers / sale+bestseller / colors Pink/Navy/Sky/Black (hex + per-color image)
  3. Heatless Hair Curler Set / 340 / — / 0 / Bestsellers / bestseller / colors Black/Navy
  4. Natural Bamboo Hair Brush - Square / 470 / — / 16 / —
  5. Sandalwood Paddle Hairbrush – Oval / 470 / — / 21 / —
  6. Sandalwood Hairbrush - Oval / 540 / — / 39 / Brush & Combs
  7. Natural Bamboo Hair Brush - Oval / 450 / 11 / 11 / — (compare-at ৳11 is template noise — clone renders compare-at only when > price)
  8. Stainless Steel Gua Sha / 665 / — / 121 / Beauty Tools
  9. Exfoliating Body Gloves | 100% Natural Viscose Fiber / 340 / — / 49 / Brush & Combs / sizes
  10. Facial Threading Tool / 440 / — / 24 / Beauty Tools
  11. Moisturizing Spa Socks / 540 / — / 0 / — / sizes
  12. Crystal Hair Remover / 520 / — / 30 / —
  13. Full silicon scalp massager / 480 / — / 19 / — / colors Pink/Black/Biege (sic)
  14. Derma Roller - Titanium / 488 / — / 15 / Beauty Tools / sizes 0.5mm, 1.0mm
  15. Derma Stamp - Titanium / 790 / — / 9 / Beauty Tools
  16. Travel Silicone Mask Applicator Set 4 Pcs / 120 / — / 6 / Beauty Tools
  17. Wooden cleansing brush / 440 / 600 / 65 / Bestsellers+Beauty Tools / sale+bastseller
  18. Anti-cellulite Dry Body Brush / 1070 / 1196 / 11 / Brush & Combs
  19. Facial Ice Bowl – Foldable & Travel-Friendly / 1040 / — / 0 / Beauty Tools
- Rich fields per product: `short_description`, `description`, `how_to_use`, `ingredients`, 2–7 images, `sort_order`.
- Full JSON evidence: `research/live/products.json`, `categories.json`, `sitesettings.json` (git-ignored research dir).
- **Images are hotlinked from `feyorabangladesh.com` (a third-party Shopify CDN). The clone does NOT copy them** — it ships independently generated imagery (asset-laundering avoidance, per `skills/replicate-web-app` §integrity). Visual parity is maintained through layout/typography/color; product photos are original.

## 6. Site settings (Verified)

- `logo_text: "ElyBeauty"`; logo is an image wordmark; favicon is a generated PNG.
- Hero title/subtitle/CTA are code defaults: "The Art of Radiance" / "Luxury botanicals. Clinical precision. Your skin, elevated." / "SHOP THE COLLECTION".
- Single hero image (desktop + mobile the same generated beauty still-life).
- Social: Facebook (`facebook.com/triggersafu…`), WhatsApp (`wa.me/8801787385459`); floating "Chat on WhatsApp" link on every page.
- Footer SUPPORT: "My Account" → `/account`, phone `tel:01787385459`.

## 7. Unknowns / blockers

- Admin/back-office of the reference (if any) — not reachable with the customer account (Reasoned: none observed; Base44 "Edit with" badge is the platform's builder, not the app).
- Google OAuth button behavior — not exercised (would create real auth state; Assumed equivalent to a standard OAuth redirect; clone renders it as a decorative parity element that is disabled-with-tooltip, keeping local email/password auth functional).
- Exact per-city shipping table — two tiers Verified (Dhaka 70 / outside 130); clone implements exactly these two tiers driven by the City field, admin-configurable (superset).

## 8. What "superset" means for this run

Keep every HomeNest capability the reference lacks (cart page, wishlist, reviews,
coupons, track-order, legal pages, contact form, SEO suite, admin console,
Stripe-ready checkout, 496-unit test suite) while re-skinning all surfaces the
reference DOES have to ElyBeauty's editorial design. Deviations are recorded in
the implementation plan's Deviations Ledger.
