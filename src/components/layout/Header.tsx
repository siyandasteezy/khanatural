import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { CartButton } from "@/components/cart/CartButton";
import { MobileMenu } from "./MobileMenu";

/** Navigation carried over from the original site, plus a direct Shop link. */
export const NAV_LINKS = [
  { label: "Khashop", href: "/" },
  { label: "Shop", href: "/shop/" },
  { label: "Why Seamoss", href: "/why-seamoss/" },
  { label: "Our Brand", href: "/our-brand/" },
  { label: "Media", href: "/media/" },
  { label: "Contact Us", href: "/contact-us/" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar — copy from the original homepage info strip.
          Translucent so the hero photography reads through the chrome; the
          opaque fallback keeps contrast where backdrop-filter is unsupported. */}
      <div className="bg-kelp-950/95 text-sand-200 backdrop-blur-md supports-[backdrop-filter]:bg-kelp-950/80">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p className="font-medium tracking-wide">Local orders: R120 for delivery in S.A.</p>
          <a href={`mailto:${site.email}`} className="hidden sm:block hover:text-gold-500">
            {site.email}
          </a>
        </Container>
      </div>

      {/* Frosted white band — light enough that the black brand lockup stays
          legible over whatever scrolls beneath, sheer enough to show it. */}
      <div className="border-b border-white/25 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
        <Container className="flex h-20 items-center justify-between gap-4">
          <Link href="/" aria-label={`${site.name} — home`} className="shrink-0">
            <Image
              src="/images/brand/logo.png"
              alt={`${site.name} — ${site.tagline}`}
              width={666}
              height={206}
              priority
              className="h-11 w-auto sm:h-12"
            />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="relative rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-wider text-kelp-800 transition-colors hover:text-gold-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex h-10 items-center rounded-full bg-gold-500 px-5 text-xs font-bold uppercase tracking-wider text-kelp-950 transition-colors hover:bg-gold-400"
            >
              WhatsApp
            </a>
            <CartButton />
            <MobileMenu links={NAV_LINKS.map((l) => ({ ...l }))} />
          </div>
        </Container>
      </div>
    </header>
  );
}
