import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { buildMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { productCardSelect } from "@/lib/products";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantityAddToCart } from "@/components/product/QuantityAddToCart";
import { ProductCard } from "@/components/product/ProductCard";
import { Section } from "@/components/ui/Section";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ where: { isPublished: true }, select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

function plainText(html: string, max = 155): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  if (!product) return {};
  return buildMetadata({
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? plainText(product.shortDescription || product.description),
    path: `/product/${slug}/`,
    image: product.images[0]?.url ?? null,
  });
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: true,
      tags: { take: 8 },
    },
  });
  if (!product || !product.isPublished) notFound();

  const primaryCategory = product.categories.find((c) => c.slug !== "uncategorised");
  const related = await prisma.product.findMany({
    where: {
      isPublished: true,
      id: { not: product.id },
      ...(primaryCategory ? { categories: { some: { slug: primaryCategory.slug } } } : {}),
    },
    take: 4,
    orderBy: [{ inStock: "desc" }, { reviewCount: "desc" }],
    select: productCardSelect,
  });

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku ?? undefined,
    image: product.images.map((i) => `${site.url}${i.url}`),
    description: plainText(product.shortDescription || product.description, 500),
    brand: { "@type": "Brand", name: "KhaNatural" },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.averageRating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${site.url}/product/${product.slug}/`,
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop/" },
    ...(primaryCategory ? [{ name: primaryCategory.name, path: `/product-category/${primaryCategory.slug}/` }] : []),
    { name: product.name, path: `/product/${product.slug}/` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd(crumbs)) }} />

      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-ink/50">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                {i < crumbs.length - 1 ? (
                  <Link href={c.path} className="hover:text-kelp-700">
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-semibold text-kelp-900">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images.map((i) => ({ url: i.url, alt: i.alt }))} name={product.name} />

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {product.onSale && <Badge tone="sale">Sale</Badge>}
              {!product.inStock && <Badge tone="out">Out of stock</Badge>}
              {primaryCategory && <Badge>{primaryCategory.name}</Badge>}
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-kelp-900 sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3">
              <RatingStars rating={product.averageRating} count={product.reviewCount} />
            </div>
            <Price
              priceCents={product.priceCents}
              regularPriceCents={product.regularPriceCents}
              onSale={product.onSale}
              className="mt-4 text-2xl"
            />

            {product.shortDescription && (
              <div className="prose-migrated mt-6" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
            )}

            <div className="mt-8">
              <QuantityAddToCart
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  image: product.images[0]?.url ?? null,
                  inStock: product.inStock,
                }}
              />
            </div>

            <dl className="mt-8 space-y-2 border-t border-sand-200 pt-6 text-sm">
              {product.sku && (
                <div className="flex gap-2">
                  <dt className="font-semibold text-kelp-900">SKU:</dt>
                  <dd className="text-ink/60">{product.sku}</dd>
                </div>
              )}
              <div className="flex gap-2">
                <dt className="font-semibold text-kelp-900">Delivery:</dt>
                <dd className="text-ink/60">R120 for delivery in S.A.</dd>
              </div>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <dt className="sr-only">Tags</dt>
                  {product.tags.map((t) => (
                    <dd key={t.slug} className="rounded-full bg-sand-100 px-3 py-1 text-xs text-ink/60">
                      {t.name}
                    </dd>
                  ))}
                </div>
              )}
            </dl>
          </div>
        </div>

        {product.description && product.description !== product.shortDescription && (
          <div className="mt-16 max-w-3xl">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-kelp-900">Description</h2>
            <div className="prose-migrated mt-4" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}
      </Container>

      {related.length > 0 && (
        <Section tone="cream" eyebrow="You may also like" title="More from the range">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
