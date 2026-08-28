import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";

const icons = {
  truck: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-8.5A1.125 1.125 0 0 0 15.902 9H13.5m-9.75 5.25V6.375c0-.621.504-1.125 1.125-1.125h7.5c.621 0 1.125.504 1.125 1.125v8.25"
    />
  ),
  chat: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
    />
  ),
  card: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
    />
  ),
};

/** The three info cards from the original homepage, copy unchanged. */
const cards = [
  {
    heading: "Local Orders",
    body: "R120 for delivery in S.A.",
    href: "/shop/",
    cta: "Shop now",
    icon: icons.truck,
  },
  {
    heading: "Email Us",
    body: "Chat to us",
    href: `mailto:${site.email}`,
    cta: site.email,
    icon: icons.chat,
  },
  {
    heading: "Secure Payments",
    body: "Card & Instant EFT, secured by Yoco.",
    href: "/checkout/",
    cta: "Explore options",
    icon: icons.card,
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
              className="group flex h-full gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand-200 transition-shadow hover:shadow-lg"
            >
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-kelp-100 text-kelp-700 transition-colors group-hover:bg-gold-500 group-hover:text-kelp-950"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                  {c.icon}
                </svg>
              </span>
              <span className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">{c.heading}</span>
                <span className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug text-kelp-900">
                  {c.body}
                </span>
                <span className="mt-2 text-sm font-semibold text-kelp-600">{c.cta} →</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}
