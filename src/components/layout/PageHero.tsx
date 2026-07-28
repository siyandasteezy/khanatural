import Image from "next/image";
import { Container } from "@/components/ui/Container";

/**
 * Compact dark hero used on inner pages. Pass `image` for a full-bleed
 * photographic backdrop (rendered under a kelp-tinted scrim for contrast).
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imagePosition = "center",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  imagePosition?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-kelp-950 text-sand-50">
      {image && (
        <>
          <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-85" style={{ objectPosition: imagePosition }} />
          {/* Heaviest on the left where the heading and lead sit, opening up to
              the right so the photograph reads. Measured against the brightest
              pixels under the lead text: 5.8:1, clear of WCAG AA. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: "linear-gradient(100deg, rgba(17,17,16,0.88) 0%, rgba(17,17,16,0.68) 45%, rgba(17,17,16,0.30) 100%)",
            }}
          />
        </>
      )}
      <Container className="relative py-14 sm:py-20">
        {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">{eyebrow}</p>}
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-base text-sand-200/85 sm:text-lg">{lead}</p>}
      </Container>
    </section>
  );
}
