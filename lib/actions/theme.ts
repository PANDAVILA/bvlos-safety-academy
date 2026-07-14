"use server";

import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

function isValidHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export async function updateTheme(formData: FormData) {
  await requireAdmin();

  const navy = String(formData.get("theme_navy") || "");
  const gold = String(formData.get("theme_gold") || "");

  const updates: Record<string, string> = {};
  if (isValidHex(navy)) updates.theme_navy = navy;
  if (isValidHex(gold)) updates.theme_gold = gold;

  for (const [key, value] of Object.entries(updates)) {
    const existing = db.select().from(siteContent).where(eq(siteContent.key, key)).get();
    if (existing) {
      db.update(siteContent).set({ value, updatedAt: new Date().toISOString() }).where(eq(siteContent.key, key)).run();
    } else {
      db.insert(siteContent).values({ key, value }).run();
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
}

export async function resetTheme() {
  await requireAdmin();
  db.delete(siteContent).where(eq(siteContent.key, "theme_navy")).run();
  db.delete(siteContent).where(eq(siteContent.key, "theme_gold")).run();
  revalidatePath("/", "layout");
  revalidatePath("/admin/appearance");
}
