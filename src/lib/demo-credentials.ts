/**
 * The seeded demo accounts — the ONE canonical source (S92-2a, audit 92-a
 * HIGH-1). Before this module the same email/password pairs lived in three
 * places (the login page's quick-fill box, `prisma/seed.ts`, and the e2e
 * helpers), which made any future credential change a three-file drift.
 *
 * Server-owned: imported by server components/actions and the seed only —
 * the login page passes these as props to the client island EXCLUSIVELY
 * when `demoModeEnabled()` is true (session-13 S13-1), so a default
 * production build ships none of these strings to the browser. The admin
 * dashboard's default-credential advisory (S92-2e) also reads the admin
 * pair to detect "the seeded admin still authenticates with the documented
 * default password" on a production deploy.
 *
 * The pair is documented in AGENTS.md, README.md, Project_Architecture_
 * Document.md and ely-beauty_SKILL.md (S93-2 fixed the SKILL's pre-rename
 * drift; S94-6 corrected this inventory — .env.example deliberately does
 * NOT document the pair) — changing it here means changing those four too
 * (and re-seeding). Consumers: the
 * login quick-fill, the seed, the e2e helpers, the advisory detector, and
 * scripts/capture-screenshots.ts (S93-2 — the last hardcoded copy retired;
 * S94-1 added the e2e bundle guard to that list).
 */
export const DEMO_CUSTOMER_EMAIL = "demo@elybeauty.com";
export const DEMO_CUSTOMER_PASSWORD = "Demo1234!";
export const DEMO_ADMIN_EMAIL = "admin@elybeauty.com";
export const DEMO_ADMIN_PASSWORD = "Admin123!";
