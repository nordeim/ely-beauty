import { db } from "@/lib/db";

/**
 * Parse a numeric setting row (session-12 C3): a missing row (undefined) or a
 * non-finite/garbage/empty value falls back to the documented default — an
 * empty or corrupt setting means "missing", never "zero" (a silent 0% tax or
 * free shipping from a wiped row would corrupt checkout money math). Pure,
 * unit-pinned in tests/unit/session12-hardening.test.ts.
 */
export function settingNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const trimmed = raw.trim();
  if (trimmed === "") return fallback;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Typed view over the StoreSetting key/value table. */
export type StoreSettings = {
  storeName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxRatePercent: number;
  standardShippingCents: number;
  expressShippingCents: number;
  freeShippingThresholdCents: number;
  socialInstagram: string;
  socialPinterest: string;
  socialFacebook: string;
  socialTikTok: string;
  /** ElyBeauty (run-72): the floating WhatsApp chat number (wa.me). */
  whatsappNumber: string;
};

const DEFAULTS: StoreSettings = {
  storeName: "ElyBeauty",
  tagline: "Luxury skincare crafted from nature's finest botanicals. Clean beauty, elevated.",
  contactEmail: "helloelybeauty@gmail.com",
  contactPhone: "01787385459",
  address: "Dhaka, Bangladesh",
  taxRatePercent: 0,
  standardShippingCents: 7000,
  expressShippingCents: 13000,
  freeShippingThresholdCents: 300000,
  socialInstagram: "",
  socialPinterest: "",
  socialFacebook: "https://www.facebook.com/triggersafu",
  socialTikTok: "",
  whatsappNumber: "8801787385459",
};

/** Load all settings with defaults for anything missing. One query. */
export async function getSettings(): Promise<StoreSettings> {
  const rows = await db.storeSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const num = (key: keyof StoreSettings, fallback: number) => settingNumber(map.get(key), fallback);
  const str = (key: keyof StoreSettings, fallback: string) => map.get(key) ?? fallback;
  return {
    storeName: str("storeName", DEFAULTS.storeName),
    tagline: str("tagline", DEFAULTS.tagline),
    contactEmail: str("contactEmail", DEFAULTS.contactEmail),
    contactPhone: str("contactPhone", DEFAULTS.contactPhone),
    address: str("address", DEFAULTS.address),
    taxRatePercent: num("taxRatePercent", DEFAULTS.taxRatePercent),
    standardShippingCents: num("standardShippingCents", DEFAULTS.standardShippingCents),
    expressShippingCents: num("expressShippingCents", DEFAULTS.expressShippingCents),
    freeShippingThresholdCents: num("freeShippingThresholdCents", DEFAULTS.freeShippingThresholdCents),
    socialInstagram: str("socialInstagram", DEFAULTS.socialInstagram),
    socialPinterest: str("socialPinterest", DEFAULTS.socialPinterest),
    socialFacebook: str("socialFacebook", DEFAULTS.socialFacebook),
    socialTikTok: str("socialTikTok", DEFAULTS.socialTikTok),
    whatsappNumber: str("whatsappNumber", DEFAULTS.whatsappNumber),
  };
}

/** Persist a patch of settings (admin) — atomically, so a mid-loop failure never persists a partial patch. */
export async function updateSettings(patch: Partial<Record<keyof StoreSettings, string>>): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  await db.$transaction(
    entries.map(([key, value]) =>
      db.storeSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      }),
    ),
  );
}
