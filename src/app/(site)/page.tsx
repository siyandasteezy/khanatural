import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { InfoStrip } from "@/components/home/InfoStrip";
import { BestSellers } from "@/components/home/BestSellers";
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
      "Your go-to destination for the finest, nutrient-rich seamoss products. Harnessing the ancient wisdom of the ocean, our seamoss is sustainably harvested and packed with essential vitamins, minerals and antioxidants to boost your health.",
    path: "/",
  }),
  // absolute: the layout's "%s – Khanatural Shop" template would double the
  // suffix on the original WordPress homepage title
  title: { absolute: `${site.name} – ${site.tagline}` },
};

export default async function HomePage() {
  const [products, testimonials, emag] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true },
      orderBy: [{ inStock: "desc" }, { reviewCount: "desc" }, { name: "asc" }],
      take: 8,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
    prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
    prisma.article.findFirst({
      where: { kind: "EMAG_ISSUE", isPublished: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return (
    <>
      <Hero />
      <InfoStrip />
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
