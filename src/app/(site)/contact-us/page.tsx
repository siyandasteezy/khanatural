import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { getPage, pageMetadata } from "@/lib/pages";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ContentBlocks } from "@/components/content/ContentBlocks";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("contact-us");
  if (!page) return {};
  return pageMetadata(page, "Get in touch with Khanatural — email us or visit us in Jeffrey’s Bay, Eastern Cape.");
}

const contactCards = [
  {
    heading: "Email",
    body: "We reply within a business day",
    detail: site.email,
    href: `mailto:${site.email}`,
  },
  {
    heading: "Visit",
    body: `${site.address.street}, ${site.address.city}`,
    detail: `${site.address.province}, ${site.address.country}, ${site.address.postalCode}`,
    href: "https://maps.google.com/?q=02+Francis+Road,+Jeffreys+Bay,+6330",
    external: true,
  },
];

export default async function ContactPage() {
  const page = await getPage("contact-us");
  if (!page) notFound();

  return (
    <>
      {/* A face, and a laughing one, under "We'd love to hear from you" — the
          frame this page used to open on was a tray of beard products, and the
          same photograph already opens Our Brand.

          Desktop sits on the smile, with her eyes just clear of the translucent
          header. Phones show two thirds of the frame, so they lift to bring the
          laurel crown in above her. */}
      <PageHero
        eyebrow="We’d love to hear from you"
        title="Contact Us"
        image="/images/shoot/honey-joy.jpg"
        positionClass="object-[center_15%] sm:object-[center_45%]"
      />
      <Container className="py-12 sm:py-16">
        <ul className="grid gap-4 sm:grid-cols-2">
          {contactCards.map((c) => (
            <li key={c.heading}>
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200 transition-shadow hover:shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{c.heading}</span>
                <span className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">{c.body}</span>
                <span className="mt-2 text-sm text-ink/60">{c.detail}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <ContentBlocks blocks={page.blocks} fallbackAlt="Contact Khanatural" />
        </div>
      </Container>
    </>
  );
}
