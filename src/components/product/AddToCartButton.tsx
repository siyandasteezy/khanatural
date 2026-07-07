"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";

type ProductInput = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  inStock: boolean;
};

export function AddToCartButton({
  product,
  quantity = 1,
  size = "md",
  className = "",
}: {
  product: ProductInput;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (!product.inStock) {
    return (
      <Button size={size} className={className} disabled>
        Out of stock
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={className}
      onClick={() => {
        addItem(
          {
            productId: product.productId,
            slug: product.slug,
            name: product.name,
            priceCents: product.priceCents,
            image: product.image,
          },
          quantity,
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Added ✓" : "Add to basket"}
    </Button>
  );
}
