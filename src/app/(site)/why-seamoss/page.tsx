import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages";
import { buildMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { EditorialSections } from "@/components/content/EditorialSections";
import { ClosingCta } from "@/components/content/ClosingCta";

export const revalidate = 300;

// Keeps the "Why Seamoss" keyword leading (as the WordPress title had it)
// while adding the terms people actually search alongside it.
export const metadata: Metadata = buildMetadata({
  title: "Why Seamoss — Benefits & How to Use It",
  description:
    "Wild-crafted sea moss for immune support, gut health and glowing skin — plus how to prepare raw sea moss and make your own gel at home.",
  path: "/why-seamoss/",
  image: "/images/stock/skin-glow.jpg",
});

export default async function WhySeamossPage() {
  const page = await getPage("why-seamoss");
  if (!page) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Why Seamoss", path: "/why-seamoss/" },
            ]),
          ),
        }}
      />
      <PageHero
        eyebrow="The science and the story"
        title="Why Seamoss"
        lead="92 of the 102 minerals your body needs, wild-crafted from the ocean — and everything you need to know about using it."
        image="/images/stock/skin-glow.jpg"
        imagePosition="center 35%"
      />
      <EditorialSections blocks={page.blocks} />
      <ClosingCta
        eyebrow="Ready to feel it"
        title="Start your seamoss ritual"
        lead="Gels, superfoods and skincare — wild-crafted, handmade in South Africa, delivered for R120 nationwide."
        image="/images/stock/skin-unapologetic.jpg"
        primary={{ label: "Shop seamoss", href: "/shop/" }}
        secondary={{ label: "Read the e-Mag", href: "/media/" }}
      />
    </>
  );
}
