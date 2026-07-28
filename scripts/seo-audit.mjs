/**
 * On-page SEO audit for the local site. Crawls the key routes and reports
 * title/description lengths, heading structure, canonical, Open Graph,
 * image alt coverage and structured data.
 *
 * Run: node scripts/seo-audit.mjs [baseUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:3100";

const ROUTES = [
  "/",
  "/shop/",
  "/why-seamoss/",
  "/our-brand/",
  "/media/",
  "/contact-us/",
  "/product-category/ladies/",
  "/product/avo-seamoss-cream-2/",
  "/privacy-policy/",
  "/legal-notice/",
];

const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#\d+;/g, "").trim();
const one = (h, re) => (h.match(re) ?? [])[1];

const rows = [];
const issues = [];

for (const route of ROUTES) {
  const res = await fetch(BASE + route);
  const html = await res.text();
  const mainStart = html.indexOf("<main");
  const mainEnd = html.indexOf("</main>");
  const main = mainStart > -1 ? html.slice(mainStart, mainEnd) : html;

  const title = strip(one(html, /<title>(.*?)<\/title>/s) ?? "");
  const desc = one(html, /name="description" content="([^"]*)"/) ?? "";
  const canonical = one(html, /rel="canonical" href="([^"]*)"/) ?? "";
  const ogImage = one(html, /property="og:image" content="([^"]*)"/) ?? "";
  const h1s = [...main.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)].map((m) => strip(m[1]));
  const h2s = [...main.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)].length;
  const imgs = [...main.matchAll(/<img[^>]*>/g)];
  // alt="" is a deliberate "decorative, skip me" signal and is correct;
  // only a missing alt attribute is an actual defect.
  const missingAlt = imgs.filter((m) => !/\balt=/.test(m[0])).length;
  const decorative = imgs.filter((m) => /\balt=""/.test(m[0])).length;
  const jsonLd = [...html.matchAll(/"@type":"(\w+)"/g)].map((m) => m[1]);
  const internalLinks = new Set([...main.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1])).size;

  rows.push({
    route,
    status: res.status,
    titleLen: title.length,
    descLen: desc.length,
    h1: h1s.length,
    h2s,
    imgs: imgs.length,
    missingAlt,
    decorative,
    links: internalLinks,
    schema: [...new Set(jsonLd)].join(","),
  });

  if (res.status !== 200) issues.push(`${route} → HTTP ${res.status}`);
  if (h1s.length !== 1) issues.push(`${route} → ${h1s.length} <h1> (want exactly 1)`);
  if (!title) issues.push(`${route} → missing <title>`);
  else if (title.length > 60) issues.push(`${route} → title ${title.length} chars (>60 may truncate): "${title}"`);
  if (!desc) issues.push(`${route} → missing meta description`);
  else if (desc.length < 70 || desc.length > 160)
    issues.push(`${route} → description ${desc.length} chars (aim 70–160)`);
  if (!canonical) issues.push(`${route} → missing canonical`);
  if (!ogImage) issues.push(`${route} → missing og:image`);
  if (missingAlt) issues.push(`${route} → ${missingAlt}/${imgs.length} images with NO alt attribute`);
}

const pad = (v, n) => String(v).padEnd(n);
console.log(
  pad("ROUTE", 34) + pad("ST", 5) + pad("TITLE", 7) + pad("DESC", 6) + pad("H1", 4) + pad("H2", 4) + pad("IMG", 5) + pad("NOALT", 7) + pad("DECOR", 7) + pad("LINKS", 7) + "SCHEMA",
);
for (const r of rows) {
  console.log(
    pad(r.route, 34) + pad(r.status, 5) + pad(r.titleLen, 7) + pad(r.descLen, 6) + pad(r.h1, 4) + pad(r.h2s, 4) + pad(r.imgs, 5) + pad(r.missingAlt, 7) + pad(r.decorative, 7) + pad(r.links, 7) + r.schema,
  );
}

console.log("\n" + (issues.length ? `${issues.length} ISSUE(S):` : "No issues found."));
for (const i of issues) console.log(" • " + i);
