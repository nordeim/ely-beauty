# Session 28 Log (Run 86) — The zod 3→4 Migration Cycle

The standing deferred debt (deferred since S27: "the zod 3→4 migration
epic — a dedicated cycle") retired this run, driven by the unpatchable
HIGH advisory GHSA-mrhx-c7xc-m3w5. The cycle: workspace refresh (pull to
f44bea9) → docs review → gates re-validation → deep audit 86-a (with the
exhaustive zod census) → live-reference re-measurement → the Session 86
plan → TDD remediation (S86-1..S86-6, RED 4 → GREEN) → screenshots → the
docs sweep → commit + push.

## The cycle in order

1. **Workspace refresh + docs review.** `git pull` fast-forwarded to
   f44bea9 (the operator's session-log commit adding session_27.md —
   the raw run-85 narrative; run 85 verified pushed @ 3a7febe with the
   remote ref confirmed). Re-read AGENTS.md, CLAUDE.md, README.md, PAD
   v2.13, ely-beauty_SKILL.md v2.13.0, session_26.md (the polished
   Run 85 log), session_27.md, the worklog tail, and the REMEDIATION_PLAN
   through Session 85. The environment held (node_modules, .env, the
   db/ symlink convergence, Playwright chromium); the DB matched the
   documented seed exactly (19/4/14/3/11). skills/ excluded from all
   checking per the operator contract; the web-application +
   code-review-checklist skills read for methodology.
2. **Gates on the pulled tree**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · 708/708 unit ✓ · clean build ✓ · **90/90 e2e on
   the FIRST full run** — no flake to reproduce.
3. **Deep audit 86-a** (read-only subagent): 12/12 standing anchors
   PASS, the run-85 change-set S85-1..S85-5 all intact, 0 CRITICAL code
   defects — 1 HIGH (the zod 3.25.76 prod-direct advisory itself), 2 LOW
   (L-1: the HomeNest kitchenware placeholder trio on the skincare admin
   dialog — dutch-oven slug, HN-DUTCH-24 SKU, "6 qt" specs; L-2: the
   dead exports `stripePublishableKey()` + `ROLES`), 6 INFO (the US-format
   phone/carrier placeholders, the wishlist fixed message, dev-only
   audit families, the money alias, schema hygiene). Plus the
   **exhaustive zod census**, runtime-probed against the installed
   package's v4 build: 1 hard break (stripe-payment.ts:343's single-arg
   `z.record`), 3 deprecation classes (`.email()` ×1, `{message:}`
   params ×3, `z.ZodIssueCode` ×3), v4 default-text rewrites for
   un-messaged checks, `.default()` semantics probed value-identical
   across all 30 sites, and no test anywhere pinning a v3 default text.
4. **Live-reference re-measurement** (agent-browser, logged in, mobile
   390×844 + desktop 1440×900): **zero new parity deltas** — the panel
   rows 89/125/161/197/233 with byte-identical hrefs, toggle-close
   (conditional unmount), the SEARCH row → overlay (z-70, bg .95, blur
   4px, Cormorant 18px/300), the "silk" set $370.00/$288.00/$470.00/
   $520.00 on 80px/2px rows, detail ৳370 Inter 24px/600, /shop 19
   bonnet-first, the footer template slugs, and the desktop overlay
   input Cormorant 24px/300 with the /60 placeholder. Two a11y
   supersets recorded, not reverted: the state-aware menu-toggle label
   ("Open menu"/"Close menu" vs the reference's static "Toggle menu")
   and the overlay rows as real `<Link href>`s vs its button-navigation.
   The clone probe (fresh standalone server): panel ±1px (rows
   88/124/160/196/232), silk rows ±1px (173/257/341/425), the desktop
   input ±2px column width (both centered), sitemap 28 public-only,
   robots disallows, the search API order identical.
5. **The Session 86 plan** (REMEDIATION_PLAN.md): S86-1 the bump + the
   z.record fix + the sentinel pin; S86-2 the deprecation modernization
   (probe-gated); S86-3 the message policy DOCUMENTED (accept v4
   defaults for un-messaged backstops — both v3/v4 texts are technical
   zod-speak, 11 form files carry client maxLength caps, zero test
   pins); S86-4 the kitchenware placeholder trio; S86-5 the dead
   exports; S86-6 the BD-localization copy. Validated against the
   codebase (every site read) before execution.
6. **TDD RED**: the v4 sentinel pin + the three placeholder pins RED on
   the pulled tree (4 failing); the five S86-2 message-preservation
   pins and the S86-1 webhook-metadata pin GREEN on v3 by design — they
   are the migration's tripwires. A pre-bump probe battery verified the
   emailSchema pipe restructure message-identical across 15 inputs
   (empty/whitespace/invalid/valid/uppercase/unicode), and the record
   probe exposed the preview-vs-shipping nuance below.
7. **GREEN**: S86-4/S86-6/S86-5 first (copy + dead exports — RED set
   shrinks to the sentinel alone), then `npm install zod@^4.6.7`
   (resolved 4.6.7), the two-arg `z.record(z.string(), z.string())`
   with the semantics comment, the emailSchema pipe restructure, the
   ZodIssueCode → "custom" renames ×3, the {message:} → {error:}
   renames ×3. Concept sweep clean (no ZodIssueCode, no single-arg
   z.record, no deprecated .email( chain, no message: params).
8. **The stale-server false alarm (resolved, recorded as a trap)**: the
   post-migration screenshot capture showed the pillowcase detail page
   in a hydration error state — the PRE-migration standalone server
   still held :3000 (pattern-guess pkill missed it; the restart died
   EADDRINUSE), so old in-memory server code served new on-disk client
   chunks. The e2e suite (fresh server per run) staying 90/90 was the
   differential that localized it. Killed by PID (ss -tlnp → 17893),
   restarted, the page verified healthy ("Color Sky Blue" et al.), and
   the capture re-run clean.
9. **Gates after the migration**: lint ✓ · typecheck ✓ ·
   typecheck:tests ✓ · **717/717 unit** (+9) · clean build ✓ · **90/90
   e2e ×2 consecutive** · 25/25 screenshots regenerated + validated
   (none undersized) · `.env.example` re-verified (no env changes) ·
   **the zod advisory GONE from npm audit** (the remaining 11 = the
   accepted dev-only families).
10. **Docs sweep + push**: AGENTS.md (the dependency-risk ledger: zod
    CLOSED by migration + the S86-3 policy pointer), CLAUDE.md (717
    pins), README (717 counts + badge), PAD v2.14 (revision block +
    the stack-table zod row ^4.6.7 + the stale 634/79 stack counts
    corrected), ely-beauty_SKILL.md v2.14.0 (project_state + the zod
    dependency row + the Session 86 Appendix B entry), this
    session_28.md, worklog Task 80, the REMEDIATION_PLAN execution
    log. Committed and pushed to main via docs/ssh_git_wrapper_v3.py.

## The probe correction (recorded for the record)

The audit's "hard break" was probed against the `zod/v4` subpath bundled
inside 3.25.76 — there the single-arg `z.record(z.string())` constructs
silently, mis-binds its argument to the KEY position, and throws
`TypeError: Cannot read properties of undefined (reading '_zod')` at
parse. The shipping 4.6.7 keeps the single-arg overload as deprecated
v3-compat (probe: constructs AND parses Record<string,string>-identical
to v3). The two-arg fix landed anyway — the deprecated overload invites
the v5 removal — and the new webhook-metadata pin locks the BEHAVIOR
(string metadata parses; non-string values reject), not the crash mode.
The pin is also the dormant-break repro: no earlier test event carried
metadata, so the record schema's parse path had never been executed by
the suite.

## Encoded traps (the S86 lesson set)

1. A census probed against a PREVIEW subpath can mis-predict the
   shipping major — pin the BEHAVIOR, not the crash mode, and fix to
   the forward-compatible idiom regardless.
2. Dormant breaks evade tests whose fixtures never exercise the branch
   — a schema that constructs but crashes at parse needs a fixture that
   walks the path (the webhook-metadata pin).
3. A stale standalone server + a rebuilt .next/ = mismatched in-memory
   server code vs on-disk client chunks — hydration error states that
   look exactly like a code regression. The suite that spins its own
   fresh server staying green is the differential. Kill by PID
   (ss -tlnp), never by pattern-guess pkill.
4. A major-version bump rewrites default error texts — decide the
   message policy EXPLICITLY (accept vs message every site) and record
   the rationale; the explicit messages are the migration's real
   contract.
5. An a11y superset is not a delta: the state-aware toggle label and
   the Link-row overlay both diverge from the reference's semantics
   while being strictly better web practice — record, don't revert
   (the S79-4 precedent, now twice-confirmed).
