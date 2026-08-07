import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Full-bleed editorial band featuring the brand's own campaign photograph
 * (carried over from the previous site). Copy is the existing brand mission
 * statement, verbatim.
 */
export function BrandCampaign() {
  return (
    <section className="relative overflow-hidden bg-kelp-950 text-sand-50">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[26rem] lg:min-h-[40rem]">
          <Image
            src="/images/shoot/brand-honey.jpg"
            alt="Founder Khabonina Qubeka in a gold laurel crown with the KhaHoney range"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-[center_22%]"
          />
          {/* soften the photo edge into the copy panel */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-kelp-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-kelp-950"
          />
        </div>

        <div className="relative flex items-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(32rem 20rem at 90% 10%, rgba(193,154,61,0.16), transparent 60%)" }}
          />
          <Container className="relative py-16 sm:py-20 lg:py-24 lg:pl-16">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-gold-300">Khabonina Qubeka Products</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
              Rooted in Realness
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-sand-200/90 sm:text-lg">
              Our mission is to help you achieve a healthier, more radiant appearance and feel more confident and vibrant. Our
              seamoss products are must haves. Packed with an impressive 92 out of 102 essential minerals and vitamins that
              your body needs daily. Experience the transformative power of Seamoss and discover a healthier you.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/our-brand/" variant="gold" size="lg">
                Our Brand
              </ButtonLink>
              <ButtonLink
                href="/why-seamoss/"
                variant="outline"
                size="lg"
                className="border-sand-200/60 text-sand-50 hover:bg-sand-50 hover:text-kelp-950"
              >
                Why Seamoss
              </ButtonLink>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
