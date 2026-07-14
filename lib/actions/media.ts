"use server";

import { requireAdmin } from "@/lib/admin";
import { getUploadsDir } from "@/lib/uploads";
import path from "path";
import fs from "fs";
import { revalidatePath } from "next/cache";

export async function deleteUpload(filename: string) {
  await requireAdmin();
  if (!filename || filename.includes("/") || filename.includes("..")) return;
  const filePath = path.join(getUploadsDir(), filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  revalidatePath("/admin/media");
}
