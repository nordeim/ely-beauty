import type { MetadataRoute } from "next";

/** PWA/web-app manifest — name, palette and icon surface for installed contexts. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ElyBeauty",
    short_name: "ElyBeauty",
    description: "A high-fashion, editorial e-commerce platform curated for premium skincare.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f7f6",
    theme_color: "#897a6c",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
