import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WordPress URLs all end with a trailing slash — keep the exact same URL
  // shape so existing search rankings and backlinks carry over 1:1.
  trailingSlash: true,
  experimental: {
    serverActions: {
      // admin uploads e-Mag PDFs through a server action (default limit is 1MB)
      bodySizeLimit: "60mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // legacy media still referenced from the old WordPress uploads dir
      { protocol: "https", hostname: "khanatural.com", pathname: "/wp-content/uploads/**" },
    ],
  },
  async redirects() {
    return [
      // WordPress-era paths that no longer exist as pages
      { source: "/khashop/", destination: "/shop/", permanent: true },
      { source: "/product-page/", destination: "/shop/", permanent: true },
      { source: "/product-detail/", destination: "/shop/", permanent: true },
      { source: "/coming-soon/", destination: "/", permanent: true },
      { source: "/customer-dashboard/", destination: "/account/", permanent: false },
      { source: "/product-category/uncategorised/", destination: "/shop/", permanent: true },
      // WordPress auth/membership pages replaced by guest checkout
      { source: "/login/", destination: "/account/", permanent: true },
      { source: "/register/", destination: "/account/", permanent: true },
      { source: "/logout/", destination: "/account/", permanent: true },
      { source: "/password-reset/", destination: "/account/", permanent: true },
      { source: "/user/", destination: "/account/", permanent: true },
      { source: "/members/", destination: "/account/", permanent: true },
    ];
  },
};

export default nextConfig;
