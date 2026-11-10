# Session 46 — Run 95: The Reference-Content Resync & PAD-Body De-Drift Cycle

The operator's standing instruction refreshed the workspace — `git pull` fast-forwarded `7df0a0f` → `ce99658` (run-94's code plus the operator's raw-narrative commit adding `docs/session_45.md`). No NEW operator-side signal artifact this cycle, so this ran as a standard verification/remediation cycle on the mature tree — run 95.

## Environment (the survived-workspace sequence)

The sandbox workspace SURVIVED since run 94 — `npm install` a 955ms no-op (582 pkgs intact), chromium 1248 already cached, `.env` (`DATABASE_URL="file:../db/custom.db"` + `AUTH_SECRET`) and `db/` at the repo root in place, and the session-63 symlink (the parent-shell shadow `file:/home/z/my-project/db/custom.db` → the one repo file) still converged. `db:setup` green at 19 products / 4 categories / 1 slide / 11 settings / 3 coupons. Baseline gates on the pulled tree: lint ✓ · typecheck ✓ · typecheck:tests ✓ · **764/764 unit** (67 files) — the docs matched reality exactly.

## Audit 95-a and the findings that shaped the cycle

**Audit 95-a** (read-only subagent, `skills/` excluded, web-application methodology): **12/12 standing anchors PASS · R1–R5 (the run-94 regression surface) 5/5 PASS · 0 CRITICAL/HIGH/MEDIUM — 6 LOW + 5 INFO.** The run-92/93/94 change-set audited file-by-file: zero correctness/security findings.

- **L-1..L-5 (one family):** the PAD's live-tense body froze around the run-76/80 era — §1.2 stack table (737 unit / 90 e2e), §8.1 heading (634) + a 48-of-67 file table carrying "12-per-page pagination" and `/products?q=`, §8.2 (79 tests, "Two projects", "order numbers increment", no globalSetup-heal/password-change rows), §3.1/§4.1/§12 ("19 models" ×3), §12 suites row (634/82). Only the append-only revision blocks ever carried the current numbers.
- **L-6:** `admin-password-advisory.ts`'s header still named `.env.example` as a demo-pair doc site — the S94-6 four-site inventory contradicts it.
- INFO-1/I-2 (cosmetic comment drift — fixed as S95-5/S95-6); INFO-3/4/5 recorded no-action (the dependency-pin posture, the restore-script import nuance, AGENTS carrying no count row).

## The parity pass — and the content investigation it triggered

The pinned surfaces all held (panel rows reference 89/125/161/197/233 vs clone 88/124/160/196/232 — the −1px uniform tolerance, hrefs byte-identical; the overlay input Cormorant 18px/300; the silk set 174/258/342/426 vs 173/257/341/425 with $370.00/$288.00/$470.00/$520.00 byte-identical; /shop 19 bonnet-first "All Products"; the bonnet detail ৳370 Inter 24px/600 with both buttons active; **mobile nav fully functional — no Tailwind v4 bug**). But the overlay ROW COPY diverged — and the API-level investigation (the reference's public entities endpoint, 19 published products) root-caused it:

- **P-1 (the driver):** the reference's owner RESTRUCTURED the product content since run-77 — the marketing paragraphs now live in `short_description` (13/19; null for 6), `description` holds feature lists or nothing (3 nulls), `how_to_use` is empty for ALL 19, `ingredients` exists only on the Ice Bowl, and the tags/variant labels carry the owner's authored quirks ("bastseller", "Pink & Lovender", "Marron & Navy Blue", "Biege", "Navy blue"). The clone's seed still carried the run-72-era split — visible text drift on the overlay rows, the cards, and the detail sections.
- **P-2 (functional):** the reference's overlay matches **title + short_description + tags only** — measured live: "Silkfare" and "Nano" (description-only words) → 0 rows; "spa-like" (short) → 1; "bastseller" (tag) → 2; "SILK" → 4. The clone's S77-4 description clause was measured against the reference's THEN-content and would now over-match.
- P-4 (INFO, no-action): the reference's Bamboo Oval carries `compare_at_price: 11` — owner data-entry noise, recorded not replicated.

## S95-1 — the search matching resync (TDD)

RED the rewritten OR-clause pin in `search-route.test.ts` (name + shortDescription + tags, `description` ABSENT) → GREEN the route edit. The header comment carries both eras' measurements so the next agent knows WHY the clause changed twice. Live-verified end-to-end on the standalone server: "silk" → 4 (the same four as the reference), "Silkfare" → 0, "bastseller" → 2, "spa-like" → 1 — byte-equal to the live reference on every probe.

## S95-2 — the seed content resync (TDD, the centerpiece)

RED 3 of the 4 new `seed-catalog.test.ts` pins (the restructured-copy, howToUse-empty, and authored-quirks pins; the Ice Bowl pin initially missed the seed's actual slug — corrected) + the storefront e2e usage-section pin flipped to the no-section reality — which exposed that the detail page rendered the Description section UNCONDITIONALLY. GREEN: the seed resync (19 products from the live API, via a script that verifies every replacement count) + the detail page's sections made ALL-conditional (no section for an empty field; no stray hairline when none carry copy — the reference's null-description pages render nothing).

**The mid-cycle discovery (TDD):** e2e run 1 failed 2 admin-catalog tests — the Gua Sha's dialog save rejected. Root cause: `productInputSchema.description`'s run-72-era `.min(10)` (the reference ships 3 EMPTY descriptions) and `shortDescription`'s `.max(300)` (the reference's longest is 424). RED 3 validation pins → GREEN the bounds relaxed (`max(8000)` / `max(1000)`) + the admin dialog's `required`, "min 10 characters" placeholder, and `maxLength={300}` corrected. A pinned bound that contradicts the reference's live data silently breaks the admin surface for exactly the resynced products.

## S95-3 + S95-4 — the PAD de-drift and its recurrence guard

The PAD body refreshed (counts 777/92; 20 models ×3; the three-project e2e reality with the serialized admin-catalog + the S84-2 globalSetup heal + the S92-2f password-change row; crypto-random order numbers; 24/page; `/shop?q=`; the §8.1 table extended to all 68 suites) + the v2.22 revision block. The NEW `tests/unit/docs-counts.test.ts` (the neo-crm mechanism — web-application skill §14) pins every live-tense count site (README badge/table/tree/commands, CLAUDE testing line, PAD §1.2/§8.1/§8.2/§12, SKILL project_state + §2) to one set of constants: RED 5/5 against the frozen PAD → GREEN after the sweep.

**Two lessons encoded:** the count moved twice mid-cycle (774 → 777 when the validation pins landed) and the pin correctly forced the re-sweep — the mechanism working as designed; the negative pins initially fired on the v2.22 revision block's own QUOTES of the stale strings — scoped to the live-tense body (after "## Table of Contents"), since revision blocks are append-only history that legitimately cites prior eras.

## Verification

- **Gates, all green on the final tree:** lint ✓ · typecheck ✓ · typecheck:tests ✓ · **777/777 unit** (68 files, +13: 4 seed-content + 5 docs-counts + 1 advisory-inventory + 3 validation copy-bounds; the search-route pin rewritten in place) · clean build ✓ · **92/92 e2e ×2 consecutive** (2.4m each — run 1 caught the validation-bound regression, fixed, then double-green).
- **Standing verifications:** sitemap **28 `<loc>`, 0 private paths** · **25/25 screenshots** regenerated from the live standalone server (the orphan ritual FIRST — one stale `next-server` caught and killed by PID; 8 changed: the content-resync family plus the known raster-noise/admin surfaces; all PNGs signature- and size-verified) · `.env.example` **9/9** (6 active + 3 commented) · `npm audit` **0** (prod and full).
- **The parity re-measure: the overlay row copy is now BYTE-IDENTICAL to the reference** — the "silk" set's name+desc concatenations equal on all four rows; prices $370.00/$288.00/$470.00/$520.00; the row geometry −1px uniform with h=80 both; the input Cormorant 18px/300 and the row price Cormorant 14px/300 both; the panel rows −1px uniform with byte-identical hrefs; /shop 19 bonnet-first "All Products" both; the bonnet detail ৳370 Inter 24px/600 with both purchase buttons active. The panel → overlay → results → navigation chain exercised live on both sites.

## Docs sweep

REMEDIATION_PLAN Session 95 (S95-1..S95-9 with the execution log) · worklog Task 89 · this log · README/CLAUDE counts 764 → 777 (badge, table, tree, commands, the CLAUDE pin list) + the README storefront row's matching/sections copy · AGENTS.md (the S95-1/S95-2 search-matching + conditional-sections invariant, the session range 2..95) · PAD **v2.22** · **SKILL v2.21.0** (project_state lockstep + the §8.4 "sequential" order-number leftover fixed).

**Lessons for the next cycle:** a parity pass that only compares GEOMETRY and PRICES can miss a full content restructure on the reference's side — compare the rendered COPY byte-for-byte on at least one surface per family (the overlay rows exposed what the geometry pins couldn't); and a schema bound is a parity pin in disguise — when the reference's data changes shape (nullable fields, longer values), the validation bounds must follow or the admin surface silently breaks for exactly the resynced rows.
