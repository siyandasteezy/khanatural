/**
 * Retire the WordPress-era photography in favour of the campaign originals.
 *
 * The WordPress images were not different pictures — they were these same
 * shoots saved out at 600-1280px. scripts/export-newimages.py writes the
 * originals back at 2400px, and this points the content at them.
 *
 * The migration JSON is the source of truth (`db:seed` deletes and recreates
 * product images and page blocks from it), so this edits the JSON and the seed
 * carries it to the database. Run `npm run db:seed` afterwards.
 *
 * Two rules held throughout:
 *   - Nothing is substituted across products. A WordPress frame only goes if
 *     the new folder holds that product, and products with no new coverage
 *     (shea butter, beard care, black soap bars, wildcrafted capsules …) keep
 *     what they have rather than borrowing someone else's photograph.
 *   - Testimonial portraits are left alone. home-14…18 are the faces of named
 *     reviewers; swapping in a different person's face to gain resolution
 *     would misrepresent a real human being.
 *
 * Alt text is rewritten at the same time. WordPress had shouted the product
 * name into every slot ("ALL NATURAL SCRUB" five times over), which tells a
 * screen-reader user nothing about which image they are on.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const MIG = join(ROOT, "data", "migration");

type MigImage = { wpId?: number; src?: string; alt: string; localSrc: string };
type MigProduct = { slug: string; name: string; images: MigImage[] };
type Block = { type: string; text?: string; src?: string; alt?: string; localSrc?: string };

/** A freshly exported campaign frame. */
const shot = (file: string, alt: string): MigImage => ({ alt, localSrc: `/images/products/${file}` });

/**
 * Per product: the gallery rebuilt from the new exports plus whichever existing
 * frames still earn their place. `keep` looks an image up by filename so the
 * result does not silently shift if the JSON is reordered later.
 */
const GALLERIES: Record<string, (keep: (needle: string) => MigImage) => MigImage[]> = {
  // Every WordPress frame here had a full-resolution original, so the gallery
  // is wholly new — except the open tub, the only shot of the scrub itself.
  "all-natural-scrub": (keep) => [
    shot("all-natural-scrub-sand.jpg", "KhaNatural All Natural Scrub, 250g tub resting on beach sand"),
    shot("all-natural-scrub-surf.jpg", "KhaNatural All Natural Scrub tub washed by the incoming tide"),
    shot("all-natural-scrub-in-use.jpg", "Hand holding the All Natural Scrub tub, scrub worked into the skin"),
    shot("all-natural-scrub-applying.jpg", "Woman applying KhaNatural All Natural Scrub to her leg on the rocks"),
    keep("all-natural-scrub-2-0b7c2a.webp"), // open tub — the only look at the texture
  ],

  "seamoss-lotion": (keep) => [
    shot("seamoss-lotion-dune-front.jpg", "KhaNatural Sea Moss Lotion, 250g tub among coastal dune plants"),
    shot("seamoss-lotion-dune-angle.jpg", "KhaNatural Sea Moss Lotion tub in the dune vegetation, angled label view"),
    shot("seamoss-lotion-sand-trio.jpg", "KhaNatural Sea Moss Lotion on the sand with three travel-size tubs behind"),
    shot("seamoss-lotion-in-use.jpg", "Sea Moss Lotion held against sunlit skin on the rocks"),
    keep("seamoss-lotion-2-15ca8d.jpg"), // opened tub showing the cream
  ],

  "reviving-facial-oil": (keep) => [
    shot("reviving-facial-oil-rock.jpg", "KhaNatural Reviving Facial Oil, both bottle sizes on dark coastal rock"),
    shot("reviving-facial-oil-dune.jpg", "KhaNatural Reviving Facial Oil bottles nestled in silver dune foliage"),
    keep("reviving-facial-oil-1-a5e1f0.jpg"), // clean two-bottle pack shot
    keep("reviving-facial-oil-6-2ddc90.jpg"), // held by the model
  ],

  "black-elderberry-capsules": () => [
    shot("black-elderberry-rock-portrait.jpg", "KhaNatural Black Elderberry capsules on a barnacled rock above the shore"),
    shot("black-elderberry-capsules-palm.jpg", "Black Elderberry vegan capsules tipped into an open palm"),
    shot("black-elderberry-held.jpg", "Woman in a sun hat holding the KhaNatural Black Elderberry bottle at the beach"),
    shot("black-elderberry-rock-shore.jpg", "Black Elderberry capsules on the rocks with the surf behind"),
    shot("black-elderberry-shore-wide.jpg", "KhaNatural Black Elderberry bottle on the shoreline"),
  ],

  // One 6720px original replaces both low-res copies of the same jar line-up,
  // which also clears the duplicate sitting at index 3.
  "khanatural-honey-super-food": (keep) => [
    shot("khanatural-honey-jars.jpg", "Three jars of KhaNatural raw honey with a wooden dipper"),
    keep("khanatural-honey-super-food-3-3941dc.jpeg"),
    keep("khanatural-honey-super-food-5-c2d11a.jpeg"),
    keep("khanatural-honey-super-food-6-38b8db.jpeg"),
    keep("khanatural-honey-super-food-7-bf0e3f.jpeg"),
  ],

  // New frame leads and the repeated first image goes.
  "coco-avocado-butter": (keep) => [
    shot("coco-avocado-butter-held.jpg", "Woman holding KhaNatural Coco Avocado Butter beside a fresh avocado and coconut"),
    keep("coco-avocado-butter-1-5410a7.jpeg"),
    keep("coco-avocado-butter-2-9ff2d6.jpeg"),
  ],

  // Pack shots stay in front — they show the bar clearly — and the new
  // lifestyle frame takes the slot the duplicate was wasting.
  "white-flower-infused-tumeric-soap": (keep) => [
    keep("white-flower-infused-tumeric-soap-1-e452ba.jpg"),
    keep("white-flower-infused-tumeric-soap-2-583616.jpg"),
    keep("white-flower-infused-tumeric-soap-3-afa184.jpg"),
    shot("turmeric-soap-held.jpg", "Customer holding a bar of KhaNatural White Flower Infused Turmeric Soap"),
  ],
};

// ---- products ----------------------------------------------------------
const productsPath = join(MIG, "products.json");
const products: MigProduct[] = JSON.parse(readFileSync(productsPath, "utf8"));

/**
 * Every retired frame mapped to the image that took over as its product's lead.
 * home.json and shop.json list each product with its hero image, and those two
 * are the last thing pinning the old files — without this the sweep cannot take
 * them, and a stale WordPress photo sits in the page data for a product whose
 * gallery has completely changed.
 */
const retiredLead = new Map<string, string>();

for (const [slug, build] of Object.entries(GALLERIES)) {
  const p = products.find((x) => x.slug === slug);
  if (!p) throw new Error(`product not found: ${slug}`);

  const keep = (needle: string): MigImage => {
    const found = p.images.find((im) => im.localSrc?.endsWith(needle));
    if (!found) throw new Error(`${slug}: cannot keep missing image ${needle}`);
    return found;
  };

  const before = p.images.map((im) => im.localSrc);
  p.images = build(keep);
  const kept = new Set(p.images.map((im) => im.localSrc));
  const lead = p.images[0];

  for (const old of before) {
    if (old && !kept.has(old)) retiredLead.set(old, lead.localSrc);
  }

  const fresh = p.images.filter((im) => !im.wpId).length;
  console.log(`${slug}: ${before.length} -> ${p.images.length} images (${fresh} from the new shoot)`);
}

writeFileSync(productsPath, JSON.stringify(products, null, 2) + "\n");

// ---- pages -------------------------------------------------------------
/**
 * Page image swaps, by page slug. Two of these are exact-duplicate files
 * (verified identical by checksum) that the migration wrote twice under
 * different names — those just repoint at the copy that is already canonical.
 */
const PAGE_SWAPS: Record<string, { from: string; to: string; alt?: string }[]> = {
  "our-brand": [
    {
      // WordPress served a 1024px export of this very frame
      from: "/images/content/our-brand-5-1db2cc.webp",
      to: "/images/products/reviving-facial-oil-dune.jpg",
      alt: "KhaNatural Reviving Facial Oil bottles nestled in silver dune foliage",
    },
  ],
  "contact-us": [
    {
      from: "/images/content/contact-us-1-9a9b41.png",
      to: "/images/shoot/beach-friends-tea.jpg",
      alt: "Two friends sharing sea moss tea on the beach",
    },
  ],
  "legal-notice": [
    {
      from: "/images/content/legal-notice-1-e4e102.jpg",
      to: "/images/shoot/beach-shore-walk.jpg",
      alt: "Walking the shoreline where KhaNatural harvests its sea moss",
    },
  ],
  "why-seamoss": [
    {
      from: "/images/content/why-seamoss-2-46b574.png",
      to: "/images/products/seamoss-gel-studio-front.jpg",
      alt: "KhaNatural Sea Moss Gel in a 500ml glass jar",
    },
  ],
  // shop.json is not in the seed's page list, so this changes no rendered page —
  // it releases the duplicate file so the orphan sweep can take it.
  shop: [{ from: "/images/content/why-seamoss-3-2969e3.png", to: "/images/brand/logo.png" }],
  // byte-identical copy of the July 2026 e-Mag cover
  home: [{ from: "/images/content/media-2-0352ee.jpeg", to: "/images/brand/emag-cover-july-2026.jpeg" }],
};

for (const [slug, swaps] of Object.entries(PAGE_SWAPS)) {
  const path = join(MIG, "pages", `${slug}.json`);
  const page = JSON.parse(readFileSync(path, "utf8")) as { blocks: Block[] };

  for (const { from, to, alt } of swaps) {
    const hits = page.blocks.filter((b) => b.localSrc === from);
    if (hits.length === 0) throw new Error(`${slug}: no block points at ${from}`);
    for (const b of hits) {
      b.localSrc = to;
      if (alt) b.alt = alt;
    }
    console.log(`${slug}: ${hits.length} block(s) ${from.split("/").pop()} -> ${to.split("/").pop()}`);
  }

  writeFileSync(path, JSON.stringify(page, null, 2) + "\n");
}

// ---- carry the gallery changes into the product listings -----------------
// home.json and shop.json each show a grid of products by their hero image.
// Neither is rendered today (the homepage is built from components, and "shop"
// is not in the seed's page list) but both are read by find-orphan-images, so
// leaving them stale would keep the retired files alive for nothing.
for (const slug of ["home", "shop"]) {
  const path = join(MIG, "pages", `${slug}.json`);
  const page = JSON.parse(readFileSync(path, "utf8")) as { blocks: Block[] };
  let moved = 0;

  for (const b of page.blocks) {
    const next = b.localSrc && retiredLead.get(b.localSrc);
    if (!next) continue;
    b.localSrc = next;
    moved++;
  }

  if (moved) writeFileSync(path, JSON.stringify(page, null, 2) + "\n");
  console.log(`${slug}: ${moved} product hero(es) followed their gallery`);
}
