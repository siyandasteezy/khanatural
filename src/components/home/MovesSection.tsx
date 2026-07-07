import { site } from "@/lib/site";
import { Section } from "@/components/ui/Section";

export function MovesSection() {
  return (
    <Section
      tone="cream"
      eyebrow="Khanatural Moves"
      title="Afro-Fusion Dance Movement"
      lead="Khanatural Moves your body, mind & soul. Book your ‘online or in-person’ session via our WhatsApp line or drop us an email."
    >
      <div className="mx-auto max-w-xl text-center">
        <p className="text-base text-ink/70">Khanatural Moves sessions are tailor made to suit your lifestyle.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
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
    </Section>
  );
}
