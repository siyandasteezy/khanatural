/**
 * Report image files under public/images/ that nothing points at any more.
 *
 * Replacing artwork leaves the old file behind, and after enough swaps nobody
 * can remember which are still in use. Guessing is expensive here: product
 * photography and article covers are referenced from database rows, not from
 * the code, so a grep of the repo alone would call live images orphaned.
 *
 * A file counts as referenced if it appears in ANY of:
 *   - source (src/), including CSS and component defaults
 *   - the migration JSON under data/ (which the seed writes to the database)
 *   - the live database: product images, article covers and downloads,
 *     testimonial portraits, and page content blocks
 *
 * Deliberately in scope: public/images only. public/emag/ is excluded because
 * the flipbook addresses page images by convention (pNNN.webp derived from
 * pageCount), so no explicit reference to them exists to find.
 *
 *   npx tsx scripts/find-orphan-images.ts            # report
 *   npx tsx scripts/find-orphan-images.ts --delete   # remove them
 */
import { readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";
import { PrismaClient } from "@prisma/client";

const ROOT = join(import.meta.dirname, "..");
const IMAGES_DIR = join(ROOT, "public", "images");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function readTextFiles(dir: string, exts: RegExp): string {
  let blob = "";
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) blob += readTextFiles(full, exts);
    else if (exts.test(entry.name)) blob += readFileSync(full, "utf8");
  }
  return blob;
}

async function main() {
  const deleting = process.argv.includes("--delete");
  const prisma = new PrismaClient();

  // ---- everywhere a path could be written down ----
  let haystack = "";
  haystack += readTextFiles(join(ROOT, "src"), /\.(tsx?|css|mjs|json)$/);
  haystack += readTextFiles(join(ROOT, "data"), /\.json$/);
  haystack += readTextFiles(join(ROOT, "prisma"), /\.ts$/);

  const [products, articles, testimonials, pages] = await Promise.all([
    prisma.productImage.findMany({ select: { url: true } }),
    prisma.article.findMany({ select: { coverImage: true, downloadUrl: true } }),
    prisma.testimonial.findMany({ select: { imageUrl: true } }),
    prisma.page.findMany({ select: { blocks: true } }),
  ]);
  haystack += products.map((p) => p.url).join("\n");
  haystack += articles.map((a) => `${a.coverImage ?? ""}\n${a.downloadUrl ?? ""}`).join("\n");
  haystack += testimonials.map((t) => t.imageUrl ?? "").join("\n");
  haystack += pages.map((p) => JSON.stringify(p.blocks)).join("\n");
  await prisma.$disconnect();

  const files = walk(IMAGES_DIR).sort();
  const orphans: { path: string; bytes: number }[] = [];
  for (const file of files) {
    const webPath = "/" + relative(join(ROOT, "public"), file).split("\\").join("/");
    // match the full web path, so a filename appearing as a substring of another
    // (e.g. "logo.png" inside "brand-logo.png") cannot mask a real orphan
    if (!haystack.includes(webPath)) orphans.push({ path: file, bytes: statSync(file).size });
  }

  const totalKept = files.length - orphans.length;
  console.log(`scanned ${files.length} images under public/images/`);
  console.log(`  still referenced : ${totalKept}`);
  console.log(`  orphaned         : ${orphans.length}\n`);

  if (orphans.length === 0) {
    console.log("Nothing to sweep.");
    return;
  }

  let freed = 0;
  for (const o of orphans) {
    freed += o.bytes;
    console.log(`  ${(o.bytes / 1024).toFixed(0).padStart(6)} KB  ${relative(ROOT, o.path)}`);
  }
  console.log(`\n  total: ${(freed / 1e6).toFixed(1)} MB across ${orphans.length} files`);

  if (!deleting) {
    console.log("\nDry run. Re-run with --delete to remove them.");
    return;
  }
  for (const o of orphans) unlinkSync(o.path);
  console.log(`\nDeleted ${orphans.length} files (recoverable from git history).`);
}

main();
