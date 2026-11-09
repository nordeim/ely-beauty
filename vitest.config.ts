// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
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
