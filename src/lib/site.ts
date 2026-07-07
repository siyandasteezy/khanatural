/** Brand facts carried over from khanatural.com — keep copy verbatim. */
export const site = {
  name: "Khanatural Shop",
  tagline: "Rooted in Realness",
  url: process.env.SITE_URL ?? "https://khanatural.com",
  email: "sales@khanatural.com",
  phone: "(+27) 79 695 8848",
  phoneHref: "+27796958848",
  whatsappUrl: "https://wa.me/27796958848",
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
