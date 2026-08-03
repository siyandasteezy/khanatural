import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Full-bleed hero on the brand's own honey shoot. The photograph runs edge to
 * edge; the only treatment is a soft, warm-white vignette that lifts the ochre
 * negative space on the left where the copy sits and fades to nothing by ~58%,
 * leaving the honey-lit face untouched. Dark type on a light lift — airy, not a
 * panel. Measured composite behind the text: headline 7.9:1, body 5.9:1 (AA).
 */
export function Hero() {
  return (
    <section className="relative -mt-[116px] overflow-hidden bg-sand-100 pt-[116px] text-ink">
      <Image
        src="/images/shoot/hero-honey.jpg"
        alt="A laughing woman wearing gold hoop earrings, honey glistening on her skin"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[78%_center] lg:object-[72%_center]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(251,247,240,0.90) 0%, rgba(251,247,240,0.80) 30%, rgba(251,247,240,0.45) 46%, rgba(251,247,240,0) 58%)",
        }}
      />

      <Container className="relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-md lg:max-w-lg">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-kelp-800">Welcome to</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.03] text-kelp-950 sm:text-6xl lg:text-7xl">
            Khanatural Shop
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-kelp-800 sm:text-lg">
            Your go-to destination for the finest, nutrient-rich seamoss products. Harnessing the ancient wisdom of the ocean,
            our seamoss is sustainably harvested and packed with essential vitamins, minerals and antioxidants to boost your
            health.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href="/shop/" variant="gold" size="lg">
              Buy Seamoss
            </ButtonLink>
            <ButtonLink href="/media/" variant="outline" size="lg">
              View eMag
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
