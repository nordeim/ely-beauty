# Session 36 — Run 90: The Coupon-Label Format, README-Table Drift & Restock-Parity Cycle

The operator's standing instruction refreshed the workspace to `99d9887` — run-89 pushed clean, plus the operator's `docs/session_35.md` (the run-89 raw narrative). No new operator-side signal artifacts this cycle (no build_error.txt / start_server_log.txt update), so this run opened as a standard verification cycle — and became a findings-bearing one twice over: once from the audit (a docs-drift LOW + a coupon-label INFO that upgraded to a real fix), and once from the live parity pass (a reference-side restock that had drifted past our seed).

## The audit and its upgrades

**Audit 90-a** (read-only subagent, skills/ excluded): **12/12 standing anchors PASS, R1–R6 (the run-89 regression surface) all PASS, 0 CRITICAL/HIGH/MEDIUM — 1 LOW + 3 INFO.** The five CONFIG_FALLBACKS byte-exact; the toolchain pins lockfile-read; every docs-vs-code claim verified true (735 ×5, PAD v2.16, SKILL v2.16.0, the AGENTS RETIRED ledger).

- **F-1 (LOW) → S90-1, docs-only.** The README architecture table's version cells were stale after runs 86/88: Prisma `^6.11` → `^6.19`, Zod `^3.25` → `^4.6`, Vitest `^3.2` → `^4.1`. Fixed; the counts in the same table were already right.
- **F-3 (INFO) → S90-2, upgraded to a real fix.** The audit called the coupon min-subtotal label refactor "output-equivalent" — it was NOT. `formatMoney` comma-groups at ৳1,000+ while the hand-built label did not, and the seeded **SAVE20 carries minSubtotal 100000 (৳1,000)** — a live user path rendering "৳1000" against the comma-grouped convention every other money surface uses (even the FREESHIP description reads "৳3,000"). TDD: the RED pin ("৳1,000", never "৳1000"; the poisha case "৳365.50" either way) failed on the pulled tree; GREEN deletes the hand-rolled logic for `formatMoney(coupon.minSubtotal)`.
- **F-4 (INFO) → S90-3.** The S88-1 comment now states vitest 4.1.12's actual declaration — `fn<T extends Procedure | Constructable = Procedure>` (constraint vs default, read from the installed `.d.ts`); the operative typed-mock conclusion unchanged.
- **F-2 (INFO) → recorded, no action.** The fsevents allowScripts omission (macOS-only optional; a no-op on Linux).

## The mid-cycle parity finding — S90-4, the restock

The standing mobile parity pass measured everything byte-consistent (panel 99/135/171/207/243 vs 98/134/170/206/242, −1px uniform; the overlay input Cormorant 18px/300 with the /0.6-alpha placeholder; the "silk" rows 214/298/382/466 vs 213/297/381/465, −1px ×4; /shop 19 bonnet-first; detail ৳370 Inter 24px/600). Then the end-to-end verification of the S90-2 label (SAVE20 in an under-৳1,000 cart) surfaced something bigger: **the clone's bonnet detail rendered OUT OF STOCK.**

The trace: DB stock 0 → the seed pins ELY-001 at 0 → the run-72 extraction snapshot (`docs/reference-investigation.md`: "Bonnet / 370 / — / 0") — our seed was reference-faithful AT RUN 72. Re-measured live: **all four run-72 stock-0 products (Bonnet / Curler / Spa Socks / Ice Bowl) now render active purchase panels on the reference** (variants + ADD TO CART + BUY IT NOW; the reference displays no numeric stock at all). The reference restocked since run 72; the clone's seed had drifted stale against it — a user-visible delta on four detail pages, including the /shop grid's first card.

The fix, TDD-first: the restock pin in `seed-catalog.test.ts` (RED on the pulled seed) → the four seed rows restocked (25/30/20/15 — the reference exposes no numbers, so the values are demo choices satisfying the visible "purchasable" contract) → applied via `restore-demo-stock.ts` (the S7-3 traffic-owned policy: `db:setup` alone never touches stock — the reseed left the column untouched, exactly as documented) → **all four clone detail pages live-verified rendering ADD TO CART + BUY IT NOW.** The three stale "sold-out bonnet" comments in `storefront.spec.ts` and the run-72 note re-recorded; AGENTS.md's stock contract carries the S90-4 note; the out-of-stock rendering path itself stays (the correct superset for genuinely drained rows). The e2e product picks were verified term-pinned (pillowcase / massager / body-brush) — no stock-order dependence anywhere.

## Verification

- **Gates, all green on the final tree:** lint ✓ · typecheck ✓ · typecheck:tests ✓ · **737/737 unit** (64 files, +2 pins) · clean build ✓ · **90/90 e2e ×2 consecutive** (2.5m + 2.4m).
- **Standing verifications:** sitemap **28 `<loc>`, 0 private paths** · **25/25 screenshots** (9 changed: the restocked detail page + the known raster-noise family; 16 byte-identical) · `.env.example` 9/9 (6 active keys + 3 commented opt-ins) · `npm audit` 0 · `db:setup` 6.19.3 == 6.19.3.
- **Two operational lessons recorded:** (1) the e2e orphan-server wedge — two 10-minute timeouts were the killed runs' orphan `next-server` processes holding :3100/:3000; kill the webServer's children before retrying a timed-out e2e run; (2) the dead-server screenshot capture — the first attempt wrote NOTHING (the e2e server died with its parent, and the script's per-shot try/catch left the old files), caught only because `git status` showed zero changes where the restocked detail page had to differ.

## Docs sweep

REMEDIATION_PLAN Session 90 (S90-1..S90-7 with the execution log) · worklog Task 84 · this log · README (table cells + counts 737 ×4) · CLAUDE (737) · PAD **v2.17** (the revision block: coupon label, README drift, comment precision, the restock) · AGENTS.md (the S90-4 stock-contract note).

**Lessons for the next cycle:** audit "equivalence" claims are hypotheses — the comma-grouping disproving of F-3 turned an INFO into the cycle's second fix; parity pins on a LIVE reference must include behavioral state (purchasable vs sold-out), not just typography — nine runs of price-pin measurements never noticed the restock delta because the price renders in both states; and when a timed-out e2e run leaves orphans, the retry inherits the wedge.
