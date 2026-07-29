import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "./NewsletterForm";

/** Newsletter signup over a soft botanical backdrop. Copy unchanged. */
export function NewsletterBand() {
  return (
    <section className="relative overflow-hidden border-t border-sand-200 py-16 sm:py-24">
      <Image src="/images/shoot/shea-serene.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-sand-100/90 via-sand-100/70 to-sand-100/90" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Stay in the loop</p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-kelp-900 sm:text-4xl">
            Subscribe to our newsletter
          </h2>
          <p className="mt-4 text-base text-ink/70 sm:text-lg">
            Get Exclusive Content by submitting your email address to us. We also offer great health tips for your wellbeing as
            well as the latest from the natural lifestyle scene.
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <NewsletterForm />
        </div>
      </Container>
    </section>
  );
}
