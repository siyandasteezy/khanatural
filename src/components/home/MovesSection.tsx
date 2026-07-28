import Image from "next/image";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";

export function MovesSection() {
  return (
    <section className="bg-sand-100 py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[420px_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2.5rem] shadow-xl">
            <Image
              src="/images/stock/dancer-beach.jpg"
              alt="Dancer silhouetted against a sunset"
              fill
              sizes="(max-width: 1024px) 90vw, 420px"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-kelp-950/10" />
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Khanatural Moves</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-kelp-900 sm:text-4xl">
              Afro-Fusion Dance Movement
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
              Khanatural Moves your body, mind &amp; soul. Book your ‘online or in-person’ session via our WhatsApp line or drop
              us an email.
            </p>
            <p className="mt-3 max-w-xl text-base text-ink/70">Khanatural Moves sessions are tailor made to suit your lifestyle.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-kelp-800 px-8 text-sm font-semibold uppercase tracking-wide text-sand-50 hover:bg-kelp-700"
              >
                WhatsApp booking
              </a>
              <a
                href={`mailto:${site.email}?subject=Khanatural%20Moves%20booking`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-kelp-800 px-8 text-sm font-semibold uppercase tracking-wide text-kelp-900 hover:bg-kelp-800 hover:text-sand-50"
              >
                Email booking
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
