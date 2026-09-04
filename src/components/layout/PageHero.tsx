import Image from "next/image";
import { Container } from "@/components/ui/Container";

/**
 * Inner-page hero.
 *
 * With `image`: the photograph gets a full-bleed band to itself, completely
 * untinted, and the copy sits beneath it on the page background. Nothing is
 * laid over the picture — which is the point, and it also removes the contrast
 * problem that scrims existed to solve. Dark type on the light page ground
 * clears WCAG AA everywhere with no measuring per photograph.
 *
 * Without `image`: a plain charcoal band with light type (used by the legal,
 * cart, checkout and account pages).
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
  /** which part of the frame to keep when the band crops it */
  imagePosition?: string;
}) {
  if (!image) {
    return (
      // pulled up behind the translucent header (36px bar + 80px band) and
      // padded back out, so the backdrop shows through the frosted chrome
      <section className="relative -mt-[116px] bg-kelp-950 pt-[116px] text-sand-50">
        <Container className="py-14 sm:py-20">
          <Copy eyebrow={eyebrow} title={title} lead={lead} tone="dark" />
        </Container>
      </section>
    );
  }

  return (
    <>
      <PageBanner image={image} imagePosition={imagePosition} />
      <Container className="pb-4 pt-10 sm:pt-14">
        <Copy eyebrow={eyebrow} title={title} lead={lead} tone="light" />
      </Container>
    </>
  );
}

/**
 * The photograph on its own, for pages whose opening heading belongs to the
 * content rather than to a hero — Our Brand leads straight into "Our Founder".
 *
 * Sized generously and pulled under the header so the picture starts at the
 * very top of the page.
 */
export function PageBanner({ image, imagePosition = "center" }: { image: string; imagePosition?: string }) {
  return (
    <div className="relative -mt-[116px] h-[46vh] min-h-[17rem] w-full overflow-hidden bg-sand-100 sm:h-[52vh] lg:h-[58vh] lg:max-h-[34rem]">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: imagePosition }}
      />
    </div>
  );
}

function Copy({
  eyebrow,
  title,
  lead,
  tone,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  tone: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <>
      {eyebrow && (
        <p className={`mb-3 text-xs font-bold uppercase tracking-[0.3em] ${dark ? "text-gold-300" : "text-gold-700"}`}>
          {eyebrow}
        </p>
      )}
      <h1
        className={`font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl ${
          dark ? "" : "text-kelp-950"
        }`}
      >
        {title}
      </h1>
      {lead && (
        <p className={`mt-4 max-w-2xl text-base sm:text-lg ${dark ? "text-sand-200/85" : "text-ink/75"}`}>{lead}</p>
      )}
    </>
  );
}
