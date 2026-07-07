import { Container } from "@/components/ui/Container";

/** Compact dark hero used on inner pages. */
export function PageHero({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <section className="bg-kelp-950 text-sand-50">
      <Container className="py-14 sm:py-20">
        {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">{eyebrow}</p>}
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-base text-sand-200/85 sm:text-lg">{lead}</p>}
      </Container>
    </section>
  );
}
