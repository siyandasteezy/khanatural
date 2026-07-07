import type { ReactNode } from "react";

const tones = {
  sale: "bg-gold-500 text-kelp-950",
  out: "bg-ink/70 text-sand-50",
  kelp: "bg-kelp-100 text-kelp-800",
} as const;

export function Badge({ tone = "kelp", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}
