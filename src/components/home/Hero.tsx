import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Split hero: the copy lives on its own charcoal panel and the photograph is
 * shown completely clean — no scrim, no tint, nothing layered over it. Both
 * halves run up behind the translucent header (36px bar + 80px band), so the
 * frosted chrome reads against real content.
 */
export function Hero() {
  return (
    <section className="relative -mt-[116px] bg-kelp-950 text-sand-50">
      <div className="grid lg:min-h-[42rem] lg:grid-cols-[1fr_1.05fr]">
        {/* Photograph — first on mobile so it sits under the header. The top
            padding is the header offset, keeping the subject clear of it. */}
        <div className="relative order-1 min-h-[24rem] pt-[116px] sm:min-h-[30rem] lg:order-2 lg:min-h-full lg:pt-0">
          <Image
            src="/images/stock/skin-sunlight.jpg"
            alt="A woman with her face turned up to the sunlight, eyes closed"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover object-[60%_center]"
          />
        </div>

        {/* Copy panel */}
        <div className="order-2 flex items-center lg:order-1 lg:pt-[116px]">
          <div className="w-full px-6 py-14 sm:px-10 sm:py-16 lg:py-24 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-14">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-gold-300">Welcome to</p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Khanatural Shop
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sand-200/95">
              Your go-to destination for the finest, nutrient-rich seamoss products. Harnessing the ancient wisdom of the
              ocean, our seamoss is sustainably harvested and packed with essential vitamins, minerals and antioxidants to
              boost your health.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
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
        </div>
      </div>
    </section>
  );
}
