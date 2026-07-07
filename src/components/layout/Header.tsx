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
      {/* announcement bar — copy from the original homepage info strip */}
      <div className="bg-kelp-950 text-sand-200">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p className="font-medium tracking-wide">Local orders: R120 for delivery in S.A.</p>
          <a href={`mailto:${site.email}`} className="hidden sm:block hover:text-gold-300">
            {site.email}
          </a>
        </Container>
      </div>

      <div className="bg-kelp-900/95 backdrop-blur supports-[backdrop-filter]:bg-kelp-900/90 shadow-lg shadow-kelp-950/20">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} — home`}>
            <Image src="/images/brand/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-contain" priority />
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wide text-sand-50">
              Khanatural
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="rounded-full px-4 py-2 text-[13px] font-semibold uppercase tracking-wider text-sand-100 hover:bg-kelp-800 hover:text-gold-300"
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
              className="hidden md:inline-flex h-10 items-center rounded-full bg-gold-500 px-4 text-xs font-bold uppercase tracking-wider text-kelp-950 hover:bg-gold-400"
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
