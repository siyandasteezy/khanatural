"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/**
 * Empties the basket once the customer reaches the confirmation page.
 *
 * The old flow cleared it the moment the order POST returned, but with Yoco the
 * customer leaves for a hosted page and may come back having cancelled — so the
 * basket has to survive the round trip and only clear here, on the way out.
 */
export function ClearCartOnMount() {
  const { items, clear } = useCart();

  useEffect(() => {
    if (items.length > 0) clear();
  }, [items.length, clear]);

  return null;
}
