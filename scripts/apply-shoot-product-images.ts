/**
 * Swap the May 2026 studio frames into the product galleries and fix the
 * blurry founder signature on Our Brand.
 *
 * The migration JSON is the source of truth — `db:seed` deletes and recreates
 * product images and page blocks from it — so this edits the JSON and the seed
 * carries it to the database. Run `npm run db:seed` afterwards.
 *
 * Only products the new shoot actually depicts are touched: the sea moss gel
 * jars and the two black soap body washes. Nothing is substituted across
 * products (a gel photo must never stand in for, say, raw sea moss).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const MIG = join(ROOT, "data", "migration");

type MigImage = { wpId?: number; src?: string; alt: string; localSrc: string };
type MigProduct = { slug: string; name: string; images: MigImage[] };
type Block = { type: string; text?: string; src?: string; alt?: string; localSrc?: string };

/** New square exports, keyed by the filename written into public/images/products. */
const shot = (file: string, alt: string): MigImage => ({ alt, localSrc: `/images/products/${file}` });

/**
 * Per product: the new gallery, given the existing images so we can keep the
 * lifestyle frames that still earn their place. Studio shots lead — they read
 * as product photography in the square shop cards; the beach frames follow as
 * lifestyle context.
 */
const GALLERIES: Record<string, (existing: MigImage[]) => MigImage[]> = {
  // Flagship gel: lead with the studio jar, then the poured-gel texture detail.
  "seamoss-gel": (ex) => [
    shot("seamoss-gel-studio-front.jpg", "KhaNatural Sea Moss Gel in a 500ml glass jar with a gold lid, studio shot"),
    shot(
      "seamoss-gel-studio-texture.jpg",
      "Close-up of KhaNatural Sea Moss Gel poured from the jar, showing its natural golden texture",
    ),
    shot("seamoss-gel-studio-close.jpg", "KhaNatural Sea Moss Gel jar, front label detail"),
    // keep one lifestyle frame: two jars on the rocks at the coast
    ex[1],
  ],

  // Combo listing keeps its two-jar hero; the duplicate second frame becomes
  // the new poured-gel studio shot.
  "seamoss-gel-combo": (ex) => [
    ex[0],
    shot("seamoss-gel-studio-pour.jpg", "KhaNatural Sea Moss Gel poured from the jar onto a stone plinth"),
    ex[2],
    ex[3],
    ex[4],
  ],

  "black-soap-liquid-body-wash-for-men-head-to-toe": (ex) => [
    shot(
      "body-wash-men-studio-front.jpg",
      "KhaNatural Black Soap Liquid Body Wash for Men, 250ml pump bottle, studio shot",
    ),
    shot("body-wash-men-studio-angle.jpg", "KhaNatural Black Soap Liquid Body Wash for Men, angled product view"),
    ex[1],
  ],

  "black-soap-liquid-body-wash-for-women-head-to-toe": (ex) => [
    shot(
      "body-wash-women-studio-front.jpg",
      "KhaNatural Black Soap Liquid Body Wash for Women, 250ml pump bottle, studio shot",
    ),
    shot("body-wash-women-studio-angle.jpg", "KhaNatural Black Soap Liquid Body Wash for Women, angled product view"),
    ex[1],
  ],
};

// ---- products ----
const productsPath = join(MIG, "products.json");
const products: MigProduct[] = JSON.parse(readFileSync(productsPath, "utf8"));

for (const [slug, build] of Object.entries(GALLERIES)) {
  const p = products.find((x) => x.slug === slug);
  if (!p) throw new Error(`product not found: ${slug}`);
  const before = p.images.length;
  p.images = build(p.images).filter(Boolean);
  const fresh = p.images.filter((im) => !im.wpId).length;
  console.log(`${slug}: ${before} -> ${p.images.length} images (${fresh} new from the shoot)`);
}

writeFileSync(productsPath, JSON.stringify(products, null, 2) + "\n");

// ---- our-brand: the founder signature ----
// The signature ships as a 200x60 PNG. The editorial grid was stretching it to
// a ~250px square tile, which is what made it look blurry. Retype it so the
// layout can render it as a signature at its natural size, and give the vacated
// image slot a real photograph from the shoot.
const brandPath = join(MIG, "pages", "our-brand.json");
const brand = JSON.parse(readFileSync(brandPath, "utf8")) as { blocks: Block[] };

const sigIndex = brand.blocks.findIndex((b) => b.type === "img" && b.src?.includes("/Name.png"));
if (sigIndex === -1) throw new Error("founder signature block not found");

brand.blocks[sigIndex] = {
  type: "signature",
  src: brand.blocks[sigIndex].src,
  localSrc: brand.blocks[sigIndex].localSrc,
  alt: "Khabonina Qubeka's signature",
};

// replace it in the image flow with a founder frame from the May 2026 shoot
brand.blocks.splice(sigIndex, 0, {
  type: "img",
  localSrc: "/images/shoot/honey-joy.jpg",
  alt: "Khabonina Qubeka laughing, wearing a gold laurel crown with KhaNatural honey on her skin",
});

writeFileSync(brandPath, JSON.stringify(brand, null, 2) + "\n");
console.log(`our-brand: signature retyped at block ${sigIndex + 1}, founder photograph added at block ${sigIndex}`);
