import type { Metadata } from "next";
import { site, isStagingDomain } from "./site";

type SeoInput = {
  title: string;
  description?: string | null;
  /** Path with leading and trailing slash, e.g. "/shop/" — becomes the canonical URL. */
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
};

/** Shown when a page has no image of its own, so every link preview has art. */
const DEFAULT_OG_IMAGE = "/images/stock/kelp-forest.jpg";

export function buildMetadata({ title, description, path, image, type = "website", noIndex }: SeoInput): Metadata {
  const url = `${site.url}${path}`;
  const desc = description ?? undefined;
  const ogImage = image || DEFAULT_OG_IMAGE;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    // staging deployments are noindexed site-wide; set here (not only in the
    // root layout) because a page's `robots: undefined` would override the
    // layout value in Next's metadata merge
    robots: noIndex || isStagingDomain ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: site.name,
      type,
      locale: "en_ZA",
      images: [{ url: ogImage.startsWith("http") ? ogImage : `${site.url}${ogImage}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage.startsWith("http") ? ogImage : `${site.url}${ogImage}`],
    },
  };
}

/** Serialise a JSON-LD object for a <script type="application/ld+json"> tag. */
export function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.company.legalName,
    url: site.url,
    logo: `${site.url}/images/brand/logo.png`,
    email: site.email,
    telephone: site.phoneHref,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.province,
      postalCode: site.address.postalCode,
      addressCountry: "ZA",
    },
    sameAs: [site.social.instagram, site.social.x],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${site.url}${c.path}`,
    })),
  };
}
