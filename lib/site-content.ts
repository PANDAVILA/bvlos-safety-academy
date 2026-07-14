import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";

export const homepageDefaults = {
  hero_eyebrow: "Knowledge · Standards · Safety",
  hero_title: "The most dangerous BVLOS risk is the one nobody reports.",
  hero_subtitle:
    "Specialized training, certifications, and consulting for teams operating beyond visual line of sight. We turn regulatory compliance into real operational safety.",
  hero_image: "/brand/hero-1.png",
  hero_image_size: "md", // sm | md | lg
  hero_background_image: "",
  primary_cta_text: "Explore courses",
  primary_cta_href: "/cursos",
  secondary_cta_text: "Try AeroSafety Case",
  secondary_cta_href: "/aerosafety-case",

  section2_visible: "true",
  section2_eyebrow: "The operational gap",
  section2_title: "Compliance is not safety.",
  section2_body:
    "Meeting the regulation certifies a paper file; it doesn't certify that the crew recognizes operational drift in real time. BVLOS Safety Academy trains remote pilots, operations managers, and SMS teams to close that gap with judgment, not just paperwork.",
  section2_image: "/brand/hero-2.png",

  section3_visible: "true",
  section3_eyebrow: "Operational drift",
  section3_title: "The silent risk in BVLOS operations.",
  section3_body:
    "The distance between the planned route and the actual track grows progressively and almost imperceptibly. Our risk mitigation modules train teams to detect that drift before it becomes a reportable event.",
  section3_image: "/brand/drift-1.png",
};

export type HomepageContent = typeof homepageDefaults;

export async function getHomepageContent(): Promise<HomepageContent> {
  const rows = db.select().from(siteContent).all();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...homepageDefaults, ...map } as HomepageContent;
}

export const heroImageSizeClass: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-none",
  lg: "max-w-none lg:scale-110 lg:origin-top-right",
};
