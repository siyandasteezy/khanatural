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
  // the founder portrait the page itself opens on, rather than a stray frame
  image: "/images/shoot/our-brand-founder.jpg",
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
      {/* The whole upright frame, cropped by the band rather than before it.
          Desktop shows a quarter of its height, so it is positioned on the
          products in his hands — the framing this banner has always had. The
          phone band is nearly square and shows two thirds, so it starts at the
          top and his face comes with them.

          The middle step is not decoration: at tablet widths the band shows
          only the top 43-46% of the frame, which stops just as the products
          begin, so object-top there would cut them in half. */}
      <PageBanner
        image="/images/shoot/page-brand-grooming.jpg"
        positionClass="object-top sm:object-[center_35%] lg:object-[center_49%]"
      />
      {/* The founder portrait was shot on a warm terracotta seamless, so the
          section takes that colour and the photograph meets the page instead of
          sitting on it as a cut-out. */}
      <EditorialSections
        blocks={page.blocks}
        firstHeadingAsH1
        sectionBackgrounds={{ "our-founder": "#e3a871" }}
      />
      <ClosingCta
        eyebrow="Join the movement"
        title="Nurture your body, mind and soul"
        lead="Explore the range Khabonina built — for ladies, for men, and everyone in between."
        primary={{ label: "Shop the range", href: "/shop/" }}
        secondary={{ label: "Why seamoss?", href: "/why-seamoss/" }}
        image="/images/shoot/beach-bag-leap.jpg"
      />
    </>
  );
}
