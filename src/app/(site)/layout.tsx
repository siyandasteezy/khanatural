import type { ReactNode } from "react";
import { jsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { CartProvider } from "@/components/cart/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold-500 focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-kelp-950"
      >
        Skip to content
      </a>
      <CartProvider>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </CartProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd()) }} />
    </>
  );
}
