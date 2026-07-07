# Khanatural — khanatural.com rebuilt

Custom-coded rebuild of [khanatural.com](https://khanatural.com), migrated off WordPress/WooCommerce/Elementor with **all original content, products, categories, images and copy preserved**. eCommerce + digital magazine for a South African wellness brand.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · PostgreSQL · Prisma · custom admin CMS.

## Getting started

Requires Node 24 (see `.nvmrc`) and PostgreSQL.

```bash
nvm use
npm install
cp .env.example .env        # fill in DATABASE_URL, AUTH_SECRET, ADMIN_PASSWORD
createdb khanatural
npx prisma migrate dev      # create schema
npm run db:seed             # import migrated WordPress content + create admin user
npm run dev
```

## What's inside

| Area | Where |
| --- | --- |
| Storefront (home, shop, categories, products) | `src/app/(site)/` |
| Content pages (why-seamoss, our-brand, media, contact, legal) | `src/app/(site)/…` — rendered from migrated content blocks in the DB |
| Cart & guest checkout (EFT, R120 flat SA delivery) | `src/components/cart/`, `/api/orders` |
| Admin dashboard (products, orders, articles/e-Mag, media, SEO, subscribers) | `src/app/admin/` — sign in at `/admin/login/` |
| Design system (kelp/sand/gold tokens, UI components) | `src/app/globals.css`, `src/components/ui/` |
| Database schema & seed | `prisma/` |
| WordPress migration snapshot (source of truth for the seed) | `data/migration/` |

## SEO / migration notes

- **URLs are preserved 1:1** with the WordPress site, including trailing slashes (`trailingSlash: true`): `/product/<slug>/`, `/product-category/<slug>/`, `/shop/`, `/why-seamoss/`, `/our-brand/`, `/media/`, `/contact-us/`, `/privacy-policy/`, `/legal-notice/`.
- Retired WordPress paths (`/khashop/`, `/login/`, `/coming-soon/`, …) 308-redirect to their replacements (`next.config.ts`).
- Canonical tags, Open Graph, Twitter cards and per-page metadata via the Metadata API; original `<title>` patterns kept (`Page – Khanatural Shop`).
- JSON-LD: `Organization` + `WebSite` site-wide, `Product` (price, availability, ratings) and `BreadcrumbList` on product pages.
- `sitemap.xml` and `robots.txt` generated from the database (`src/app/sitemap.ts`, `src/app/robots.ts`).
- All 104 migrated images served locally via `next/image` (AVIF/WebP, responsive sizes).
- Product/category/content pages are statically generated with 5-minute ISR; admin edits go live without a rebuild.

## Auth

Admin sessions are JWT cookies (`jose`, HS256, httpOnly, 8 h TTL) with bcrypt-hashed credentials. `src/proxy.ts` gates `/admin` at the edge and every server action re-verifies with `requireAdmin()`.
