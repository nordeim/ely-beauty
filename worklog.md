Task ID: 72
Agent: run-72 executor (Super Z — the ElyBeauty re-skin)
Task: The mission pivot — clone https://ely-beauty.base44.app/ (premium skincare, BDT ৳, COD; login with the operator credentials) using the cloned ely-beauty repo (the HomeNest Kitchen scaffold) as the codebase root. Full cycle: live reference investigation, implementation plan, the re-skin (design tokens/fonts, catalog, variants, city-tiered shipping, ELY- order numbers, single-page COD checkout, /shop route, mobile panel + in-panel search, WhatsApp float, generated imagery), test re-pinning, gates, agent-browser parity pass, screenshots, docs regeneration (AGENTS/CLAUDE/README/PAD/SKILL v2.0.0 rename), worklog, two commits + SSH-wrapper pushes to main.

Work Log:
- Fresh clone → e478da9 (the operator's update-prompts commit: the old HomeNest screenshots DELETED from docs/screenshots/, the creation prompt re-pointed at ely-beauty.base44.app — the mission pivot signal). Read the repo docs (AGENTS/CLAUDE/README/PAD/SKILL v1.67.0, worklog, REMEDIATION_PLAN tail, skills-catalog, Tailwind-V4-Validation-Report, homenest SKILL) + the operator-named skills (replicate-web-app, web-application, web-application-engineering, clone-app-pat-pro, agent-browser, tdd — summarized via a research subagent, RES-1).
- LIVE reference investigation (agent-browser, logged in with the operator credentials; dossier: docs/reference-investigation.md): the reference is BACK ONLINE at the new URL (the 17-cycle 503 outage is over) — and it is a DIFFERENT app from nest-culinary-hub: ElyBeauty, a high-fashion editorial premium-skincare storefront (BDT ৳, Bangladesh, phone 01787385459, WhatsApp, Cash on Delivery). Extracted: full computed-style token set (Cormorant Garamond + Inter, ivory/taupe/4px radius), the route map, the header/mobile-panel anatomy (incl. the in-panel SEARCH flow + route-change close), the 19-product catalog + 4 categories via the public entity API (research/live/products.json), the COD checkout with city-tiered shipping (Dhaka ৳70 / outside ৳130 — both verified live), ELY-XXXXXXXX order numbers (one clearly-named verification order placed: ELY-MW774C50, ৳358), the Google/Facebook/WhatsApp/social surface, and the footer/legal map. VLM-verified the design language from full-page captures.
- Implementation plan saved to docs/implementation-plan.md (14 governing decisions, 10 workstreams, deviations ledger, risks, DoD).
- Environment: npm install (431 pkgs) · .env (DATABASE_URL="file:../db/custom.db" + fresh AUTH_SECRET) · db/ at the repo root with the SYMLINK shadow convergence (ln -sfn <repo>/db /home/z/my-project/db) · fresh db:setup.
- Imagery: 27 brand images generated (z-ai image CLI via scripts/generate-imagery.mjs — idempotent, 3 retry batches for rate limits): hero, ritual banner, about, og-default, 4 category tiles, 19 product shots. The old HomeNest images deleted.
- The re-skin (all src/ changes this run): globals.css tokens (@theme inline, full-hsl values, the --shadow-sm pin kept, NEW @utility declarations for eyebrow-label/link-cta — the run's NEW v4 trap: @apply cannot reference @layer-utilities classes, caught by the build); layout.tsx fonts + metadata; logo (bicolor wordmark); header (fixed 80px, transparent-over-hero on /, nav SHOP/BEAUTY TOOLS/BRUSH & COMBS/ABOUT, desktop search overlay with live ৳ results); mobile-nav (ivory push-down panel, SEARCH row → in-panel input + live results, active = text-primary; the hardened contract kept: conditional mount, scroll lock, aria flip, route-change close); store-chrome ("Your Bag" drawer + variant display); footer (4 columns + social circles + legal links); whatsapp-float; home page (single-slide hero via the retained carousel engine, Shop by Ritual tiles, Curated for You newest-6, Complete Your Ritual banner); /shop (renamed from /products with a 301 redirect; pill filters with category thumbnails + active solid; Radix sort combobox; 3-col editorial grid); product detail (BACK TO SHOP, gallery, COLOR swatches/SIZE buttons via the rewritten PurchasePanel, ADD TO CART + BUY IT NOW + the wishlist heart, DESCRIPTION/HOW TO USE/INGREDIENTS, Complete the Ritual); single-page checkout (CONTACT/SHIPPING/PAYMENT/Notes + ORDER SUMMARY with the live city-tiered shipping row + coupon box; COD default, Stripe-island-only-when-configured; every invariant kept); account (ORDER HISTORY first); auth pages (Welcome back / Create your account + the disabled Google parity button); about (Beauty, Redefined); the brand sweep (legal, admin, manifest, icon.svg, settings, seo).
- Schema: Product += colors/sizes/howToUse/ingredients; Category += imageUrl; CartItem += variant (@@unique([cartId, productId, variant]) — empty-string default for NULL-safe dedupe); Order += notes; the cart/merge/bulk/order-placement plumbing updated for variant line identity + OrderItem.variantLabel snapshots; money.ts → ৳ whole-taka (parseAmountToCents + back-compat alias); order-number.ts → ELY-XXXXXXXX (crypto-random, format-pinned); order-money += the pure shippingMethodForCity; validation: variant on cart schemas, notes on checkout, the BD address model (state/ZIP optional).
- Tests: the full kitchenware-pin re-pinning (money ৳, seed-catalog 19/authored-order/4-categories/variants, product-card Sale anatomy, toCardData shape, dedupeBulkWanted composite keys, stripe refund notes, coupon minimum copy, seo /shop, api-boundaries ELY- retry loop) + new pins (order-number format, shipping tiers, variant keys). E2E re-pinned via the E2E-1 subagent (storefront/mobile-nav/shopping-flow/auth/wishlist/reviews/seo/admin/free-shipping suites — 69/69 green; one stale-pin pagination fix in free-shipping-coupon via the brush-combs category route). Login button renamed "Log in" (reference parity) with the auth/admin specs swept.
- Gates (all observed green): lint ✓ · typecheck ✓ · typecheck:tests ✓ · 512/512 unit (52 files) · build ✓ zero prisma:error · 69/69 e2e · agent-browser live parity pass on the production build (home/shop/detail/mobile panel/search/checkout: exact anatomy, ৳70/৳130 tiers, the Navy Blue variant carry-through to the bag + summary, PLACE ORDER — ৳358 matching the reference's verified numbers, zero page errors; the mobile contract verified element-by-element incl. the exact-token hidden check — the documented lg:hidden false-positive avoided).
- Screenshots: 25/25 captured to docs/screenshots/ (the capture script rewritten for the new flows: detail-page adds, the Dhaka-filled checkout, ELY- placeholders; the badge/toast/panel/image-decode gates retained).
- Docs: AGENTS.md (rebrand + trap 6 + the variant/shipping/order-number invariants + the corrected mobile-menu contract), CLAUDE.md (identity + counts 500/69), README.md (full ElyBeauty rewrite per the readme-md skill), PAD v2.0 (revision block + ADR-008 the re-skin + the design-system/route/data updates), SKILL renamed homenest-store-s_SKILL.md → ely-beauty_SKILL.md (v2.0.0, the run-72 project_state opening), REMEDIATION_PLAN session-71 section, .env.example (COD copy), this worklog Task 72.
- Commits: 42e9d95 (the codebase: src/prisma/tests/scripts/public images/docs dossier+plan/screenshots — 172 files) pushed via docs/ssh_git_wrapper_v3.py + the paramiko shim (--remote git@github.com:nordeim/ely-beauty.git; dry-run → push → remote verified == local HEAD); the docs commit follows with this worklog.

Stage Summary:
- Run 72 — the ElyBeauty re-skin complete and pushed: remote main @ 42e9d95 (codebase) + the docs commit (this change-set). The clone is a visual-parity, functional-superset of ely-beauty.base44.app with every hardened invariant intact.
- All green: 6 gates · 512/512 unit · 69/69 e2e · agent-browser live parity (anatomy + variants + shipping tiers + mobile contract) · 25 screenshots.
- Encoded results: the @apply/@layer-utilities v4 trap (AGENTS trap 6); the agent-browser lessons this run (absolute screenshot paths; scoped-snapshot refs for the ambiguous Search label; the always-mounted drawer's closed-state "Loading" text is not a fetch failure).
- Deferred/documented: generated imagery (not the reference's CDN photos); the disabled Google button (no OAuth secrets); the reference's broken template-remnant category links not cloned; one verification order on the live reference (ELY-MW774C50, ৳358 — operator-deletable).
- Next action: the standard verification cycle for the next run (the reference is LIVE again — re-baseline parity against it when it changes).

---
Task ID: 73-a
Agent: deep audit 73-a (read-only subagent, run-73 cycle)
Task: Read-only deep audit 73-a — the 9 standing code anchors + the run-72 re-skin delta (173 files) + the standing conflict-marker gate on the 1ac21eb tree (the first audit after the ElyBeauty re-skin).

Work Log:
- Methodology: skills/web-application/SKILL.md + the 12-category code-review-checklist standard + AGENTS.md invariants; skills/ excluded from all checking per the operator contract.
- Tree: HEAD 1ac21eb on main, working tree clean. The delta under audit: commit 42e9d95 (173 files, the re-skin) + 40b90a9 (docs).
- The 9 anchors verified from scratch with file:line evidence: db-path (PASS), money (PASS with the M-1 caveat), validation boundary (PASS), checkout transaction authority (PASS with the M-1 caveat), auth/session (PASS), order-access gating (PASS), mobile-nav/Tailwind v4 (PASS), SEO/sitemap/robots (PASS), CSP nonce/hydration (PASS).
- Findings: 3 MEDIUM (M-1 client-trusted shipping tier — the documented "server re-derives in-tx" invariant was NOT implemented; M-2 the login merge's stock clamp dead on composite keys; M-3 kitchenware legal copy + the USD claim), 5 LOW (L-1 the panel drops the size on both-dimension products; L-2 the composite split truncates pipe-bearing variants; L-3 paypal accepted + the bare-card path; L-4 the hydration-unsafe window.location.search read; L-5 the US country default), 4 INFORMATIONAL (I-1 three-links-active; I-2 residual sweep; I-3 stale comments; I-4 the AGENTS.md shipping claim false). Conflict-marker gate CLEAN.
- Every finding carried file:line evidence and a PRE-EXISTING vs ACTIONABLE (run-72) split; no files modified.

Stage Summary:
- 9/9 anchors PASS; 0 CRITICAL/HIGH; 3 MEDIUM / 5 LOW / 4 INFO, nearly all run-72 re-skin regressions — the findings list that became the Session 73 remediation plan (S73-1..S73-12).

---
Task ID: 73
Agent: Super Z (main agent + 73-a read-only audit subagent)
Task: Run-73 cycle for github.com/nordeim/ely-beauty — workspace refresh, docs review, gates re-validation, deep audit 73-a, live-reference parity re-baseline, TDD remediation (S73-1..S73-12), screenshots, docs alignment, commit + SSH push to main.

Work Log:
- git pull to 1ac21eb (the operator's session-log commit); docs re-read (AGENTS/CLAUDE/README/PAD v2.0/SKILL v2.0.0/session_1/REMEDIATION_PLAN/worklog); skills/ excluded per contract.
- Environment: DATABASE_URL shadow converged (same inode); .env/.env.example/db contract verified; all 9 env vars documented.
- Gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 512/512 unit ✓ · build ✓ · 69/69 e2e ✓.
- Deep audit 73-a (Task 73-a above): 9/9 anchors PASS, 3M/5L/4I — the Session 73 findings list.
- Live-reference parity re-baseline (agent-browser, the reference ONLINE): home/shop/product/footer/mobile-menu strong (VLM side-by-side); three measured deltas (P-1 no active-nav highlight on the reference; P-2 shop count geometry; P-3 0.1em micro-label tracking); the decisive S73-7 validation (the reference's massager renders BOTH selector rows and records both selections — the seed is reference-faithful; a plan error corrected before execution).
- Remediation plan appended (S73-1..S73-11 + the in-flight S73-12), validated against the codebase, executed TDD-first: RED tests first (variants/cart-merge/session9/validation/place-order-integration/mobile-nav e2e), then GREEN implementations across 33 src/test files.
- Final gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 536/536 unit (+24 pins) · build ✓ · 69/69 e2e (the re-pinned mobile-nav contract).
- agent-browser live verification of the remediated build: shop header/nav/mobile-panel byte-parity with the reference measurements; the composed "Black / Beige" variant label carried end-to-end to the cart line.
- 25/25 screenshots regenerated (single cold pass); the changed surfaces VLM-verified; the legal pages live-scanned (zero kitchenware/USD remnants).
- Docs sweep: REMEDIATION_PLAN Session 73, AGENTS.md (the shipping invariant now true + the mobile-menu contract + the 0.1em note), CLAUDE.md (the parity contract), README (536 counts, the S73 rows), PAD v2.1 (rows 85-90 + the stale rows 1/6 corrected), ely-beauty_SKILL.md v2.1.0 (project_state + the Appendix B Session 73 entry with the cycle's four encoded traps), docs/session_2.md, worklog (this entry).
- Commit + push to main through the SSH wrapper (fast-forward, no new branches; remote verified).

Stage Summary:
- Run 73 complete: the FIRST findings-bearing cycle since the re-skin — 3 MEDIUM (money-integrity shipping, dead merge clamp, kitchenware legal copy) + 5 LOW + 4 INFO all fixed TDD-first, three live-measured parity deltas closed, and one docs-vs-code gap (admin variant editing) made true. The suite grew 512 → 536 unit; e2e re-pinned at 69/69. The four new traps encoded in the SKILL: a live reference can contradict the clone's own documented parity pins (re-measure, don't trust); zod-strips-unknown is the removal-safety contract (pin the strip); the whitespace-delimited token pattern for not.toHaveClass against hover: variants; interface-field removal = compile-time blast radius enumeration.
---
Task ID: 74-a
Agent: deep audit 74-a (read-only subagent, run-74 cycle)
Task: Read-only deep audit 74-a — the 9 standing code anchors + the run-73 remediation delta (commit 5002bc0) + the session-log commit verification (211c0e2) on the pulled tree.

Work Log:
- Methodology: skills/web-application/SKILL.md + the 12-category code-review-checklist standard + AGENTS.md invariants; skills/ excluded from all checking per the operator contract.
- Tree: HEAD 211c0e2 on main, working tree clean. The delta under audit: 5002bc0 (39 src/test/config files, +595/−141) + 211c0e2 (docs/session_3.md only — verified docs-only via git show --stat).
- The 9 anchors verified from scratch with file:line evidence: db-path PASS, money PASS, validation boundary PASS, checkout transaction authority PASS, auth/session PASS, order-access PASS, mobile-nav/Tailwind v4 PASS, SEO PASS, CSP/hydration PASS.
- Findings: 1 HIGH (F-1 dormant: the Stripe card path mints USD intents whose amount equals the BDT poisha count — ৳288 → $288.00, ~120× overcharge once keys are set; pre-existing since the run-62 retrofit × run-72 re-skin), 5 LOW (F-2 the US country zod default; F-3 the orange iconGradient zod default; F-4 kitchenware placeholder remnants; F-5 the cart-page variant label style), 4 INFO (F-6 the no-pipe guard; F-7 badge tracking; F-8 the stale AGENTS wishlist bullet; F-9/F-10 stale comment + dead e2e field). Conflict-marker gate CLEAN.
- Every finding carried file:line evidence and a PRE-EXISTING vs BY-THE-DELTA split; no files modified.

Stage Summary:
- 9/9 anchors PASS; 0 CRITICAL; 1 HIGH (dormant) + 5 LOW + 4 INFO — the findings list that fed the Session 74 remediation plan (with the parity deltas the parent agent measured live).

---
Task ID: 74
Agent: Super Z (main agent + 74-a read-only audit subagent)
Task: Run-74 cycle for github.com/nordeim/ely-beauty — workspace refresh, docs review, gates re-validation, deep audit 74-a, live-reference surface-by-surface re-measurement, TDD remediation (S74-1..S74-14), screenshots, docs alignment, commit + SSH push to main.

Work Log:
- git pull to 211c0e2 (the operator's session-log commit); docs re-read (AGENTS/CLAUDE/README/PAD v2.1/SKILL v2.1.0/session_2/session_3/REMEDIATION_PLAN/worklog); skills/ excluded per contract.
- Environment: DATABASE_URL shadow converged (same inode); .env/.env.example/db contract verified.
- Gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 536/536 unit ✓ · build ✓ · 69/69 e2e ✓.
- Deep audit 74-a (Task 74-a above): 9/9 anchors PASS, 1H(dormant)/5L/4I.
- Live-reference re-measurement (agent-browser computed styles + VLM side-by-side; reference ONLINE): the catalog UNCHANGED (19 published; 6 new entity rows are unpublished ৳0.1 drafts); 14 measured geometry deltas found (hero 78svh vs h-screen, pills rounded vs sharp, panel extras, purchase row vs column, no eyebrow, serif vs micro-label headings, 4:5 vs 1:1 cards, stacked vs split badges, iconed footer, 48 vs 56 float, underline vs border-b CTAs, dull logo, sort combobox vs native select). Every VLM claim confirmed or refuted against the DOM (4 non-findings: the lazy banner, the SPA's unpainted sections, the fixed-header capture artifact, the ৳ glyph misread).
- Remediation plan (Session 74) appended with the measured-values table, validated against the codebase, executed TDD-first: RED batch (15 failures) → GREEN implementations across 30+ src/test files.
- S74-11: the Stripe FX gate — STRIPE_BDT_PER_USD + the stripeChargeAmount seam + the amountUsdCents interface + the converted in-tx guard + the converted idempotency key; .env.example + DEPLOYMENT.md documented.
- Reseed (content-only policy): the massager title refreshed to the reference's authored casing.
- Final gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 550/550 unit (+14 pins) · build ✓ · 70/70 e2e (re-pinned mobile-nav contract; native-select sort pin; the new footer-wishlist pin).
- The fixed surfaces re-measured GREEN against the live reference (hero h1 720×192 byte-exact; pills 34px/0-radius; panel text byte-exact; purchase column stacked at radius 2px; eyebrow/gallery/badges/footer/float all matching).
- 25/25 screenshots regenerated (single clean pass).
- Docs sweep: REMEDIATION_PLAN Session 74 (execution log), AGENTS.md (the S74-2 panel contract + the re-worded wishlist bullet + the FX-gate invariant), CLAUDE.md (the S74 parity paragraph + the FX note), README (550/70 counts + the pill/sort/FX rows + STRIPE_BDT_PER_USD), PAD v2.2 (the revision block + rows 91-93), ely-beauty_SKILL.md v2.2.0 (project_state + the Session 74 entry with five encoded traps), docs/session_4.md, worklog (this entry).
- Commit + push to main through the SSH wrapper (fast-forward, no new branches; remote verified).

Stage Summary:
- Run 74 complete: the measured-geometry parity cycle — 14 live-measured visual deltas closed to byte-exact (including one run-73 measurement that itself proved wrong: the pills), the dormant Stripe USD/BDT ~120× overcharge closed with the explicit FX-rate gate, and the audit residuals aligned. The suite grew 536 → 550 unit / 69 → 70 e2e. Five new traps encoded in the SKILL: re-measure pinned geometry every cycle (a prior run's measurement can be wrong); an FX-denominated payment path must re-derive its currency semantics with a re-skin; fixed headers paint where the viewport was in fullPage captures; lazy below-fold images report naturalWidth 0 until scrolled; always confirm VLM visual claims against the DOM.

---
Task ID: 75-a
Agent: deep audit 75-a (read-only subagent, run-75 cycle)
Task: Read-only deep audit 75-a — the 9 standing code anchors + the run-74 delta (commit 24b07d1) on the pulled 951ca57 tree.

Work Log:
- Methodology: skills/web-application/SKILL.md + skills/code-review-checklist/SKILL.md; skills/ excluded from all checking per the operator contract.
- The 9 anchors verified from scratch with file:line evidence: db-path PASS, money/order-money PASS, validation PASS, checkout/order-placement PASS, auth/password PASS, order-access/tracking PASS, mobile-nav/store-chrome PASS, sitemap/robots/noindex PASS, CSP/proxy/auth/404 PASS.
- Findings: 0 CRITICAL/HIGH code defects; 2 MEDIUM docs-truth (M-1 the PAD body's ~26 kitchen-era claims contradicting the "PAD v2.2 aligned" commit; M-2 DEPLOYMENT.md still HomeNest-branded with wrong credentials + self-heal SQL); 4 LOW (L-1 the Stripe Element appearance's kitchen palette + false comment; L-2 the admin charts' kitchen orange; L-3 the 404 CookingPot icon; L-4 the favicon's dull pre-S74-10 anchors); 3 NIT (the stale "sequential" comment; aria-haspopup="dialog"; the footer slice(0,3) split); 3 INFO (the deliberate cookie names; verified-accurate test counts; the AGENTS suspicion refuted). Conflict-marker gate CLEAN; secrets spot-check clean.

Stage Summary:
- 9/9 anchors PASS, 0 CRITICAL/HIGH — the findings list that fed the Session 75 docs-truth + residual work, alongside the parent agent's live-measured layout-frame deltas.

---
Task ID: 75
Agent: Super Z (main agent + 75-a read-only audit subagent)
Task: Run-75 cycle for github.com/nordeim/ely-beauty — workspace refresh, docs review, gates re-validation, deep audit 75-a, live-reference whole-page re-measurement, TDD remediation (S75-1..S75-16), screenshots, the docs-truth sweep, commit + SSH push to main.

Work Log:
- git pull to 951ca57 (the operator's session-log commit); docs re-read (AGENTS/CLAUDE/README/PAD v2.2/SKILL v2.2.0/session_4/session_5/REMEDIATION_PLAN/worklog); skills/ excluded per contract.
- Environment: DATABASE_URL shadow converged (same inode); .env/.env.example/db contract verified (10 env vars).
- Gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 550/550 unit ✓ · build ✓ · 70/70 e2e ✓.
- Deep audit 75-a (Task 75-a above): 9/9 anchors PASS, 2M/4L/3N — the Session 75 findings list.
- Live-reference whole-page re-measurement (agent-browser, both sites, both viewports, logged in): 10 layout-frame deltas found (the universal gutter, the responsive header, the home rhythm/grids/banner, the product clearance/gap, the hero lh, the panel padding CSS-order bug, the footer rhythm, the WhatsApp glyph) + the plan-validation pass found the couponLabel $ bug (H-1).
- Remediation plan (Session 75) appended with the measured-values table, validated against the codebase, executed TDD-first: RED batch (13 layout-tokens pins + 5 coupon re-pins) → GREEN implementations across globals.css, header/store-chrome/mobile-nav (the panel moved INSIDE the fixed header — the reference's DOM order, caught by the new e2e geometry pin), home/product/hero/footer/whatsapp/stripe-pay/charts/not-found/icon.svg/coupons.ts/order-tracking.ts.
- Final gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 563/563 unit (+13) · build ✓ · 74/74 e2e (+4 geometry pins).
- The fixed surfaces re-measured GREEN against the live reference (byte-exact: sections y:900/566/128px, tiles 264×198, banner 1152×384, h1 720×192, columns 544×48, shop h1 @176, footer 96px, panel @64/24px padding).
- 25/25 screenshots regenerated (single clean pass after restore-stock + the 60s limiter window).
- Docs sweep: REMEDIATION_PLAN Session 75 (execution log), AGENTS.md (the S75 mobile-menu + layout-frame contracts), CLAUDE.md (the S75 parity paragraph), README (563/74 + 19 models), PAD v2.3 (the revision block + ~26 corrected claims + rows 94-95), DEPLOYMENT.md (rebranded), ely-beauty_SKILL.md v2.3.0, docs/session_6.md, worklog (this entry).
- Commit + push to main through the SSH wrapper (fast-forward, no new branches; remote verified).

Stage Summary:
- Run 75 complete: the measured LAYOUT FRAME cycle — the universal gutter + responsive header + panel-inside-header structure closed to byte-exact against the live reference, the fixed-coupon ৳ currency bug fixed (customer-facing), the kitchen-era residual family (Stripe appearance, chart hexes + $ axes, 404 icon, favicon, WhatsApp glyph) retired, and the docs-truth debt (PAD body, DEPLOYMENT branding) paid. The suite grew 550 → 563 unit / 70 → 74 e2e. New traps encoded: the element-px-loses-to-container-page CSS-order class; measure the shared frame, not just the surfaces; the sandbox thread-budget exhaustion class (kill abandoned browser daemons before blaming the harnesses).

---
Task ID: 76
Agent: Super Z (main agent + 76-a read-only audit subagent)
Task: Run-76 cycle for github.com/nordeim/ely-beauty — workspace refresh, docs review, gates re-validation, the clean-build recovery (F-0), deep audit 76-a, live-reference re-measurement, TDD remediation (S76-0..S76-12), screenshots, the docs sweep, commit + SSH push to main.

Work Log:
- git pull to 1f8aea5 (the operator's session_7 narration capture); docs re-read (AGENTS/CLAUDE/README/PAD v2.3/SKILL v2.3.0/session_6/session_7/REMEDIATION_PLAN/worklog); skills/ excluded per contract.
- Gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 563/563 unit ✓ — then the CLEAN build FAILED (globals.css:2:135421 Missed semicolon).
- F-0 root-caused (CRITICAL): Tailwind v4's candidate scan reads .md prose; the run-75 docs sweep's colon-form md:aspect-[3:1] (4 doc files) compiled to invalid aspect-ratio:3:1 and broke the production PostCSS pass — run-75's final build was a stale-cache false-green. Reproduced standalone + via a temporary postcss parse-dump hook.
- S76-0 (TDD, pre-plan): the @source not scan guard in globals.css (docs/, skills/, tests/, scripts/, **/*.md, **/*.mdx), the four doc typos → the slash form, tests/unit/tailwind-scan-guard.test.ts (3 pins incl. a real compile). Clean build ✓, 566/566 unit ✓, 74/74 e2e ✓ on the fixed tree.
- Deep audit 76-a (read-only subagent): 9/9 anchors PASS, 0 C/H/M, 2 LOW (docs counts; a debug leftover — both disposed) + 3 NIT + 3 INFO; the guard proven load-bearing by controlled experiment; the F-3 doubled-hairline deduction later DISPOSED against the live DOM.
- Live-reference re-measurement (agent-browser, both sites, both viewports, logged in): the frame surfaces re-verified GREEN; 12 new card/variant deltas measured (shop grid gaps, card text-block anchoring, product h1 scale, pill-vs-square chips, swatch anatomy, thumb geometry, non-home border-t, the bonnet's badge/desc data, the gallery image counts).
- Remediation plan (Session 76) appended with the measured-values table, validated against the codebase (schema nullability, seed-policy ownership, metadata consumers, test-pin collisions), executed TDD-first: RED batch (10 unit + 3 e2e failing) → GREEN implementations (S76-1..S76-10) → the reseed + the live-DB badge UPDATE.
- S76-9: 38 gallery variants generated (scripts/gen-gallery-variants.mjs, the run-72 brand pipeline, foreground idempotent chunks — background jobs die between shell invocations); the VLM coherence review kept 9 generated sets and replaced 10 drifted sets with PIL detail crops; 19/19 products VLM-verified coherent.
- Final gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 576/576 unit (+13) · clean build ✓ (after clearing a stale node_modules/.cache/jiti that broke next/font) · 77/77 e2e (+3).
- The fixed surfaces re-measured GREEN against the live reference (byte-exact: shop grid 48px 32px + 363×447 cards + 48px row gaps, mobile cards 159×283 @ 24px gap, the card anatomy name@+16/20 + price@+44 + the bonnet name+price only, the h1 48/48/300, the 38px pill chips with ivory active text, the 36px double-ring swatches, the 64×80 thumbs @16 below the 544×725 main, the non-home header 82px desktop).
- 25/25 screenshots regenerated (single clean pass after restore-stock + the 60s limiter window).
- Docs sweep: REMEDIATION_PLAN Session 76 (execution log), session_8.md, worklog (this entry), README (576/77 + the gallery row), AGENTS.md (the scan-guard trap #7 + the S76 card/variant contract), CLAUDE.md (the S76 parity paragraph), PAD v2.4 (the revision block + counts), ely-beauty_SKILL.md v2.4.0 (project_state + the Session 76 entry with five encoded traps).
- Commit + push to main through the SSH wrapper (fast-forward, no new branches; remote verified).

Stage Summary:
- Run 76 complete: the clean-build recovery cycle — the pushed run-75 tree's build breaker (prose leaking into the Tailwind candidate scan) closed with the structural @source not guard, and 12 live-measured card/variant anatomy deltas closed to byte-exact (the shop grid rhythm, the flow-anchored card text block, the 48px product heading scale, the pill chips, the double-ring swatches, the 64×80 thumbs, the non-home border-t, the badge/description data parity, and the VLM-verified 3-image galleries). The suite grew 563 → 576 unit / 74 → 77 e2e. Five new traps encoded in the SKILL: prose is a compile input; a warm Turbopack cache can false-green a broken tree; the stale jiti cache breaks next/font; VLM-verify generated imagery; pin typography scales, not wrap-dependent box heights.

---
Task ID: 77
Agent: Super Z (main agent + 77-a read-only audit subagent)
Task: Run-77 cycle for github.com/nordeim/ely-beauty — workspace refresh (fresh clone; the sandbox
was recycled), docs review, gates re-validation, deep audit 77-a, live-reference re-measurement,
TDD remediation (S77-1..S77-12), screenshots, the docs sweep, commit + SSH push to main.

Work Log:
- Fresh clone to 356899b (the operator's session-8/9 log commit); docs re-read
  (AGENTS/CLAUDE/README/PAD v2.4/SKILL v2.4.0/session_8/session_9/REMEDIATION_PLAN/worklog);
  skills/ excluded per contract.
- Environment: .env from .env.example, db/ at the repo root, db:setup seeded (19 products); the
  sandbox's ambient DATABASE_URL (outside the repo) converged via the documented symlink after the
  standalone health probe reported db:down; Playwright chromium binaries installed for the fresh
  sandbox.
- Gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 576/576 unit ✓ · clean
  build ✓ · 77/77 e2e ✓ — the docs' claimed state matched reality.
- Deep audit 77-a (read-only subagent): 9/9 anchors PASS, 0 CRITICAL code defects; 3 HIGH (next
  16.4.0's 3 critical CVEs; the zod <4.6.6 advisory; the push-target cluster stale at TWO
  generations — the wrapper's DEFAULT_REMOTE pointed at task-management, the runbook override at
  homenest-store-s) + 4 MEDIUM (CLAUDE.md counts 550/74 vs 576/77; the "16-product catalog" claim
  vs the actual 19; REMEDIATION_PLAN's "21 products" + garbled line; the seed bypassing the
  db-path seam) + 4 LOW + 3 NIT + 5 INFO. .env.example ↔ code verified clean both directions;
  conflict markers/secrets clean. The homenest-store-s config spot-check: all shared configs
  byte-identical.
- Live-reference re-measurement (agent-browser, both sites, both viewports, logged in): all
  S75/S76 pinned surfaces re-verified GREEN byte-exact; ONE new delta family measured — the
  search surface (the reference's full-screen z-[70] overlay with the max-w-2xl column, the
  Cormorant 18/24px input, single-column 80px description-bearing rows, description-inclusive
  matching, authored-order results vs the clone's header-anchored dropdown + in-panel swap +
  category labels + rating ordering).
- Remediation plan (Session 77) appended with the measured-values table, validated against the
  codebase, executed TDD-first: RED batch (23 unit pins — search-overlay component ×10,
  search-route contract ×4, seed-seam ×2, layout-token S77 ×7) ran 11-failing → GREEN.
  Implementation: the shared search-overlay.tsx (store state + StoreChrome render site; the
  dropdown + PanelSearch retired), the /api/search field/order/payload contract, the seed's
  datasourceUrl seam, the twitter-card fallback, the product metadata isActive filter, the
  gen-gallery-variants cleanup, the money comment, npm audit fix (next 16.4.5 + prisma 6.12.0 +
  the lockfile root name), the push-target cluster, the zod/vitest risk ledger.
- Refined post-measurement: backdrop-blur-xs (v4's xs = the reference's 4px; its sm is 8px — the
  rename trap) + the input's leading-[1.1] (the reference's tight heading box).
- E2E updates: the panel-search spec rewritten (the SEARCH row opens the overlay; the full-screen
  box pinned against viewportSize() — the iPhone 13 descriptor's viewport is 390×664, not 844);
  the storefront search spec extended (1440×900 box, the 672px column, the 24px Cormorant input,
  the 80×624 rows, the shortDescription copy); the two q=silk product resolutions switched to
  q=pillowcase (the authored-order flip made results[0] the sold-out bonnet).
- Final gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 599/599 unit (+23) · clean build ✓ ·
  77/77 e2e.
- The fixed surfaces re-measured GREEN against the live reference (byte-exact: the overlay
  full-screen z-70 bg/95 blur(4px), the column x:384 w:672, the input 24px Cormorant ±2px, the
  mobile input 18px/20px ±1px, 4 rows @624×80 @84px rhythm in the authored order with
  description lines, ৳ prices).
- Screenshots regenerated; docs sweep: REMEDIATION_PLAN Session 77 (this execution log),
  session_10.md, worklog (this entry), README (599/77 + the search row), AGENTS.md (the S77
  search-surface + mobile-menu contracts, the db-path seed correction, the dependency-risk
  ledger), CLAUDE.md (599/77 + 19-product + push target + the S77 parity paragraph), PAD v2.5,
  ely-beauty_SKILL.md v2.5.0 (the H1 retitled) with five new encoded traps.
- Commit + push to main through the SSH wrapper (fast-forward, no new branches; remote verified).

Stage Summary:
- Run 77 complete: the search-overlay parity cycle — the reference's full-screen search surface
  (both entry points, the Cormorant input, the 80px description-bearing rows, the
  description-inclusive authored-order typeahead) closed to byte-exact, the dependency hygiene
  landed (next's 3 critical CVEs patched; the accepted-risk ledger recorded), the push-target
  landmine defused (all three stale references now say ely-beauty), the seed routed through the
  db-path seam, and the docs-truth debt paid (counts, the 19-product catalog, the SKILL H1). The
  suite grew 576 → 599 unit / 77 e2e. New traps encoded: the v4 backdrop-blur rename; the iPhone
  13 descriptor's 664px viewport; source-pin comments must not quote the retired pattern; a
  search-ordering change is a test-fixture blast radius; npm audit fix's safe lane vs the
  deliberate-epic majors.

---
Task ID: 78
Agent: Super Z (main agent + 78-a read-only audit subagent)
Task: Run-78 cycle for github.com/nordeim/ely-beauty — workspace refresh (fresh clone; the sandbox
was recycled), docs review, gates re-validation, deep audit 78-a, live-reference re-measurement
(the mobile-menu priority surface included), TDD remediation (S78-1..S78-10), screenshots, the
docs sweep, commit + SSH push to main.

Work Log:
- Fresh clone to 1ccecc5 (the operator's run-77 log commits); docs re-read
  (AGENTS/CLAUDE/README/PAD v2.5/SKILL v2.5.0/session_10/session_11/REMEDIATION_PLAN/worklog +
  the skills catalog, web-application, tdd, agent-browser, tailwind-patterns,
  code-review-checklist skills); skills/ excluded from all checking per contract; the
  homenest-store-s reference repo spot-cloned for the tech-stack patterns (task context).
- Environment: .env from .env.example (fresh AUTH_SECRET), db/ at the repo root, db:setup seeded
  (19 products); the sandbox's ambient DATABASE_URL (outside the repo) converged via the
  documented symlink; Playwright chromium binaries installed for the fresh sandbox.
- Gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 599/599 unit ✓ · clean
  build ✓ · 77/77 e2e ✓ — the docs' claimed state matched reality.
- Deep audit 78-a (read-only subagent; web-application + code-review-checklist methodology):
  9/9 anchors PASS, 0 CRITICAL/HIGH code defects; 3 MEDIUM (the search overlay's result list
  has NO scroll container — 8 capped rows (~784px) overflow the 664px e2e viewport with nothing
  scrollable; the store-provider scroll-lock comment claims "any overlay" while the code locks
  panel+drawer only; CLAUDE.md still says "74 e2e") + 4 LOW (the overlay's missing dialog
  semantics + shell inert; two stale backdrop-blur-sm comments; the undocumented
  eslint-chain moderates; the half-repaired S76-9 historical line) + 1 NIT accepted (LIKE
  wildcards — the live reference behaves identically; escaping would diverge) + 2 INFO.
- Live-reference re-measurement (agent-browser, both sites, 390×844 + 1440×900, logged in):
  every S75/S76/S77 pinned surface re-verified GREEN byte-exact — the mobile-menu priority
  surface included (panel y:64 h:214, 4×14px links @36px rhythm, the SEARCH row,
  toggle/navigate-close, the conditional-mount pattern). FOUR new deltas measured on the search
  surface: D-1 the list container (the reference's mt-6 space-y-1 max-h-[60vh] overflow-y-auto —
  scrollH 668 vs clientH 506 with 8 rows; the clone's uncapped flex flex-col gap-1), D-2 the
  1-char floor (the reference returns its capped 8-row set for "e"; the clone floored at 2),
  D-3 the rows' 2px corners (its rounded-md under the shadcn radius scale), D-4 the no-results
  copy (No products found for "zzzzq" vs the clone's No products match).
- The Session 78 plan (S78-1..S78-10) appended to docs/REMEDIATION_PLAN.md and validated
  against the codebase (every change site named and pre-read), then executed TDD-first:
  the RED batch (14 new unit pins across search-overlay ×6, search-route ×2, layout-tokens ×6)
  ran 12-failing → GREEN implementations → 613/613 unit. The list gained the reference's scroll
  geometry (byte-exact: both sites 506.4px cap, 668/506 scroll), the floor dropped to 1 char,
  the rows gained rounded-[2px], the no-results copy matched, and the overlay gained
  role="dialog" + aria-modal with StoreChrome's shell inert widened to cover the open overlay.
- E2E: +2 specs (the mobile 8-row reachability guard on the 664px viewport; the desktop
  scroll/dialog-geometry pin) → 79/79 e2e after a clean rebuild.
- Refined post-measurement: byte-exact list-cap parity confirmed on both viewports
  (506.4px @844vh, 540px @900vh); the mobile nav re-verified ±1px.
- Docs sweep: AGENTS.md (the S78 search-surface contract + the S78-8 ledger entry), CLAUDE.md
  (613/79 counts), README (counts + the search row + the reachability guard), PAD v2.6 (the
  revision block), ely-beauty_SKILL.md v2.6.0 (project_state + the Session 78 entry with five
  encoded traps), REMEDIATION_PLAN Session 78 (the plan + this execution log), session_12.md,
  worklog (this entry).
- Screenshots regenerated to docs/screenshots/ (the capture script against the dev server);
  .env.example verified to match the codebase (DATABASE_URL="file:../db/custom.db" contract,
  Stripe vars, SITE_URL, AUTH_SECRET, TRUST_CF_CONNECTING_IP, DEMO_MODE) and included in the
  commit.
- Final gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 613/613 unit ✓ · clean build ✓ ·
  79/79 e2e ✓. Commit + push to main through the SSH wrapper (fast-forward, no new branches;
  remote verified).

Stage Summary:
- Run 78 complete: the search-overlay reachability & micro-parity cycle — the overlay's result
  list now scrolls inside the reference's measured 60vh cap (the run-77 bug: 8 broad-term rows
  permanently unreachable below the fold), the search floor is the reference's 1 character, the
  rows carry its measured 2px corners, the no-results copy matches, and the full-screen sheet
  is a real modal to assistive tech (role=dialog + aria-modal + the inert shell — the invisible
  a11y superset). The suite grew 599 → 613 unit / 77 → 79 e2e. The operator's mobile-menu
  priority surface re-verified byte-exact; the Tailwind v4 conditional-mount pattern holds.
- New traps encoded: a full-screen overlay needs its OWN scroll surface (fixed inset-0 never
  scrolls); parity includes failure copy and input floors, not just happy-path geometry; theme
  radius scales are relative (the reference's rounded-md = 2px vs v4's 6px — pin measured
  pixels); comments quoting retired class names are prose-scan landmines (now pinned).

---

Task ID: 73
Agent: run-79 executor (the overlay focus-management, fresh-sheet & body-hardening cycle)
Task: The full remediation cycle on the surviving workspace (git pull at 1b46d3a): docs review → gates re-validation (613/613 unit, 79/79 e2e, clean build — docs matched reality) → deep audit 79-a (read-only subagent, web-application + code-review-checklist methodology, skills/ excluded: 12/12 anchors PASS, 0 CRITICAL/HIGH, 2 MEDIUM, 5 LOW, 6 INFO) → live-reference re-measurement (agent-browser, both viewports, logged in; the mobile-menu priority surface byte-exact ±1px; TWO new search-surface deltas measured: the serif price + the reset-on-reopen) → the Session 79 plan (S79-1..S79-10, validated against the codebase) → TDD execution (RED 12 → GREEN; 613 → 634 unit, 79 → 82 e2e) → 25 screenshots off the dev server → the docs sweep (AGENTS/CLAUDE/README/PAD v2.7/SKILL v2.7.0/session_14/this worklog/REMEDIATION_PLAN Session 79) → commit + SSH-wrapper push to main.

Work Log:
- The aref] "selector bug" was RETRACTED mid-cycle: byte-level verification proved the drawer's wrap selector was always `a[href]` — the corruption was the bash display pipeline eating `[h` (the run-78 artifact class). The pin stays as a regression guard; the lesson is encoded in the SKILL trap log.
- The S79-7 limiter-first reorder surfaced a latent 27-session-old TEST flaw: the api-boundaries xff helper put per-test IPs in the spoofable LEFTMOST hop — all requests shared ONE 198.51.100.1 budget bucket, masked by the old parse-before-limit order. Fixed: per-test IPs now ride the RIGHTMOST (trusted) hop.
- The bounded parseJsonBody seam (src/lib/json-body.ts): content-type gate, 32KB declared/streamed cap with mid-read cancel, null-for-malformed keeping the routes' byte-identical 400 envelope; all 9 JSON routes migrated, zero request.json() calls remain (source-pinned).
- The overlay is a full modal citizen now: openerRef focus restoration, Tab-wrap handler, focus-visible rings, aria-expanded/haspopup on the header button, the render-time prev-open reset (lint-clean form), font-display on the row price.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 634/634 unit · clean build · 82/82 e2e.
- Every fixed surface pinned: the serif price (e2e computed-style), the fresh sheet + focus restoration (e2e), the seam contract (8-case truth table), the source contracts (7 layout-token pins).
- Dev-server screenshots: 25/25 regenerated and validated.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 74
Agent: run-80 executor (the overlay empty-state, no-results centering & webhook raw-body cycle)
Task: The full remediation cycle on the RESET workspace (fresh clone at 8feb3d1): environment rebuild (npm install, .env with a generated AUTH_SECRET, db:setup, the DATABASE_URL shadow converged via the documented symlink) → docs review → gates re-validation (634/634 unit, 82/82 e2e, clean build — docs matched reality) → deep audit 80-a (read-only subagent, web-application + code-review-checklist methodology, skills/ excluded: 12/12 anchors PASS, 0 CRITICAL/HIGH, 1 LOW, 3 INFO) → live-reference re-measurement (agent-browser, logged in, both viewports; the mobile-menu priority surface byte-exact ±1px; the shop catalog order 19/19 — the re-baseline concern closed; TWO new deltas measured on the empty/failure states: the empty-query hint + the no-results copy's straight quotes/period-free/centered form) → the Session 80 plan (S80-1..S80-6, validated against the codebase) → TDD execution (RED 16 → GREEN; 634 → 650 unit, 82 → 85 e2e) → 25 screenshots off the dev server → the docs sweep (AGENTS/CLAUDE/README/PAD v2.8/SKILL v2.8.0/session_16/this worklog/REMEDIATION_PLAN Session 80) → commit + SSH-wrapper push to main.

Work Log:
- The [h-eating bash display artifact struck this session's own probes twice (the audit's S79-5 read-back + this session's parity probes) — byte-level codepoint probes (JSON.stringify + codePointAt) proved both files correct; no phantom findings actioned.
- The bounded readRawBody seam (src/lib/json-body.ts): the shared readBodyTextBounded byte-walk under both seams; declared content-length fast-fail over the 64 KB cap, streamed cancel mid-read, string | null → 400 "Payload too large." feeding constructEvent; the only sanctioned request.text() site is the seam module itself (source-pinned).
- The overlay's empty state: the hint (Start typing to search our collection, py-8 text-center) gated on the query — the fresh-sheet reset lands on it; the no-results copy is the reference's codepoint-exact bytes (&quot; entities render the straight quotes react/no-unescaped-entities forbids in raw JSX text).
- The zod 3→4 migration epic: deliberately deferred again (documented) — a major-version schema migration deserves its own dedicated cycle with full gate validation.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 650/650 unit · clean build · 85/85 e2e.
- Every fixed surface pinned: the hint (4 unit + 2 e2e), the no-results copy (3 unit + 1 e2e with computed style + codepoints), the raw-body seam (7-case truth table + source pins).
- Dev-server screenshots: 25/25 regenerated and validated (dimensions + non-blank).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 75
Agent: run-81 executor (the category-model, dual-filter & one-page-grid cycle)
Task: The full remediation cycle on the surviving workspace (git pull to 2c3a646): docs review → gates re-validation (650/650 unit, 85/85 e2e, clean build — docs matched reality) → deep audit 81-a (read-only subagent, web-application + code-review-checklist methodology, skills/ excluded: 12/12 anchors PASS, 0 CRITICAL/HIGH/MEDIUM, 3 LOW, 2 INFO; run-80 verified regression-free) → live-reference re-measurement (agent-browser, both viewports, logged in; every pinned surface re-verified GREEN; the reference's public entity API captured its AUTHORITATIVE category model — the category_ids many-to-many + the template category string) → the Session 81 plan (S81-1..S81-12, validated against the codebase) → TDD execution (RED 33 → GREEN; 650 → 677 unit, 85 → 88 e2e) → 25 screenshots off the dev server → the docs sweep (AGENTS/CLAUDE/README/PAD v2.9/SKILL v2.9.0/session_18/this worklog/REMEDIATION_PLAN Session 81) → commit + SSH-wrapper push to main.

Work Log:
- The category-model discovery: probing the reference's link targets (home tiles link by category ENTITY ID; the nav links ?category=skincare/body_care) revealed a dual category system; /api/entities/Product + /api/entities/Category (read with the operator's logged-in session) confirmed it exactly — every product carries category_ids (an ARRAY; the cleansing brush dual-member, six products uncategorized) + a category STRING (skincare/lip_care/body_care) driving the breadcrumb eyebrow, the nav/footer links, and a template filter mode (h1 "Shop", no pill active). The 20th API product is is_published: false — the 19-product catalog confirmed.
- The fix: the ProductCategory junction + templateCategory column (destructive db:push; a reseed rebuilds the wiring — the existing dev db converged with one db:seed run), resolveCategoryFilter's dual mode, the reference's exact memberships (7/3/4 with the dual; 6 uncategorized), the nav/footer template links, the detail eyebrow, the 3-newest-excluding-self ritual, PER_PAGE 24 (the one-page grid), the centered Cormorant empty state, the guarded parseShippingMetadata seam (audit L-1), the admin checkbox multi-select with transactional junction writes, and restore-demo-stock's wiring backstop.
- Tooling traps survived: the [h-eating bash artifact struck on the hydration-marker grep (a codepoint probe proved the file correct); a wedged dev-server/browser pair (Fast Refresh loop, never hydrating) resolved by restarting both — the production e2e suite was the truth; the sort-label colon regression ("Name: A-Z") was caught by the e2e immediately.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 677/677 unit · clean build · 88/88 e2e.
- Every fixed surface verified against the reference's measured values (the dual filter modes, the memberships, the eyebrow, the ritual, the empty state, the CTA, the mobile panel ±1px).
- Dev-server screenshots: 25/25 regenerated and validated.
- Pushed: main via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 76
Agent: run-82 executor (the overlay price-format parity & admin-undo cycle)
Task: The full remediation cycle on the RESET workspace (fresh clone at 515bfa5): environment rebuild (npm install, .env with a generated AUTH_SECRET, db:setup, the DATABASE_URL shadow converged via the documented symlink, Playwright chromium) → docs review → gates re-validation (677/677 unit, 88/88 e2e, clean build — docs matched reality) → deep audit 82-a (read-only subagent, web-application + code-review-checklist methodology, skills/ excluded: 12/12 standing anchors PASS, 0 CRITICAL/HIGH/MEDIUM, 3 LOW, 8 INFO; run-81 verified regression-free) → live-reference re-measurement (agent-browser, both viewports, logged in; the mobile-menu priority surface byte-exact ±1px on both sites; every pinned surface re-verified GREEN) → the Session 82 plan (S82-1..S82-7, validated against the codebase) → TDD execution (RED 15 → GREEN; 677 → 691 unit, 88 → 90 e2e) → 25 screenshots off the dev server → the docs sweep (AGENTS/CLAUDE/README/PAD v2.10/SKILL v2.10.0/session_20/this worklog/REMEDIATION_PLAN Session 82) → commit + SSH-wrapper push to main.

Work Log:
- The discovery (D-82-1): the reference's overlay row price renders the Base44 template's USD format — "$370.00", ASCII U+0024 codepoint-verified, always two decimals, Cormorant 14px/300 — while its grid/detail prices stay ৳. The clone had unified on ৳ everywhere; the prior "font-light ৳ price" pin imputed the grid currency. Fixed with the pure formatOverlayPrice seam (overlay-scoped; every other money surface keeps ৳ — verified on the grid card, the detail page, and the body scan).
- The audit fixes: the schema junction comment corrected to the declared FK split; the stale seed comment updated to the S81-3 template-slug mapping; the admin dialog's "None" option through the pure normalizeTemplateCategory seam (the clear path — Radix Select cannot deselect); the ordered productCategoryInclude (deterministic first display category); the P2003 mapping in upsertProductAction; the transactional single-read restore-script rebuild.
- GREEN-phase corrections: `as const` on the ordered include broke the typecheck (Prisma rejects readonly orderBy arrays) — `satisfies Prisma.ProductInclude` is the fix; two e2e pins (mobile-navigation, storefront) carried the old ৳ overlay expectation and were updated to the $ format.
- The operator's standing instructions verified: DATABASE_URL="file:../db/custom.db" with db/ at the repo root (the .env contract + db-path resolution + the symlink convergence, all held); vitest + playwright configs complete and green; the sitemap/robots/JSON-LD/OG/security-header surfaces verified on the running dev server; the homenest-store-s spot-clone confirmed the tech-stack patterns (the direct ancestor).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 691/691 unit · clean build · 90/90 e2e.
- Every fixed surface pinned: the formatOverlayPrice truth table (×4 unit + the e2e codepoint pin), the None clear path (×3 unit + the e2e clear-and-revert), the ordered include / P2003 mapping / transactional rebuild (source pins).
- Dev-server screenshots: 25/25 regenerated and validated (dimensions + non-trivial sizes).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 77
Agent: run-83 executor (the e2e concurrency-isolation & USD-remnant cycle)
Task: The full remediation cycle on the SURVIVING workspace (git pull to 3d567ad): docs review → gates re-validation (which surfaced a 2-of-6-runs e2e flake — the cycle's discovery) → deep audit 83-a (read-only subagent: 12/12 anchors PASS, 0 CRITICAL/HIGH/MEDIUM production defects, 1 HIGH test-infra, 1 LOW, 1 INFO) → live-reference re-measurement (ZERO new parity deltas — every pinned surface GREEN on both sites) → the Session 83 plan → TDD remediation (S83-1..S83-5, RED 7 → GREEN) → the self-heal verification → 25 screenshots → the docs sweep → commit + SSH push to main.

Work Log:
- The flake root-cause (full error evidence on the second reproduction): three modes, one family — the ungated post-search Edit click racing the native-GET navigation + re-hydration (abort mid-mutation → durable dirt), the observable mutation windows (bestsellers 4→5 / skincare 12→11) landing inside parallel storefront count pins, and the same-product full-row-upsert clobber between S81-11 and S82-3 (audit 83-a's extension). CI's workers: 1 masked the class; the fresh-server restore backstop healed the dirt between invocations.
- The fix set: the serialized admin-catalog Playwright project (workers: 1 — projects run sequentially, mutations execute alone after every reader); the gated searchProductsAndOpenDialog helper (waitForURL + the hydration sentinel before the client-island click); the S81-11 self-heal opening (verified end-to-end: dirt seeded → heals + passes → post-run state seed-clean); the analytics nested orderBy (the S82-4 determinism gap + the comment correction); the USD/US remnant sweep (the dead United States fallbacks ×2, the $0.00 AOV zero-state → formatMoney(0)).
- The GREEN-phase correction: the S83-5 comment initially quoted the banned literal — the source pin caught its own fixing comment (encoded as SKILL trap 5).
- The live reference re-measured on both viewports: the mobile panel 89/125/161/197/233 vs the clone's 88/124/160/196/232 (±1px), the overlay $X.00 rows byte-exact (cp 36, two decimals, Cormorant 14px/300; the desktop input 24px/300, column x:384 w:672), the shop 19/19 authored order, the detail ৳370 Inter 24px/600 — ZERO new deltas; the clone's server-side probe 8/8.
- The operator's standing instructions verified: DATABASE_URL="file:../db/custom.db" with db/ at the repo root (the symlink convergence intact, same inode); vitest + playwright configs complete and green (the playwright config now three projects); the sitemap/robots/JSON-LD/OG/security surfaces verified on the running server; .env.example re-verified 9/9 (committed); the mobile menu — the priority surface — verified working on BOTH sites (geometry ±1px, toggle-close, SEARCH-row → overlay, route-change close; no Tailwind v4 display-toggle anywhere in the contract).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 698/698 unit (+7) · clean build · 90/90 e2e ×3 consecutive full-suite runs (the flake closed structurally and empirically).
- Every fixed surface pinned: the e2e-infrastructure pins ×3 (the project split, the gated helper, the self-heal) + the layout-tokens S83 pins ×4 (the analytics orderBy, the comment, the US-fallback ban, the $0.00 ban).
- Dev-server screenshots: 25/25 regenerated and validated (dimensions + non-trivial sizes).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 78
Agent: run-84 executor (the overlay-input parity & self-heal-closure cycle)
Task: The full remediation cycle on the SURVIVING workspace (git pull 18aee4a → d2f20c0): docs review → gates re-validation (all green, 90/90 e2e on the FIRST run — run 83's serialized admin-catalog project holding) → deep audit 84-a (read-only subagent: 12/12 anchors PASS, 0 CRITICAL/HIGH, 1 MEDIUM M-1, 1 LOW L-1, 3 INFO) → live-reference re-measurement (every pinned surface GREEN, zero deltas — plus TWO new micro-deltas on the overlay INPUT: the reference's font-light 300 vs the clone's 400, the /60-dimmed placeholder vs full opacity; and ONE clone-side glyph: Chromium's native search-cancel button, pixel-cluster evidence) → the Session 84 plan → TDD remediation (RED 5+1 → GREEN) → the end-to-end globalSetup-heal verification → screenshots → docs sweep → commit + push.

Work Log:
- The reference re-measured on both viewports with the S81-3 panel content byte-verified again (labels AND hrefs: Shop/Beauty Tools→skincare/Brush & Combs→body_care/About), the "silk" overlay set ($370.00/$288.00/$470.00/$520.00 cp 36 two-decimals Cormorant 14px/300, the Bonnet's no-desc row), /shop 19 one-page bonnet-first, the detail ৳370 Inter 24px/600, the footer template slugs, and the --accent = --secondary = 30 15% 93% identity (the row-hover class-name difference renders identically). The clone probe: 8/8 server checks + the panel ±1px + the overlay rows byte-exact.
- The fixes: the overlay input's font-light + placeholder /60 (one line, both viewports); the native search-cancel-button suppression (scoped globals.css rule; type=search stays for the searchbox role, verified by pixel-cluster analysis before/after); the globalSetup heal (probes :3100, restores the catalog BEFORE any project when a server is already listening — verified end-to-end: dirt seeded + confirmed LIVE on the reused server (skincare 11) → the storefront spec 22/22 GREEN → post-run state seed-clean); the symmetric S82-3 opening heal (the S83-3 discipline); the taka rewording (validation.ts ×4 + coupon-dialog ×2 + comments, never quoting the banned literals in the fixing comments).
- The GREEN-phase correction: the D-1b S75 pin (the overlay input's class-order regex) updated for the font-light insertion; the S83-5 trap-5 lesson honored throughout (no fixing comment quotes its banned literal).
- The operator's standing instructions verified: DATABASE_URL="file:../db/custom.db" with db/ at the repo root (the .env contract + db-path resolution + the symlink convergence, all held); vitest + playwright configs complete and green (the playwright config now three projects + globalSetup); the sitemap/robots/JSON-LD/OG/security surfaces verified on the running server (sitemap 28 public-only); .env.example re-verified 9/9 (committed); the mobile menu — the priority surface — re-verified end-to-end on both sites (panel ±1px, toggle/route close, the SEARCH row → overlay, e2e mobile-navigation spec green ×4 runs); Tailwind v4 traps intact (no display-utility toggles, @theme full hsl, the @source not guard — all audit-anchored PASS).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 704/704 unit (+6) · clean build · 90/90 e2e ×3 consecutive (4 total green runs this session).
- Every fixed surface pinned: the S84-1 input pin (font-light + /60 + the lookahead ban), the S84-1b cancel-button pin, the S84-2 globalSetup pin, the S84-3 self-heal pin, the S84-4/4b taka-copy pins (+ the D-1b class-order update).
- Dev-server screenshots: 25/25 regenerated and validated (none undersized).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 79
Agent: run-85 executor (the admin taka-copy completion & comment-scope cycle)
Task: The full remediation cycle on the RECYLED workspace (fresh clone at cd4ecd9 after a mid-cycle sandbox recycle; the identical change-set re-landed and every gate re-verified): environment rebuild (npm install, .env with a generated AUTH_SECRET, db:setup, the DATABASE_URL shadow converged via the documented symlink, Playwright chromium) → docs review → gates re-validation (704/704 unit, 90/90 e2e on the first run) → deep audit 85-a (read-only subagent, web-application + code-review-checklist methodology, skills/ excluded: 12/12 standing anchors PASS, 0 CRITICAL/HIGH/MEDIUM, 2 LOW, 3 INFO; run-84 verified regression-free) → live-reference re-measurement (agent-browser, both viewports, logged in; the mobile-menu priority surface byte-exact ±1px on both sites; every pinned surface re-verified GREEN, zero new deltas) → the Session 85 plan (S85-1..S85-5, validated against the codebase) → TDD execution (RED 4 → GREEN; 704 → 708 unit) → 25 screenshots off the standalone server → the docs sweep (AGENTS/CLAUDE/README/PAD v2.13/SKILL v2.13.0/session_26/this worklog/REMEDIATION_PLAN Session 85) → commit + SSH-wrapper push to main.

Work Log:
- The discovery (audit L-1 + the concept census): the dollar-worded admin copy that survived BOTH the S83-5 symbol sweep and the run-84 S84-4 worded sweep — product-dialog's two labels ("Price ($)" / "Compare-at ($)") + two parse errors, and settings-form's threshold error + three "Enter dollars." helpers beneath labels that already read (৳). The census extended the audit's INFO-2 to seven comment sites (the coupon type-switch hazard example, the money alias doc, the SEO converter doc "decimal dollars" for what produces JSON-LD BDT prices, the settings-schema helper doc, the coupons page display note, the checkout zero-line guard, the cart-quantity zero-item note).
- The fixes: S85-1 the product-dialog labels/errors → taka (৳); S85-2 the settings-form error + helpers → taka with the doc comment describing the taka ⇄ poisha edit (the *Dollars field names recorded as heritage); S85-3 the seven comment rewordings (no fixing comment quotes its banned literal — the S83-5 trap-5 lesson); S85-4 the globals.css S84-1b comment stating the real app-wide scope (three admin GET-form search inputs covered deliberately — no rule change); S85-5 AGENTS.md's DATABASE_URL contract naming scripts/restore-demo-stock.ts as the second lockstep site of the db-location truth.
- The live reference re-measured on both viewports: every pinned surface GREEN, ZERO new deltas (the panel rows 89/125/161/197/233 byte-verified, the silk overlay set $370/$288/$470/$520 on 80px/2px rows, the detail ৳370 Inter 24px/600, /shop 19 bonnet-first, the desktop overlay input 24px/300 at column x:384 w:672, the footer template slugs). The clone probe: byte-parity, no native search-cancel glyph, the S79-4 focus-visible ring's first positive visual evidence (a lenient <180 threshold caught the ≈125-gray ring run-84's <120 scan missed — the a11y superset, not a delta; investigated to closure).
- The operator's standing instructions verified: DATABASE_URL="file:../db/custom.db" with db/ at the repo root (the .env contract + db-path resolution + the symlink convergence, all held); vitest + playwright configs complete and green (three projects + globalSetup); the sitemap/robots/JSON-LD/OG/security surfaces verified on the running server (sitemap 28 public-only); .env.example re-verified 9/9 (committed); the mobile menu — the priority surface — verified working on BOTH sites (geometry ±1px, toggle-close, SEARCH-row → overlay, route-change close; no Tailwind v4 display-toggle anywhere in the contract; the e2e mobile-navigation spec green in every run).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 708/708 unit (+4) · clean build · 90/90 e2e ×2 consecutive (3 green runs total counting the prior session's post-fix run on the identical change-set).
- Every fixed surface pinned: the S85-1..S85-4 pins in tests/unit/layout-tokens.test.ts (the taka-copy completion + the comment-scope + the comment-accuracy assertions).
- Dev-server screenshots: 25/25 regenerated and validated (dimensions + non-trivial sizes).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 80
Agent: run-86 executor (the zod 3→4 migration cycle)
Task: The full remediation cycle on the pulled tree (f44bea9 = 3a7febe + the operator's session_27.md log; run 85 verified pushed): workspace refresh → docs review (AGENTS/CLAUDE/README/PAD v2.13/SKILL v2.13.0/session_26/session_27/worklog/REMEDIATION_PLAN through Session 85) → gates re-validation (708/708 unit, 90/90 e2e first run, clean build) → deep audit 86-a (read-only subagent, web-application + code-review-checklist methodology, skills/ excluded: 12/12 standing anchors PASS, run-85 regression-free, 0 CRITICAL code defects — 1 HIGH = the zod advisory itself, 2 LOW, 6 INFO; plus the exhaustive runtime-probed zod census) → live-reference re-measurement (agent-browser, both viewports, logged in; the mobile-menu priority surface ±1px with byte-identical hrefs; zero new parity deltas; two a11y supersets recorded) → the Session 86 plan (S86-1..S86-6, validated against the codebase) → TDD execution (RED 4 → GREEN; 708 → 717 unit) → 25 screenshots off the standalone server (after resolving the stale-server false alarm by PID) → the docs sweep (AGENTS ledger/CLAUDE/README/PAD v2.14/SKILL v2.14.0/session_28/this worklog/REMEDIATION_PLAN Session 86) → commit + SSH-wrapper push to main.

Work Log:
- The discovery (audit 86-a + the census): zod 3.25.76 carries the unpatchable HIGH advisory GHSA-mrhx-c7xc-m3w5 (fixed only in ≥4.6.7 — v3 end-of-line, prod-direct). The census: 1 hard break (stripe-payment.ts:343 single-arg z.record — dormant: constructs silently, throws at parse in the v4 preview, v3-compat in shipping 4.6.7), 3 deprecation classes (.email() ×1, {message:} params ×3, z.ZodIssueCode ×3), v4 default-text rewrites for the ~50 un-messaged backstop checks (no test pins them; the four e2e error-text asserts all target explicit messages), .default() chain semantics changed but probed value-identical across all 30 sites, everything else verified unchanged.
- The fixes: S86-1 npm install zod@^4.6.7 + the two-arg z.record fix + the v4 sentinel pin + the webhook-metadata pin (the dormant-break repro — no earlier test event carried metadata); S86-2 the deprecation modernization (the emailSchema pipe restructure — probe-verified message-identical across a 15-input battery; ZodIssueCode.custom → "custom" ×3; {message:} → {error:} ×3 across validation.ts + settings-schema.ts); S86-3 the message-policy acceptance DOCUMENTED in the plan; S86-4 the kitchenware placeholder trio → the store's conventions (rosehip-glow-serum / ELY-020 / "Material: Bamboo / Bristle type: Soft"); S86-5 the dead exports deleted (stripePublishableKey, ROLES — zero consumers re-verified pre-delete); S86-6 the BD-localization copy (the account phone +880 1712 345678; the order dialog Pathao, RedX, Sundarban… + ABC123456789).
- The live reference re-measured on both viewports: every pinned surface GREEN, ZERO new deltas (panel rows 89/125/161/197/233 vs clone ±1px; the silk set $370/$288/$470/$520 at 80px/2px ±1px; detail ৳370 Inter 24px/600; /shop 19 bonnet-first; footer slugs byte-identical; the desktop overlay input Cormorant 24px/300 both sites). Two a11y supersets recorded, not reverted (the state-aware toggle label; the overlay rows as real Link hrefs).
- The stale-server false alarm: the post-migration capture showed the pillowcase detail page in a hydration error state — the pre-migration server still held :3000 (pattern-guess pkill missed it; the restart died EADDRINUSE), old in-memory code serving new on-disk chunks; localized by the e2e suite (fresh server) staying 90/90; killed by PID (ss -tlnp), restarted, verified healthy ("Color Sky Blue" present), 25/25 captured clean.
- The operator's standing instructions verified: DATABASE_URL="file:../db/custom.db" with db/ at the repo root (the .env contract + the symlink convergence, held); vitest + playwright configs complete and green; the sitemap/robots/JSON-LD/OG/security surfaces verified on the running server (sitemap 28 public-only); .env.example re-verified (no env changes this cycle); the mobile menu — the priority surface — verified working on BOTH sites (geometry ±1px, toggle-close, the SEARCH row → overlay, route-change close; the e2e mobile-navigation spec green in both consecutive runs); no Tailwind v4 display-toggle anywhere in the contract.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 717/717 unit (+9) · clean build · 90/90 e2e ×2 consecutive.
- Every fixed surface pinned: the v4 sentinel + the five message-preservation pins + the webhook-metadata pin (validation.test.ts + stripe-payment.test.ts), the three placeholder pins (layout-tokens.test.ts).
- The zod advisory GONE from npm audit (the remaining 11 = the accepted dev-only families: vitest/tinypool + the eslint toolchain).
- Dev-server screenshots: 25/25 regenerated and validated (dimensions + non-trivial sizes).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 81
Agent: run-87 executor (the lost-config build-resilience cycle)
Task: The full remediation cycle on the pulled tree (e395919 = ef98760 + the operator's session_29.md + docs/build_error.txt + prompt-to-review-3 edits; runs 85/86 verified pushed): workspace refresh → docs review (AGENTS/CLAUDE/README/PAD v2.14/SKILL v2.14.0/session_28/session_29/worklog/REMEDIATION_PLAN through Session 86 + build_error.txt) → the build-error diagnosis (scenario matrix, one shared install + cp -al variants: minus-tsconfig → the operator's 311-error block; minus-postcss → the @apply/tw-animate symptoms; minus-both → the log reproduced signature-for-signature; --omit=dev and root-inference ruled out by different signatures) → deep audit 87-a (read-only subagent, skills/ excluded: 12/12 standing anchors PASS, run-86 regression-free, 0 CRITICAL/HIGH/MEDIUM/LOW — 6 INFO; .env.example 9/9) → live-reference re-measurement (agent-browser, both viewports: zero new parity deltas — panel ±1px hrefs byte-identical, overlay input Cormorant 18px/300 ph /60, silk set ±1px ×4, /shop 19 bonnet-first, detail ৳370 Inter 24px both sites; supersets recorded) → the Session 87 plan (S87-1..S87-6) → TDD execution (RED 8 → GREEN; 717 → 725 unit) → the 4/4 poison-tree acceptance matrix + the standalone CSS-pipeline verification → 25 screenshots off the standalone server → the docs sweep (AGENTS contract/CLAUDE/README/PAD v2.15/SKILL v2.15.0/session_30/this worklog/REMEDIATION_PLAN Session 87) → commit + SSH-wrapper push to main.

Work Log:
- The discovery: docs/build_error.txt shows the operator's Next 16.4.5 Turbopack build dying with 312 module-not-found errors (311 @/ aliases + tw-animate-css) + 15 @apply/@utility unknown-at-rule warnings — while every reported-missing file was verified TRACKED and the fresh-clone tree green on every gate. The bisect: missing tsconfig.json kills the @/* paths (Turbopack reads aliases from root config; bare node_modules imports keep resolving file-relative — which is why ONLY @/ imports died) AND the build's type-check; missing postcss.config.mjs unregisters @tailwindcss/postcss so the CSS pipeline falls to raw PostCSS (@apply/@utility warnings) and the plugin-resolved @import "tw-animate-css" falls to Turbopack's bare-specifier CSS resolution (module-not-found). The mechanism: the operator's materialization drops files untouched since the 2026-10-12 initial migration — exactly the two build-critical root configs; everything recently modified survived.
- The fixes: S87-1 turbopack.resolveAlias {"@/*": "./src/*"} in next.config.ts (the identical mapping to tsconfig paths — the compilation belt; matrix-verified 311→0); S87-2 scripts/ensure-build-configs.mjs (CONFIG_FALLBACKS registry embedding the five 2026-10-12-vintage configs — tsconfig.json, postcss.config.mjs, vitest.config.ts, tsconfig.tests.json, eslint.config.mjs — write-if-missing-or-EMPTY, never overwrites; generated from the canonical files and self-verified byte-exact; each canonical file carries the S87-2 header comment naming its restore path); S87-3 the seven gated npm scripts (build/dev/lint/test/test:e2e/typecheck/typecheck:tests) chain the bootstrap first (~10ms, silent when nothing is missing); S87-4 the 8 pins in tests/unit/build-config-resilience.test.ts (the alias presence, registry↔canonical byte-sync, temp-dir restore, empty-vs-customized semantics, the script chain, the tracked check).
- The acceptance: 4/4 poison-tree builds GREEN on fresh installs — full tree (regression: resolveAlias coexists with the tsconfig alias), minus tsconfig, minus postcss, the operator's exact both-missing tree (bootstrap prints the restores; build completes; restored tsconfig byte-identical). The lost-both standalone server booted on :3200: HTTP 200, 92KB CSS with .container-page's @apply expanded — the tailwind pipeline verified working, not just the exit code.
- The live reference re-measured on both viewports: every pinned surface GREEN, ZERO new deltas (panel rows 125/161/197/233 vs clone 124/160/196/232 ±1px; the overlay input Cormorant 18px/300 with the /60 placeholder; the silk set all four rows ±1px — clone 173/257/341/425 vs reference 174/258/342/426; /shop 19 unique cards bonnet-first; the detail ৳370 Inter 24px on both sites; sitemap 28 public-only). The toggle-label ("Open menu"/"Close menu") and type=search overlay input supersets recorded, not reverted.
- The operator's standing instructions verified: DATABASE_URL="file:../db/custom.db" with db/ at the repo root (the .env contract + the symlink convergence, held); vitest + playwright configs complete and green; the sitemap/robots/JSON-LD/OG/security surfaces verified on the running server (sitemap 28); .env.example re-verified 9/9 by audit 87-a (committed); the mobile menu — the priority surface — verified working on BOTH sites (geometry ±1px, toggle-close, the SEARCH row → overlay; the e2e mobile-navigation spec green in both consecutive runs); no Tailwind v4 display-toggle anywhere in the contract.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 725/725 unit (+8) · clean build · 90/90 e2e ×2 consecutive.
- Every fixed surface pinned: the 8 build-config-resilience pins (the registry drift alarm is the maintenance contract).
- Poison-tree acceptance: 4/4 builds green including the operator's exact both-missing tree; CSS pipeline verified via compiled @apply output.
- Dev-server screenshots: 25/25 regenerated and validated (dimensions + non-trivial sizes).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 82
Agent: run-88 executor (the npm-audit retirement cycle)
Task: The full remediation cycle on the fresh-clone tree (36e85de = run-87 + the operator's session_31.md working notes + docs/start_server_log.txt; runs 85/86/87 verified pushed): workspace re-clone + symlink ritual → docs review (AGENTS/CLAUDE/README/PAD v2.15/SKILL v2.15.0/session_30/session_31/worklog/REMEDIATION_PLAN through Session 87/start_server_log.txt) → the operator-log signal diagnosis (11 vulnerabilities reproduced locally, decomposed to 3 root packages; the prisma CLI 6.12.0 / client 6.19.3 skew confirmed via db:setup's "Generated Prisma Client (v6.12.0)") → deep audit 88-a (read-only subagent, skills/ excluded: 12/12 standing anchors PASS, run-87 regression-free 4/4, .env.example 9/9) → the Session 88 plan (S88-1..S88-6) → TDD execution (RED 7+2 → GREEN; 725 → 735 unit; the deepmerge-ts advisory the prisma alignment surfaced, retired TDD-first mid-cycle) → npm audit 0 → the full gate chain → live-reference re-measurement (mobile 390×844, zero new parity deltas) → 25 screenshots off the standalone server → the docs sweep (AGENTS S77-10 ledger/CLAUDE/README 735/PAD v2.16/SKILL v2.16.0/session_32/this worklog/REMEDIATION_PLAN Session 88) → commit + SSH-wrapper push to main.

Work Log:
- The discovery: docs/start_server_log.txt shows the operator rebuilding from scratch — the S87 bootstrap verified in the field (build green on a tree their materialization rebuilt: "Compiled successfully in 13.6s", 22/22 static pages, all 40 routes; db:setup reseeded the exact 2 users / 4 categories / 19 products / 1 slide / 11 settings / 3 coupons catalog) — with two new signals: npm install's 11 vulnerabilities (9 moderate, 2 critical; the run-86-recorded accepted dev-only families) and db:setup's "Generated Prisma Client (v6.12.0)" (against the lockfile's 6.19.3 runtime). Both reproduced locally on the fresh clone, signature-identical.
- The decomposition: 2 CRITICAL tinypool advisories (GHSA-5gmw-xhrv-c9v3 + GHSA-85c8-ppgw-ccpr, prototype-pollution→RCE worker gadgets — tinypool 1.1.1 is a DIRECT vitest-3 dependency, the only edge in the tree) + 2 moderate @vitest/mocker advisories (GHSA-82fw-gwwq-j7x9 path traversal, GHSA-qxg6-89mg-rqv8 code injection; vitest 3.2.7 ∈ 0.0.95–4.1.10) + 1 moderate minimatch advisory ×7 packages (GHSA-g3hv-75wg-m249; nested 10.2.6 under @typescript-eslint/typescript-estree 8.72.1 via eslint-config-next — the patch exists only in ≥11.0.1 and typescript-estree@latest still declares ^10.2.2, so the ecosystem fix has not propagated).
- The fixes: S88-1 vitest ^3.2.4 → ^4.1.12 (registry-verified up front: vitest 4.1.12 depends on the PATCHED @vitest/mocker 4.1.12 and drops tinypool entirely — one major bump retires all four advisories; the anticipated vitest 5 was unnecessary. Compatibility surface checked before touching anything: no snapshot files, 7 jsdoc-pragma jsdom suites, plugin-react@5.1.1 peers vite ^4–^7, all 13 vi.mock targets are local alias/package mocks); S88-2 the scoped npm overrides — "@typescript-eslint/typescript-estree": { "minimatch": "^11.0.5" } (typescript-estree's only usage surface is lint-time file matching; the eslint gate re-verified green) and, mid-cycle, "@prisma/config": { "deepmerge-ts": "^8.0.2" } (the prisma alignment moved the CLI into the NEWLY-published GHSA-ggr8-5vv4-36mx range — vulnerable <8.0.0 via @prisma/config, in range from prisma 6.13 while the operator's 6.12.0 sat below it; @prisma/config's sole usage is the stable `deepmerge` named export via dynamic import; db:setup verified at runtime); S88-3 prisma + @prisma/client both ^6.19.3 (the latest 6.x for both; 7/8-rc out of scope) with the allowScripts entries refreshed in lockstep (prisma/@prisma/engines/@prisma/client at 6.19.3, stale 6.12.0 rows removed); S88-4 the 10 pins in tests/unit/toolchain-versions.test.ts.
- The one source fix: vitest 4 types vi.fn() as Mock<Procedure | Constructable>, which no longer satisfies session17-hardening.test.ts's `satisfies CategoryWriteClient` (6 TS errors in typecheck:tests) — the fakeDb mocks now carry the seam's exact function types (vi.fn<CategoryDeleteManyFn>() etc. with the S88-1 comment in-file). The other 63 test files ran UNCHANGED on vitest 4.1.12 — zero test edits, the toThrowError aliases included.
- The pin design: every assertion reads package-lock.json (what actually installs), not the declared ranges — a caret range keeps a stale resolution forever (the ^6.11.1 pair resolving CLI 6.12.0 + client 6.19.3 at different times is the proof). The prisma CLI↔client version-equality pin is the skew alarm; the two override-declaration pins are the drift alarms if anyone deletes the overrides block.
- The acceptance: npm audit → found 0 vulnerabilities (from 11; exit 0). db:setup prints "Generated Prisma Client (v6.19.3)" — the operator-log skew signal gone, the aligned pair verified at runtime with the deepmerge override in place. Gates: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 735/735 unit (+10) · clean build ✓ · 90/90 e2e ×2 consecutive (the first attempt's 79 failures were the fresh sandbox's missing Playwright browser binaries — `npx playwright install chromium`, environmental, then 90/90 ×2) · sitemap 28 public-only ✓ · 25/25 screenshots regenerated (19 of 25 BYTE-IDENTICAL to run-87's — the dependency-only parity signal; the 6 changed are the known raster-noise surfaces) · .env.example 9/9 unchanged.
- Audit 88-a (read-only subagent): 12/12 standing anchors PASS, run-87 regression-free (resolveAlias, registry, script chain, resilience pins), 0 CRITICAL/HIGH/MEDIUM/LOW — 4 INFO, all executed this cycle (the allowScripts refresh, the vitest declaration floor, the AGENTS ledger update, the health/webhook unmetered record).
- The live reference re-measured on mobile 390×844: panel rows SHOP/BEAUTY TOOLS/BRUSH & COMBS/ABOUT reference 135/171/207/243 centers vs clone 134/170/206/242 (±1px, the recorded tolerance; hrefs byte-identical; SEARCH row present both); the overlay input Cormorant Garamond 18px/300 with the /0.6-alpha placeholder on both; the "silk" set measured in the SAME panel-open state — reference 214/298/382/466 vs clone 213/297/381/465 (±1px ×4; the run-87 pins' 174/258/342/426 were the panel-closed state — both interaction states now recorded); /shop 19 unique cards bonnet-first on both (the clone's first href resolves to the same "Premium Double Sided Ruffles Silk Hair Bonnet" detail); the detail price ৳370 Inter 24px/600 on both. The recorded supersets present, not reverted (type=search input, role=dialog overlay, the toggle labels).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 735/735 unit (+10) · clean build · 90/90 e2e ×2 consecutive.
- npm audit: 0 vulnerabilities (from 11: 2 critical + 9 moderate) — the run-86 deferred debt fully retired.
- Every fixed surface pinned: the 10 lockfile-read toolchain pins (the prisma skew alarm, the vitest floor, the tinypool/mocker/minimatch/deepmerge absence-or-patched floors, the two override drift alarms).
- Dev-server screenshots: 25/25 regenerated and validated (19 byte-identical — the cheapest drift alarm there is).
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 83
Agent: run-89 executor (the post-retirement verification & typed-mock completion cycle)
Task: The full verification cycle on the pulled tree (7bf789c = run-88 pushed @ 75ba7c7 + the operator's docs/session_33.md raw narrative): workspace refresh (fast-forward, clean tree) → docs review (AGENTS/CLAUDE/README/PAD v2.16/SKILL v2.16.0/session_32/session_33/worklog/REMEDIATION_PLAN through Session 88) → the field-round-trip posture check (npm audit 0 prod+full, db:setup "Generated Prisma Client (v6.19.3)", 735/735 unit baseline) → deep audit 89-a (read-only subagent, skills/ excluded: 12/12 standing anchors PASS, R1–R8 run-87/88 regression surface PASS, 0 CRITICAL/HIGH/MEDIUM/LOW, 4 INFO) → live-reference re-measurement (mobile 390×844, zero new parity deltas; the overlay $-format re-verified end-to-end on both sites) → S89-1 (the audit's INFO-1: the typed-mock idiom completed at the two fakeDb override call sites) → the full gate chain → 25 screenshots off the standalone server → the docs sweep (REMEDIATION_PLAN Session 89/this worklog/session_34) → commit + SSH-wrapper push to main.

Work Log: the operator's standing instruction with the review pair `docs/session_32.md` (the run-88 polished log) + `docs/session_33.md` (the run-88 raw narrative + final report, pulled @ `7bf789c`). Run 88's dependency retirement (vitest 4.1.12, prisma 6.19.3 alignment, the two scoped overrides) needed its field-round-trip verification; the audit's one INFO with code weight needed retiring.

- Audit 89-a (read-only subagent, skills/ excluded): 12/12 standing anchors PASS, R1–R8 (run-87/88 regression surface) all PASS, 0 CRITICAL/HIGH/MEDIUM/LOW — 4 INFO. The five CONFIG_FALLBACKS byte-exact against the canonicals; the lockfile cross-checked (vitest 4.1.12, tinypool ABSENT, mocker 4.1.12, minimatch {11.0.5, 3.1.5}, deepmerge-ts 8.0.2, prisma == client == 6.19.3).

- Changes (S89-1): the two `fakeDb({ deleteMany: vi.fn()… })` override call sites in `tests/unit/session17-hardening.test.ts` now declare `vi.fn<CategoryDeleteManyFn>()` — completing the S88-4 typed-mock idiom file-wide (behavior-preserving; the audit's INFO-1). No product code touched.

- Live-reference re-measurement (mobile 390×844): panel rows reference 99/135/171/207/243 centers vs clone 98/134/170/206/242 (−1px uniform, hrefs byte-identical); overlay input Cormorant Garamond 18px/300 with the /0.6-alpha placeholder both sites; the "silk" set panel-open reference 214/298/382/466 vs clone 213/297/381/465 (−1px ×4); the overlay price format re-verified end-to-end — "$370.00"/"$288.00" on BOTH sites (the reference's overlay-only $ format that `formatOverlayPrice` mirrors); /shop 19 unique cards bonnet-first on both; detail ৳370 Inter 24px/600 on both. Supersets present (type=search, role=dialog, "Open menu" label, UL/LI/A overlay semantics). Zero new parity deltas. Reference-side observation recorded: a raw-ID string (`6a2bdd48591fe5701197b0ff`) sits in the reference home Bestsellers link text — a data artifact on their side; both /shop catalogs remain 19 with the identical first card.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 735/735 unit · clean build · 90/90 e2e ×2 consecutive.
- Field posture holding: npm audit 0 vulnerabilities (prod and full), db:setup prints 6.19.3 == 6.19.3.
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (16 byte-identical; the 9 changed are the known raster-noise family) · .env.example 9/9.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 84
Agent: run-90 executor (the coupon-label format, README-table drift & restock-parity cycle)
Task: The full remediation cycle on the pulled tree (99d9887 = run-89 pushed @ 21f72ab + the operator's docs/session_35.md raw narrative; no new operator signal artifacts): workspace refresh → docs review (session_34/session_35/REMEDIATION_PLAN/worklog) → posture re-verification (npm audit 0, db:setup 6.19.3 == 6.19.3) → deep audit 90-a (read-only subagent, skills/ excluded: 12/12 standing anchors PASS, R1–R6 PASS, 1 LOW + 3 INFO) → the live parity pass (mobile 390×844) → S90-1 (README architecture-table version cells, the audit F-1) → S90-2 (TDD: the coupon min-subtotal label via formatMoney — the audit F-3 UPGRADED from "output-equivalent" to a real comma-grouping divergence on the seeded SAVE20 path) → S90-3 (the S88-1 comment precision) → S90-4 (the mid-cycle parity finding: the reference restocked the four run-72 stock-0 products; the seed mirrors, TDD RED→GREEN, live-verified) → the full gate chain (737/737, e2e 90/90 ×2) → screenshots/sitemap/.env.example → the docs sweep (PAD v2.17, AGENTS S90-4 note, counts 737, REMEDIATION_PLAN Session 90, session_36, this worklog) → commit + SSH-wrapper push to main.

Work Log:
- Audit 90-a findings mapped to fixes: F-1 LOW (README table Prisma ^6.11/Zod ^3.25/Vitest ^3.2 stale after runs 86/88) → S90-1; F-3 INFO (the coupon label hand-builds the ৳ string) → S90-2 with the equivalence claim DISPROVEN (formatMoney comma-groups at ৳1,000+; the seeded SAVE20 minSubtotal 100000 made "৳1000" a live user-path divergence) ; F-4 INFO (the vitest-4 typing comment imprecise) → S90-3; F-2 INFO (fsevents allowScripts omission) → recorded, no action.
- The S90-4 discovery chain: the parity pass hit the clone's bonnet detail rendering OUT OF STOCK → DB stock 0 traced to the seed (ELY-001 stock: 0) → the seed value traced to the run-72 extraction snapshot (docs/reference-investigation.md: "Bonnet / 370 / — / 0") → the LIVE reference re-measured: all four run-72 stock-0 products (Bonnet/Curler/Spa Socks/Ice Bowl) now render active purchase panels (variants + ADD TO CART + BUY IT NOW; no numeric stock displayed) → the reference restocked since run 72; the clone's seed was stale against it.
- The S90-4 remediation: the restock pin in seed-catalog.test.ts (RED on the pulled seed: positive stock file-wide + the four named products) → the seed rows restocked (25/30/20/15 — the reference exposes no numbers; the visible contract is "purchasable") → applied via restore-demo-stock.ts (4 restored) after db:setup alone proved the S7-3 traffic-owned policy (reseeds never touch stock) → all four clone detail pages live-verified (ADD TO CART + BUY IT NOW, no out-of-stock) → the three stale "sold-out bonnet" comments in storefront.spec.ts + the run-72 note in seed-catalog.test.ts re-recorded → AGENTS.md :135 stock contract carries the S90-4 note. The out-of-stock rendering path retained (the correct superset for genuinely drained rows).
- The e2e orphan-server lesson: two 10-minute timeouts on the e2e gate were the KILLED runs' orphan next-server processes holding :3100/:3000 (the retries ran against wedged orphans) — kill -9 of the orphans, then the clean run passed 90/90 in 2.5m, and the consecutive second run 90/90 in 2.4m.
- The screenshot dead-server lesson: the first capture attempt wrote NOTHING (the e2e server died with its parent; the script's per-shot try/catch left the old files in place) — caught by git status showing ZERO changes where the restocked detail page had to differ; re-run against a live server produced the expected 9 changed shots (the detail page + the known raster-noise family; 16 byte-identical).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 737/737 unit (+2) · clean build · 90/90 e2e ×2 consecutive.
- Parity: zero deltas remaining — the restock delta closed (four detail pages now match the reference's purchasable state); panel/overlay/silk/shop/detail pins byte-consistent (−1px tolerances, hrefs byte-identical).
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (9 changed post-restock) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 85
Agent: run-91 executor (the API force-dynamic consistency & verification cycle)
Task: The full remediation cycle on a fresh-clone workspace (68a8a23 = run-90 code 8a36e75 + 2 docs commits, incl. the operator's docs/session_37.md raw narrative): environment rebuild (npm install 582 pkgs; .env written with DATABASE_URL="file:../db/custom.db"; db/ created at the repo root; the parent-shell DATABASE_URL shadow converged via the documented symlink; db:setup green at 19 products / 2 users / 3 coupons; Playwright chromium headless-shell installed — the documented run-88 fresh-sandbox environmental gap) → docs review (AGENTS/CLAUDE/README/PAD v2.17/SKILL v2.16.0/session_36/session_37/worklog/REMEDIATION_PLAN through Session 90) → deep audit 91-a (read-only subagent, skills/ excluded: 12/12 standing anchors PASS, R1-R8 regression surface PASS, 0 CRITICAL/HIGH/MEDIUM/LOW, 3 INFO) → the operator's named surfaces verified live (DATABASE_URL contract A1; mobile navigation Tailwind v4 trap scan clean + live parity; Vitest + Playwright suites 737/90; sitemap/SEO 28 public-only) → the live-reference parity pass (mobile 390×844, logged in with the operator credentials: panel −1px uniform, overlay "silk" set −1px ×4 with $-format prices, /shop 19 bonnet-first h1 "All Products" both sites, detail ৳370 Inter 24px/600 with the S90-4 restock holding — zero new deltas) → S91-1 (TDD: the force-dynamic sweep — all 13 API route files declare export const dynamic = "force-dynamic", RED 11/13 → GREEN, pinned by the api-boundaries source-scan describe) → the full gate chain (738/738 unit, 90/90 e2e ×2 consecutive) → 25/25 screenshots from the live standalone server → sitemap 28 / .env.example 9/9 / npm audit 0 → the docs sweep (PAD v2.18, SKILL v2.17.0 with the de-staled project_state, README/CLAUDE counts 738, AGENTS force-dynamic convention note, REMEDIATION_PLAN Session 91, session_38, this worklog) → commit + SSH-wrapper push to main.

Work Log:
- Audit 91-a findings mapped: INFO-1 (11 of 13 API route files lack the explicit force-dynamic declaration — the family SKILL §6 idiom; zero behavioral impact today since Next 15+/16 leaves request-reading handlers uncached, but a future route edit that stops reading the request could silently become static-cached) → S91-1 TDD; INFO-2 (two minimatch copies, both outside the vulnerable range, dev-only, toolchain-pinned) → recorded, no action; INFO-3 (allowScripts is npm-ignored documentation) → recorded, no action.
- The fresh-sandbox environmental sequence this run: the first e2e attempt's 79 failures were the missing chromium headless-shell binary (the documented run-88 lesson — `npx playwright install chromium`), after which 90/90 ×2 consecutive (2.3m + 2.4m).
- The S91-1 remediation detail: the pin reads every src/app/api/**/route.ts source (the e2e-infrastructure/layout-tokens file-reading convention) and asserts the declaration — RED listed the 11 files; GREEN added the two-line export to each (surgical diff: 2 lines per route, 32 in the test); the declaration placed after the import block following the two Stripe routes' placement convention.
- The docs-drift fix this cycle: ely-beauty_SKILL.md's project_state was still the run-88 record (735) after run-90 moved the count to 737 — the SKILL bumped to v2.17.0 with the current 738 state (the count-lockstep convention, enforced retroactively).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 738/738 unit (+1 pin) · clean build · 90/90 e2e ×2 consecutive.
- Audit 91-a: 0 CRITICAL/HIGH/MEDIUM/LOW (3 INFO — one fixed as S91-1, two recorded).
- Parity: zero new deltas vs the live reference (all measured pins byte-consistent within the recorded −1px tolerances).
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (6 changed: the raster-noise + data-dependent family) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 86
Agent: run-92 executor (the production-deploy hardening cycle)
Task: The full remediation cycle on a fresh-clone workspace (df631f1 = run-91 code 554d211 + 2 docs commits, incl. the operator's docs/session_39.md raw narrative): environment rebuild (npm install 582 pkgs; .env with DATABASE_URL="file:../db/custom.db" + a generated AUTH_SECRET — the production build's assertAuthSecret requires one; db/ at the repo root; the parent-shell shadow converged via the documented symlink; db:setup green at 19 products / 2 users / 3 coupons; Playwright chromium headless-shell installed) → docs review (AGENTS/CLAUDE/README/PAD v2.18/SKILL v2.17.0/session_38/session_39/worklog/REMEDIATION_PLAN through Session 91/start_server_log.txt) → the operator-signal diagnosis (THE NEW SIGNAL: a full production deploy at https://ely-beauty.jesspete.shop — custom NEXT_PUBLIC_SITE_URL + real AUTH_SECRET, db:setup/build/start all green in the field; the deployed site verified LIVE from the sandbox: health db:up, /shop 19 cards h1 "All Products", sitemap 28 locs on the custom domain, robots, canonical + og:url, JSON-LD, the full security-header set) → deep audit 92-a (read-only subagent, skills/ excluded: 12/12 standing anchors PASS, run-91 force-dynamic surface 13/13 CLEAN, 0 CRITICAL — 1 HIGH + 1 MEDIUM + 2 LOW + 3 INFO) → the live parity pass (mobile 390×844, both sites logged in: panel rows 99/135/171/207/243 IDENTICAL on both sites in this environment — the historical −1px was cross-environment rounding; overlay input Cormorant 18px/300 + 0.6-alpha both; the "silk" set −1px uniform with $-format prices byte-identical; /shop 19 bonnet-first "All Products" both; detail ৳370 Inter 24px/600 + active purchase panel both — zero new deltas; the reference account page carries only ORDER HISTORY, the clone's tabs remain supersets) → the Session 92 plan (S92-1..S92-8) → TDD execution: S92-1 the siteBaseUrl whitespace hardening (RED 2 → GREEN 14/14); S92-2 the password-change surface + default-credential advisory (the audit HIGH-1 remediation: demo-credentials single-sourced across login/seed/e2e-helpers/advisory; changePasswordSchema RED 4 → GREEN 65/65; changePasswordAction with per-email + per-IP budgets and FULL session rotation; the PasswordForm island on the account Profile tab; isDefaultAdminPasswordActive RED 5 → GREEN 5/5 + the dashboard role=alert advisory card gated on production posture; the serialized password-change e2e spec with self-heal, and the advisory e2e — with the mid-cycle React-19 form-reset lesson: uncontrolled inputs reset after EVERY action completion, so a re-login must re-fill BOTH fields); S92-3 DEPLOYMENT.md §6 the custom-domain deploy walkthrough + the baked-sitemap rebuild callout → the full gate chain (749/749 unit +11, 92/92 e2e ×2 consecutive) → 25/25 screenshots from the live standalone server (after killing the session-43 orphan next-server port owner by PID — the trap recurred live: 13 capture failures from the stale process serving wiped chunks) → sitemap 28 / .env.example 9/9 / npm audit 0 → the docs sweep (REMEDIATION_PLAN Session 92 with this execution log, worklog Task 86, docs/session_40.md, README/CLAUDE counts 749/92, AGENTS.md password-rotation contract + S92-2f serialized-project note, CLAUDE.md project standard, PAD v2.19, SKILL v2.18.0 project_state lockstep) → commit + SSH-wrapper push to main.

Work Log:
- The audit findings mapped to fixes: HIGH-1 (the seeded default admin credentials live on the public domain, with NO password-change surface anywhere in the app — updateProfileAction covered name/phone only) → S92-2 the centerpiece; MEDIUM-1 (TRUST_CF_CONNECTING_IP defaults to trust — on a direct deploy the client-forgeable cf-connecting-ip header mints fresh per-IP limiter buckets; the default is the documented session-6 invariant and must not flip silently) → the §6 edge-topology decision documented; LOW-1 (siteBaseUrl does not trim — a whitespace-only NEXT_PUBLIC_SITE_URL 500s every page) → S92-1 TDD; LOW-2 (DEPLOYMENT.md lacks a custom-domain walkthrough and never states sitemap/robots are BAKED at build time — editing the URL without a rebuild diverges them from the per-request canonicals) → S92-3; INFO-1/2/3 recorded, no action (the JSON-LD origin-only image absolutization is the documented pattern; the in-memory limiter is documented single-process; the standalone .env copy verified in Next's write-standalone-directory).
- The S92-2 design decisions: the new password rides the register passwordSchema (the two surfaces can never drift); the current password is verified against the stored scrypt hash with a single uniform inline error; the rotation deletes EVERY session row then issues a fresh one (the standard secure behavior — this browser stays signed in, every other device signs out); the advisory renders only on production posture (!demoModeEnabled — in dev the demo credentials are the advertised workflow) while isDefaultAdminPasswordActive verifies the seeded admin still authenticates with the documented default; the detector is failure-tolerant (.catch(() => false) at the call site — an advisory must never take the console down).
- The two mid-cycle lessons, both root-caused before fixing: (1) the password spec's first failure was NOT a code bug — React 19 resets uncontrolled form inputs after every action completion (verified live: both login boxes empty after a failed submission), so the alternate-password re-login POSTed an empty email; the fix re-fills both fields and documents the behavior in-spec. (2) The screenshot pass's 13 failures were the session-43 orphan-next-server trap recurring: the renamed next-server (v16.4.5) child held :3000 across rebuilds (pkill -f standalone/server.js misses it; the fresh server died on EADDRINUSE; the orphan served HTML referencing wiped chunks → ChunkLoadError → the auth/account/admin surfaces failed hydration while cached public pages rendered) — killed by PID per the documented ss -tlnp ritual, then 25/25 clean.
- The serialized-project extension: password-change.spec.ts mutates the demo PASSWORD (change→restore window) which every concurrent demo login under fullyParallel would observe as a hard failure — it joins admin.spec.ts in the admin-catalog project (workers: 1, after every read-only project), and the e2e-infrastructure source pin was updated in the same commit to hold the new testMatch/testIgnore contract.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 749/749 unit (+11) · clean build (11/11 static) · 92/92 e2e ×2 consecutive.
- Audit 92-a: 0 CRITICAL; the 1 HIGH + 1 MEDIUM + 2 LOW all remediated (the password surface + advisory; the deploy-docs guidance; the trim; the walkthrough).
- Parity: zero new deltas vs the live reference (panel byte-identical this environment; overlay/silk/shop/detail within the recorded tolerances).
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (7 changed: the two NEW surfaces + the known family) · .env.example 9/9 · npm audit 0 · the deployed jesspete.shop site verified live.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 87
Agent: run-93 executor (the rotation-atomicity & credential-single-sourcing cycle)
Task: The full remediation cycle on the SURVIVED workspace (git pull at 913c872 = run-92 code 2ec891b + the raw narrative docs/session_41.md; no new operator signal — a standard verification cycle): environment verified (node_modules intact, .env with DATABASE_URL="file:../db/custom.db" + AUTH_SECRET, db/ at the repo root with the shadow converged via hardlink — same inode; npm install 0 vulnerabilities; fresh reseed 19/2/3) → docs review (AGENTS/CLAUDE/README/PAD v2.19/SKILL v2.18.0/session_40/session_41/worklog/REMEDIATION_PLAN through Session 92) → baseline gates (lint, typecheck, typecheck:tests, 749/749 unit — docs matched reality) → deep audit 93-a (read-only subagent, skills/ excluded, web-application + code-review-checklist methodology: 12/12 standing anchors PASS, run-92 regression surface R1–R8 8/8 PASS, 0 CRITICAL — 1 MEDIUM + 3 LOW + 4 INFO) → the live-reference parity pass (mobile 390×844, reference logged in with the operator credentials, clone with the seeded demo customer: panel rows reference 99/135/171/207/243 vs clone 98/134/170/206/242 — the −1px uniform tolerance, hrefs byte-identical; overlay input Cormorant 18px/300 + 0.6-alpha both; the silk set −1px ×4 with $-format prices byte-identical; /shop 19 bonnet-first "All Products" both; detail ৳370 Inter 24px/600 with both purchase buttons active — zero new deltas, mobile nav fully functional, no Tailwind v4 bug; the session-43 orphan-next-server trap recurred once at the clone pass — killed by the documented PID ritual) → the Session 93 plan (S93-1..S93-7, validated against the codebase) → TDD execution: S93-1 the transactional credential rotation (rotateCredentialInTx seam + the action's db.$transaction; RED compile-miss → GREEN 6/6: 3 seam pins + 3 action-source pins); S93-2 capture-screenshots.mjs → .ts (the five credential sites single-sourced; the tsx/CJS top-level-await lesson — the body now lives in an async main(), the restore-demo-stock.ts pattern; invocation refs updated in 4 docs); S93-3 the SKILL's pre-rename demo-email drift; S93-4 the advisory's TTL-cached negative verdict (60s, positives never cached; RED 8 → GREEN 8/8) → the full gate chain (758/758 unit +9, clean build, 92/92 e2e ×2 consecutive) → 25/25 screenshots from the live standalone server after the fresh reseed + orphan ritual (8 changed — the known family; both S92-2 surfaces re-verified live) → sitemap 28/0-private, .env.example 9/9, npm audit 0 → the docs sweep (REMEDIATION_PLAN Session 93 with this execution log, worklog Task 87, docs/session_42.md, README/CLAUDE counts 758, AGENTS.md rotation-atomicity + TTL contract notes, PAD v2.20, SKILL v2.19.0 project_state lockstep) → commit + SSH-wrapper push to main.

Work Log:
- The audit findings mapped to fixes: MEDIUM-1 (the rotation's three independent awaited writes left a crash window where the password changed while every pre-change session stayed alive — the exact threat the rotation exists to kill, with no forgot-password recovery) → S93-1 the transactional seam; LOW-1 (the S92-2a credential single-sourcing missed scripts/capture-screenshots.mjs — three login sites + a track-order URL hardcoded both pairs) → S93-2 the TypeScript conversion + single-source; LOW-2 (ely-beauty_SKILL.md's demo table still carried @homenestkitchen.com — stale since the run-72 re-skin) → S93-3; LOW-3 (the advisory detector burned a synchronous scrypt on every production dashboard render, including the post-rotation steady state) → S93-4 the TTL cache; INFO-1/2/3 recorded no-action (the no-JS account-form GET fallback matches the pre-existing ProfileForm pattern; same-password rotation is cryptographically harmless; a scheme-less site URL fails fast by design); INFO-4 (docs count lockstep verified current repo-wide).
- The S93-2 mid-fix lesson, root-caused before the workaround: tsx compiled the converted script as CommonJS (the repo's package.json carries no "type": "module" — the .mjs extension was the ESM signal) and rejected the top-level awaits; the body moved into an async main() + main().catch() — the exact restore-demo-stock.ts pattern, and the file gained strict-mode typing (Browser/Page/BrowserContext param types, unknown-in-catch guard, as-const tuple loop, non-null device-descriptor assertions).
- The S93-4 cache semantics: ONLY the negative verdict caches (the post-rotation steady state skips the scrypt + query burn); a positive verdict never caches, so the advisory clears on the very first render after the operator rotates — and the exotic revert path (a DB restore flipping the hash back) re-arms within the 60 s TTL. The spec gained a beforeEach reset so module state never leaks between pins.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 758/758 unit (+9) · clean build (11/11 static) · 92/92 e2e ×2 consecutive.
- Audit 93-a: 0 CRITICAL; the 1 MEDIUM + 3 LOW all remediated (4 INFO recorded).
- Parity: zero new deltas vs the live reference (all measured pins within the recorded −1px tolerances; mobile nav fully functional — no Tailwind v4 bug).
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (8 changed — the known family) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 88
Agent: run-94 executor (the Stripe-replay ownership & SKILL-body de-drift cycle)
Task: The full remediation cycle on a FRESH-clone workspace (faab9ce = run-93 code f6aba96 + the operator's raw-narrative commit adding docs/session_43.md): environment rebuild (npm install 582 pkgs 0 vulns; .env with DATABASE_URL="file:../db/custom.db" + a generated AUTH_SECRET; db/ at the repo root; the parent-shell DATABASE_URL shadow converged via the session-63 symlink BEFORE db:setup — the shadow pointed outside the repo; Playwright chromium headless-shell 1248 installed to match the repo's playwright-core 1.64.0 — the cache's 1200 rev belonged to a foreign toolchain, the run-88 gap in a new costume; db:setup green at 19/2/3/4/11) → docs review (AGENTS/CLAUDE/README/PAD v2.20/SKILL v2.19.0/session_42/session_43/worklog/REMEDIATION_PLAN through Session 93) → baseline gates (lint, typecheck, typecheck:tests, 758/758 unit — docs matched reality exactly) → deep audit 94-a (read-only subagent, skills/ excluded, web-application methodology: 12/12 standing anchors PASS, run-93 regression surface R1–R5 5/5 PASS, 0 CRITICAL/HIGH/MEDIUM — 7 LOW + 5 INFO, all five SKILL docs-drift candidates CONFIRMED with file:line evidence) → the live-reference parity pass (mobile 390×844, reference logged in with the operator credentials, clone with the seeded demo customer: panel rows reference 89/125/161/197/233 vs clone 88/124/160/−/− — the −1px uniform tolerance in this environment's coordinates, hrefs byte-identical; overlay input Cormorant 18px/300 + 0.6-alpha placeholder both sites; the "silk" set reference 174/258/342/426 vs clone 173/257/341/425 (−1px ×4, h 80 both) with $370.00/$288.00/$470.00/$520.00 byte-identical at Cormorant 14px/300; /shop 19 unique cards bonnet-first with h1 "All Products" both sites; the bonnet detail ৳370 Inter 24px/600 with both purchase buttons active — zero new deltas, mobile nav fully functional, no Tailwind v4 bug) → the Session 94 plan (S94-1..S94-9, validated against the codebase) → TDD execution: S94-2 the Stripe-intent P2002 replay routed through resolveReplay (the S7-2 ownership gate; the webhook backstop places with the same userId/cartToken metadata so genuine retries still replay; RED 2/3 — the deny pin observed 200 + the victim's receipt — → GREEN 3/3 with the source-composition pin; the pi_ regex lesson root-caused mid-RED); S94-1 the e2e bundle guard imports the demo pair from the single source (+2 source-scan pins in e2e-infrastructure.test.ts); S94-4 the scrypt hash hoisted above the rotation $transaction (RED the source pin → GREEN 7/7) → the full gate chain (764/764 unit +6, clean build 11/11, 92/92 e2e ×2 consecutive) → 25/25 screenshots from the live standalone server after the fresh reseed + orphan ritual (7 changed — the known family; all PNGs dimension- and content-verified) → sitemap 28/0-private, .env.example 9/9, npm audit 0 → the SKILL body de-drift pass (S94-3/S94-5: the five CONFIRMED live-tense drifts — identity, version table, 20 models, ELY-XXXXXXXX, clientIp order, key-files list, the terracotta hsl leftover — fixed; historical narrative untouched) + S94-6 the lockstep inventory correction → the docs sweep (REMEDIATION_PLAN Session 94 with this execution log, worklog Task 88, docs/session_44.md, README/CLAUDE counts 758 → 764, AGENTS.md stripe-replay ownership + hoist notes + session range 2..94, PAD v2.21, SKILL v2.20.0 project_state lockstep) → commit + SSH-wrapper push to main.

Work Log:
- The audit findings mapped to fixes: L-6 (the e2e bundle guard hardcoded both demo password literals — a future rotation would rot it vacuously green) → S94-1; L-7 (the Stripe-intent P2002 branch returned the receipt unconditionally while the idempotencyKey sibling is ownership-gated — the exact S6-8/S7-2 threat model unmirrored) → S94-2 the centerpiece; L-1..L-5 (the five CONFIRMED SKILL body drifts: HomeNest identity, stale versions/models/order-format/clientIp/key-files) → S94-3/S94-5; I-1 (scrypt inside the transaction — the sync burn under the SQLite write lock) → S94-4; I-3 (the lockstep inventory) → S94-6; I-4 (the deliberately-retained pre-rename homenest_* cookie names) + I-5 (the maintained allowScripts config) recorded no-action.
- The S94-2 design note: the webhook backstop extracts userId/cartToken from the PaymentIntent metadata and places with the SAME binding the route uses, so routing the stripe-intent recovery through resolveReplay cannot over-block a genuine double-submit — verified in src/app/api/stripe/webhook/route.ts before writing the fix.
- The S94-2 mid-RED lesson, root-caused before the workaround: the first run 400'd both behavior pins — checkoutBodySchema's stripePaymentIntentId regex is ^pi_[A-Za-z0-9]{6,}$ and the fixture id "pi_replay_test_1" carries underscores outside the class; the id became pi_REPLAYTEST1 (a reminder that the RED must fail on the MISSING behavior, not on fixture invalidity — a 400 is not a denial).
- The environment sequence this run: fresh sandbox → the shadow symlink converged pre-seed (the documented order — seeding through a divergent shadow would have split the database); the chromium revision gap caught at the FIRST browser launch (the parity script), before any e2e or capture pass could fail on it.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 764/764 unit (+6) · clean build (11/11 static) · 92/92 e2e ×2 consecutive.
- Audit 94-a: 0 CRITICAL/HIGH/MEDIUM; the 7 LOW all remediated (5 INFO: three fixed as S94-4/S94-5/S94-6, two recorded no-action).
- Parity: zero new deltas vs the live reference (all measured pins within the recorded −1px tolerances in this environment's coordinates; prices byte-identical).
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (7 changed: the known family) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 89
Agent: run-95 executor (the reference-content resync & PAD-body de-drift cycle)
Task: The full remediation cycle on the SURVIVED workspace (git pull fast-forward 7df0a0f → ce99658 = run-94 code + the operator's raw-narrative commit adding docs/session_45.md; no new operator signal — a standard verification cycle): docs review → baseline gates green (764/764 unit — docs matched reality) → audit 95-a (read-only, skills/ excluded) → the live parity pass whose overlay-row-copy divergence root-caused into the reference's content restructure → the Session 95 plan (S95-1..S95-9) → TDD execution → gates ×2 → standing verifications + the parity re-measure → the docs sweep → the SSH-wrapper push.

Work Log:
- The parity pass's driver finding: the overlay ROW COPY diverged from the reference — the API-level investigation (the reference's public entities endpoint) root-caused it as a full CONTENT RESTRUCTURE by the reference's owner since run-77 (paragraphs moved to short_description, description → feature-lists/nulls, how_to_use emptied reference-wide, ingredients on the Ice Bowl only) plus a MATCHING divergence (the reference's overlay matches title + short_description + tags only — "Silkfare"/"Nano" → 0 rows measured live; the clone's S77-4 description clause would over-match the resynced content).
- The fixes: S95-1 the /api/search OR clause resync (RED the rewritten pin → GREEN the route edit; live-verified byte-equal on "silk"/"Silkfare"/"bastseller"/"spa-like"); S95-2 the seed content resync (19 products from the live API; the authored quirks verbatim per S74-13 — "bastseller", "Pink & Lovender", "Marron & Navy Blue", "Biege", "Navy blue") + the detail page's sections made ALL-conditional (the reference renders no section for an empty field, and no stray hairline when none carry copy).
- The S95-2 mid-cycle discovery (TDD): e2e run 1 failed 2 admin-catalog tests — productInputSchema's run-72-era description .min(10) (the reference ships 3 empties) and shortDescription .max(300) (the reference's longest is 424). RED 3 validation pins → GREEN the bounds relaxed (max(8000)/max(1000)) + the admin dialog's required/placeholder/maxLength corrected.
- The S95-3/S95-4 pair: the PAD live-tense body de-drift (737/634/79 → 777/92; "19 models" → 20 ×3; the two-project e2e → three with the serialized admin-catalog + globalSetup heal + password-change row; "order numbers increment" → crypto-random; 12-per-page → 24/page; /products?q= → /shop?q=; the §8.1 table 48 → 68 suites) pinned by the NEW tests/unit/docs-counts.test.ts (the neo-crm count-lockstep mechanism — every live-tense count site under the unit gate; a stale count anywhere fails BY NAME). RED 5/5 → GREEN after the sweep.
- The docs-counts lessons: the count moved twice mid-cycle (774 → 777 when the validation pins landed) and the pin correctly forced the re-sweep — the mechanism working as designed; the negative pins initially fired on the v2.22 revision block's own QUOTES of the stale strings — scoped to the live-tense body (after "## Table of Contents") since revision blocks are append-only history.
- The parity re-measure: the overlay row copy now BYTE-IDENTICAL to the reference (the "silk" set's texts equal on all four rows; prices/geometry/fonts within the recorded −1px tolerances); mobile nav fully functional — no Tailwind v4 bug (zero classList in src/, the conditional-mount pattern holding, the panel → overlay → results → navigation chain exercised live on both sites).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 777/777 unit (+13, 68 files) · clean build · 92/92 e2e ×2 consecutive.
- Audit 95-a: 0 CRITICAL/HIGH/MEDIUM; the 6 LOW all remediated (5 INFO: two fixed as S95-5/S95-6, three recorded no-action; P-4 the reference's ৳11 compare-price data noise recorded, not replicated).
- Parity: the content resync closes the copy gap — the overlay rows + card desc lines byte-match; all measured pins within the recorded −1px tolerances.
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (8 changed: the content-resync family + the known raster-noise/admin surfaces) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 90
Agent: run-96 executor (the SEO-fallback completion & full-stack doc-de-drift cycle)
Task: The full remediation cycle on a FRESH-sandbox clone (git clone at 5fcf72b = run-95 code + the operator's raw-narrative commit adding docs/session_47.md; no new operator signal — a standard verification cycle): environment rebuild (install + .env + db/ + the session-63 symlink convergence + chromium 1248 re-pair) → docs review → baseline gates green (777/777 unit — docs matched reality) → audit 96-a (read-only, skills/ excluded) → the live parity pass (zero new deltas) → the Session 96 plan (S96-1..S96-11) → TDD execution → gates ×2 → standing verifications → the docs sweep → the SSH-wrapper push.

Work Log:
- The cycle's driver finding (audit 96-a L-8, a run-95 follow-on): the S95-2 content resync left the bamboo oval with BOTH shortDescription and description empty — the detail page's two-term S76-8 chain then shipped an EMPTY meta/OG/Twitter/JSON-LD description. Reference-side investigation (headless browser): the reference ships a GENERIC meta ("Product Detail on ElyBeauty. A high-fashion…") on every product page — per-product metas are the clone's deliberate SEO superset, so the fix restores the never-empty invariant with a name-based third term instead of regressing to the generic.
- S96-1 (TDD): NEW shared productMetaDescription() in src/lib/seo.ts (shortDescription → description → `${name} — ElyBeauty`), composed into BOTH generateMetadata and buildProductJsonLd. RED 5 pins → GREEN 19/19; live-verified (all four of the oval's description surfaces render "Natural Bamboo Hair Brush - Oval — ElyBeauty").
- S96-2 (TDD): six admin-dialog checkboxes still hardcoded the pre-re-skin terracotta accent-[hsl(24_70%_50%)] — all six → accent-foreground (product-dialog ×3, slide-dialog, category-dialog, coupon-dialog), pinned by the new S96 describes in layout-tokens.test.ts (RED 2 → GREEN 77/77). The mid-fix lesson: the tool pipeline strips `[h` in rendered output — byte-level verification (pickaxe + raw-pattern counts) proved the class bytes valid all along; trust the count, not the display.
- S96-3..S96-8 (the doc-de-drift family, all 10 LOW + 4 of 6 INFO remediated): the S95-1 search-contract texts de-drifted in CLAUDE.md, AGENTS.md, and search-overlay.tsx's comment; CLAUDE.md's homenest-era catalog gloss → the 19/4/7-3-4 reality; SKILL §19's color table rebuilt from the live globals.css taupe palette + the §2 Stripe row + the §5 counts (144/15+10/41, re-derived with the documented commands); PAD §4.3's three stale seed claims + §8.2's globalSetup mechanism wording fixed; the SKILL session-record boundary note (runs 89+ → the PAD revision blocks).
- The count-lockstep fired exactly as designed: the +7 unit move (777 → 784) tripped the README/CLAUDE/PAD/SKILL sites BY NAME and the sweep brought them all green in one pass.
- The parity pass (mobile 390×844, both sites logged in): every pinned surface HOLDS — panel rows −1px uniform with byte-identical hrefs+labels; overlay input Cormorant 18px/300; the silk rows byte-identical ×4 with $370/$288/$470/$520 at Cormorant 14px/300; /shop 19 bonnet-first "All Products"; the bonnet detail ৳370 Inter 24px/600 both buttons active; mobile nav fully functional (no Tailwind v4 bug; zero classList in src/). Two parity-script lessons: the reference login's first submit is "Continue with Google" (target the native Log in button); scope panel-link locators to :visible (a bare first-match resolves to the below-fold footer link).
- Recorded no-action (INFO): the howToUse/ingredients admin-editing gap (seed-only content, preserved by upserts — a deferred enhancement, not a defect); the menu button's state-dependent aria-label (the documented a11y-superset tolerance); the replay-branch file attribution nuance (the invariant held).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 784/784 unit (+7, 68 files) · clean build · 92/92 e2e ×2 consecutive (2.5m + 2.4m).
- Audit 96-a: 0 CRITICAL/HIGH/MEDIUM; the 10 LOW all remediated (6 INFO: four fixed as S96-6/S96-8, two recorded no-action).
- Parity: zero new deltas on every pinned surface; the S96-1 fix verified live on the oval's four description surfaces.
- Standing verifications: sitemap 28 public-only · 25/25 screenshots (6 changed: the known family + the accent-foreground delta on 15b) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 91
Agent: run-97 executor (the auth-secret hardening & doc-de-drift completion cycle)
Task: The full remediation cycle on the SURVIVED workspace (git pull 5fcf72b→9bfd120 fast-forward = run-96 code + the operator's raw-narrative commit adding docs/session_49.md; no new operator signal — a standard verification cycle): docs review (five core docs + session_46..49/REMEDIATION_PLAN/worklog, PAD + SKILL digested via parallel subagents) → baseline gates green (784/784 unit — docs matched reality) → audit 97-a (read-only, skills/ excluded) → the live parity pass (zero new deltas, mobile 390×844 both sites logged in) → the Session 97 plan (S97-1..S97-11) → TDD execution → gates ×2 → standing verifications → the docs sweep → the SSH-wrapper push.

Work Log:
- The cycle's code driver (audit 97-a N1): assertAuthSecret rejected only missing/empty/whitespace/dev-fallback — a 1-character non-fallback secret passed the production gate and then keyed the session-cookie HMAC and the order-access tokens. S97-1 (TDD): MIN_AUTH_SECRET_LENGTH = 32 enforced (the README's `openssl rand -hex 32` guidance), RED 3 pins (1-char/31-char reject, 32-char passes) → GREEN 8/8; the 31-char "strong secret" fixture updated to the new contract; both call sites route the env through unchanged.
- S97-2 (TDD, the lockstep-net extension — audit N4/D1): README carried "19 models" in its architecture table AND file-hierarchy tree while every other doc said 20 — and the docs-counts net didn't cover README's model-count sites. The rewritten pin (positive on both README sites + whole-file negative, README being fully live-tense) went RED against the stale rows → GREEN after the fix; the drift class S95-4 was built to catch can no longer rot README silently.
- S97-3 (TDD): productMetaDescription now trims each term (a whitespace-only field is truthy in a bare || chain and would ship as the meta; the schema trims upstream but the helper owns the never-empty invariant). RED 2 pins → GREEN 21/21; live-verified on the oval (meta + JSON-LD both render the name-based fallback).
- S97-4 (test hardening, mutation-verified): the S96-2 accent pin moved from a count heuristic to per-tag assertions + the negative net extended (underscore/space hsl variants + #d96e26). The regex lesson encoded: an onChange arrow contains ">" so a [^>]* pattern truncates mid-tag and misses a className that follows the handler — the tag match spans to the self-closing slash. Mutation check: stripping the class fails the pin by name.
- S97-5..S97-8 (the doc-de-drift completion — 14 CONFIRMED leads remediated, D8 refuted): the installed Radix set (dialog/label/select/slot/toast) + the real 9-file ui inventory in README/PAD/SKILL; SKILL §1's radius pins → the measured scale + the mobile-menu anatomy → the S73-4/S74-2 reality (aria-current only, no in-panel close button); §6 searchOverlayOpen; §8.3's limiter grid completed (changePassword/addresses/cart-bulk/cart-summary/stripe-intent + the review two-tier, every budget re-verified against the routes); §2's §9.3 cross-ref; §3's typecheck:tests row; PAD §4.1's ER diagram +ProductCategory junction +StripeEvent; §1.4's 19-product mirror + guest-checkout reality; §6's two $queryRaw sites + order numbers; §8.2's one-page grid; §2's 13-route topology.
- The count-lockstep fired exactly as designed: the +5 unit move (784 → 789) tripped the README/CLAUDE/PAD/SKILL sites BY NAME (4 failing tests observed) and the sweep brought them all green in one pass.
- The parity pass (mobile 390×844, both sites logged in): every pinned surface HOLDS — panel rows (the direct probe: Search/Shop/Beauty Tools/Brush & Combs/About at reference 89/125/161/197/233 vs clone 88/124/160/196/232, −1px uniform, hrefs+labels byte-identical); overlay input Cormorant 18px/300; the silk rows byte-identical ×4 with $370/$288/$470/$520 at Cormorant 14px/300; /shop 19 bonnet-first "All Products"; the first-card detail ৳370 Inter 24px/600 both buttons active; mobile nav fully functional (no Tailwind v4 bug; zero classList in src/, the conditional-mount pattern holding).
- Environment lesson re-confirmed (the S64 costume): the first screenshot capture failed on 03-product-detail with a ChunkLoadError — the :3000 parity server had survived the rebuild under the renamed `next-server (v1…)` process (pkill -f standalone/server.js misses it), serving the OLD build's chunk manifest against the NEW .next/static. Killed BY PORT OWNER (ss -tlnp → PID), the fresh server recaptured all 25. After ANY rebuild: kill by port owner and restart before server-dependent passes.
- Recorded no-action (INFO N7): the overlay's "No products found" flash during the 250ms in-flight typeahead window — a cosmetic micro-state whose reference behavior is unmeasured; changing a visible surface without a reference measurement violates the replicate-as-observed convention.

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 789/789 unit (+5, 68 files) · clean build · 92/92 e2e ×2 consecutive (2.5m + 2.4m).
- Audit 97-a: 12/12 standing anchors · R1–R8 (the run-96 regression surface) 8/8 · 0 CRITICAL/HIGH/MEDIUM — 18 LOW + 3 INFO; all substantive LOW remediated (14 drift leads CONFIRMED + N1–N4 fixed; D8 refuted — accurate as written; N7 recorded no-action).
- Parity: zero new deltas on every pinned surface; the S97-3 fallback verified live on the oval.
- Standing verifications: sitemap 28 public-only · robots 4 disallows · 25/25 screenshots (7 changed: 03 the review-ID/date band, 12/13/14/17/19 the known admin/account raster-noise family, 15b the coupons surface) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 92
Agent: run-98 executor (the enumeration-lockstep & payment-prose de-drift cycle)
Task: The full remediation cycle on the SURVIVED workspace (git pull 9bfd120→0dfcf29 fast-forward = run-97 code + the operator's raw-narrative commit adding docs/session_51.md; no new operator signal — a standard verification cycle): docs review (five core docs + session_50/51, PAD/SKILL/CLAUDE digested via a subagent) → baseline gates green (789/789 unit — docs matched reality on every count) → audit 98-a (read-only, skills/ excluded — 12/12 anchors, R1–R8 8/8, 0 C/H/M, 2 LOW + 2 INFO, 6 drift leads CONFIRMED) → the live parity pass (zero new deltas, mobile 390×844 both sites logged in) → the Session 98 plan (S98-1..S98-9) → TDD execution → gates ×2 → standing verifications → the docs sweep → the SSH-wrapper push.

Work Log:
- The cycle's code centerpiece (S98-1, TDD — audit D1/D2/D4/N2): the docs' route/admin ENUMERATIONS were rotting while the docs-counts net pinned only numbers. New pins in tests/unit/docs-counts.test.ts: the 13-route inventory derived from the filesystem (the S91-1 convention) + the 9-page admin inventory (the dashboard IS the admin root page.tsx — a discovery the derivation pin itself forced when the assumed dashboard/ folder rejected) + set-equality pins on the four enumeration sites (AGENTS architecture-invariants, CLAUDE api, CLAUDE admin, SKILL §5 row). RED 7 pins by name → GREEN 14/14 after the sweep. Two RED-phase lessons encoded: the set pin must reuse the derivation's sort (ASCII '-' before '/'), and match() captures are string | undefined under noUncheckedIndexedAccess (m?.[1] ?? "" shape).
- S98-2/S98-3 (the sweep): AGENTS's route list → all 13 exact paths (scope widened to "client-island fetches and the Stripe webhook"); CLAUDE's admin list → the 9 pages; CLAUDE's api list + SKILL §5's row → all 13; CLAUDE's stale "demo payment (no processor)" sentence → the session-61 Stripe reality, the "no real charge" guard on a non-existent surface removed, negative-pinned.
- S98-4/S98-5/S98-6: the SKILL signpost "runs 89–96 (v2.17–v2.23)" → "runs 89–97 (v2.17–v2.24)" + run 97 in the trail; the project_state label "(session 48 cycle)" → "(session 50 cycle)"; AGENTS's dangling session_114.md pointer → DEPLOYMENT.md §4, negative-pinned; the AUTH_SECRET command single-sourced on openssl rand -hex 32 across .env.example + DEPLOYMENT.md ×2, pinned.
- The count-lockstep fired exactly as designed: the +9 move (789 → 798) tripped the README/CLAUDE/PAD/SKILL sites BY NAME (4 failing pins observed) and the one-pass sweep brought them all green; the PAD's append-only v2.24 revision block deliberately keeps its historical 789/789.
- The parity pass (mobile 390×844, both sites logged in): every pinned surface HOLDS — panel rows (the direct probe) reference 89/125/161/197/233 vs clone 88/124/160/196/232 (−1px uniform, hrefs+labels byte-identical); the overlay input Cormorant 18px/300; the silk rows byte-identical ×4 with $370/$288/$470/$520 at Cormorant 14px/300; /shop 19 bonnet-first "All Products"; the first-card detail ৳370 Inter 24px/600 both buttons active; mobile nav fully functional (no Tailwind v4 bug; zero classList in src/, the conditional-mount pattern holding).
- Environment: the orphan-server ritual ran BEFORE the screenshot capture (the :3000 parity server had survived the rebuild as the renamed next-server; killed by port owner PID 32579 — zero ChunkLoadErrors in the 25-shot capture). xxd is absent in this sandbox — the PNG signature check moved to Python (the first check false-failed every file).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 798/798 unit (+9, 68 files) · clean build · 92/92 e2e ×2 consecutive (2.4m + 2.3m).
- Audit 98-a: 12/12 standing anchors · R1–R8 (the run-97 regression surface) 8/8 · 0 CRITICAL/HIGH/MEDIUM — 2 LOW + 2 INFO; all 6 CONFIRMED drift leads + both LOW remediated (N4 the homenest_* cookie names recorded no-action).
- Parity: zero new deltas on every pinned surface.
- Standing verifications: sitemap 28 public-only · robots 4 disallows · 25/25 screenshots (7 changed: the documented families) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 93
Agent: run-99 executor (the dangling-pointer class net & payment-prose completion cycle)
Task: The full remediation cycle on a FRESH-CLONE workspace (the sandbox had been reset — npm install, .env with a fresh AUTH_SECRET, db:setup seeding the 19-product catalog, the parent-shell DATABASE_URL shadow converged via the session-63 symlink, Playwright chromium-1248 downloaded; the operator's 84544fb added session_53.md + start_server_log.txt — no new operator signal, a standard verification cycle): docs review (five core docs + session_52/53/plan/worklog) → baseline gates green (798/798 unit — docs matched reality on every count site) → audit 99-a (read-only, skills/ excluded, web-application methodology).

Work Log:
- Audit 99-a: 12/12 standing anchors PASS · R1–R8 (the run-98 regression surface) 8/8 PASS · 0 CRITICAL/HIGH/MEDIUM — 7 LOW + 4 INFO, ALL documentation drift, zero code defects; the untouched-surface spot check (csp/proxy/rate-limit/stripe-webhook/wishlist/order-status) clean; every live-tense count claim re-verified (798/68/92/13/9/20/19/25/28).
- The cycle's code centerpiece (S99-1, TDD — audit D1/N1/N2): the dangling-doc-pointer CLASS net in tests/unit/docs-counts.test.ts — the docs/ inventory derived from the FILESYSTEM, every docs/<path> reference in each of seven live-tense scopes (AGENTS/CLAUDE/README whole, .env.example, DEPLOYMENT, the SKILL's pre-Appendix-A body, the PAD's post-ToC body) pinned to resolve on disk. RED 5 pins observed by name (AGENTS build_error.txt; CLAUDE session_113.md; the SKILL body session_113.md + the session_114.md quoted inside project_state's own run-98 narrative; the SKILL demo-payment/demo-card-wizard prose; the PAD's ADR-005 "the demo payment") → GREEN 24/24 after the sweep. A RED-phase derivation bug caught and encoded: the strip regex must carry the filter's extension (page\.ts$ no-ops on page.tsx).
- S99-2/S99-3 (the sweep): §7.4's heading → DEPLOYMENT.md §4; CLAUDE's session_113 citation → the run-63 cycle by name; AGENTS's build_error.txt → tests/unit/build-config-resilience.test.ts; the project_state quotes paraphrased (a quoted dangling path in a live state string is itself a drift vector). The S98-3 payment-prose class finished across siblings: SKILL §7.3/§7.4/§13 + PAD ADR-005 → the session-61/S73-8 reality (intent-derived cardLast4, COD-only unconfigured, PCI SAQ-A, the ADR supersession annotated), with SKILL/PAD live-body negative pins.
- S99-4 (hygiene): the schema comment card | paypal | cod → card | cod (comment-only; @default recorded no-action — never materialized); CLAUDE's placeOrderTx location → src/lib/order-placement.ts; the ADMIN_PAGES derivation made recursive; the Appendix B docs-reset boundary note added.
- The count-lockstep fired exactly as designed: the +10 move (798 → 808) tripped exactly the four predicted doc-site pins BY NAME (README badge/table/tree/commands, CLAUDE's pin line, PAD §1.2/§8.1/§12, SKILL project_state) and the one-pass sweep brought them all green; the PAD's append-only v2.24/v2.25 revision blocks keep their historical 798s; SKILL:3459's "1792454423798" is a coincidental timestamp digit — untouched.
- The parity pass (mobile 390×844, both sites logged in — the reference-side methodology mapped this cycle: #email/#password/"Log in", the panel measured header-scoped, the overlay rows are BUTTON children of the mt-6 list): every pinned surface HOLDS — the panel rows reference 89/125/161/197/233 vs clone 88/124/160/196/232 (−1px uniform, hrefs + labels byte-identical); the overlay input Cormorant 18px/300 "Search products..." both; the silk rows reference 174/258/342/426 vs clone 173/257/341/425 (h=80) with all four row copies BYTE-IDENTICAL and $370.00/$288.00/$470.00/$520.00 at Cormorant 14px/300 both; /shop 19 cards bonnet-first h1 "All Products" both; the no-results copy byte-identical; the mobile nav fully functional — the panel → link → navigation chain exercised live on both sites, no Tailwind v4 bug (zero classList in src/, the conditional-mount pattern holding).
- Standing verifications: sitemap 28 public-only · robots 4 disallows · .env.example 9/9 (6 active + 3 commented, zero drift) · npm audit 0 (prod and full) · 25/25 screenshots regenerated (8 changed: 03 the review-ID/date band, 04b the coupon-hint family, 12/13/14/17/19 the known admin/account raster-noise family, 15b the coupons surface; all PNG-signature- and dimension-verified via Python).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 808/808 unit (+10, 68 files) · clean build · 92/92 e2e ×2 consecutive (2.5m + 2.5m).
- Audit 99-a: 12/12 standing anchors · R1–R8 8/8 · 0 CRITICAL/HIGH/MEDIUM — 7 LOW + 4 INFO; all remediated this cycle (D2/N7-default recorded no-action/annotated per convention).
- Parity: zero new deltas on every pinned surface; the mobile nav functional on both sites.
- Standing verifications: sitemap 28 public-only · robots 4 disallows · 25/25 screenshots (8 changed, the documented families) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 94
Agent: run-100 executor (the stale-existence-claim net & citation-hygiene cycle)
Task: The full remediation cycle on a FRESH-CLONE workspace (the sandbox had been reset — npm install, .env with a fresh AUTH_SECRET, db:setup seeding the 19-product catalog, Playwright chromium-1248 downloaded, the platform-injected DATABASE_URL shadow converged via a HARD link since this sandbox generation blocks symlinks — one inode, two paths; the operator's 197f5a2 added session_55.md + a refreshed start_server_log.txt showing a clean install→db:setup→build→start cycle with zero error signals — a standard verification cycle): docs review (five core docs + session_54/55/plan/worklog) → baseline gates green (808/808 unit — docs matched reality on every count site) → audit 100-a (read-only subagent, skills/ excluded, web-application methodology).

Work Log:
- Audit 100-a: 12/12 standing anchors PASS · 0 CRITICAL/HIGH/MEDIUM — 1 LOW + 4 INFO; zero code defects (the run-99 change-set verified line-by-line; the operator's commit adds no code; the class net's derivation logic independently re-probed for non-vacuity — synthetic danglers caught, zero false-greens). Every live-tense count claim re-verified (808/68/92/13/9/20/19/25/28).
- LOW-1 (the cycle's finding): the S99-4 Appendix B docs-reset boundary note's bounded-range existence claim about the surviving session files was falsified by the post-reset log series the same commit began — run-99's own session_54.md (added by the SAME c3db704 that added the note) and the operator's session_55.md; the note's HomeNest-era cite range (session_54..132) now numerically collides with the live post-reset files.
- The cycle's code centerpiece (S100-1, TDD): the stale-existence-claim CLASS net in tests/unit/docs-counts.test.ts — the session-file numbers derived from the FILESYSTEM, staleSessionExistenceClaims() matching the only-session_A..B.md-exist shape (the ≤12-char gap window handles the line-wrapped form), then three pins: the inventory sanity (≥50 files, the post-reset series present), the seven-scope live-tense scan (a stale claim fails BY NAME with the scope named), and the boundary-note marker pin (the bullet survives AND claims nothing stale — present-tense inventory guidance is scanned even inside the otherwise-exempt Appendix B). RED 2 pins observed by name (the SKILL live body's project_state literal; the boundary-note bullet) → GREEN 27/27.
- S100-2 (the sweep): the boundary note rewritten to the two-series reality (pre-reset survivors session_1..53; the post-reset series resumed at session_54.md (run-99) and continues forward; the HomeNest-era cites collide numerically with the live files, not point at them) — paraphrased, never re-quoted; the project_state narrative paraphrased in the same class. Citation hygiene (INFO-2): CLAUDE:56 + PAD:1015's guarded-updateMany citation couponRedemptionWhere → couponRedemptionFilter (the composed filter order-placement.ts:191 actually calls; coupons.test.ts directly tests the cap-clause builder — PAD:854 accurate, untouched; fixed-without-pin — both identifiers are real exports, the class is imprecision).
- The count-lockstep fired exactly as designed: the +3 move (808 → 811) tripped exactly the four predicted doc-site pins BY NAME (README badge/table/tree/commands, CLAUDE's pin line, PAD §1.2/§8.1/§12, SKILL project_state) and the one-pass sweep brought them all green; the PAD's append-only v2.26 revision block keeps its historical 808s.
- The parity pass (mobile 390×844, both sites logged in — reference-side selectors mapped live: #email/#password/"Log in", the panel measured header-scoped, the overlay rows are BUTTON children): every pinned surface HOLDS — the panel rows reference 89/125/161/197/233 vs clone 88/124/160/196/232 (−1px uniform, hrefs + labels byte-identical); the overlay input Cormorant 18px/300 "Search products..." both; the silk rows reference 174/258/342/426 vs clone 173/257/341/425 (h=80) with all four row copies BYTE-IDENTICAL and $370.00/$288.00/$470.00/$520.00 at Cormorant 14px/300 both; /shop 19 cards bonnet-first h1 "All Products" both; the no-results copy byte-identical; the mobile nav fully functional — the panel → link → navigation chain exercised live on BOTH sites, no Tailwind v4 bug (zero classList in src/, the conditional-mount pattern holding).
- Standing verifications: sitemap 28 public-only · robots 4 disallows · .env.example 9/9 (6 active + 3 commented, zero drift) · npm audit 0 (prod and full) · 25/25 screenshots regenerated (7 changed: the documented raster-noise families; all PNG-signature-verified via Python).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 811/811 unit (+3, 68 files) · clean build · 92/92 e2e ×2 consecutive (2.5m + 2.6m).
- Audit 100-a: 12/12 standing anchors · 0 CRITICAL/HIGH/MEDIUM — 1 LOW + 4 INFO (LOW-1 remediated; INFO-1/3/4 recorded no-action; INFO-2 fixed-without-pin).
- Parity: zero new deltas on every pinned surface; the mobile nav functional on both sites.
- Standing verifications: sitemap 28 public-only · robots 4 disallows · 25/25 screenshots (7 changed, the documented families) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.

---

Task ID: 95
Agent: run-101 executor (the plan-range lockstep net cycle)
Task: The full remediation cycle on a workspace that SURVIVED the sandbox recycle (`git pull` fast-forwarded run-100's pushed `7fc5342` to the operator's `107b1e3` — a commit adding only `docs/session_57.md`, the raw run-100 narrative: no code, no error signal, the expected interleaved raw-log artifact; node_modules warm, the `.env` DB contract intact, the hard-linked `db/custom.db` at the repo root, chromium-1248 cached): docs review (five core docs + session_56/57/plan/worklog) → baseline gates green (811/811 unit — docs matched reality on every count site) → audit 101-a (read-only subagent, skills/ excluded, web-application + code-review-checklist methodology).

Work Log:
- Audit 101-a: 12/12 standing anchors PASS · 0 CRITICAL/HIGH/MEDIUM/LOW — 2 INFO; zero code defects (src/ verified byte-frozen since run-97 — the exact tree audits 97-a…100-a plus this cycle's baseline gates already cover; the run-100 change-set re-verified line-by-line with no test weakening; both class nets re-probed non-vacuous with synthetic inputs). Every live-tense count claim re-verified (811/68/92/13/9/20/19/25/28).
- INFO-1 (the cycle's finding): AGENTS.md's architecture bullet carried a bounded-range claim about the REMEDIATION_PLAN's session sections — accurate at HEAD (the plan's tail was Session 100) but outside the S100-1 net's grammar and stale the moment this cycle's plan entry landed; the audit's recommendation (derive the plan tail in docs-counts, pin the literal to it) adopted as the cycle's centerpiece.
- The cycle's code centerpiece (S101-1, TDD): the plan-range lockstep CLASS net in tests/unit/docs-counts.test.ts — the plan's session headings derived from the FILESYSTEM (105 headings; the heading level historically mixed H1/H2/H3 with era gaps, so only the MAX is pinned — a lower-bound sanity, never an upper bound), stalePlanRangeLiterals() matching the session-2..N shape across the seven live-tense scopes, and a non-vacuity floor keeping the literal from silently vanishing. RED 1 pin observed by name (the class scan caught AGENTS.md's plan-range literal still carrying the run-100 tail) → GREEN 30/30.
- S101-2 (the sweep): AGENTS.md's plan-range literal bumped to session-2..101 (the single live-tense site). The count-lockstep fired exactly as designed: the +3 move (811 → 814) tripped exactly the four predicted doc-site pins BY NAME (README badge/table/tree/commands, CLAUDE's pin line, PAD §1.2/§8.1/§12, SKILL project_state) and the one-pass sweep across the 9 live-tense sites brought them all green; the PAD's append-only v2.27 revision block keeps its historical 811s.
- The parity pass (mobile 390×844, the reference logged in via the operator credentials — reference-side selectors mapped live: the Toggle-menu button, the panel rows below y=80, the placeholder-based overlay input, the BUTTON-children result rows): every pinned surface HOLDS — the panel rows reference 89/125/161/197/233 vs clone 88/124/160/196/232 (−1px uniform, hrefs + labels byte-identical); the overlay input Cormorant 18px/300 "Search products..." both; the silk rows reference 174/258/342/426 vs clone 173/257/341/425 (h=80) with all four row copies BYTE-IDENTICAL and $370.00/$288.00/$470.00/$520.00 at Cormorant 14px/300 both; /shop 19 unique cards bonnet-first h1 "All Products" both; the no-results copy byte-identical; the mobile nav fully functional — the panel → link → navigation chain exercised live on BOTH sites (About → /about each side), no Tailwind v4 bug (zero classList in src/, the conditional-mount pattern holding).
- Standing verifications: sitemap 28 public-only · robots 4 disallows · /api/health ok · .env.example 9/9 (6 active + 3 commented, zero drift) · npm audit 0 (prod and full) · the .env DB contract (DATABASE_URL="file:../db/custom.db", db/ at the repo root, the hard-link convergence holding) · 25/25 screenshots regenerated after restore-demo-stock re-topped the demo stock (8 changed: the documented raster-noise families; all PNG-signature-verified via Python).

Stage Summary:
- All gates green: lint · typecheck · typecheck:tests · 814/814 unit (+3, 68 files) · clean build · 92/92 e2e ×2 consecutive.
- Audit 101-a: 12/12 standing anchors · 0 CRITICAL/HIGH/MEDIUM/LOW — 2 INFO (INFO-1 remediated as the S101-1 centerpiece; INFO-2 recorded no-action).
- Parity: zero new deltas on every pinned surface; the mobile nav functional on both sites.
- Standing verifications: sitemap 28 public-only · robots 4 disallows · 25/25 screenshots (8 changed, the documented families) · .env.example 9/9 · npm audit 0.
- Pushed: main @ <this commit> via docs/ssh_git_wrapper_v3.py (the paramiko shim), remote verified.
