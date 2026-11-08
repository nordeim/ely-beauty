// ElyBeauty brand imagery generator (run-72). Idempotent: skips existing files.
// Usage: node scripts/generate-imagery.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "public", "images");
mkdirSync(OUT, { recursive: true });

const MOOD =
  "warm ivory cream studio background, soft diffused natural light, gentle shadow, luxury editorial skincare brand aesthetic, muted taupe and blush rose palette, high-end product photography, photorealistic, high quality";

const jobs = [
  // Hero + section art
  ["hero-main.png", "1440x720", `Elegant flat-lay still life of amber glass serum bottles with gold dropper caps, blush pink rose petals and a flowing ivory silk ribbon arranged on dark charcoal silk fabric, moody romantic editorial lighting with soft golden highlights, luxury skincare campaign photography, cinematic, high quality`],
  ["ritual-banner.png", "1440x720", `Warm taupe photographic scene of glass cosmetic bottles and a jade gua sha stone on beige travertine stone, soft sunlight and long shadows, dried botanicals, minimalist luxury skincare editorial banner, high quality`],
  ["about-collection.png", "1344x768", `Curated collection of premium beauty tools - wooden hairbrush, silk scrunchie, stainless steel gua sha, satin pillowcase - arranged on warm ivory linen with eucalyptus sprigs, soft morning light, luxury skincare brand photography, high quality`],
  ["og-default.png", "1440x720", `Luxury skincare flat-lay with amber glass serum bottles, rose gold tweezers, blush pink silk fabric and delicate white flowers on warm ivory background, elegant editorial brand banner with generous negative space, high quality`],
  // Category tiles (portrait)
  ["category-beauty-tools.png", "864x1152", `Flat-lay of skincare beauty tools - stainless steel gua sha, derma roller, facial threading tool - arranged neatly on ${MOOD}`],
  ["category-brush-combs.png", "864x1152", `Elegant wooden hairbrush and sandalwood comb with a few dried flowers on ${MOOD}`],
  ["category-bestsellers.png", "864x1152", `Blush pink satin silk pillowcase softly folded with a silk hair bonnet and heatless curler set on ${MOOD}`],
  ["category-gift-sets.png", "864x1152", `Beautifully wrapped beauty gift box with ivory ribbon, small glass serum bottles and dried rosebuds peeking out, on ${MOOD}`],
  // Products (portrait 864x1152)
  ["product-silk-bonnet.png", "864x1152", `Premium double-sided pink silk hair bonnet with delicate ruffles, gently inflated on ${MOOD}`],
  ["product-satin-pillowcase.png", "864x1152", `Blush pink satin silk pillowcase elegantly draped with soft folds showing sheen, on ${MOOD}`],
  ["product-heatless-curler.png", "864x1152", `Satin heatless hair curling rod set in soft pink with two matching scrunchies, coiled neatly on ${MOOD}`],
  ["product-bamboo-brush-square.png", "864x1152", `Square natural bamboo paddle hairbrush with wooden bristles, on ${MOOD}`],
  ["product-sandalwood-paddle.png", "864x1152", `Oval sandalwood paddle hairbrush with rich wooden grain and cushioned bristles, on ${MOOD}`],
  ["product-sandalwood-oval.png", "864x1152", `Elegant oval sandalwood hairbrush with polished wooden handle, on ${MOOD}`],
  ["product-bamboo-brush-oval.png", "864x1152", `Oval natural bamboo hairbrush with soft bristles, on ${MOOD}`],
  ["product-gua-sha.png", "864x1152", `Polished stainless steel gua sha facial sculpting tool with mirror finish, on ${MOOD}`],
  ["product-exfoliating-gloves.png", "864x1152", `Pair of pink exfoliating body gloves made of natural viscose fiber, folded neatly on ${MOOD}`],
  ["product-threading-tool.png", "864x1152", `Facial hair threading tool spring coil with small handles, on ${MOOD}`],
  ["product-spa-socks.png", "864x1152", `Soft pink moisturizing gel spa socks, on ${MOOD}`],
  ["product-crystal-hair-remover.png", "864x1152", `Smooth crystal glass hair remover egg with iridescent surface, on ${MOOD}`],
  ["product-scalp-massager.png", "864x1152", `Soft pink silicone scalp massager brush with flexible bristles, on ${MOOD}`],
  ["product-derma-roller.png", "864x1152", `Titanium derma roller with fine micro-needles and ergonomic handle, on ${MOOD}`],
  ["product-derma-stamp.png", "864x1152", `Titanium derma stamp pen with precision needle head, on ${MOOD}`],
  ["product-mask-applicator.png", "864x1152", `Set of four travel-size pink silicone face mask applicator brushes fanned out on ${MOOD}`],
  ["product-cleansing-brush.png", "864x1152", `Wooden facial cleansing brush with soft natural bristles, dual-sided, on ${MOOD}`],
  ["product-body-brush.png", "864x1152", `Natural bristle dry body brush with wooden handle for lymphatic exfoliation, on ${MOOD}`],
  ["product-ice-bowl.png", "864x1152", `Foldable pink silicone facial ice bath bowl with matching ice roller, on ${MOOD}`],
];

let ok = 0, skipped = 0, failed = [];
for (const [file, size, prompt] of jobs) {
  const out = join(OUT, file);
  if (existsSync(out)) { skipped++; continue; }
  try {
    execFileSync("z-ai", ["image", "-p", prompt, "-o", out, "-s", size], { stdio: "pipe", timeout: 120000 });
    ok++;
    console.log(`OK  ${file}`);
  } catch (e) {
    failed.push(file);
    console.error(`FAIL ${file}: ${String(e.message).slice(0, 120)}`);
  }
}
console.log(`\nDone: ${ok} generated, ${skipped} skipped, ${failed.length} failed${failed.length ? ": " + failed.join(", ") : ""}`);
