import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    // pulled up behind the translucent header (36px bar + 80px band) and padded
    // back out, so the photography shows through the frosted chrome
    <section className="relative -mt-[116px] overflow-hidden bg-kelp-950 pt-[116px] text-sand-50">
      {/* Sunlit kelp forest — the ocean the seamoss comes from, at full
          strength. Mobile crops to the photo's darkest slice (far left) so the
          scrim over the copy can stay as light as possible; desktop shows the
          bright fronds on the right. */}
      <Image
        src="/images/stock/kelp-forest.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[0%_center] lg:object-[70%_center]"
      />

      {/* Legibility scrim, kept off the photograph as much as possible.
          On desktop it is anchored to the text column and clears completely
          by 70% of the width, leaving the right third of the kelp untouched.
          On mobile it is anchored in PIXELS to the text band (which starts at
          a fixed offset under the header): light above the copy, opaque only
          across it, and gone below the buttons — the extra bottom padding
          gives the photo a clean showcase before the wave. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,16,0.30) 0px, rgba(17,17,16,0.30) 165px, rgba(17,17,16,0.62) 208px, rgba(17,17,16,0.62) 620px, rgba(17,17,16,0.35) 700px, rgba(17,17,16,0) 790px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(100deg, rgba(17,17,16,0.76) 0%, rgba(17,17,16,0.74) 42%, rgba(17,17,16,0) 70%), radial-gradient(40rem 24rem at 8% 108%, rgba(193,154,61,0.20), transparent 62%)",
        }}
      />
      {/* extra bottom padding below lg = the scrim-free photo showcase */}
      <Container className="relative pt-24 pb-56 sm:pt-32 sm:pb-64 lg:py-40">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-gold-300">Welcome to</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            Khanatural Shop
          </h1>
          {/* Clamped on desktop so the copy never runs into the un-scrimmed
              right side of the photograph. Tightens again at 2xl because the
              centred container pushes the column further right as the viewport
              grows, which is where contrast would otherwise fall away. */}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand-200/95 sm:text-xl lg:max-w-[38vw] 2xl:max-w-[30vw]">
            Your go-to destination for the finest, nutrient-rich seamoss products. Harnessing the ancient wisdom of the ocean,
            our seamoss is sustainably harvested and packed with essential vitamins, minerals and antioxidants to boost your
            health.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/shop/" variant="gold" size="lg">
              Buy Seamoss
            </ButtonLink>
            <ButtonLink
              href="/media/"
              variant="outline"
              size="lg"
              className="border-sand-200/60 text-sand-50 backdrop-blur-sm hover:bg-sand-50 hover:text-kelp-950"
            >
              View eMag
            </ButtonLink>
          </div>
        </div>
      </Container>
      {/* wave divider into the page background */}
      <svg aria-hidden viewBox="0 0 1440 64" fill="none" className="relative block w-full text-sand-50" preserveAspectRatio="none">
        <path d="M0 64h1440V22C1200 52 960 62 720 48 480 34 240 10 0 32v32Z" fill="currentColor" />
      </svg>
    </section>
  );
}
