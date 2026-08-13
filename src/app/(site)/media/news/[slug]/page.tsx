import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { POST_KINDS, formatPostDate } from "@/lib/posts";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await prisma.article.findMany({
    where: { kind: { in: POST_KINDS }, isPublished: true },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.article.findUnique({ where: { slug } });
  if (!post || !POST_KINDS.includes(post.kind)) return {};
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || `${post.title} — news from Khanatural.`,
    path: `/media/news/${slug}/`,
    image: post.coverImage ?? undefined,
    type: "article",
  });
}

export default async function NewsPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await prisma.article.findUnique({ where: { slug } });
  if (!post || !POST_KINDS.includes(post.kind) || !post.isPublished) notFound();

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: post.title,
            description: post.excerpt || undefined,
            image: post.coverImage ? `${site.url}${post.coverImage}` : undefined,
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Organization", name: site.name },
            publisher: {
              "@type": "Organization",
              name: site.name,
              logo: { "@type": "ImageObject", url: `${site.url}/images/brand/logo.png` },
            },
            mainEntityOfPage: `${site.url}/media/news/${slug}/`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Media", path: "/media/" },
              { name: post.title, path: `/media/news/${slug}/` },
            ]),
          ),
        }}
      />

      {/* pulled up behind the translucent header and padded back out */}
      <header className="relative -mt-[116px] bg-kelp-950 pt-[116px] text-sand-50">
        <Container className="py-12 sm:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">In the news</p>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-sand-200/70">
            <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt)}</time>
          </p>
        </Container>
      </header>

      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt=""
              width={1200}
              height={675}
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="mb-10 h-auto w-full rounded-3xl object-cover shadow-sm ring-1 ring-sand-200"
            />
          )}
          {post.excerpt && <p className="mb-8 text-lg leading-relaxed text-ink/80">{post.excerpt}</p>}
          {post.content && <div className="prose-migrated" dangerouslySetInnerHTML={{ __html: post.content }} />}

          <div className="mt-12 border-t border-sand-200 pt-8">
            <ButtonLink href="/media/" variant="outline" size="sm">
              ← Back to Media
            </ButtonLink>
          </div>
        </div>
      </Container>
    </article>
  );
}
