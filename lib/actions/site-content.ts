"use server";

import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { homepageDefaults } from "@/lib/site-content";

export async function updateHomepageContent(formData: FormData) {
  await requireAdmin();

  const checkboxKeys = new Set(["section2_visible", "section3_visible"]);

  for (const key of Object.keys(homepageDefaults)) {
    const value = checkboxKeys.has(key)
      ? formData.get(key) === "on"
        ? "true"
        : "false"
      : String(formData.get(key) ?? "");
    const existing = db.select().from(siteContent).where(eq(siteContent.key, key)).get();
    if (existing) {
      db.update(siteContent).set({ value, updatedAt: new Date().toISOString() }).where(eq(siteContent.key, key)).run();
    } else {
      db.insert(siteContent).values({ key, value }).run();
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
