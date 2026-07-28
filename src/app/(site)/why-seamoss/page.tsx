import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, pageMetadata } from "@/lib/pages";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("why-seamoss");
  if (!page) return {};
  return pageMetadata(page, "Why seamoss? Discover the 92 essential minerals, the Khanatural quality promise, and how to use seamoss daily.");
}

export default async function WhySeamossPage() {
  const page = await getPage("why-seamoss");
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="The science and the story" title="Why Seamoss" image="/images/stock/kelp-forest.jpg" />
      <Container className="py-12 sm:py-16">
        <ContentBlocks blocks={page.blocks} />
        <div className="mt-12">
          <ButtonLink href="/shop/" variant="gold" size="lg">
            Buy Seamoss
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
