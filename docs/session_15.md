工作区已刷新至 `1b46d3a` (session_13.md 已添加)。让我来制定主计划，并开始进行文档审查。
The persisted-output nesting is getting deep. Let me read AGENTS.md directly in sections.
The nested persisted outputs aren't working. Let me use bash with line-wrapping to read these docs in manageable chunks.
session_13.md is the log of run-78 (the last completed cycle, pushed @ `3d6f48a`). Let me read session_12.md, worklog.md, and the REMEDIATION_PLAN tail to understand where things stand.
Session 78 全景已确认。现在让我快速浏览一下 PAD 和 SKILL（标题/版本）以及 skills 的目录清单，然后验证环境状态。
Environment survived: `node_modules` present, `.env` correct, `db/custom.db` at repo root with the documented symlink convergence. Now let me review the recent run-78 changes and validate alignment via the full gate chain.
613/613 单元测试已通过。现在开始进行干净的生产环境构建（run-76 经验：文档改动可能会破坏构建）。
Build clean. Now the e2e suite (79 tests, standalone server on :3100).
**All gates green on the pulled tree**: lint ✓ · typecheck ✓ · typecheck:tests ✓ · 613/613 unit ✓ · clean build ✓ · 79/79 e2e ✓ — docs match reality. Now let me verify the config surfaces (vitest/playwright/sitemap/SEO) and load the audit skills.
Sitemap/robots/SEO verified (implemented + tested + build-emitted). Now let me load the audit methodology skills and the agent-browser skill for the live-reference comparison.
agent-browser 0.41.2 is available. Let me launch the deep audit subagent (read-only) and do the live-reference comparison myself in parallel.
Audit complete: **0 Critical / 0 High, 2 Medium, 5 Low** — solid baseline. Now let me do the live-reference parity comparison myself with agent-browser (the operator's mobile-menu priority surface first).
Logged into the reference. Now setting the mobile viewport (390×844) and measuring the mobile navigation menu — the priority surface.
The toggle click closed the previously-open menu. Reopening and measuring in one flow:
Reference mobile panel measured: `y:64 h:214`, links 14px/1.4px uppercase @36px rhythm, SEARCH row, transparent fixed header — matches the documented pins. Now the search overlay via the panel's SEARCH row:
1-char floor works on the reference. I notice `$` pricing in the results — the reference may have changed currency since the ৳ pins. Let me verify on the shop page:
The shop page still renders ৳ whole-taka — but the overlay now shows `$` + decimals. Let me check what run-77/78 recorded for the overlay price format, and re-verify the live overlay carefully:
Run-77 measured "৳ prices" in the overlay. Let me re-verify the live reference's overlay price rendering on both viewports carefully — this could be new drift:
Significant finding: the reference's overlay now renders prices as `$370.00` (dollar + decimals) in the heading font, while the shop page keeps ৳. Let me check the desktop viewport and product detail page to map the full drift:
Desktop overlay confirms: `$370.00`, Cormorant Garamond 300, 14px. Let me check the original S77 measurement record and the product detail page price to see if this is new reference drift:
The `$370.00` is the **documented standing deviation** (S77: "prices render ৳ (the reference's `$370.00` is its own quirk)") — not new drift. But the price **font family** (Cormorant vs our Inter) may be a missed micro-delta. Let me measure the full row anatomy and the reference's remaining key surfaces:
Reference price renders in **Cormorant** (fw 300) — let me check our clone's row implementation:
Our clone renders the price in Inter; the reference uses Cormorant — a genuine micro-delta. Let me sweep the reference's other pinned surfaces (detail page, footer, no-results copy) before comparing the clone:
The detail page main is empty — wrong slug. Let me get the real product URLs from the shop page:
Reference detail page matches documented anatomy. Note the footer SHOP column lists "Skincare / Body Care / Gift Sets" — let me check the reference's shop pills and our clone's footer for drift:
The reference's footer links reveal hidden categories (skincare: 12 products). Let me probe the reference's entity API for its full category model:
Only 4 categories exist in the reference's API (matching our seed). The footer's Skincare/Body Care links are legacy slugs. Let me check what the run-72 dossier recorded about the footer:
现在让我来测量 clone 端。根据 sandbox 约定，server 和测量必须在一次 bash 调用中完成。让我检查一下现有的 capture-script 模式，然后编写一个 clone 端的测量脚本：
The clone uses `aria-label="Open menu"` (with the documented flip) vs the reference's "Toggle menu" — an a11y superset, fine. Let me check the clone's mobile-nav structure for the right selectors:
The aria-label flips to "Close menu" when open (the documented contract). Fixing the selector to use the panel's `data-testid`:
克隆端测量已完成。对比结果：**移动端面板字节完全一致（±1px）**，胶囊/列表/圆角/无结果渲染全部匹配，**发现一个新差异：遮罩层价格以 Inter 渲染，而参考端使用 Cormorant Garamond**。让我验证一下参考端的遮罩层重开行为（状态持久化），然后敲定修复计划：
The reference **resets** overlay state on reopen — our clone persists it (a real functional delta). One more check: the reference's mobile price font size:
参考已在两个视口上确认：14px Cormorant 300。现在让我在编写修复计划之前，先审查现有的测试套件：
Now let me study the CartDrawer's focus pattern (the repo's modal standard) to mirror it in the overlay:
**New latent bug found**: the drawer's focusables selector contains `aref]` — invalid CSS that makes `querySelectorAll` **throw on every Tab press**, silently breaking the Tab-wrap (it was meant to be `a[href]`). Let me confirm and check its history:
**Verified**: the selector throws `SyntaxError` — the drawer's Tab-wrap has never worked. That's a confirmed latent bug for the plan. Now let me write the Session 79 remediation plan:
Plan recorded and validated against the codebase. Now the TDD RED phase — let me read the existing test harnesses first:
Before designing the `readJsonBody` helper, let me check how the client islands actually call these APIs (content-type implications):
The repo already has per-route `parseJsonBody` copies returning `null` — the surgical design: one canonical bounded helper in `src/lib/json-body.ts` keeping the null contract. Let me map each route's limiter position:
All test harnesses are compatible with the design. Now writing the RED batch — first the search-overlay unit extensions:
Now the layout-tokens S79 source pins:
Now the new json-body unit test (the helper contract):
Now the e2e RED extensions for the storefront spec:
Now run the RED batch to confirm the new pins fail before implementation:
RED confirmed — 12 failing. Let me see the full failure list:
All RED as expected. Now the GREEN implementations. First, the bounded JSON body seam:
Now the search-overlay GREEN implementation:
Now repair the drawer's corrupted selector and add the header button's aria pair:
The file may actually be correct — the `aref]` could be a terminal display artifact (as the run-78 log documented). Let me verify at byte level:
**关键修正**：该文件实际上包含 `a[href]` —— `aref]` 是一个**终端显示伪影**（输出管道将 `[h` 当作 ANSI 序列处理），这正是 run-78 日志中记录的陷阱。我的 `jsdom` 测试从未读取该文件；它测试的是我转录的一个已损坏的字符串。`selector` 一直都是正确的。让我相应地修正该计划：
Now the header button's aria pair (S79-6):
Store exposes it ✓. Now the 9 route migrations. Starting with cart (local helper + POST reorder):
Cart PATCH was already limiter-first ✓. Now the remaining 8 route files:
All routes migrated. Now the GREEN check on the full RED batch plus route tests:
The reorder exposed a latent test-helper flaw: every request funnels into ONE shared IP bucket (the rightmost xff hop `198.51.100.1`), masked before by parse-before-limit. Let me check the helper's usage across files:
Other files use single-hop xff correctly. Fixing the api-boundaries helper so the per-test IP rides the trusted rightmost position:
All route tests green. Now the full unit suite to catch ripple effects:
634/634 (+21 new pins). Now lint + typecheck + clean build + e2e:
The repo's lint rule correctly rejects setState-in-effects. Moving the reset to the canonical render-time adjustment pattern (React's "storing information from previous renders"):
All gates green. Now the e2e suite with the new S79 specs:
**82/82 e2e (+3)**. Now the S79-8 docs-truth fixes in AGENTS.md:
Now extend the AGENTS.md search-surface contract with the S79 additions:
Now the count sweeps across README, CLAUDE, PAD, SKILL:
Now the PAD v2.7 revision block:
Now the dev-server screenshots (S79-10) — server + capture in one invocation per the sandbox contract:
All 25 captured. Quick pixel-level validation (non-blank check) on the key shots:
All screenshots valid. Now verify `.env.example` matches the codebase (task 12):
All new files intentional. Now the REMEDIATION_PLAN execution log with ticked checkboxes:
Now the session log `docs/session_14.md`:
Now the worklog entry:
Now the final full gate chain on the final tree (docs changed since the last build — the run-76 lesson):
**All final gates green.** Now the commit + SSH-wrapper push. Reading the runbook first:
I have the full procedure. First the commit (runbook rule 3 — commit before push):
Committed `05a4633`. Now the SSH push — key materialization, shim deployment, sanity check:
Dry-run clean — fast-forward to the correct remote. Now the real push:
**Run 79 complete — pushed to `main` @ `05a4633`** (remote verified, key shredded, working tree clean, no new branches).
**Run 79 complete — pushed to `main` @ `05a4633`** (remote verified by the SSH wrapper, key shredded, no new branches, working tree clean).

## What was done

**Baseline (Verified):** `git pull` → `1b46d3a`; all gates green on the pulled tree — lint · typecheck · typecheck:tests · **613/613 unit** · clean build · **79/79 e2e** — the docs matched reality. Environment intact: `.env` with `DATABASE_URL="file:../db/custom.db"`, `db/custom.db` at the repo root, the documented symlink convergence.

**Audit 79-a** (read-only, `web-application` + `code-review-checklist` methodology, `skills/` excluded): **12/12 standing anchors PASS, 0 CRITICAL/HIGH code defects** — 2 MEDIUM (overlay never restored focus on close; unbounded `request.json()` with the limiter after the parse) + 5 LOW + 6 INFO. Vitest/Playwright configs, Sitemap/robots/noindex/JSON-LD all verified in place and build-emitted.

**Live-reference parity** (agent-browser, logged in, both viewports): your **mobile-menu priority surface is byte-exact ±1px** (panel y:64 h:213, 14px/1.4px links @36px rhythm; Tailwind v4 conditional-mount pattern intact, e2e-guarded). Two new search-surface deltas measured and closed TDD-first (RED 12 → GREEN):
- **S79-1**: the row price now rides the display serif (the reference's computed Cormorant 14px/300)
- **S79-2**: the overlay now resets on close/reopen (the reference's fresh sheet; lint-clean render-time adjustment)

Plus the a11y superset (opener focus restoration, Tab-wrap, focus-visible rings, `aria-expanded`/`aria-haspopup` on the header button) and the **bounded `parseJsonBody` seam** (content-type gate, 32 KB cap, limiter-first on all 9 JSON routes) — which also surfaced and fixed a 27-session-old latent test flaw (all api-boundaries requests shared one IP bucket).

**One finding retracted with discipline:** the drawer's `aref]` "corrupted selector" was a bash display artifact — byte-level verification proved `a[href]` was always correct (the run-78 lesson repeating); the pin stays as a regression guard.

**Final gates:** 634/634 unit (+21) · 82/82 e2e (+3) · clean build · 25/25 dev-server screenshots regenerated · `.env.example` verified against every code-referenced env var · full docs sweep (session_14 log, worklog, REMEDIATION_PLAN Session 79, AGENTS/PAD v2.7/SKILL v2.7.0).

**Suggested next cycle:** the zod 3→4 migration epic (the documented accepted advisory), and re-baselining parity if the reference re-orders its catalog.
