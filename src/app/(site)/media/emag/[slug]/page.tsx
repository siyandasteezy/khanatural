import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { FlipbookViewer } from "@/components/emag/FlipbookViewer";
import { EmagDownloadButton } from "@/components/emag/EmagDownloadButton";
import { EmagSubscribeInline } from "@/components/emag/EmagSubscribeInline";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const issues = await prisma.article.findMany({
    where: { kind: "EMAG_ISSUE", isPublished: true, downloadUrl: { not: null } },
    select: { slug: true },
  });
  return issues.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const issue = await prisma.article.findUnique({ where: { slug } });
  if (!issue) return {};
  return buildMetadata({
    title: issue.seoTitle ?? `Read ${issue.title}`,
    description: issue.seoDescription ?? issue.excerpt ?? `Read ${issue.title} online — flip through the Khanatural digital magazine.`,
    path: `/media/emag/${slug}/`,
    image: issue.coverImage,
    type: "article",
  });
}

export default async function EmagReaderPage({ params }: Params) {
  const { slug } = await params;
  const issue = await prisma.article.findUnique({ where: { slug } });
  if (!issue || issue.kind !== "EMAG_ISSUE" || !issue.isPublished || !issue.downloadUrl) notFound();

  return (
    <section className="bg-kelp-950 text-sand-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Media", path: "/media/" },
              { name: issue.title, path: `/media/emag/${slug}/` },
            ]),
          ),
        }}
      />
      <Container className="py-12 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">Khanatural e-Mag</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">{issue.title}</h1>
          </div>
          <div className="flex gap-3">
            <ButtonLink
              href="/media/"
              variant="outline"
              size="sm"
              className="border-sand-200/50 text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
            >
              ← All issues
            </ButtonLink>
            <EmagDownloadButton
              pdfUrl={issue.downloadUrl}
              issueTitle={issue.title}
              label="Download PDF"
              className="!h-9 !px-4 !text-xs"
            />
          </div>
        </div>

        {/* Ingested issues carry pre-rendered pages at /emag/<slug>/pNNN.webp, so
            the reader opens without pulling the PDF down first. */}
        <FlipbookViewer
          pdfUrl={issue.downloadUrl}
          title={issue.title}
          pages={
            issue.pageCount
              ? Array.from(
                  { length: issue.pageCount },
                  (_, i) => `/emag/${slug}/p${String(i + 1).padStart(3, "0")}.webp`,
                )
              : undefined
          }
        />
        <EmagSubscribeInline />
      </Container>
    </section>
  );
}
