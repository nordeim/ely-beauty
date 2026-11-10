/**
 * Seed — idempotent (upserts by natural keys). Seeds:
 *  - 4 categories matching the ElyBeauty reference storefront
 *  - the reference catalog (19 products, BDT cents, variants, full copy)
 *  - 1 hero slide (the reference's single-image hero)
 *  - coupons, store settings, demo accounts (admin + customer)
 *  - a starter review per product (superset review surface)
 *
 * Run: npm run db:seed   (tsx prisma/seed.ts)
 *
 * Catalog source: the live reference's public entity API (fetched 2026-11-08,
 * research/live/products.json). Product imagery is independently generated
 * (see docs/implementation-plan.md deviations ledger).
 */
import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import { scryptHash } from "../src/lib/password";
import { resolveProcessDatabaseUrl } from "../src/lib/db-path";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_CUSTOMER_EMAIL,
  DEMO_CUSTOMER_PASSWORD,
} from "../src/lib/demo-credentials";
import { couponSeedCreatedAt, productSeedCreatedAt, productSeedUpdate } from "../src/lib/seed-policy";

// S77-6 (audit F7): the seed routes through the db-path seam — the SAME
// schema-anchored resolution the app runtime uses (src/lib/db-path.ts) — so
// a relative DATABASE_URL in .env resolves identically for db:seed,
// db:push and the running server, regardless of the shell's exported env.
// A bare client constructor (the pre-S77 shape) followed whatever
// DATABASE_URL the shell carried — the root cause of the recurring "rows
// survive fresh reseeds" convergence rituals (see AGENTS.md's db-path
// contract).
const prisma = new PrismaClient({ datasourceUrl: resolveProcessDatabaseUrl() });

type Spec = { label: string; value: string };
type ColorOption = { name: string; hex: string };

type SeedProduct = {
  slug: string;
  name: string;
  // S81-1: the reference's two parallel category systems, captured from its
  // entity API (2026-11-09):
  //  - categories: DISPLAY-category slugs (many-to-many; six reference
  //    products belong to none, the cleansing brush to two);
  //  - templateCategory: the template `category` string (skincare |
  //    lip_care | body_care) — the detail eyebrow, the nav/footer slug
  //    filters, and the shop's template filter mode.
  categories: string[];
  templateCategory: "skincare" | "lip_care" | "body_care";
  price: number; // cents (৳1 = 100)
  compareAtPrice?: number;
  sku: string;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  specs: Spec[];
  colors?: ColorOption[];
  sizes?: string[];
  shortDescription: string;
  description: string;
  howToUse?: string;
  ingredients?: string;
  // S76-8: null is an explicit no-badge (the bonnet's reference-true
  // state) — distinct from undefined's "keep the default" semantics.
  badge?: string | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
};

// The reference's four categories (display names + tile captions + imagery
// as observed live). Slugs use clean kebab-case. S81-3/S82-2: the reference's
// nav AND footer deliberately link the TEMPLATE-remnant filters — Beauty
// Tools → ?category=skincare, Brush & Combs → ?category=body_care, Gift
// Sets → ?category=sets (measured live; the clone replicates them
// as-observed, and the dual-mode /shop filter resolves them).
const CATEGORIES = [
  {
    slug: "beauty-tools",
    name: "Beauty Tools",
    description: "Serums, creams & treatments",
    imageUrl: "/images/category-beauty-tools.png",
    icon: "sparkles",
    iconGradient: "from-stone-400 to-stone-600",
    sortOrder: 1,
  },
  {
    slug: "brush-combs",
    name: "Brush & Combs",
    description: "Oils, lotions & rituals",
    imageUrl: "/images/category-brush-combs.png",
    icon: "brush",
    iconGradient: "from-amber-400 to-stone-500",
    sortOrder: 2,
  },
  {
    slug: "bestsellers",
    name: "Bestsellers",
    description: "The most-loved pieces of the collection",
    imageUrl: "/images/category-bestsellers.png",
    icon: "heart",
    iconGradient: "from-rose-400 to-rose-600",
    sortOrder: 3,
  },
  {
    slug: "gift-sets",
    name: "Gift Sets",
    description: "Curated gift collections",
    imageUrl: "/images/category-gift-sets.png",
    icon: "gift",
    iconGradient: "from-stone-400 to-amber-600",
    sortOrder: 4,
  },
];

export const PRODUCTS: SeedProduct[] = [
  // ---- The reference catalog, in the reference's "Newest" order ----
  {
    slug: "premium-double-sided-ruffles-silk-hair-bonnet",
    name: "Premium Double Sided Ruffles Silk Hair Bonnet",
    categories: ["bestsellers"],
    templateCategory: "skincare",
    price: 37000,
    sku: "ELY-001",
    stock: 25, // S90-4 restocked — the reference restocked since run-72
    rating: 4.8,
    reviewCount: 24,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-silk-bonnet.png", "/images/product-silk-bonnet-2.png", "/images/product-silk-bonnet-3.png"],
    tags: ["bastseller"],
    specs: [
      { label: "Material", value: "100% mulberry silk" },
      { label: "Sides", value: "Double-sided" },
    ],
    sizes: ["Pink & Lovender", "Marron & Navy Blue", "Black & White"],
    // S76-8 (D-11): the reference renders NO card description on this
    // product (measured live 2026-11-08) — empty copy, no card line.
    shortDescription: "",
    description: "Protect your hair day and night with our luxuriously soft, double-sided satin silk bonnet. Designed to reduce frizz, prevent breakage, and lock in moisture, it keeps your hairstyle smooth and healthy while you sleep. Lightweight, breathable, and gentle on all hair types—for effortless beauty every morning. ✨",
    // S76-8 (D-10): the live reference renders NO badge on the bonnet
    // card (measured 2026-11-08) — badge data parity.
    badge: null,
    isFeatured: true,
    isNewArrival: true,
  },
  {
    slug: "pure-satin-silk-pillowcase",
    name: "Pure Satin Silk Pillowcase – For Hair & Skin",
    categories: ["bestsellers"],
    templateCategory: "lip_care",
    price: 28800,
    compareAtPrice: 35000,
    sku: "ELY-002",
    stock: 19,
    rating: 4.9,
    reviewCount: 87,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-satin-pillowcase.png", "/images/product-satin-pillowcase-2.png", "/images/product-satin-pillowcase-3.png"],
    tags: ["sale", "bestseller"],
    specs: [
      { label: "Material", value: "Premium satin silk" },
      { label: "Sizes", value: "Standard" },
    ],
    colors: [
      { name: "Pink", hex: "#cb9d9d" },
      { name: "Navy Blue", hex: "#28335b" },
      { name: "Sky Blue", hex: "#8aaccc" },
      { name: "Black", hex: "#080906" },
    ],
    shortDescription: "Sleep in smooth comfort with our premium satin silk pillowcase. Designed to protect your hair and skin, it’s the perfect beauty sleep essential for waking up fresh, frizz-free, and glowing.",
    description: "Sleep in smooth comfort with our premium satin silk pillowcase. Designed to protect your hair and skin, it’s the perfect beauty sleep essential for waking up fresh, frizz-free, and glowing.\n\nReduces Hair Frizz & Breakage – Minimizes friction to keep hair smooth and tangle-free.\nPrevents Sleep Lines & Wrinkles – Gentle on skin, reducing creases and signs of aging.\nRetains Skin & Hair Moisture – Unlike cotton, satin won’t absorb natural oils.\nHypoallergenic & Gentle – Ideal for sensitive skin and allergy-prone users.\nCool & Comfortable – Breathable fabric keeps you cool all night.\nDescription",
    badge: "Bestseller",
    isFeatured: true,
    isNewArrival: true,
  },
  {
    slug: "heatless-hair-curler-set",
    name: "Heatless Hair Curler Set",
    categories: ["bestsellers"],
    templateCategory: "lip_care",
    price: 34000,
    sku: "ELY-003",
    stock: 30, // S90-4 restocked — the reference restocked since run-72
    rating: 4.7,
    reviewCount: 53,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-heatless-curler.png", "/images/product-heatless-curler-2.png", "/images/product-heatless-curler-3.png"],
    tags: ["bestseller"],
    specs: [
      { label: "Includes", value: "Curling rod + 2 scrunchies" },
      { label: "Method", value: "Heatless" },
    ],
    colors: [
      { name: "Black", hex: "#080906" },
      { name: "Navy blue", hex: "#28335b" },
    ],
    shortDescription: "Get beautiful curls without heat damage. Our Heatless Hair Curling Set creates soft, long-lasting curls, reduces frizz, and keeps hair smooth & healthy.",
    description: "",
    badge: "Bestseller",
    isFeatured: true,
    isNewArrival: true,
  },
  {
    slug: "natural-bamboo-hair-brush-square",
    name: "Natural Bamboo Hair Brush - Square",
    categories: [],
    templateCategory: "body_care",
    price: 47000,
    sku: "ELY-004",
    stock: 16,
    rating: 4.6,
    reviewCount: 31,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-bamboo-brush-square.png", "/images/product-bamboo-brush-square-2.png", "/images/product-bamboo-brush-square-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "Natural bamboo" },
      { label: "Shape", value: "Square" },
    ],
    // S76-8 (D-11): the reference renders NO card description on this
    // product (measured live 2026-11-08) — empty copy, no card line.
    shortDescription: "",
    description: "Promote healthier hair with our Bamboo Wood Anti Hair Loss Hairbrush. Designed to gently massage the scalp, this eco-friendly brush helps reduce hair fall, stimulate growth, and improve circulation. Perfect for all hair types, it’s a sustainable choice for those looking to maintain thick, strong, and nourished hair.",
    isFeatured: true,
    isNewArrival: true,
  },
  {
    slug: "sandalwood-paddle-hairbrush-oval",
    name: "Sandalwood Paddle Hairbrush – Oval",
    categories: [],
    templateCategory: "body_care",
    price: 47000,
    sku: "ELY-005",
    stock: 21,
    rating: 4.8,
    reviewCount: 44,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-sandalwood-paddle.png", "/images/product-sandalwood-paddle-2.png", "/images/product-sandalwood-paddle-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "100% natural sandalwood" },
      { label: "Shape", value: "Oval paddle" },
    ],
    shortDescription: "This natural wooden comb gently glides through your hair to detangle, smooth, and reduce frizz. Its anti-static properties help maintain shine while preventing breakage and split ends — the perfect daily essential for healthy, beautiful hair.\n\nBenefits -\nReduces hair breakage and split ends\nPrevents static & frizz naturally\nImproves scalp blood circulation\nLeaves hair silky, shiny & manageable\nShipping & Delivery",
    description: "Features -\nMade from Sandalwood\nAnti-static & Eco-friendly natural material\nSmooth rounded teeth for gentle detangling\nLightweight & durable handcrafted design\nSuitable for all hair types, men and women\n",
    isFeatured: true,
    isNewArrival: true,
  },
  {
    slug: "sandalwood-hairbrush-oval",
    name: "Sandalwood Hairbrush - Oval",
    categories: ["brush-combs"],
    templateCategory: "body_care",
    price: 54000,
    sku: "ELY-006",
    stock: 39,
    rating: 4.9,
    reviewCount: 61,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-sandalwood-oval.png", "/images/product-sandalwood-oval-2.png", "/images/product-sandalwood-oval-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "100% natural sandalwood" },
      { label: "Shape", value: "Oval" },
    ],
    shortDescription: "Experience effortless detangling with our Premium Sandalwood Detangling Hairbrush – Oval Style. Crafted from 100% natural sandalwood, this elegant brush gently glides through your hair, reducing breakage, frizz, and static while adding a natural shine and soothing aroma.",
    description: "Features\n100% Natural Sandalwood Handle & Bristles\nOval Style design for easy grip and smooth brushing\nAnti-static & Eco-friendly finish\nDurable & Long-lasting handcrafted body\nSuitable for all hair types – wet or dry\nBenefits\nGently detangles without pulling or breakage\nHelps reduce frizz and static naturally\nPromotes scalp stimulation & healthy hair growth\nLeaves hair smooth, shiny, and manageable",
    isNewArrival: true,
  },
  {
    slug: "natural-bamboo-hair-brush-oval",
    name: "Natural Bamboo Hair Brush - Oval",
    categories: [],
    templateCategory: "body_care",
    price: 45000,
    sku: "ELY-007",
    stock: 11,
    rating: 4.5,
    reviewCount: 18,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-bamboo-brush-oval.png", "/images/product-bamboo-brush-oval-2.png", "/images/product-bamboo-brush-oval-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "Natural bamboo" },
      { label: "Shape", value: "Oval" },
    ],
    // S76-8 (D-11): the reference renders NO card description on this
    // product (measured live 2026-11-08) — empty copy, no card line.
    shortDescription: "",
    description: "",
  },
  {
    slug: "stainless-steel-gua-sha",
    name: "Stainless Steel Gua Sha",
    categories: ["beauty-tools"],
    templateCategory: "skincare",
    price: 66500,
    sku: "ELY-008",
    stock: 121,
    rating: 4.8,
    reviewCount: 72,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-gua-sha.png", "/images/product-gua-sha-2.png", "/images/product-gua-sha-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "Stainless steel" },
      { label: "Finish", value: "Polished mirror" },
    ],
    shortDescription: "Elevate your skincare routine with this cooling stainless steel gua sha. ✨ Glide it over your favorite serum or moisturizer to help relax facial tension, reduce puffiness, and boost your natural glow. 💆♀️",
    description: "",
    isFeatured: true,
  },
  {
    slug: "exfoliating-body-gloves",
    name: "Exfoliating Body Gloves | 100% Natural Viscose Fiber",
    categories: ["brush-combs"],
    templateCategory: "skincare",
    price: 34000,
    sku: "ELY-009",
    stock: 49,
    rating: 4.7,
    reviewCount: 39,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-exfoliating-gloves.png", "/images/product-exfoliating-gloves-2.png", "/images/product-exfoliating-gloves-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "100% natural viscose" },
      { label: "Set", value: "1 pair" },
    ],
    sizes: ["Pink", "Sky Blue", "Black"],
    shortDescription: "Experience spa-like exfoliation at home with our 100% Natural Viscose Exfoliating Gloves. Designed to gently remove dead skin cells, unclog pores, and reveal softer, smoother, and brighter skin after every use.",
    description: "Benefits:\n\nDeeply exfoliates to remove dead skin buildup\nHelps reduce ingrown hairs & improve skin texture\nBoosts circulation for naturally glowing skin\nEnhances absorption of body lotions & oils\nReusable, eco-friendly & suitable for all skin types\nProduct Details:\n\nMade from 100% natural viscose plant fiber\nUse 1–2 times a week on damp skin\nCompatible with soap or body wash\nSize: One size fits all\nWashable & long-lasting",
  },
  {
    slug: "facial-threading-tool",
    name: "Facial Threading Tool",
    categories: ["beauty-tools"],
    templateCategory: "skincare",
    price: 44000,
    sku: "ELY-010",
    stock: 24,
    rating: 4.4,
    reviewCount: 12,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-threading-tool.png", "/images/product-threading-tool-2.png", "/images/product-threading-tool-3.png"],
    tags: [],
    specs: [
      { label: "Type", value: "Spring coil" },
      { label: "Use", value: "Facial hair removal" },
    ],
    // S76-8 (D-11): the reference renders NO card description on this
    // product (measured live 2026-11-08) — empty copy, no card line.
    shortDescription: "",
    description: "Achieve smooth, salon-like facial hair removal at home with the FEYORA Precision Facial Threading Tool. Designed for easy and gentle threading, it helps remove unwanted hair from the upper lip, chin, cheeks, and forehead without harsh chemicals or irritation. Lightweight, reusable, and beginner-friendly — perfect for quick touch-ups anytime.\n\n",
  },
  {
    slug: "moisturizing-spa-socks",
    name: "Moisturizing Spa Socks",
    categories: [],
    templateCategory: "skincare",
    price: 54000,
    sku: "ELY-011",
    stock: 20, // S90-4 restocked — the reference restocked since run-72
    rating: 4.6,
    reviewCount: 21,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-spa-socks.png", "/images/product-spa-socks-2.png", "/images/product-spa-socks-3.png"],
    tags: [],
    specs: [
      { label: "Type", value: "Gel-lined spa socks" },
      { label: "Care", value: "Hand wash" },
    ],
    sizes: ["Pink", "Black"],
    // S76-8 (D-11): the reference renders NO card description on this
    // product (measured live 2026-11-08) — empty copy, no card line.
    shortDescription: "",
    description: "Say goodbye to dry, rough feet\nInfused with soft gel lining tHelps lock in moisture and repair cracked, dry heels for softer, smoother feet 💖\n\nHow to care:\n• Hand wash with cold water & mild soap\n• Lay flat to dry after use",
  },
  {
    slug: "crystal-hair-remover",
    name: "Crystal Hair Remover",
    categories: [],
    templateCategory: "skincare",
    price: 52000,
    sku: "ELY-012",
    stock: 30,
    rating: 4.5,
    reviewCount: 28,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-crystal-hair-remover.png", "/images/product-crystal-hair-remover-2.png", "/images/product-crystal-hair-remover-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "Crystal glass" },
      { label: "Reusability", value: "Eco-friendly, reusable" },
    ],
    shortDescription: "Say goodbye to razors and painful waxing! Our Crystal Hair Remover gently buffs away unwanted hair and dead skin cells, leaving your skin silky-smooth and glowing. Easy to use, eco-friendly, and reusable — it's perfect for legs, arms, and sensitive areas. Just rub in circular motions and reveal softer skin instantly!",
    description: "Product Info - ✨\nNano Crystalline Technology\nGently Remove Hair Painless\nReusable And Washable\nSlowing Hair Growth\nEasy to carry",
  },
  {
    slug: "full-silicon-scalp-massager",
    name: "Full silicon scalp massager", // S74-13: the reference authored it lowercase (live-measured 2026-11-08)
    categories: [],
    templateCategory: "skincare",
    price: 48000,
    sku: "ELY-013",
    stock: 19,
    rating: 4.7,
    reviewCount: 33,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-scalp-massager.png", "/images/product-scalp-massager-2.png", "/images/product-scalp-massager-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "Food-grade silicone" },
      { label: "Bristles", value: "Soft flexible tips" },
    ],
    colors: [
      { name: "Pink", hex: "#CB9D9D" },
      { name: "Black", hex: "#080906" },
      { name: "Biege", hex: "#E5C38F" },
    ],
    sizes: ["Pink", "Black", "Biege"],
    // S76-8 (D-11): the reference renders NO card description on this
    // product (measured live 2026-11-08) — empty copy, no card line.
    shortDescription: "",
    description: "Elevate your haircare ritual with Silkfare’s Sweet Repair Scalp Massager.\n\nThoughtfully designed to exfoliate buildup and invigorate your scalp, this soft-touch massager transforms your shower into a spa-like escape. With its full solid one piece design and gentle bristles, it's your perfect partner for healthier, more vibrant hair — one soothing massage at a time.",
  },
  {
    slug: "derma-roller-titanium",
    name: "Derma Roller - Titanium",
    categories: ["beauty-tools"],
    templateCategory: "skincare",
    price: 48800,
    sku: "ELY-014",
    stock: 15,
    rating: 4.8,
    reviewCount: 57,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-derma-roller.png", "/images/product-derma-roller-2.png", "/images/product-derma-roller-3.png"],
    tags: [],
    specs: [
      { label: "Needles", value: "Titanium micro-needles" },
      { label: "Sizes", value: "0.5mm / 1.0mm" },
    ],
    sizes: ["0.5mm", "1.0mm"],
    shortDescription: "Transform your skincare routine with the Derma Roller! Featuring fine, ultra-precise needles, this tool gently stimulates collagen production, reduces fine lines, minimizes pores, and promotes smoother, firmer skin. Perfect for enhancing absorption of your favorite serums and creams, it’s your go-to for a glowing, rejuvenated complexion. Safe, easy to use, and ideal for all skin types—unlock radiant skin with every roll!",
    description: "Benefits: \n\nBoosts Collagen Production – Firms and plumps the skin for a youthful glow.\nReduces Acne Scars & Dark Spots – Fades blemishes, hyperpigmentation, and sun damage.\nEnhances Skincare Absorption – Helps serums and moisturizers penetrate deeper.\nMinimizes Fine Lines & Wrinkles – Smooths out aging signs for a fresher look.\nShrinks Large Pores – Tightens skin and improves texture.\nPromotes Hair Growth – Stimulates scalp for thicker, healthier hair.\nHow to Use a Derma Roller in 5 Simple Steps\nCleanse your skin thoroughly.\nSanitize the derma roller.\nRoll gently in vertical, horizontal, and diagonal directions.\nApply a serum or moisturizer.\nClean and store the derma roller.\nSize Guidelines :\n0.5 mm - For Hair\n1.0 mm -  For Skin",
  },
  {
    slug: "derma-stamp-titanium",
    name: "Derma Stamp - Titanium",
    categories: ["beauty-tools"],
    templateCategory: "skincare",
    price: 79000,
    sku: "ELY-015",
    stock: 9,
    rating: 4.9,
    reviewCount: 26,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-derma-stamp.png", "/images/product-derma-stamp-2.png", "/images/product-derma-stamp-3.png"],
    tags: [],
    specs: [
      { label: "Needles", value: "Titanium" },
      { label: "Type", value: "Stamp pen" },
    ],
    shortDescription: "Healthy hair & glowing skin, made simple! 💖",
    description: "Adjustable Derma Stamp – Revive Your Hair & Skin Naturally! ✨\nStruggling with hair thinning or uneven skin? The Adjustable Derma Stamp is your go-to solution! Designed to boost hair growth, smooth out skin texture, and enhance serum absorption, this tool puts professional skincare in your hands. With adjustable needle depth and Titanium micro-needles, it promotes natural healing—without harsh chemicals!\n\n✔️ Stimulates hair follicles for thicker hair\n✔️ Boosts collagen for firmer, youthful skin\n✔️ Improves product absorption for better results\n✔️ Adjustable & easy to use at home",
  },
  {
    slug: "travel-silicone-mask-applicator-set-4-pcs",
    name: "Travel Silicone Mask Applicator Set 4 Pcs",
    categories: ["beauty-tools"],
    templateCategory: "skincare",
    price: 12000,
    sku: "ELY-016",
    stock: 6,
    rating: 4.6,
    reviewCount: 15,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-mask-applicator.png", "/images/product-mask-applicator-2.png", "/images/product-mask-applicator-3.png"],
    tags: [],
    specs: [
      { label: "Set", value: "4 pieces" },
      { label: "Material", value: "Silicone" },
    ],
    shortDescription: "❣️ Travel-friendly ❣️ Hygienic ❣️ Multi-use",
    description: "Upgrade your skincare routine with the Travel Silicone Mask Applicator Set! Designed for mess-free + hygienic application, this set includes three soft, flexible mini silicone spreaders that help evenly apply facial masks, creams, + serums without wasting product or getting your fingers dirty.\n\nPackaged in a convenient storage case, this set is perfect for beauty lovers who want a clean, efficient, + travel-friendly way to apply their favorite skincare products.",
  },
  {
    slug: "wooden-cleansing-brush",
    name: "Wooden cleansing brush",
    categories: ["beauty-tools", "bestsellers"],
    templateCategory: "lip_care",
    price: 44000,
    compareAtPrice: 60000,
    sku: "ELY-017",
    stock: 65,
    rating: 4.7,
    reviewCount: 42,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-cleansing-brush.png", "/images/product-cleansing-brush-2.png", "/images/product-cleansing-brush-3.png"],
    tags: ["sale", "bastseller"],
    specs: [
      { label: "Material", value: "Wood + soft bristles" },
      { label: "Design", value: "Dual-sided" },
    ],
    shortDescription: "Transform your skincare routine with the Wooden cleansing brush, designed to deliver a deeper, more effective cleanse. Its soft bristles and dual-sided design make it ideal for both exfoliation and cleansing, leaving your skin feeling refreshed, smooth, and glowing.",
    description: "Product Details:\n\nPremium Pine Wood Handle\nSoft bristles\nHow to Use:\n\nApply your favorite cleanser to the brush.\nGently massage in circular motions on damp skin.\nRinse with warm water and pat dry.\nUse the silicone side for gentle exfoliation.\nKey Benefits:\n\nDeep cleanses pores, removing dirt, oil, and makeup.\nExfoliates dead skin cells, revealing smoother skin.\nBoosts circulation for a natural, healthy glow.\nHelps skincare products absorb more effectively.\nThis high-quality tool is a game-changer for healthy, radiant skin. Perfect for any skincare routine, it’s your go-to for a refreshed and revitalized complexion.\n\nShipping & Delivery",
    badge: "Sale",
  },
  {
    slug: "anti-cellulite-dry-body-brush",
    name: "Anti-cellulite Dry Body Brush",
    categories: ["brush-combs"],
    templateCategory: "skincare",
    price: 107000,
    compareAtPrice: 119600,
    sku: "ELY-018",
    stock: 11,
    rating: 4.8,
    reviewCount: 35,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-body-brush.png", "/images/product-body-brush-2.png", "/images/product-body-brush-3.png"],
    tags: [],
    specs: [
      { label: "Bristles", value: "Natural" },
      { label: "Ritual", value: "Dry brushing" },
    ],
    shortDescription: "Revive your skin with our detox dry body brush. This ancient ritual stimulates lymphatic flow, boosts circulation, smooths the appearance of cellulite, and reveals softer, radiant skin. ",
    description: "Product Benefits - \n\nPromote circulation \nIncrease energy levels\nGently exfoliate\nActivate lymphatic drainage\nSoften + smooth skin texture\nMaterials - \n\nSisal bristles\nBeech wood\n100% vegan\n100% plastic free\n100% biodegradable",
    badge: "Sale",
  },
  {
    slug: "facial-ice-bowl",
    name: "Facial Ice Bowl – Foldable & Travel-Friendly",
    categories: ["beauty-tools"],
    templateCategory: "skincare",
    price: 104000,
    sku: "ELY-019",
    stock: 15, // S90-4 restocked — the reference restocked since run-72
    rating: 4.7,
    reviewCount: 19,
    // S76-9 (D-12): the 3-image gallery (main + two brand-pipeline
    // variants) — the reference renders multi-image galleries on
    // every product page; the rail renders with 2+ images.
    images: ["/images/product-ice-bowl.png", "/images/product-ice-bowl-2.png", "/images/product-ice-bowl-3.png"],
    tags: [],
    specs: [
      { label: "Material", value: "Food-grade silicone" },
      { label: "Design", value: "Foldable" },
    ],
    shortDescription: "Refresh and elevate your skincare routine with this foldable Face Ice Bath Bowl—perfect for quick, effective cold therapy anytime, anywhere.",
    description: "Refresh and elevate your skincare routine with this foldable Face Ice Bath Bowl—perfect for quick, effective cold therapy anytime, anywhere.",
    ingredients: "✨ Key Features:  Foldable & Portable – Easy to store and travel with Depuffs & Tightens – Refreshes skin and boosts glow Premium Silicone – Durable, safe, and skin-friendly Built-In Ice Use – Just add water + ice, no extras needed Easy to Clean – Smooth, stain-resistant surface 📏 Specifications:  Material: Silicone Size: 26.4 × 23.2 × 10 cm Weight: ~310 g Color: Black 📦 Includes:  1 × Face Ice Bath Bowl",
  },
];

const SLIDES = [
  {
    title: "The Art of Radiance",
    subtitle: "Luxury botanicals. Clinical precision. Your skin, elevated.",
    image: "/images/hero-main.png",
    ctaText: "SHOP THE COLLECTION",
    ctaLink: "/shop",
    sortOrder: 1,
  },
];

const SETTINGS: Record<string, string> = {
  storeName: "ElyBeauty",
  tagline: "Luxury skincare crafted from nature's finest botanicals. Clean beauty, elevated.",
  contactEmail: "helloelybeauty@gmail.com",
  contactPhone: "01787385459",
  address: "Dhaka, Bangladesh",
  taxRatePercent: "0",
  // ElyBeauty shipping tiers (verified live): Dhaka ৳70 / outside Dhaka ৳130.
  // The checkout derives the tier from the City/District field.
  standardShippingCents: "7000",
  expressShippingCents: "13000",
  freeShippingThresholdCents: "300000",
  whatsappNumber: "8801787385459",
  socialFacebook: "https://www.facebook.com/triggersafu",
};

// S51-1: the array is authored in the ADMIN DISPLAY order (FREESHIP →
// SAVE20 → WELCOME10 — the card order the /admin/coupons grid has shipped
// since session-19); couponSeedCreatedAt makes the first-listed row the
// newest so the page's `orderBy: { createdAt: "desc" }` renders exactly
// this order deterministically (the seed loop's ~1ms insert spacing could
// tie two rows at SQLite's ms precision and flip the grid run-to-run).
export const COUPONS = [
  // Session-20 S20-6: a first-class free_shipping coupon — zeroes shipping
  // outright. (Fresh databases get this row; an EXISTING database keeps its
  // earlier fixed-type FREESHIP — the seed is create-only, both work.)
  { code: "FREESHIP", type: "free_shipping", value: 0, description: "Free shipping on orders over ৳3,000", minSubtotal: 300000, expiresAt: null, maxRedemptions: null },
  { code: "SAVE20", type: "percent", value: 20, description: "20% off orders over ৳1,000", minSubtotal: 100000, expiresAt: null, maxRedemptions: 500 },
  // Lifecycle fields (expiresAt / maxRedemptions) are enforced by
  // isCouponRedeemable at coupon-lookup and inside the checkout transaction.
  { code: "WELCOME10", type: "percent", value: 10, description: "10% off your first order", minSubtotal: 0, expiresAt: null, maxRedemptions: null },
];

const REVIEW_TEMPLATES = [
  { title: "Exceeded expectations", comment: "Beautifully made and clearly built to last. It has already become part of my daily ritual — I could not be happier with this purchase." },
  { title: "Wonderful quality", comment: "The finish is gorgeous and it feels great to use. Arrived quickly and packaged with real care. Would happily buy again as a gift." },
  { title: "Worth every penny", comment: "I compared several options before choosing this one and I am glad I did. The quality difference is obvious the moment you hold it." },
  { title: "My favorite find", comment: "I use this constantly and it still looks brand new. Friends keep asking where I got it — highly recommend to anyone building their routine." },
];

async function main() {
  console.log("Seeding ElyBeauty…");

  // ---- Users ----
  const admin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: {},
    create: {
      email: DEMO_ADMIN_EMAIL,
      name: "Store Admin",
      phone: "01787385459",
      role: "admin",
      passwordHash: scryptHash(DEMO_ADMIN_PASSWORD),
    },
  });
  const demo = await prisma.user.upsert({
    where: { email: DEMO_CUSTOMER_EMAIL },
    update: {},
    create: {
      email: DEMO_CUSTOMER_EMAIL,
      name: "Ayesha Rahman",
      phone: "01787385459",
      role: "customer",
      passwordHash: scryptHash(DEMO_CUSTOMER_PASSWORD),
    },
  });
  await prisma.address.upsert({
    where: { id: "seed-demo-address" },
    update: {},
    create: {
      id: "seed-demo-address",
      userId: demo.id,
      label: "Home",
      fullName: "Ayesha Rahman",
      phone: "01787385459",
      line1: "House 12, Road 5, Dhanmondi",
      city: "Dhaka",
      state: "Dhaka",
      postalCode: "1205",
      country: "Bangladesh",
      isDefault: true,
    },
  });
  console.log(`Users: admin=${admin.id} demo=${demo.id}`);

  // ---- Categories ----
  const categoryIds = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        icon: cat.icon,
        iconGradient: cat.iconGradient,
        sortOrder: cat.sortOrder,
      },
      create: cat,
    });
    categoryIds.set(cat.slug, row.id);
  }
  console.log(`Categories: ${categoryIds.size}`);

  // ---- Products ----
  let createdProducts = 0;
  // Session-12 S12-5 (ElyBeauty re-aligned run-72): create rows with
  // BACKDATED timestamps (productSeedCreatedAt) so the seed-list order =
  // the reference's authored order = the `createdAt: desc` consumers'
  // newest-first order (/shop "Newest" and the home "Curated for You"
  // grid). Create-only: reseeds never rewrite the createdAt of existing
  // rows — re-ordering requires a fresh DB.
  for (const [index, p] of PRODUCTS.entries()) {
    // S81-1: resolve every display-category membership (unknown slugs are
    // a seed bug, not a silent skip).
    for (const slug of p.categories) {
      if (!categoryIds.get(slug)) throw new Error(`Unknown category ${slug} for ${p.slug}`);
    }
    const membershipIds = p.categories.map((slug) => categoryIds.get(slug) as string);
    const data = {
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.description,
      templateCategory: p.templateCategory,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      sku: p.sku,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      images: JSON.stringify(p.images),
      tags: JSON.stringify(p.tags),
      specs: JSON.stringify(p.specs),
      colors: JSON.stringify(p.colors ?? []),
      sizes: JSON.stringify(p.sizes ?? []),
      howToUse: p.howToUse ?? "",
      ingredients: p.ingredients ?? "",
      badge: p.badge ?? null,
      isFeatured: p.isFeatured ?? false,
      isNewArrival: p.isNewArrival ?? false,
      isActive: true,
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      // Session-7 S7-3: the update branch refreshes CATALOG CONTENT only
      // (seed-policy.ts). price/stock/rating/reviewCount/badge/featured are
      // admin- or traffic-owned — a reseed must never reset them.
      update: productSeedUpdate(data),
      create: { ...data, createdAt: productSeedCreatedAt(index) },
    });
    // S81-1: the display-category memberships are catalog wiring (the old
    // single categoryId rode the same refresh policy) — rebuilt
    // deterministically so a reseed converges an existing DB onto the
    // reference's many-to-many model (delete-then-create is idempotent;
    // the junction's composite PK makes createMany fail on dupes, so the
    // sweep always runs).
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    if (membershipIds.length > 0) {
      await prisma.productCategory.createMany({
        data: membershipIds.map((categoryId) => ({ productId: product.id, categoryId })),
      });
    }
    createdProducts += 1;

    // A starter review per product so detail pages are never empty.
    const existing = await prisma.review.findFirst({ where: { productId: product.id } });
    if (!existing) {
      const template = REVIEW_TEMPLATES[createdProducts % REVIEW_TEMPLATES.length];
      if (template) {
        await prisma.review.create({
          data: {
            productId: product.id,
            userId: demo.id,
            author: "Ayesha Rahman",
            rating: Math.round(p.rating),
            title: template.title,
            comment: template.comment,
            verified: true,
          },
        });
      }
    }
  }
  console.log(`Products: ${createdProducts}`);

  // ---- Carousel ----
  // Session-7 S7-3: slides are admin-managed (CRUD + reorder) — create-only
  // on reseed, exactly like coupons (S4-8) and settings below.
  for (const slide of SLIDES) {
    const existing = await prisma.carouselSlide.findFirst({ where: { title: slide.title } });
    if (!existing) {
      await prisma.carouselSlide.create({ data: slide });
    }
  }
  console.log(`Carousel slides: ${SLIDES.length}`);

  // ---- Settings ----
  // Session-7 S7-3: settings are admin-edited through the settings UI —
  // create-only on reseed (missing keys are created; existing values survive).
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.storeSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log(`Settings: ${Object.keys(SETTINGS).length}`);

  // ---- Coupons ----
  for (const [index, coupon] of COUPONS.entries()) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      // Create-only: a reseed must never reset live redemption bookkeeping
      // (timesUsed / expiresAt / maxRedemptions) — that state is admin- and
      // traffic-owned once the coupon exists (the admin coupon UI manages
      // it; reseeds only top up missing codes). S51-1: the deterministic
      // backdated createdAt lives on the CREATE branch only — existing
      // rows keep their own timestamps (admin-created coupons still sort
      // as the newest via their real `now()`).
      update: {},
      create: { ...coupon, createdAt: couponSeedCreatedAt(index) },
    });
  }
  console.log(`Coupons: ${COUPONS.length}`);

  console.log("Seed complete.");
}

// Run the seed only when executed directly (tsx prisma/seed.ts) — importing
// the module (scripts/restore-demo-stock.ts reads PRODUCTS for the e2e stock
// restore) must NOT trigger a seed.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
