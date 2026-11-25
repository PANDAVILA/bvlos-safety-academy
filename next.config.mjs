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

// Security headers for every response.
// The CSP keeps scripts/styles/images open to https (the site embeds videos, PayPal buttons and map tiles)
// but blocks plugins, base-tag tricks and framing of our pages by other sites.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https:",
  "frame-src 'self' https:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [...slugRedirects, ...sectionRedirects];
  },
};

export default nextConfig;
