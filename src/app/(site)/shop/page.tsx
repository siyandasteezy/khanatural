import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPublishedProducts, getShopCategories } from "@/lib/products";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Shop", // renders as "Shop – Khanatural Shop", matching the original title
  description:
    "Shop the full Khanatural range — seamoss gels, superfoods, natural skincare, soaps and grooming for ladies, men and everyone in between.",
  path: "/shop/",
});

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getPublishedProducts(), getShopCategories()]);

  return (
    <>
      <PageHero
        eyebrow="Khashop"
        title="Shop"
        lead="Your trusted source for naturally made products. Nurture your body, mind and soul; khaNaturally."
        image="/images/stock/skin-golden.jpg"
      />
      <Container className="py-12 sm:py-16">
        <nav aria-label="Product categories" className="mb-10 flex flex-wrap gap-3">
          <ButtonLink href="/shop/" variant="primary" size="sm" aria-current="page">
            All products
          </ButtonLink>
          {categories.map((c) => (
            <ButtonLink key={c.slug} href={`/product-category/${c.slug}/`} variant="outline" size="sm">
              {c.name}
            </ButtonLink>
          ))}
        </nav>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      </Container>
    </>
  );
}
