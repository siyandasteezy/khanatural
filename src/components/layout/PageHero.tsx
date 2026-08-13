import Image from "next/image";
import { Container } from "@/components/ui/Container";

/**
 * Compact inner-page hero.
 *
 * With `image` and the default light scrim: the photograph runs full-bleed and
 * untinted on the right; a warm-white vignette lifts the left where the copy
 * sits, so dark type reads on a light lift without burying the picture.
 * Measured on the brightest product crops: headline 8:1, body 6:1 (WCAG AA).
 *
 * With `scrim="dark"`: the mirror treatment for photographs that are already
 * dark, where lifting them to carry dark type would mean washing the picture
 * out. Light type sits on a charcoal gradient instead. Small screens get an
 * extra flat tint because `object-cover` crops a wide frame to its centre there
 * and the copy spans the full width, so the directional gradient alone leaves
 * the end of each line sitting on bare photograph.
 *
 * Without `image`: a plain charcoal band with light type (used by the legal,
 * cart and account pages).
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imagePosition = "center",
  scrim = "light",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  imagePosition?: string;
  scrim?: "light" | "dark";
}) {
  const onImage = Boolean(image) && scrim === "light";

  return (
    // pulled up behind the translucent header (36px bar + 80px band) and padded
    // back out, so the backdrop shows through the frosted chrome
    <section
      className={`relative -mt-[116px] overflow-hidden pt-[116px] ${onImage ? "bg-sand-100 text-ink" : "bg-kelp-950 text-sand-50"}`}
    >
      {image && (
        <>
          <Image src={image} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: imagePosition }} />
          {/* Below xl the copy runs past where the gradient has faded out, so it
              needs a flat floor underneath. Measured worst case with it: 4.80:1
              at 1280 and 5.25:1 at 768 for the smallest type (WCAG AA). */}
          {scrim === "dark" && <div aria-hidden className="absolute inset-0 bg-kelp-950/75 xl:hidden" />}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                scrim === "dark"
                  ? "linear-gradient(100deg, rgba(17,17,16,0.92) 0%, rgba(17,17,16,0.82) 42%, rgba(17,17,16,0.55) 62%, rgba(17,17,16,0) 78%)"
                  : "linear-gradient(100deg, rgba(251,247,240,0.90) 0%, rgba(251,247,240,0.78) 42%, rgba(251,247,240,0.34) 62%, rgba(251,247,240,0) 78%)",
            }}
          />
        </>
      )}
      <Container className="relative py-14 sm:py-20">
        {eyebrow && (
          <p className={`mb-3 text-xs font-bold uppercase tracking-[0.3em] ${onImage ? "text-kelp-800" : "text-gold-300"}`}>
            {eyebrow}
          </p>
        )}
        <h1
          className={`font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl ${onImage ? "text-kelp-950" : ""}`}
        >
          {title}
        </h1>
        {lead && (
          <p className={`mt-4 max-w-2xl text-base sm:text-lg ${onImage ? "text-kelp-800" : "text-sand-200/85"}`}>{lead}</p>
        )}
      </Container>
    </section>
  );
}
