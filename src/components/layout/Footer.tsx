import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { SmartPickWordmark } from "./SmartPickWordmark";

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
            <Link href="/" className="inline-block" aria-label={`${site.name} — home`}>
              {/* black lockup inverted to white for the dark footer */}
              <Image
                src="/images/brand/logo.png"
                alt={`${site.name} — ${site.tagline}`}
                width={666}
                height={206}
                className="h-14 w-auto brightness-0 invert"
              />
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
            <p className="mt-4">
              {/* The wordmark's "Smart" half is currentColor, so it takes the
                  link's colour and hover transition; "Pick" stays brand green. */}
              <a
                href="https://www.smartpick.co.za/it"
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-2 text-sand-200/70 transition-colors hover:text-gold-300"
              >
                <span className="text-xs uppercase tracking-[0.14em]">Developed by</span>
                <SmartPickWordmark className="h-3.5 w-auto opacity-90 transition-opacity group-hover:opacity-100" />
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
