import Link from "next/link";
import { Facebook } from "lucide-react";

import { WhatsAppFloat } from "./whatsapp-float";

// The reference's footer link map (verified live). COMPANY links all route
// to /about; SHOP links filter the /shop grid.
const SHOP_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/shop?category=beauty-tools", label: "Beauty Tools" },
  { href: "/shop?category=brush-combs", label: "Brush & Combs" },
  { href: "/shop?category=gift-sets", label: "Gift Sets" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "Our Story" },
  { href: "/about#ingredients", label: "Ingredients" },
  { href: "/about#sustainability", label: "Sustainability" },
];

/**
 * splitWordmark — the bicolor wordmark's head/tail split (S75-14, N-3).
 * The reference brands "Ely" gold + "Beauty" rose; the split falls at the
 * first word boundary (a space, or the second camelCase hump) so a renamed
 * store still breaks at a sensible seam instead of an arbitrary character
 * index. Single-word, single-case names stay monochrome-safe (the tail is
 * empty → one span renders nothing).
 */
export function splitWordmark(name: string): { head: string; tail: string } {
  const trimmed = name.trim();
  const spaceAt = trimmed.indexOf(" ");
  if (spaceAt > 0) {
    return { head: trimmed.slice(0, spaceAt), tail: trimmed.slice(spaceAt + 1) };
  }
  const camelAt = trimmed.slice(1).search(/[A-Z]/);
  if (camelAt > 0) {
    return { head: trimmed.slice(0, camelAt + 1), tail: trimmed.slice(camelAt + 1) };
  }
  return { head: trimmed, tail: "" };
}

export function Footer({
  settings,
}: {
  settings: {
    storeName: string;
    tagline: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialFacebook?: string;
    socialInstagram?: string;
    socialPinterest?: string;
    socialTikTok?: string;
    whatsappNumber?: string;
  };
}) {
  return (
    <>
      <footer className="border-t border-border bg-background">
        {/* S75-9 (D-10, measured): the reference's footer vertical rhythm —
            py-16 lg:py-24 (was py-14). */}
        <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-24">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl font-medium tracking-tight">
              {/* S75-14 (N-3): the bicolor split falls at the FIRST WORD
                  BOUNDARY (camelCase or space) — the literal slice(0, 3)
                  split was correct only for "ElyBeauty" and rendered an
                  arbitrary color break on any renamed store. */}
              <span className="text-[#c99a3a]">{splitWordmark(settings.storeName).head}</span>
              <span className="text-[#d95577]">{splitWordmark(settings.storeName).tail}</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">{settings.tagline}</p>
            <SocialLinks settings={settings} />
          </div>
          {/* SHOP */}
          <nav aria-labelledby="footer-shop">
            <h4 id="footer-shop" className="eyebrow-label mb-4 text-foreground">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* COMPANY */}
          <nav aria-labelledby="footer-company">
            <h4 id="footer-company" className="eyebrow-label mb-4 text-foreground">
              Company
            </h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* SUPPORT */}
          <div>
            <h4 className="eyebrow-label mb-4 text-foreground">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/account" className="transition-colors hover:text-foreground">
                  My Account
                </Link>
              </li>
              <li>
                {/* S74-2: the wishlist entry — the mobile panel link retired
                    for reference parity, so the footer carries it (every
                    viewport, below the fold, the standard superset spot). */}
                <Link href="/wishlist" className="transition-colors hover:text-foreground">
                  Wishlist
                </Link>
              </li>
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="break-all transition-colors hover:text-foreground">
                  {settings.contactEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${settings.contactPhone}`} className="transition-colors hover:text-foreground">
                  {settings.contactPhone}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-sm text-muted-foreground sm:flex-row">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/legal/privacy-policy" className="transition-colors hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/legal/terms-of-service" className="transition-colors hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppFloat whatsappNumber={settings.whatsappNumber} />
    </>
  );
}

/** Circular outlined social icons (settings-driven; the reference ships
 *  Facebook + WhatsApp). */
function SocialLinks({
  settings,
}: {
  settings: {
    storeName?: string;
    socialFacebook?: string;
    socialInstagram?: string;
    socialPinterest?: string;
    socialTikTok?: string;
    whatsappNumber?: string;
  };
}) {
  const socials: { label: string; href: string; icon: React.ReactNode }[] = [];
  if (settings.socialFacebook) {
    socials.push({ label: "Facebook", href: settings.socialFacebook, icon: <Facebook className="h-4 w-4" aria-hidden /> });
  }
  if (settings.whatsappNumber) {
    const digits = settings.whatsappNumber.replace(/[^\d]/g, "");
    if (digits) {
      socials.push({
        label: "WhatsApp",
        href: `https://wa.me/${digits}`,
        icon: (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
          </svg>
        ),
      });
    }
  }

  if (socials.length === 0) return null;

  return (
    <ul className="mt-6 flex items-center gap-3" aria-label="Social media">
      {socials.map(({ label, href, icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${settings.storeName ?? "ElyBeauty"} on ${label}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {icon}
            <span className="sr-only">{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
