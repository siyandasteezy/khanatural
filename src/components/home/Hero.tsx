import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Founder hero on shoot frame 1520 (portrait 2:3).
 *
 * Mobile stacks it: the portrait is a full-bleed banner up top (uncropped
 * through crown and face), the copy sits on solid charcoal beneath — clean
 * contrast, whole image shown. Desktop goes full-bleed overlay: the image
 * fills the section edge to edge and the copy rides a left-weighted gradient
 * that clears by 60%, leaving the crown, honey and face untouched. Measured
 * behind the desktop text: headline 9.7:1, body 7.4:1 (WCAG AA).
 */
export function Hero() {
  return (
    <section className="relative -mt-[116px] bg-kelp-950 text-sand-50 lg:flex lg:min-h-[48rem] lg:flex-col lg:justify-end lg:overflow-hidden lg:pt-[116px]">
      {/* Photograph — a banner on mobile, a full-bleed fill on desktop */}
      <div className="relative h-[62vh] min-h-[24rem] pt-[116px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0 lg:pt-0">
        <Image
          src="/images/shoot/hero-goddess.jpg"
          alt="Founder Khabonina Qubeka wearing a gold laurel crown as honey is drizzled over her, with the KhaHoney range"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%] lg:object-[center_25%]"
        />
        {/* desktop-only left lift, off the face */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(100deg, rgba(20,14,6,0.94) 0%, rgba(20,14,6,0.86) 30%, rgba(20,14,6,0.48) 46%, rgba(20,14,6,0) 60%)",
          }}
        />
      </div>

      <Container className="relative py-14 sm:py-16 lg:py-24">
        <div className="max-w-md lg:max-w-lg">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-gold-300">Welcome to</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.03] sm:text-6xl lg:text-7xl">
            Khanatural Shop
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-sand-100/95 sm:text-lg">
            Your go-to destination for the finest, nutrient-rich seamoss products. Harnessing the ancient wisdom of the ocean,
            our seamoss is sustainably harvested and packed with essential vitamins, minerals and antioxidants to boost your
            health.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ButtonLink href="/shop/" variant="gold" size="lg">
              Buy Seamoss
            </ButtonLink>
            <ButtonLink
              href="/media/"
              variant="outline"
              size="lg"
              className="border-sand-200/60 text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
            >
              View eMag
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
