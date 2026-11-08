// S76-9: generate 2 gallery variants per product (extends the run-72 pipeline).
// Run-76 outcome: 38 variants generated; VLM coherence review kept 9
// products' generated angles (bonnet, pillowcase, massager, bamboo-square,
// sandalwood-oval, exfoliating-gloves, cleansing-brush, body-brush + the
// regenerated bonnet set) and REPLACED 10 drifted sets with PIL detail
// crops of each main shot (80% alternate framing + 58% center zoom —
// coherent by construction; the gua-sha's 3 generation attempts all
// drifted). The crop fallback is the documented path for products whose
// generations drift from the main shot's material/shape.
// Idempotent: skips existing files.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/my-project/ely-beauty";
const OUT = join(ROOT, "public", "images");

const MOOD =
  "warm ivory cream studio background, soft diffused natural light, gentle shadow, luxury editorial skincare brand aesthetic, muted taupe and blush rose palette, high-end product photography, photorealistic, high quality";

// [file, size, prompt2, prompt3] — variants per product, same brand pipeline.
const jobs = [
  ["product-silk-bonnet", `Premium double-sided pink silk hair bonnet with delicate ruffles shown from a top-down angle, softly spread on ${MOOD}`, `Close-up detail of pink silk fabric ruffles and stitch edge of a hair bonnet, on ${MOOD}`],
  ["product-satin-pillowcase", `Blush pink satin silk pillowcase folded in thirds showing the fabric sheen and edge seam, on ${MOOD}`, `Close-up macro of blush pink satin silk weave with soft light reflections, on ${MOOD}`],
  ["product-heatless-curler", `Satin heatless hair curling rod in soft pink draped in a gentle spiral with matching scrunchie beside it, on ${MOOD}`, `Close-up of the soft pink satin curling rod's fabric texture and stitched end, on ${MOOD}`],
  ["product-bamboo-brush-square", `Square natural bamboo paddle hairbrush with wooden bristles photographed at a three-quarter angle, on ${MOOD}`, `Close-up detail of bamboo wood grain and rounded bristle tips of a paddle hairbrush, on ${MOOD}`],
  ["product-sandalwood-paddle", `Oval sandalwood paddle hairbrush with rich wooden grain at a three-quarter angle, on ${MOOD}`, `Close-up of sandalwood wood grain and cushioned bristle base of a paddle hairbrush, on ${MOOD}`],
  ["product-sandalwood-oval", `Elegant oval sandalwood hairbrush with polished wooden handle standing upright, on ${MOOD}`, `Close-up of the polished sandalwood handle and bristles of an oval hairbrush, on ${MOOD}`],
  ["product-bamboo-brush-oval", `Oval natural bamboo hairbrush with soft bristles at a three-quarter angle, on ${MOOD}`, `Close-up of bamboo bristles and cushioned pad of an oval hairbrush, on ${MOOD}`],
  ["product-gua-sha", `Polished stainless steel gua sha facial sculpting tool at a diagonal angle catching the light, on ${MOOD}`, `Close-up of the mirror-finish edge curve of a stainless steel gua sha tool, on ${MOOD}`],
  ["product-exfoliating-gloves", `Single pink exfoliating body glove laid flat showing the viscose texture, second glove folded behind, on ${MOOD}`, `Close-up of the pink viscose exfoliating weave texture of a body glove, on ${MOOD}`],
  ["product-threading-tool", `Facial hair threading tool spring coil with small handles coiled on a marble surface, on ${MOOD}`, `Close-up of the spring coil and handle detail of a facial threading tool, on ${MOOD}`],
  ["product-spa-socks", `Soft pink moisturizing gel spa socks arranged as a pair, one slightly behind the other, on ${MOOD}`, `Close-up of the soft pink gel fabric texture and cuff of a spa sock, on ${MOOD}`],
  ["product-crystal-hair-remover", `Smooth crystal glass hair remover egg with iridescent surface turning to catch a different light angle, on ${MOOD}`, `Close-up of the iridescent crystal glass surface texture of a hair remover egg, on ${MOOD}`],
  ["product-scalp-massager", `Soft pink silicone scalp massager brush with flexible bristles shown from above, on ${MOOD}`, `Close-up of the soft pink silicone bristle tips of a scalp massager, on ${MOOD}`],
  ["product-derma-roller", `Titanium derma roller with fine micro-needles and ergonomic handle at a three-quarter angle, on ${MOOD}`, `Close-up of the titanium micro-needle roller head detail, on ${MOOD}`],
  ["product-derma-stamp", `Titanium derma stamp pen with precision needle head standing at an angle, on ${MOOD}`, `Close-up of the precision needle head and pen grip of a derma stamp, on ${MOOD}`],
  ["product-mask-applicator", `Set of four pink silicone face mask applicator brushes arranged in a fan pattern, on ${MOOD}`, `Close-up of the pink silicone brush tips of a face mask applicator set, on ${MOOD}`],
  ["product-cleansing-brush", `Wooden facial cleansing brush with soft natural bristles, dual-sided, standing upright, on ${MOOD}`, `Close-up of the natural bristles and wood handle junction of a cleansing brush, on ${MOOD}`],
  ["product-body-brush", `Natural bristle dry body brush with wooden handle laid diagonally, on ${MOOD}`, `Close-up of the natural fiber bristles and wooden back of a dry body brush, on ${MOOD}`],
  ["product-ice-bowl", `Foldable pink silicone facial ice bath bowl with matching ice roller, water droplets on the bowl, on ${MOOD}`, `Close-up of the pink silicone folding rim of a facial ice bowl with the ice roller beside, on ${MOOD}`],
  ["placeholder-product-1", null, null],
  ["placeholder-product-2", null, null],
];

// The 2 draft products (unpublished) get variants too — find their slugs from the seed.
import { readFileSync } from "node:fs";
const seed = readFileSync(join(ROOT, "prisma", "seed.ts"), "utf8");
const draftSlugs = [...seed.matchAll(/slug: "([^"]+)"/g)].map(m => m[1]);

let ok = 0, skipped = 0, failed = [];
for (const [base, p2, p3] of jobs) {
  if (!p2) continue;
  for (const [suffix, prompt] of [["2", p2], ["3", p3]]) {
    const file = `${base}-${suffix}.png`;
    const out = join(OUT, file);
    if (existsSync(out)) { skipped++; continue; }
    try {
      execFileSync("z-ai", ["image", "-p", prompt, "-o", out, "-s", "864x1152"], { stdio: "pipe", timeout: 180000 });
      ok++;
      console.log(`OK ${file}`);
    } catch (e) {
      failed.push(file);
      console.error(`FAIL ${file}: ${String(e.message).slice(0, 100)}`);
    }
  }
}
console.log(`DONE ok=${ok} skipped=${skipped} failed=${failed.length} ${failed.join(",")}`);
