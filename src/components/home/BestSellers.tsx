import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";

const categoryLinks = [
  { label: "Ladies", href: "/product-category/ladies/" },
  { label: "Men", href: "/product-category/mens-range/" },
  { label: "Unisex", href: "/product-category/unisex/" },
];

export function BestSellers({ products }: { products: ProductCardData[] }) {
  return (
    <Section
      eyebrow="Naturally made"
      title="Shop Our Best Sellers"
      lead="Your trusted source for naturally made products. Nurture your body, mind and soul; khaNaturally."
    >
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {categoryLinks.map((c) => (
          <ButtonLink key={c.href} href={c.href} variant="outline" size="sm">
            {c.label}
          </ButtonLink>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <ButtonLink href="/shop/" size="lg">
          View all products
        </ButtonLink>
      </div>
    </Section>
  );
}
