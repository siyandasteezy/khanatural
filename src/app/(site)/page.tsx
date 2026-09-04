import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { InfoStrip } from "@/components/home/InfoStrip";
import { BestSellers } from "@/components/home/BestSellers";
import { FeaturedProduct } from "@/components/home/FeaturedProduct";
import { BrandCampaign } from "@/components/home/BrandCampaign";
import { EmagSection } from "@/components/home/EmagSection";
import { MovesSection } from "@/components/home/MovesSection";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterBand } from "@/components/home/NewsletterBand";

export const revalidate = 300; // ISR: refresh content every 5 minutes

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${site.name} – ${site.tagline}`,
    description:
      "Wild-crafted seamoss gels, superfoods and natural skincare, handmade in South Africa. Packed with 92 essential minerals. R120 delivery nationwide.",
    path: "/",
  }),
  // absolute: the layout's "%s – Khanatural Shop" template would double the
  // suffix on the original WordPress homepage title
  title: { absolute: `${site.name} – ${site.tagline}` },
};

/**
 * Product given the homepage spotlight. Falls back to the top best seller if
 * the slug is ever retired, so the section never renders empty.
 */
const FEATURED_SLUG = "avo-seamoss-cream-2";

export default async function HomePage() {
  const [products, testimonials, emag, featured] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true },
      orderBy: [{ inStock: "desc" }, { reviewCount: "desc" }, { name: "asc" }],
      take: 6, // three-up grid, so six fills two clean rows
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.article.findFirst({
      where: { kind: "EMAG_ISSUE", isPublished: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.product.findFirst({
      where: { slug: FEATURED_SLUG, isPublished: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  const featuredProduct = featured ?? products[0] ?? null;

  return (
    <>
      <Hero />
      <InfoStrip />
      <FeaturedProduct product={featuredProduct} />
      <BestSellers products={products} />
      <BrandCampaign />
      <EmagSection
        issue={
          emag
            ? { title: emag.title, slug: emag.slug, content: emag.content, coverImage: emag.coverImage, downloadUrl: emag.downloadUrl }
            : null
        }
      />
      <MovesSection />
      <Testimonials testimonials={testimonials} />
      <NewsletterBand />
    </>
  );
}
