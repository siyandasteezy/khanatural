import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, pageMetadata } from "@/lib/pages";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ContentBlocks } from "@/components/content/ContentBlocks";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("privacy-policy");
  if (!page) return {};
  return pageMetadata(page, "How Khanatural collects, uses and protects your personal information.");
}

export default async function PrivacyPolicyPage() {
  const page = await getPage("privacy-policy");
  if (!page) notFound();

  return (
    <>
      <PageHero title="Privacy Policy" />
      <Container className="py-12 sm:py-16">
        <ContentBlocks blocks={page.blocks} />
      </Container>
    </>
  );
}
