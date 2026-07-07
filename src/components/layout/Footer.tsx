import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";

/** Footer link groups migrated from the original site footer. */
const groups = [
  {
    heading: "Shop",
    links: [
      { label: "Ladies' Range", href: "/product-category/ladies/" },
      { label: "Men's Range", href: "/product-category/mens-range/" },
      { label: "Unisex", href: "/product-category/unisex/" },
      { label: "Monthly eMag", href: "/media/" },
      { label: "Testimonials", href: "/#testimonials" },
    ],
  },
  {
    heading: "Why Seamoss",
    links: [
      { label: "Why Seamoss", href: "/why-seamoss/" },
      { label: "Khanatural Quality", href: "/why-seamoss/" },
      { label: "How to Use Seamoss", href: "/why-seamoss/" },
      { label: "Make Seamoss", href: "/why-seamoss/" },
    ],
  },
  {
    heading: "Our Brand",
    links: [
      { label: "Our Founder", href: "/our-brand/" },
      { label: "Our Story", href: "/our-brand/" },
      { label: "Unlock Seamoss", href: "/why-seamoss/" },
    ],
  },
  {
    heading: "Media",
    links: [
      { label: "Khanatural eMag", href: "/media/" },
      { label: "In the News", href: "/media/" },
      { label: "Our Gallery", href: "/media/" },
    ],
  },
  {
    heading: "Legal Notice",
    links: [
      { label: "Terms & Conditions", href: "/legal-notice/" },
      { label: "Privacy Policy", href: "/privacy-policy/" },
      { label: "Cookie Policy", href: "/legal-notice/" },
      { label: "Paia Manual", href: "/legal-notice/" },
      { label: "Popi Act", href: "/legal-notice/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-kelp-950 text-sand-200">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)] xl:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/images/brand/logo.png" alt="" width={48} height={48} className="h-12 w-12 rounded-full object-contain" />
              <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-sand-50">Khanatural</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand-200/80">
              Our mission is to help you achieve a healthier, more radiant appearance and feel more confident and vibrant. Our
              seamoss products are must haves. Packed with an impressive 92 out of 102 essential minerals and vitamins that your
              body needs daily. Experience the transformative power of Seamoss and discover a healthier you.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Khanatural on Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200/25 hover:border-gold-400 hover:text-gold-300"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.3.06-1.65.07-4.9.07s-3.6 0-4.9-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.1 15.62 2.1 15.24 2.1 12s0-3.58.08-4.85C2.32 3.92 3.84 2.38 7.1 2.23 8.4 2.2 8.8 2.2 12 2.2zm0 3.8a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 9.9a3.9 3.9 0 1 1 0-7.8 3.9 3.9 0 0 1 0 7.8zm6.2-11.4a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z" />
                </svg>
              </a>
              <a
                href={site.social.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Khanatural on X"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200/25 hover:border-gold-400 hover:text-gold-300"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.4z" />
                </svg>
              </a>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat to Khanatural on WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand-200/25 hover:border-gold-400 hover:text-gold-300"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 1 1 8.38 4.63zm8.4-18.28A11.82 11.82 0 0 0 12.04 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.95L.06 24l6.3-1.65a11.87 11.87 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.49-8.4z" />
                </svg>
              </a>
            </div>
          </div>

          {groups.map((g) => (
            <nav key={g.heading} aria-label={g.heading}>
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold-300">{g.heading}</h2>
              <ul className="space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-sand-200/80 hover:text-gold-300">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 grid gap-8 border-t border-sand-200/15 pt-8 text-sm text-sand-200/70 sm:grid-cols-3">
          <address className="not-italic leading-relaxed">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Contact Us</span>
            A: {site.address.street}, {site.address.city},
            <br />
            {site.address.province}, {site.address.country}, {site.address.postalCode}
            <br />
            T:{" "}
            <a href={`tel:${site.phoneHref}`} className="hover:text-gold-300">
              {site.phone}
            </a>
            <br />
            E:{" "}
            <a href={`mailto:${site.email}`} className="hover:text-gold-300">
              {site.email}
            </a>
          </address>
          <div className="leading-relaxed">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gold-300">The Company</span>
            {site.company.legalName}
            <br />
            {site.company.registration}
            <br />
            Director/s: {site.company.director}
          </div>
          <div className="leading-relaxed">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gold-300">The Website</span>
            Copyrights © 2022 – {new Date().getFullYear()}
            <br />
            Khanatural.com / All Rights Reserved
          </div>
        </div>
      </Container>
    </footer>
  );
}
