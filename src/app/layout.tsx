import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    // preserves the original WordPress <title> pattern: "Page – Khanatural Shop"
    default: `${site.name} – ${site.tagline}`,
    template: `%s – ${site.name}`,
  },
  description:
    "Your go-to destination for the finest, nutrient-rich seamoss products. Sustainably harvested and packed with essential vitamins, minerals and antioxidants to boost your health.",
  applicationName: site.name,
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning: browser extensions inject attributes into <html>
  // before React hydrates, causing false-positive mismatch warnings. It only
  // suppresses attribute warnings on this one element, not its children.
  return (
    <html
      lang="en-ZA"
      className={`${fraunces.variable} ${manrope.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
