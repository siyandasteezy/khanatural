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
          <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-50" style={{ objectPosition: imagePosition }} />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: "linear-gradient(100deg, rgba(13,32,26,0.92) 0%, rgba(13,32,26,0.65) 55%, rgba(13,32,26,0.35) 100%)",
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
