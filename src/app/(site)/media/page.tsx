import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPage, pageMetadata } from "@/lib/pages";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { ButtonLink } from "@/components/ui/Button";
import { EmagDownloadButton } from "@/components/emag/EmagDownloadButton";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("media");
  if (!page) return {};
  return pageMetadata(page, "The Khanatural digital magazine, press features and gallery — wellness stories from South Africa.");
}

export default async function MediaPage() {
  const [page, issues] = await Promise.all([
    getPage("media"),
    prisma.article.findMany({
      where: { kind: "EMAG_ISSUE", isPublished: true },
      orderBy: { publishedAt: "desc" },
    }),
  ]);
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="Khanatural e-Mag & press" title="Media" image="/images/stock/ocean-aerial.jpg" />
      {issues.length > 0 && (
        <Section tone="kelp" eyebrow="Digital magazine" title="Khanatural e-Mag" align="left">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <li key={issue.id} className="flex flex-col rounded-3xl bg-kelp-800/60 p-6 ring-1 ring-sand-50/10">
                {issue.coverImage && (
                  <Image
                    src={issue.coverImage}
                    alt={`${issue.title} cover`}
                    width={420}
                    height={594}
                    sizes="(max-width: 640px) 90vw, 420px"
                    className="mb-5 w-full rounded-2xl shadow-xl shadow-kelp-950/40"
                  />
                )}
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-sand-50">{issue.title}</h3>
                {issue.excerpt && <p className="mt-2 text-sm leading-relaxed text-sand-200/80">{issue.excerpt}</p>}
                <div className="mt-5 flex flex-wrap gap-3">
                  {issue.downloadUrl && (
                    <ButtonLink href={`/media/emag/${issue.slug}/`} variant="gold" size="sm">
                      Read eMag
                    </ButtonLink>
                  )}
                  {issue.downloadUrl && (
                    <EmagDownloadButton
                      pdfUrl={issue.downloadUrl}
                      issueTitle={issue.title}
                      label="Download"
                      variant="outlineLight"
                      className="!h-9 !px-4 !text-xs"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
      <Container className="py-12 sm:py-16">
        <ContentBlocks blocks={page.blocks} />
      </Container>
    </>
  );
}
