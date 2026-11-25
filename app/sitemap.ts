import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { courses, products, articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://bvlossafetyacademy.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed = [
    "", "/courses", "/resources", "/news", "/reports", "/standards", "/consulting", "/teams",
    "/aerosafety-case", "/contact",
    "/legal/disclaimer", "/legal/terms", "/legal/privacy", "/legal/refunds", "/legal/consulting-scope",
    "/legal/app-terms", "/legal/ai-use", "/legal/security",
  ].map((p) => ({ url: `${SITE}${p}`, lastModified: now }));

  let dynamic: MetadataRoute.Sitemap = [];
  try {
    dynamic = [
      ...db.select({ slug: courses.slug }).from(courses).where(eq(courses.published, true)).all().map((r) => ({ url: `${SITE}/courses/${r.slug}`, lastModified: now })),
      ...db.select({ slug: products.slug }).from(products).where(eq(products.published, true)).all().map((r) => ({ url: `${SITE}/resources/${r.slug}`, lastModified: now })),
      ...db.select({ slug: articles.slug, type: articles.type }).from(articles).where(eq(articles.published, true)).all()
        .map((r) => ({ url: `${SITE}/${r.type === "report" ? "reports" : "news"}/${r.slug}`, lastModified: now })),
    ];
  } catch {
    // Database not ready: serve the fixed pages only.
  }
  return [...fixed, ...dynamic];
}
