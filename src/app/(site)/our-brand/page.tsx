import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, pageMetadata } from "@/lib/pages";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ContentBlocks } from "@/components/content/ContentBlocks";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("our-brand");
  if (!page) return {};
  return pageMetadata(page, "Meet Khanatural — our founder, our story, and the promise behind every product.");
}

export default async function OurBrandPage() {
  const page = await getPage("our-brand");
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="Rooted in realness" title="Our Brand" image="/images/brand/khabo.jpg" imagePosition="center 20%" />
      <Container className="py-12 sm:py-16">
        <ContentBlocks blocks={page.blocks} />
      </Container>
    </>
  );
}
