import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { RatingStars } from "@/components/ui/RatingStars";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  regularPriceCents: number;
  onSale: boolean;
  inStock: boolean;
  averageRating: number;
  reviewCount: number;
  images: { url: string; alt: string }[];
};

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const image = product.images[0];
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-sand-200 transition-shadow hover:shadow-xl">
      <Link href={`/product/${product.slug}/`} className="absolute inset-0 z-10" aria-label={product.name} />
      <div className="relative aspect-square overflow-hidden bg-sand-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.onSale && <Badge tone="sale">Sale</Badge>}
          {!product.inStock && <Badge tone="out">Out of stock</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
        <h3 className="font-[family-name:var(--font-display)] text-base font-semibold leading-snug text-kelp-900 group-hover:text-kelp-700">
          {product.name}
        </h3>
        <RatingStars rating={product.averageRating} count={product.reviewCount} />
        <Price
          priceCents={product.priceCents}
          regularPriceCents={product.regularPriceCents}
          onSale={product.onSale}
          className="mt-auto pt-1"
        />
      </div>
    </article>
  );
}
