import { readFileSync } from "node:fs";

const legacy = JSON.parse(readFileSync(new URL("./lib/legacy-slugs.json", import.meta.url), "utf8"));

// Old Spanish URLs -> English URLs (permanent redirects keep links and SEO value).
// Specific slug redirects come first so they win over the generic section redirects.
const sections = [
  { from: "cursos", to: "courses", slugs: legacy.courses },
  { from: "tienda", to: "resources", slugs: legacy.products },
  { from: "noticias", to: "news", slugs: legacy.articles },
  { from: "informes", to: "reports", slugs: legacy.articles },
];

const slugRedirects = sections.flatMap(({ from, to, slugs }) =>
  Object.entries(slugs).map(([oldSlug, newSlug]) => ({
    source: `/${from}/${oldSlug}`,
    destination: `/${to}/${newSlug}`,
    permanent: true,
  }))
);

const sectionRedirects = [
  ["cursos", "courses"],
  ["tienda", "resources"],
  ["noticias", "news"],
  ["informes", "reports"],
  ["consultoria", "consulting"],
  ["registro", "register"],
  ["aprender", "learn"],
  ["panel", "dashboard"],
  ["contacto", "contact"],
].flatMap(([from, to]) => [
  { source: `/${from}`, destination: `/${to}`, permanent: true },
  { source: `/${from}/:path*`, destination: `/${to}/:path*`, permanent: true },
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [...slugRedirects, ...sectionRedirects];
  },
};

export default nextConfig;
