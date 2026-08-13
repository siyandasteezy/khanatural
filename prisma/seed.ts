/**
 * Seeds the database from the WordPress migration snapshot in data/migration/.
 * Idempotent: re-running upserts by slug/wpId without duplicating rows.
 */
import { PrismaClient, ArticleKind } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const MIGRATION_DIR = join(process.cwd(), "data", "migration");

function load<T>(rel: string): T {
  return JSON.parse(readFileSync(join(MIGRATION_DIR, rel), "utf8")) as T;
}

type MigCategory = { wpId: number; name: string; slug: string; description: string };
type MigTag = { name: string; slug: string };
type MigImage = { wpId: number; src: string; alt: string; localSrc?: string };
type MigProduct = {
  wpId: number;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription: string;
  description: string;
  priceCents: number;
  regularPriceCents: number;
  salePriceCents: number | null;
  onSale: boolean;
  currency: string;
  inStock: boolean;
  averageRating: number;
  reviewCount: number;
  weight: string | null;
  categories: string[];
  tags: MigTag[];
  images: MigImage[];
};
type MigBlock = { type: string; text?: string; src?: string; alt?: string; localSrc?: string };
type MigPage = { slug: string; title: string; metaDescription: string; blocks: MigBlock[] };
type MigTestimonial = { author: string; location: string; quote: string; image: string; sortOrder: number };
type MigEmagIssue = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  downloadUrl: string;
  pageCount: number;
  publishedAt: string;
};

const CATEGORY_ORDER: Record<string, number> = { ladies: 1, "mens-range": 2, unisex: 3, uncategorised: 99 };

async function main() {
  // ---- categories ----
  const categories = load<MigCategory[]>("categories.json");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        wpId: c.wpId,
        name: c.name,
        slug: c.slug,
        description: c.description,
        sortOrder: CATEGORY_ORDER[c.slug] ?? 50,
      },
      update: { name: c.name, description: c.description, sortOrder: CATEGORY_ORDER[c.slug] ?? 50 },
    });
  }
  console.log(`categories: ${categories.length}`);

  // ---- tags ----
  const tags = load<MigTag[]>("tags.json");
  for (const t of tags) {
    await prisma.tag.upsert({ where: { slug: t.slug }, create: t, update: { name: t.name } });
  }
  console.log(`tags: ${tags.length}`);

  // ---- products ----
  const products = load<MigProduct[]>("products.json");
  for (const p of products) {
    const data = {
      wpId: p.wpId,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      shortDescription: p.shortDescription,
      description: p.description,
      priceCents: p.priceCents,
      regularPriceCents: p.regularPriceCents,
      salePriceCents: p.salePriceCents,
      onSale: p.onSale,
      currency: p.currency,
      inStock: p.inStock,
      averageRating: p.averageRating,
      reviewCount: p.reviewCount,
      weight: p.weight,
      categories: { connect: p.categories.map((slug) => ({ slug })) },
      tags: { connect: p.tags.map((t) => ({ slug: t.slug })) },
    };
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: data,
      update: { ...data, categories: { set: [], connect: data.categories.connect }, tags: { set: [], connect: data.tags.connect } },
    });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((im, i) => ({
        productId: product.id,
        url: im.localSrc ?? im.src,
        alt: im.alt || p.name,
        sortOrder: i,
      })),
    });
  }
  console.log(`products: ${products.length}`);

  // ---- pages ----
  const pageSlugs = ["home", "why-seamoss", "our-brand", "media", "contact-us", "privacy-policy", "legal-notice"];
  for (const s of pageSlugs) {
    const pg = load<MigPage>(`pages/${s}.json`);
    const slug = s === "home" ? "" : s;
    await prisma.page.upsert({
      where: { slug },
      create: {
        slug,
        title: pg.title,
        metaTitle: pg.title,
        metaDescription: pg.metaDescription || null,
        blocks: pg.blocks as object[],
      },
      update: { title: pg.title, blocks: pg.blocks as object[] },
    });
  }
  console.log(`pages: ${pageSlugs.length}`);

  // ---- testimonials ----
  const testimonials = load<MigTestimonial[]>("testimonials.json");
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { author: t.author } });
    const data = { author: t.author, location: t.location, quote: t.quote, imageUrl: t.image, sortOrder: t.sortOrder };
    if (existing) await prisma.testimonial.update({ where: { id: existing.id }, data });
    else await prisma.testimonial.create({ data });
  }
  console.log(`testimonials: ${testimonials.length}`);

  // ---- current e-Mag issue (copy from the live homepage, unchanged) ----
  await prisma.article.upsert({
    where: { slug: "khanatural-emag-july-2026" },
    create: {
      kind: ArticleKind.EMAG_ISSUE,
      title: "Khanatural e-Mag — July 2026 Issue",
      slug: "khanatural-emag-july-2026",
      excerpt:
        "Inside This isuue, we get to know our cover star, Mokgadi Shogole’s beauty from within, while Jamie oliver inspires your palate with hearty winter meals.",
      content:
        "<p>Inside This isuue, we get to know our cover star, Mokgadi Shogole’s beauty from within, while Jamie oliver inspires your palate with hearty winter meals.</p>\n<p>Radio and TV host, Tyrone Willard is our One To Watch this month. He has a voice and he is using it to highlight what’s happening in South Africa.</p>\n<p>Stretching has become as important as working out and we ask you if have you ever been told a beautiful lie?</p>\n<p>We also have our usual features from Mokwadi and Dambisa. Mokwadi reminisces on the boys who once were, while Dambisa educates us in the beauty of presence.</p>",
      coverImage: "/images/brand/emag-cover-july-2026.jpeg",
      downloadUrl: "/uploads/emag/khanatural-emag-july-2026.pdf",
      publishedAt: new Date("2026-07-01"),
    },
    update: {},
  });

  // ---- back catalogue, ingested by scripts/ingest-magazine.py ----
  // `update` deliberately leaves excerpt/content alone so anything reworded in
  // the admin survives a re-seed; only the generated assets are refreshed.
  const issues = load<MigEmagIssue[]>("emag-issues.json");
  for (const issue of issues) {
    const assets = {
      coverImage: issue.coverImage,
      downloadUrl: issue.downloadUrl,
      pageCount: issue.pageCount,
    };
    await prisma.article.upsert({
      where: { slug: issue.slug },
      create: {
        kind: ArticleKind.EMAG_ISSUE,
        title: issue.title,
        slug: issue.slug,
        excerpt: issue.excerpt,
        publishedAt: new Date(issue.publishedAt),
        ...assets,
      },
      update: assets,
    });
  }
  console.log(`articles: ${issues.length + 1} e-Mag issues (${issues.length} back issues + July 2026)`);

  // ---- admin user ----
  const email = process.env.ADMIN_EMAIL ?? "sales@khanatural.com";
  const password = process.env.ADMIN_PASSWORD;
  if (password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      create: { email, name: "Khanatural Admin", passwordHash, role: "ADMIN" },
      update: { passwordHash },
    });
    console.log(`admin user: ${email}`);
  } else {
    console.log("ADMIN_PASSWORD not set — skipping admin user");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
