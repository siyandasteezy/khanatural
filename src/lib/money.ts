/** Prices are stored in cents (ZAR minor units), matching the WooCommerce export. */
export function formatZar(cents: number): string {
  const rands = cents / 100;
  const formatted = new Intl.NumberFormat("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rands);
  return `R${formatted}`;
}

/** Flat national delivery fee shown on the original site: "R120 for delivery in S.A." */
export const DELIVERY_FEE_CENTS = 12000;
