import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { StoreProvider } from "@/components/store/store-provider";
import { siteBaseUrl } from "@/lib/seo";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

// The reference's font pair (verified from its Google Fonts request):
// Cormorant Garamond 300–600 for display, Inter 300–600 for body.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Session-7 S7-4: the base URL is single-sourced from seo.ts so metadataBase
// can never drift from the canonicals/sitemap/robots (one env, one fallback).
const siteUrl = siteBaseUrl();

const SITE_NAME = "ElyBeauty";
const SITE_DESCRIPTION =
  "A high-fashion, editorial e-commerce platform curated for premium skincare, focusing on tactile luxury and a seamless, immersive shopping experience.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    // Self-hosted branded card (session-6 S6-3); metadataBase resolves the
    // root-relative path to an absolute URL for crawlers.
    images: [{ url: "/images/og-default.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/images/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} font-sans`}>
        {/* The Toaster wraps children so every client island can call
            useToast(); the viewport portals toasts above everything. */}
        <StoreProvider>
          <Toaster>{children}</Toaster>
        </StoreProvider>
      </body>
    </html>
  );
}
