/** Brand facts carried over from khanatural.com — keep copy verbatim. */
export const site = {
  name: "Khanatural Shop",
  tagline: "Rooted in Realness",
  url: process.env.SITE_URL ?? "https://khanatural.com",
  // Email is the only direct contact channel — the WhatsApp line and the
  // number behind it were removed at the brand's request.
  email: "sales@khanatural.com",
  address: {
    street: "02 Francis Road",
    city: "Jeffrey’s Bay",
    province: "Eastern Cape",
    country: "South Africa",
    postalCode: "6330",
  },
  company: {
    legalName: "Khanatural Pty (Ltd)",
    registration: "Company Reg. No.2021/483700/07",
    director: "Ms. K Qubeka",
  },
  social: {
    instagram: "https://www.instagram.com/khanaturalseamoss/",
    x: "https://x.com/KhanaturalStore",
  },
} as const;

/**
 * True when the app is not running on the production domain (e.g. the
 * temporary khanatural.netlify.app URL while the real domain still points at
 * WordPress). Staging deployments are noindexed site-wide so the temporary
 * URL never competes with khanatural.com in search — this switches off by
 * itself once SITE_URL is set to the production domain.
 */
export const isStagingDomain = !site.url.startsWith("https://khanatural.com");
