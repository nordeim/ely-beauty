// S87-2 — the build-config fallback registry (run-87).
//
// docs/build_error.txt: the operator's checkout lost tsconfig.json and
// postcss.config.mjs — the only build-critical root configs untouched since
// the 2026-10-12 initial migration — and `npm run build` died with 312
// module-not-found errors (311 `@/` aliases + tw-animate-css) plus 15
// @apply/@utility warnings (no postcss config → no @tailwindcss/postcss →
// the CSS pipeline fell to raw PostCSS). This module restores any of the
// five long-untouched configs that such a checkout loses.
//
// Contract: write-if-missing-or-EMPTY only — existing content is never
// overwritten. Maintenance rule: when editing any registered file, update
// its CONFIG_FALLBACKS copy in the same change (the
// tests/unit/build-config-resilience.test.ts drift alarm fails otherwise).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..");

export const CONFIG_FALLBACKS = {
  "tsconfig.json": `// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
// missing or empty (the gated npm scripts run that bootstrap first; keep the
// CONFIG_FALLBACKS registry in sync — pinned by build-config-resilience.test.ts).
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "skills",
    "docs",
    "tests",
    "playwright.config.ts"
  ]
}
`,
  "postcss.config.mjs": `// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
// missing or empty (the gated npm scripts run that bootstrap first; keep the
// CONFIG_FALLBACKS registry in sync — pinned by build-config-resilience.test.ts).
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
`,
  "vitest.config.ts": `// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
// missing or empty (the gated npm scripts run that bootstrap first; keep the
// CONFIG_FALLBACKS registry in sync — pinned by build-config-resilience.test.ts).
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    setupFiles: ["tests/unit/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
`,
  "tsconfig.tests.json": `// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
// missing or empty (the gated npm scripts run that bootstrap first; keep the
// CONFIG_FALLBACKS registry in sync — pinned by build-config-resilience.test.ts).
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["node", "vitest/globals"]
  },
  "include": [
    "tests/**/*.ts",
    "tests/**/*.tsx",
    "prisma/**/*.ts",
    "playwright.config.ts",
    "vitest.config.ts",
    "scripts/**/*.ts",
    "scripts/**/*.mjs"
  ],
  "exclude": ["node_modules", "skills", "docs", ".next"]
}
`,
  "eslint.config.mjs": `// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
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
`,
};

/** The registered configs that are missing or empty under targetDir (sorted). */
export function missingConfigFiles(targetDir = repoRoot) {
  return Object.keys(CONFIG_FALLBACKS)
    .filter((name) => {
      const file = path.join(targetDir, name);
      if (!existsSync(file)) return true;
      return readFileSync(file, "utf8").trim().length === 0;
    })
    .sort();
}

/**
 * Restores every missing/empty registered config under targetDir; existing
 * non-empty files are never touched. Returns the names written.
 */
export function ensureAll(targetDir = repoRoot, log = console.log) {
  const written = [];
  for (const name of missingConfigFiles(targetDir)) {
    writeFileSync(path.join(targetDir, name), CONFIG_FALLBACKS[name]);
    written.push(name);
    log(`[ensure-build-configs] restored ${name} (was missing or empty)`);
  }
  return written;
}

// CLI entry — the gated npm scripts run this before their real command.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  ensureAll();
}
