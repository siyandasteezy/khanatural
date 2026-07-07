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

## Deploying to Netlify

The repo is Netlify-ready (`netlify.toml`, Next.js runtime auto-detected). One-time setup:

1. **Hosted PostgreSQL** — create a database on [Neon](https://neon.tech) (or Supabase/RDS). Use the **pooled** connection string (Neon's `-pooler` host) — serverless functions open many short-lived connections.
2. **Push the schema and content** from your machine:
   ```bash
   DATABASE_URL="<hosted url>" npx prisma migrate deploy
   DATABASE_URL="<hosted url>" ADMIN_EMAIL=sales@khanatural.com ADMIN_PASSWORD="<strong password>" npm run db:seed
   ```
3. **Netlify site** — "Import from Git" → pick this repo. Set environment variables:
   - `DATABASE_URL` — the pooled connection string (needed at build time too; pages are prerendered from the DB)
   - `SITE_URL` — the production origin, e.g. `https://khanatural.com`
   - `AUTH_SECRET` — `openssl rand -hex 32`
4. Deploy. Build command (`npm run build`), Node 24 and the Next.js plugin come from `netlify.toml`; `prisma generate` runs via the `postinstall` script.

**Hosting-specific behaviour:** admin e-Mag PDF uploads are stored in **Netlify Blobs** (the serverless filesystem is read-only) and served from `/api/emag-pdf/<slug>/`. Netlify caps function request bodies at ~6MB, so upload compressed PDFs there (≤5.5MB — the July issue is 5.6MB compressed from Canva, right at the limit; anything bigger, commit it to `public/uploads/emag/` instead, which is served from the CDN). Self-hosted `next start` has neither restriction and writes uploads to `public/uploads/emag/`.

## Auth

Admin sessions are JWT cookies (`jose`, HS256, httpOnly, 8 h TTL) with bcrypt-hashed credentials. `src/proxy.ts` gates `/admin` at the edge and every server action re-verifies with `requireAdmin()`.
