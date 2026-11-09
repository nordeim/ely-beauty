import type { Metadata } from "next";

import { demoModeEnabled } from "@/lib/demo-mode";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_CUSTOMER_EMAIL,
  DEMO_CUSTOMER_PASSWORD,
} from "@/lib/demo-credentials";
import { getSettings } from "@/lib/settings";

import { LoginForm, type DemoAccount } from "./login-form";

export const dynamic = "force-dynamic"; // per-request CSP nonce — see (auth)/layout.tsx

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Log in to your ElyBeauty account to track orders, manage addresses, and keep your wishlist in sync.",
  // Session-8 S8-9: utility pages — keep them out of the index.
  robots: { index: false, follow: true },
};

/**
 * Demo quick-fill is an evaluation affordance for development builds.
 * Session-12 S12-2: OFF by default in production (the box names the seeded
 * ADMIN credentials), opt-in with NEXT_PUBLIC_DEMO_MODE="true". Session-13
 * S13-1: the flag is computed HERE, server-side, and the credentials are
 * passed as props ONLY when enabled — production builds (flag unset) ship
 * no credential strings in the client bundle at all. See .env.example and
 * docs/DEPLOYMENT.md.
 */
const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    label: "Customer demo",
    email: DEMO_CUSTOMER_EMAIL,
    password: DEMO_CUSTOMER_PASSWORD,
  },
  {
    label: "Admin demo",
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
  },
];

export default async function LoginPage() {
  // Session-11 S11-5: the "Forgot password?" mailto follows the admin-editable
  // settings.contactEmail (the S7-5 sweep's last hardcoded shadow).
  const settings = await getSettings().catch(() => null);
  const showDemoBox = demoModeEnabled({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  });
  return (
    <LoginForm
      contactEmail={settings?.contactEmail ?? "helloelybeauty@gmail.com"}
      demoAccounts={showDemoBox ? DEMO_ACCOUNTS : undefined}
    />
  );
}
