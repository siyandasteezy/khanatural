import { formatZar } from "@/lib/money";

export function Price({
  priceCents,
  regularPriceCents,
  onSale,
  className = "",
}: {
  priceCents: number;
  regularPriceCents: number;
  onSale: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      {onSale && regularPriceCents > priceCents && (
        <s className="text-sm text-ink/40">{formatZar(regularPriceCents)}</s>
      )}
      <span className="font-semibold text-kelp-900">{formatZar(priceCents)}</span>
    </span>
  );
}
