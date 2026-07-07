import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, pageMetadata } from "@/lib/pages";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ContentBlocks } from "@/components/content/ContentBlocks";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("legal-notice");
  if (!page) return {};
  return pageMetadata(page, "Khanatural terms & conditions, cookie policy, PAIA manual and POPI Act information.");
}

export default async function LegalNoticePage() {
  const page = await getPage("legal-notice");
  if (!page) notFound();

  return (
    <>
      <PageHero title="Legal Notice" lead="Terms & Conditions, Privacy, Cookie Policy, PAIA Manual and POPI Act." />
      <Container className="py-12 sm:py-16">
        <ContentBlocks blocks={page.blocks} />
      </Container>
    </>
  );
}
