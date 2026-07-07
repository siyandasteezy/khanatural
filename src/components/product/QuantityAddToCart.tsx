"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";

type ProductInput = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  inStock: boolean;
};

export function QuantityAddToCart({ product }: { product: ProductInput }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {product.inStock && (
        <div className="inline-flex h-12 items-center rounded-full border border-sand-300 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-12 w-12 rounded-l-full text-lg font-semibold text-kelp-900 hover:bg-sand-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-bold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className="h-12 w-12 rounded-r-full text-lg font-semibold text-kelp-900 hover:bg-sand-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}
      <AddToCartButton product={product} quantity={quantity} size="lg" className="flex-1 sm:flex-none" />
    </div>
  );
}
