import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildMetadata, breadcrumbJsonLd, jsonLd } from "@/lib/seo";
import { getPublishedProducts, getShopCategories } from "@/lib/products";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ where: { slug: { not: "uncategorised" } }, select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};
  return buildMetadata({
    title: category.seoTitle ?? category.name,
    description:
      category.seoDescription ??
      category.description ??
      `Shop the Khanatural ${category.name} range of natural seamoss and wellness products.`,
    path: `/product-category/${slug}/`,
  });
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || slug === "uncategorised") notFound();

  const [products, categories] = await Promise.all([getPublishedProducts(slug), getShopCategories()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop/" },
              { name: category.name, path: `/product-category/${slug}/` },
            ]),
          ),
        }}
      />
      <PageHero eyebrow="Shop by range" title={category.name} lead={category.description || undefined} />
      <Container className="py-12 sm:py-16">
        <nav aria-label="Product categories" className="mb-10 flex flex-wrap gap-3">
          <ButtonLink href="/shop/" variant="outline" size="sm">
            All products
          </ButtonLink>
          {categories.map((c) => (
            <ButtonLink
              key={c.slug}
              href={`/product-category/${c.slug}/`}
              variant={c.slug === slug ? "primary" : "outline"}
              size="sm"
              aria-current={c.slug === slug ? "page" : undefined}
            >
              {c.name}
            </ButtonLink>
          ))}
        </nav>
        {products.length === 0 ? (
          <p className="text-ink/60">No products in this range yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
