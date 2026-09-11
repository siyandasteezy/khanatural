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
  image: "/images/shoot/honey-ritual.jpg",
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
      {/* Skin, not another jar: the page already shows the gel twice below, and
          the hero is the one place to lead with what seamoss is FOR. Cropped to
          the eyes, because this band keeps only about a quarter of the frame. */}
      <PageHero
        eyebrow="The science and the story"
        title="Why Seamoss"
        lead="92 of the 102 minerals your body needs, wild-crafted from the ocean — and everything you need to know about using it."
        image="/images/shoot/skin-close.jpg"
        imagePosition="center 22%"
      />
      <EditorialSections blocks={page.blocks} />
      <ClosingCta
        eyebrow="Ready to feel it"
        title="Start your seamoss ritual"
        lead="Gels, superfoods and skincare — wild-crafted, handmade in South Africa, delivered for R120 nationwide."
        image="/images/shoot/natural-crown.jpg"
        primary={{ label: "Shop seamoss", href: "/shop/" }}
        secondary={{ label: "Read the e-Mag", href: "/media/" }}
      />
    </>
  );
}
