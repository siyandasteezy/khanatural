import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";

/** The three info cards from the original homepage, copy unchanged. */
const cards = [
  {
    heading: "Local Orders",
    body: "R120 for delivery in S.A.",
    href: "/shop/",
    cta: "Shop now",
  },
  {
    heading: "WhatsApp",
    body: "Chat to us",
    href: site.whatsappUrl,
    cta: site.phone,
    external: true,
  },
  {
    heading: "EFT Payments",
    body: "We’ve teamed up with Peach Payments. Explore options.",
    href: "/checkout/",
    cta: "Explore options",
  },
];

export function InfoStrip() {
  return (
    <Container className="-mt-2 pb-4">
      <ul className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.heading}>
            <a
              href={c.href}
              {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200 transition-shadow hover:shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{c.heading}</span>
              <span className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-kelp-900">{c.body}</span>
              <span className="mt-3 text-sm font-semibold text-kelp-600">{c.cta} →</span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}
