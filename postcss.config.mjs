// S87-2 canonical config — restored by scripts/ensure-build-configs.mjs when
// missing or empty (the gated npm scripts run that bootstrap first; keep the
// CONFIG_FALLBACKS registry in sync — pinned by build-config-resilience.test.ts).
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
