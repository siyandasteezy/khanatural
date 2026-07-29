import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Editorial split hero. The copy sits on cream with charcoal type — the
 * palette the logo itself uses — and the photograph fills its own half and
 * bleeds off the right edge. Nothing is layered over the picture, and a
 * portrait frame is used so the subject is never cropped through the face.
 */
export function Hero() {
  return (
    <section className="relative -mt-[116px] bg-sand-50 text-ink">
      <div className="grid lg:min-h-[42rem] lg:grid-cols-[minmax(0,47%)_1fr]">
        {/* Photograph — first on mobile so it sits under the frosted header */}
        <div className="relative order-1 min-h-[26rem] pt-[116px] sm:min-h-[32rem] lg:order-2 lg:min-h-full lg:pt-0">
          <Image
            src="/images/shoot/honey-joy.jpg"
            alt="A laughing woman wearing a gold laurel crown, honey glistening on her skin"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 53vw"
            className="object-cover object-[50%_22%] lg:object-[50%_28%]"
          />
        </div>

        {/* Copy */}
        <div className="order-2 flex items-center lg:order-1 lg:pt-[116px]">
          <div className="w-full px-6 py-14 sm:px-10 sm:py-20 lg:py-24 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-16">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-gold-700">Welcome to</p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.02] text-kelp-950 sm:text-6xl lg:text-[4.25rem]">
              Khanatural
              <span className="block text-gold-600">Shop</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-kelp-700 sm:text-lg">
              Your go-to destination for the finest, nutrient-rich seamoss products. Harnessing the ancient wisdom of the
              ocean, our seamoss is sustainably harvested and packed with essential vitamins, minerals and antioxidants to
              boost your health.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/shop/" variant="gold" size="lg">
                Buy Seamoss
              </ButtonLink>
              <ButtonLink href="/media/" variant="outline" size="lg">
                View eMag
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
