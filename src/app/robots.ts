import type { MetadataRoute } from "next";
import { site, isStagingDomain } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Staging: keep crawling ALLOWED so bots can see the noindex meta/header —
  // a blanket Disallow would hide the noindex and Google could still list
  // bare URLs it discovers elsewhere. No sitemap pointer either.
  if (isStagingDomain) {
    return {
      rules: [{ userAgent: "*", allow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/shopping-cart/", "/account/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
