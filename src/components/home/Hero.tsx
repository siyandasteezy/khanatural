import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    // pulled up behind the translucent header (36px bar + 80px band) and padded
    // back out, so the photography shows through the frosted chrome
    <section className="relative -mt-[116px] overflow-hidden bg-kelp-950 pt-[116px] text-sand-50">
      {/* sunlit kelp forest — the ocean the seamoss comes from */}
      <Image
        src="/images/stock/kelp-forest.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] opacity-60"
      />
      {/* legibility scrim + brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(17,17,16,0.94) 0%, rgba(17,17,16,0.75) 45%, rgba(17,17,16,0.35) 100%), radial-gradient(40rem 24rem at 10% 110%, rgba(193,154,61,0.25), transparent 60%)",
        }}
      />
      <Container className="relative py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-gold-300">Welcome to</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            Khanatural Shop
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand-200/95 sm:text-xl">
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
