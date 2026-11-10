# Session 50 — Run 97: The Auth-Secret Hardening & Doc-De-Drift Completion Cycle

The operator's standing instruction refreshed the workspace — `git pull` fast-forwarded `b68ed15` → `9bfd120` (run-96's code plus the operator's raw-narrative commit adding `docs/session_49.md`). No NEW operator-side signal artifact this cycle, so this ran as a standard verification/remediation cycle on the mature tree — run 97.

## Environment (the survived-workspace recovery)

The sandbox workspace SURVIVED since run 96: node_modules intact, `.env` in place (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET`), the session-63 symlink converging the parent-shell `DATABASE_URL` shadow, `db/custom.db` seeded, and the Playwright cache already carrying the pinned chromium-1248. Only `git pull` was needed for the code refresh. Baseline gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · **784/784 unit** (68 files) — the docs matched reality exactly.

## Audit 97-a and the findings that shaped the cycle

**Audit 97-a** (read-only subagent, `skills/` excluded, web-application methodology): **12/12 standing anchors PASS · R1–R8 (the run-96 regression surface) 8/8 PASS · 0 CRITICAL/HIGH/MEDIUM — 18 LOW + 3 INFO.** The run-96 change-set audited file-by-file: zero correctness/security findings (the `productMetaDescription` chain, the accent-foreground dialogs, the new pins, and the doc claims all verified in source). 14 of 15 pre-flagged documentation-drift leads CONFIRMED; D8 (the PAD §5 radius claim) REFUTED — accurate as written.

- **N1 (the code driver):** `assertAuthSecret` rejected only missing/empty/whitespace/dev-fallback — a 1-character non-fallback secret passed the production gate and then keyed the session-cookie HMAC and the order-access tokens. The A8 anchor's "missing/short" expectation was half-unimplemented.
- **N4 (the lockstep-net gap):** `docs-counts.test.ts` pinned the 20-model claims only on PAD/SKILL — README's two "19 models" rows failed no test, exactly the drift class S95-4 was built to catch.
- **N6:** `productMetaDescription` passed a whitespace-only string through (truthy `||`); defended upstream by the schema's `.trim()` but not inside the helper.
- **N5:** the S96-2 accent pin was a count heuristic with a single-variant negative scope.
- **D1–D15 + N2/N3 (the doc-drift family):** the README model count (19 → 20), the PAD §1.2 Radix list (claimed sheet/tabs/radio; installs dialog/label/select/slot/toast), the SKILL §5 UI-primitives list, the SKILL §1 radius pins (homenest-era xl 12/2xl 16/3xl 24 vs the measured xl 8/2xl 12/3xl 16) and mobile-menu anatomy (the "bg-primary active pill" + "green circular close button" were pre-S73-4/S74-2 anatomy), the SKILL §6 `searchOpen` field, the §8.3 limiter grid (missing changePassword/addresses/cart-bulk/cart-summary/stripe-intent + the review two-tier), the §2 broken "(§10.4)" cross-ref, the §3 script table (no `typecheck:tests`), the PAD §4.1 ER diagram (18 named vs the 20-model heading), §1.4's "13 more products (superset)" + "the reference requires login" (ADR-004 + the dossier say guest checkout), §6's "sole `$queryRaw`" + "sequential numbers", §8.2's "superset tail on page 2", and §2's 10-endpoint topology (13 route files).

## The parity pass — every pinned surface holds

Measured live, mobile 390×844, both sites logged in: the panel rows Search/Shop/Beauty Tools/Brush & Combs/About at reference 89/125/161/197/233 vs clone 88/124/160/196/232 (−1px uniform, hrefs AND labels byte-identical — the direct panel probe; the main script's `a[href]` filter returned empty on BOTH sides, the known run-96 quirk); the overlay input Cormorant Garamond 18px/300 with "Search products..." both; the "silk" overlay rows reference 174/258/342/426 vs clone 173/257/341/425 (h=80) with all four row copies BYTE-IDENTICAL and $370.00/$288.00/$470.00/$520.00 at Cormorant 14px/300 both; /shop 19 unique cards bonnet-first h1 "All Products" both; the first-card detail ৳370 Inter 24px/600 with both purchase buttons active; and the mobile nav fully functional on both sites — the panel → link → navigation chain exercised live, **no Tailwind v4 bug** (zero `classList` in src/, the conditional-mount pattern holding).

## S97-1 — the AUTH_SECRET minimum-length floor (TDD, the centerpiece)

RED 3 pins in `tests/unit/auth-secret.test.ts` (a 1-char and a 31-char non-fallback secret in production both throw; a 32-char secret passes) → GREEN: `MIN_AUTH_SECRET_LENGTH = 32` in `src/lib/auth-secret.ts` (the README's documented `openssl rand -hex 32` guidance, now enforced), the error message naming the floor and the command; the pre-existing 31-char "strong secret" fixture updated to the new contract. 8/8 in the file; both call sites (`src/lib/auth.ts`, `src/lib/order-access.ts`) route the env through unchanged.

## S97-2 — the docs-counts README model-count net (TDD)

The rewritten "20-model claims" pin positively pins README's architecture table + file-hierarchy tree to `PRISMA_MODELS` and negatively pins the whole README against "19 models" (README is fully live-tense — no historical narrative). RED against the two stale rows → GREEN after the fix. The drift class S95-4 was built to catch can no longer rot README silently.

## S97-3 — the productMetaDescription whitespace hardening (TDD)

RED 2 pins in `tests/unit/seo-ld.test.ts` (a whitespace-only shortDescription falls through to the description; whitespace-only both fields → the name-based line) → GREEN: the helper trims each term. Live-verified on the standalone server: the bamboo oval (both fields empty) renders "Natural Bamboo Hair Brush - Oval — ElyBeauty" on the meta description AND the Product JSON-LD.

## S97-4 — the S96-2 accent pin hardening (mutation-verified)

Per-tag assertions (every `<input type="checkbox">` tag in the four admin dialogs carries `accent-foreground`) replace the count heuristic; the negative net extends to the underscore/space hsl variants + `#d96e26`. A regex lesson encoded mid-fix: the first per-tag attempt used `[^>]*` and FALSE-FAILED against product-dialog's category checkbox — an `onChange` arrow contains `>` (in `=>`), so the pattern truncated mid-tag and missed the `className` that follows the handler; the tag match now spans to the self-closing slash. Mutation check: stripping the class from a checkbox fails the pin by name.

## S97-5..S97-8 — the doc-de-drift completion family

The installed Radix set + the real 9-file ui inventory across README/PAD/SKILL; SKILL §1's radius pins → the measured scale (§19 authoritative) and the mobile-menu anatomy → the S73-4/S74-2 reality (SEARCH + 4 links, no in-panel close button, `aria-current` only); §6's `searchOverlayOpen`; §8.3's limiter grid completed with the measured inventory (every budget re-verified against the route sources); §2's §9.3 cross-ref; §3's `typecheck:tests` row; PAD §4.1's ER diagram gains the `ProductCategory` junction edge + `StripeEvent`; §1.4's 19-product mirror + the guest-checkout reality; §6's two `$queryRaw` sites + crypto-random order numbers; §8.2's one-page 24-per-page grid; §2's 13-route topology.

## Verification

- **Gates, all green on the final tree:** lint ✓ · typecheck ✓ · typecheck:tests ✓ · **789/789 unit** (68 files, +5: 3 auth-secret floor pins + 2 whitespace pins) · clean build ✓ · **92/92 e2e ×2 consecutive** (2.5m + 2.4m). The docs-counts lockstep fired exactly as designed — the +5 move tripped the README/CLAUDE/PAD/SKILL sites BY NAME (4 failing tests observed) and the sweep brought them all green in one pass.
- **Standing verifications:** sitemap **28 `<loc>`, 0 private paths** · robots 4 disallows + the sitemap pointer · the bamboo-oval meta verified live · **25/25 screenshots** regenerated from the live standalone server (7 changed: 03 the review-ID/date band, 12/13/14/17/19 the known admin/account raster-noise family, 15b the coupons surface; all PNGs signature-verified) · `.env.example` **9/9** (6 active + 3 commented, zero drift) · `npm audit` **0** (prod and full).
- **Recorded no-action (INFO N7):** the overlay's "No products found" flash during the 250ms in-flight typeahead window — a cosmetic micro-state whose reference behavior is unmeasured; changing a visible surface without a reference measurement violates the replicate-as-observed convention.

## Docs sweep

REMEDIATION_PLAN Session 97 (S97-1..S97-11 with the execution log) · worklog Task 91 · this log · README counts 784 → 789 + the model count 19 → 20 (now pinned) + the primitives row · CLAUDE counts 784 → 789 · AGENTS.md (the session range 2..97) · PAD **v2.24** · **SKILL v2.23.0** (project_state lockstep + the run-97 summary).

**Lessons for the next cycle:** a pin's regex must respect the grammar of the source it scans — JSX attributes can contain `>` inside arrow functions, so tag-matching patterns must span to the tag's true close, not the first `>`; and the orphan-server trap now has a rebuild costume — after ANY `next build`, a surviving server from the pre-build era serves the OLD chunk manifest against the NEW `.next/static` (ChunkLoadError on client navigation, the SSR shell still 200s) — kill by port owner and restart before every server-dependent pass.
