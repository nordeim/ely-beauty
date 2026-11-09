// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
// missing or empty (the gated npm scripts run that bootstrap first; keep the
// CONFIG_FALLBACKS registry in sync — pinned by build-config-resilience.test.ts).
import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "eslint-config-next";

const nextConfig = Array.isArray(nextPlugin) ? nextPlugin : [nextPlugin];

export default defineConfig([
  ...nextConfig,
  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "skills/**",
    "docs/**",
    "prisma/seed.ts",
  ]),
]);
