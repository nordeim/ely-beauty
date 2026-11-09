# Session 30 — Run 87: The Lost-Config Build-Resilience Cycle

The operator's standing instructions arrived with a new artifact this run: `docs/build_error.txt` (5,930 lines) — their environment's `npm run build` on Next.js 16.4.5 (Turbopack) dying with a wall of **312 module-not-found errors** (311 `@/`-alias imports + 1 `tw-animate-css`) and **15 `@apply`/`@utility` "Unknown at rule" warnings**.

## The diagnosis discipline

1. **Trust the repo first.** Every reported-missing module was verified tracked in git (`stripe-pay.tsx`, `wishlist.ts`, the whole `@/components` and `@/lib` families); a fresh full clone passed lint · typecheck · typecheck:tests · 717/717 unit · build. So the failure was environmental, not code.
2. **Bisect the signature with a scenario matrix** — one shared `npm ci` install, `cp -al` hardlinked variants, one 90-second build per probe:
   - minus `tsconfig.json` → **exactly the operator's 311-error block**;
   - minus `postcss.config.mjs` → the @apply/@utility warnings + the tw-animate-css module-not-found;
   - minus **both** → **the operator's log reproduced signature-for-signature** (15 warnings + 312 errors).
3. **Rule out the plausible theories by different signature, not by argument:**
   - `npm ci --omit=dev` → one hard EARLY "Cannot find module '@tailwindcss/postcss'" (not 312), and typescript still installs via prisma — dead.
   - the Next 16.4.5 `find-root.js` workspace-marker root inference → our `outputFileTracingRoot` pin already forces the root, and the operator's log carries none of the root warnings — dead.
4. **The mechanism**: the operator's tree materialization drops files untouched since the 2026-10-12 initial migration — `tsconfig.json` and `postcss.config.mjs` are the only build-critical root configs in that vintage (package.json, next.config.ts, src/** — all recently modified — survived). Why the symptoms follow: no tsconfig → no `@/*` paths for Turbopack (it reads aliases from the root config, while bare node_modules imports keep resolving file-relative — which is why ONLY `@/` imports died) and the build's type-check falls to TS defaults; no postcss config → `@tailwindcss/postcss` never registers → raw PostCSS warns on every `@apply`/`@utility` and the plugin-resolved `@import "tw-animate-css"` falls to Turbopack's bare-specifier CSS resolution.

## The fix — living in the files proven to survive

- **S87-1** `turbopack.resolveAlias: { "@/*": "./src/*" }` in `next.config.ts` — the identical mapping to tsconfig paths, so Turbopack compilation never depends on tsconfig.json surviving the checkout (matrix-verified: the minus-tsconfig tree goes 311→0 at compilation).
- **S87-2** `scripts/ensure-build-configs.mjs` — the `CONFIG_FALLBACKS` registry embedding the five 2026-10-12-vintage configs (`tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`, `tsconfig.tests.json`, `eslint.config.mjs`), generated from the canonical files and self-verified byte-exact. Contract: **write-if-missing-or-EMPTY, never overwrites existing content.** Each canonical file carries a one-line S87-2 header naming its restore path (documentation + the recency hedge).
- **S87-3** the seven gated npm scripts (`build`, `dev`, `lint`, `test`, `test:e2e`, `typecheck`, `typecheck:tests`) chain the bootstrap first (~10 ms, silent when nothing is missing).
- **S87-4** the 8 TDD pins in `tests/unit/build-config-resilience.test.ts` — the alias presence, the registry↔canonical byte-sync (the drift alarm that enforces the maintenance rule), the temp-dir restore behavior, the empty-vs-customized semantics, the script chain.

## Verification

- **RED 8 → GREEN; 717 → 725 unit.**
- **Acceptance matrix (S87-5)**: 4/4 poison-tree builds GREEN on fresh installs — the full tree (regression: resolveAlias coexists with the tsconfig alias), minus tsconfig, minus postcss, and **the operator's exact both-missing tree** (the bootstrap prints the restores and the build completes; the restored tsconfig byte-identical to canonical).
- **The CSS pipeline itself verified**: the lost-both standalone server booted on :3200, served HTTP 200, and its 92KB stylesheet carries compiled `@apply` output (`.container-page` expanded to real CSS) — the tailwind pipeline survived, not just the exit code.
- **Gates**: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 725/725 unit ✓ · clean build ✓ · **90/90 e2e ×2 consecutive** · sitemap 28 public-only ✓ · 25/25 screenshots regenerated · `.env.example` 9/9 (audit 87-a).
- **Audit 87-a** (read-only subagent, skills/ excluded): 12/12 standing anchors PASS, run-86 regression-free, 0 CRITICAL/HIGH/MEDIUM/LOW — 6 INFO (all recorded decisions).
- **Live-reference re-measurement** (config-only cycle, expected zero drift — confirmed): panel rows 125/161/197/233 vs clone 124/160/196/232 (±1px, hrefs byte-identical); overlay input Cormorant 18px/300 with the /60 placeholder on both sites; the silk set — all four rows ±1px (clone 173/257/341/425 vs reference 174/258/342/426); /shop 19 unique cards bonnet-first; detail ৳370 Inter 24px on both sites. The toggle-label and type=search supersets recorded, not reverted.

## Docs sweep

AGENTS.md (the build-config-loss resilience contract + the registry maintenance rule) · REMEDIATION_PLAN Session 87 (plan + execution log) · CLAUDE.md (725 pins) · README (725 ×4 + badge) · PAD v2.15 · ely-beauty_SKILL.md v2.15.0 (project_state + Appendix B) · worklog Task 81 · this log.

**Lessons for the next cycle:** a wall of module-not-found errors pointing at files that exist in the repo is a checkout-integrity signal, not a code signal; reproduce the operator's environment as a matrix of minimal deltas; resilience belongs in the files proven to survive the failure; and two sources of truth (canonical + registry) demand a pin or they WILL drift.
