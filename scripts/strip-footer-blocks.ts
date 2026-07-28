/**
 * The WordPress scrape captured the newsletter signup and the site footer as
 * page content, so every migrated page repeated the footer nav as body text.
 * This trims each page's blocks at that boundary, in both the migration
 * snapshot and the database.
 *
 * Run: npx tsx scripts/strip-footer-blocks.ts
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const PAGES_DIR = join(process.cwd(), "data", "migration", "pages");

type Block = { type: string; text?: string; src?: string; alt?: string; localSrc?: string };

/** Everything from the newsletter heading onward is chrome, not page content. */
const CUTOFF = /^subscribe to our newsletter$/i;

function trim(blocks: Block[]): Block[] {
  const idx = blocks.findIndex((b) => b.type.startsWith("h") && CUTOFF.test((b.text ?? "").trim()));
  return idx === -1 ? blocks : blocks.slice(0, idx);
}

async function main() {
  for (const file of readdirSync(PAGES_DIR).filter((f) => f.endsWith(".json"))) {
    const path = join(PAGES_DIR, file);
    const page = JSON.parse(readFileSync(path, "utf8")) as { slug: string; blocks: Block[] };
    const before = page.blocks.length;
    page.blocks = trim(page.blocks);
    if (page.blocks.length !== before) {
      writeFileSync(path, JSON.stringify(page, null, 2));
    }

    const slug = file === "home.json" ? "" : page.slug;
    const row = await prisma.page.findUnique({ where: { slug } });
    if (row) {
      const trimmed = trim((row.blocks as Block[]) ?? []);
      await prisma.page.update({ where: { slug }, data: { blocks: trimmed as object[] } });
      console.log(`${file.padEnd(20)} ${before} → ${trimmed.length} blocks`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
