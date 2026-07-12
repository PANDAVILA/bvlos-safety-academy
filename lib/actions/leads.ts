"use server";

import { db } from "@/lib/db";
import { consultingLeads } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export async function updateLeadStatus(id: string, status: string) {
  await requireAdmin();
  db.update(consultingLeads).set({ status }).where(eq(consultingLeads.id, id)).run();
  revalidatePath("/admin/leads");
}
