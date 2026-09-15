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
      {/* The whole upright frame, cropped by the band rather than before it.
          The tub sits low — the bottom quarter of the photograph — so the wide
          desktop band stays down there and keeps the framing this hero has
          always had. The phone band shows two thirds of the frame, so it lifts
          to bring her face in above the product.

          It cannot bring in all of her: face and tub span 21%-92% of the frame
          and the phone window holds 66%, so something has to give. Lifting far
          enough to clear her face of the header starts clipping the bottom of
          the tub, and on a shop page the product loses that argument. This is
          the highest it goes with the tub still whole. */}
      <PageHero
        eyebrow="Khashop"
        title="Shop"
        lead="Your trusted source for naturally made products. Nurture your body, mind and soul; khaNaturally."
        image="/images/shoot/page-shop.jpg"
        positionClass="object-[center_70%] sm:object-[center_90%]"
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
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      </Container>
    </>
  );
}
