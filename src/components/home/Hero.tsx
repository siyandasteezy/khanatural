import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Full-bleed hero on the brand's own campaign photography. The copy sits in a
 * defined charcoal panel rather than on the picture: measured across the
 * shoot, no frame has negative space clean enough to carry a headline (the
 * best candidate still dipped to 2.5:1 against its own product label), so the
 * panel guarantees contrast while the photograph runs edge to edge, untinted.
 */
export function Hero() {
  return (
    <section className="relative -mt-[116px] overflow-hidden bg-kelp-950 pt-[116px] text-sand-50">
      <Image
        src="/images/shoot/coco-avo-joy.jpg"
        alt="A smiling woman holding KhaNatural Coco Avo Butter, with fresh coconut and avocado"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_22%] lg:object-[62%_18%]"
      />

      <Container className="relative py-12 sm:py-16 lg:py-24">
        <div className="max-w-xl rounded-[2rem] bg-kelp-950/90 p-8 shadow-2xl shadow-kelp-950/40 ring-1 ring-sand-50/10 backdrop-blur-md sm:p-10 lg:max-w-lg lg:p-12">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-gold-300">Welcome to</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
            Khanatural Shop
          </h1>
          <p className="mt-5 text-base leading-relaxed text-sand-200/95 sm:text-lg">
            Your go-to destination for the finest, nutrient-rich seamoss products. Harnessing the ancient wisdom of the ocean,
            our seamoss is sustainably harvested and packed with essential vitamins, minerals and antioxidants to boost your
            health.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
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
