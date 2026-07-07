export function RatingStars({ rating, count }: { rating: number; count?: number }) {
  if (!rating) return null;
  const label = count ? `Rated ${rating} out of 5 from ${count} review${count === 1 ? "" : "s"}` : `Rated ${rating} out of 5`;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={label} title={label}>
      <span aria-hidden className="text-gold-500 tracking-tight text-sm">
        {"★".repeat(Math.round(rating))}
        <span className="text-sand-300">{"★".repeat(5 - Math.round(rating))}</span>
      </span>
      {count ? <span className="text-xs text-ink/50">({count})</span> : null}
    </span>
  );
}
