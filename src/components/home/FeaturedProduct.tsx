import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Price } from "@/components/ui/Price";
import { RatingStars } from "@/components/ui/RatingStars";
import { AddToCartButton } from "@/components/product/AddToCartButton";

export type FeaturedProductData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  priceCents: number;
  regularPriceCents: number;
  onSale: boolean;
  inStock: boolean;
  averageRating: number;
  reviewCount: number;
  images: { url: string; alt: string }[];
};

/**
 * Editorial spotlight for a single product — the hero product moment the old
 * site had. Product copy is rendered verbatim from the catalogue.
 */
export function FeaturedProduct({ product }: { product: FeaturedProductData | null }) {
  if (!product) return null;
  const image = product.images[0];

  return (
    <section className="bg-sand-100 py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* warm halo so the photograph lifts off the cream band */}
            <div aria-hidden className="absolute -inset-6 rounded-[3rem] bg-gold-500/15 blur-2xl" />
            {image && (
              <Image
                src={image.url}
                alt={image.alt || product.name}
                width={900}
                height={1200}
                sizes="(max-width: 1024px) 92vw, 576px"
                className="relative aspect-[3/4] w-full rounded-[2rem] object-cover shadow-2xl shadow-kelp-950/25"
              />
            )}
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Featured product</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-kelp-900 sm:text-4xl">
              {product.name}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Price
                priceCents={product.priceCents}
                regularPriceCents={product.regularPriceCents}
                onSale={product.onSale}
                className="text-2xl"
              />
              <RatingStars rating={product.averageRating} count={product.reviewCount} />
            </div>

            {/* first paragraph of the migrated copy is the product name in bold,
                which the heading above already states — hidden to avoid the echo */}
            <div
              className="prose-migrated mt-5 max-w-xl [&>p:first-child]:hidden"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />

            <div className="mt-8 flex flex-wrap gap-4">
              <AddToCartButton
                product={{
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  priceCents: product.priceCents,
                  image: image?.url ?? null,
                  inStock: product.inStock,
                }}
                size="lg"
              />
              <ButtonLink href={`/product/${product.slug}/`} variant="outline" size="lg">
                View product
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
