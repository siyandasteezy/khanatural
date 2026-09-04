import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages";
import { buildMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { PageBanner } from "@/components/layout/PageHero";
import { EditorialSections } from "@/components/content/EditorialSections";
import { ClosingCta } from "@/components/content/ClosingCta";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Our Brand — Founder Khabonina Qubeka",
  description:
    "Meet Khabonina Qubeka — award-winning South African actress and founder of Khanatural, the wild-crafted sea moss range rooted in realness.",
  path: "/our-brand/",
  image: "/images/brand/khabo.jpg",
});

export default async function OurBrandPage() {
  const page = await getPage("our-brand");
  if (!page) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Our Brand", path: "/our-brand/" },
            ]),
          ),
        }}
      />
      {/* No hero copy here: the page opens on the photograph and goes straight
          into "Our Founder", which carries the page's <h1>. The line the hero
          used to show now stands at the top of that section instead. */}
      <PageBanner image="/images/shoot/page-brand-grooming.jpg" imagePosition="center" />
      <EditorialSections blocks={page.blocks} firstHeadingAsH1 />
      <ClosingCta
        eyebrow="Join the movement"
        title="Nurture your body, mind and soul"
        lead="Explore the range Khabonina built — for ladies, for men, and everyone in between."
        primary={{ label: "Shop the range", href: "/shop/" }}
        secondary={{ label: "Why seamoss?", href: "/why-seamoss/" }}
        image="/images/brand/khabo.jpg"
      />
    </>
  );
}
