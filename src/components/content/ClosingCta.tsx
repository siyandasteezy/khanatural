import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Closing conversion band for content pages — gives every editorial page a
 * route back into the shop instead of ending on a dead stop.
 */
export function ClosingCta({
  eyebrow,
  title,
  lead,
  primary = { label: "Shop the range", href: "/shop/" },
  secondary,
  image = "/images/stock/skin-unapologetic.jpg",
}: {
  eyebrow: string;
  title: string;
  lead: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-kelp-950 text-sand-50">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-40" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(17,17,16,0.88) 0%, rgba(17,17,16,0.78) 100%)" }}
      />
      <Container className="relative py-16 text-center sm:py-20">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">{eyebrow}</p>
        <h2 className="mx-auto max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-sand-200/85">{lead}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href={primary.href} variant="gold" size="lg">
            {primary.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink
              href={secondary.href}
              variant="outline"
              size="lg"
              className="border-sand-200/60 text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
            >
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </Container>
    </section>
  );
}
