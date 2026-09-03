/**
 * Does the admin's rich-text editor preserve every product and article body?
 *
 * The editor parses stored HTML into its own schema and re-serialises it on
 * save, so anything the schema does not model is dropped silently — the shop
 * owner would open a product, press Save, and lose copy without being told.
 *
 * This runs the real editor extensions over the real content and compares the
 * visible text before and after. Formatting may legitimately change (<b>
 * becomes <strong>); losing words may not.
 *
 *   npx tsx scripts/check-editor-roundtrip.ts
 */
// the /server entry parses without a browser DOM
import { generateJSON, generateHTML } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// must mirror RichTextEditor.tsx
const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener", target: "_blank" } },
  }),
];

const NAMED: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…",
};

/**
 * Visible words, ignoring tags, whitespace and entity encoding.
 *
 * Entity decoding matters: the editor turns `&#8211;` into a literal en dash.
 * That is the same character to a reader, so comparing raw markup would flag it
 * as lost copy when nothing changed on screen.
 */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function roundTrip(html: string): string {
  if (!html.trim()) return "";
  return generateHTML(generateJSON(html, extensions), extensions);
}

type Row = { label: string; field: string; before: string; after: string };

// tsx compiles this to CJS, where top-level await is unavailable
async function main() {
  const products = JSON.parse(
    readFileSync(join(import.meta.dirname, "..", "data", "migration", "products.json"), "utf8"),
  ) as { name: string; shortDescription: string; description: string }[];

  const rows: Row[] = [];
  for (const p of products) {
    for (const field of ["shortDescription", "description"] as const) {
      const before = p[field] ?? "";
      if (!before.trim()) continue;
      rows.push({ label: p.name, field, before, after: roundTrip(before) });
    }
  }

  // Articles use the same editor, so they carry the same risk.
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const articles = await prisma.article.findMany({ select: { title: true, content: true } });
  for (const a of articles) {
    if (!a.content?.trim()) continue;
    rows.push({ label: a.title, field: "content", before: a.content, after: roundTrip(a.content) });
  }
  await prisma.$disconnect();

  let lost = 0;
  let reformatted = 0;
  for (const r of rows) {
    const a = textOf(r.before);
    const b = textOf(r.after);
    if (a !== b) {
      lost++;
      console.log(`\nCONTENT CHANGED — ${r.label} (${r.field})`);
      // show the first divergence
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      console.log(`  before: …${a.slice(Math.max(0, i - 60), i + 60)}`);
      console.log(`  after : …${b.slice(Math.max(0, i - 60), i + 60)}`);
    } else if (r.before.replace(/\s+/g, "") !== r.after.replace(/\s+/g, "")) {
      reformatted++;
    }
  }

  console.log(`\nchecked ${rows.length} fields across ${products.length} products and ${articles.length} articles`);
  console.log(`  text preserved exactly : ${rows.length - lost}`);
  console.log(`  markup normalised only : ${reformatted}  (e.g. <b> -> <strong>, renders identically)`);
  console.log(`  TEXT LOST              : ${lost}`);

  if (lost > 0) {
    console.error("\nThe editor would drop copy on save. Do not ship until the schema covers it.");
    process.exitCode = 1;
  } else {
    console.log("\nNo copy is lost by opening and saving through the editor.");
  }
}

main();
