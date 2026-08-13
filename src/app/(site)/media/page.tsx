import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPage, pageMetadata } from "@/lib/pages";
import { POST_KINDS, formatPostDate } from "@/lib/posts";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmagDownloadButton } from "@/components/emag/EmagDownloadButton";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("media");
  if (!page) return {};
  return pageMetadata(page, "The Khanatural digital magazine, press features and gallery — wellness stories from South Africa.");
}

export default async function MediaPage() {
  const [page, issues, posts] = await Promise.all([
    getPage("media"),
    prisma.article.findMany({
      where: { kind: "EMAG_ISSUE", isPublished: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.findMany({
      where: { kind: { in: POST_KINDS }, isPublished: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true },
    }),
  ]);
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="Khanatural e-Mag & press" title="Media" image="/images/shoot/page-media.jpg" />
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
      {/* The blog. Posts are written in the admin (Articles → type "In the
          news" or "Article") and land here the moment they're published. The
          section stays out of the page until there is something in it, rather
          than showing customers an empty heading. */}
      {posts.length > 0 && (
        <Section eyebrow="From the Khanatural desk" title="In the news" align="left">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/media/news/${post.slug}/`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sand-200 transition-shadow hover:shadow-lg"
                >
                  {post.coverImage && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-sand-100">
                      <Image
                        src={post.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
                      <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt)}</time>
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-kelp-900">
                      {post.title}
                    </h3>
                    {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/70">{post.excerpt}</p>}
                    <span className="mt-4 text-sm font-semibold text-kelp-700 group-hover:text-gold-600">Read more →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
