import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/** Folder (inside the repo, NOT public) that holds the downloadable resource files. */
export function getResourcesDir() {
  return path.join(process.cwd(), "resources-files");
}

/** Resolve a product's file name to a safe absolute path, or null if it is not a local file. */
export function resolveLocalResource(fileUrl: string | null | undefined) {
  if (!fileUrl || /^https?:\/\//i.test(fileUrl)) return null;
  const name = path.basename(fileUrl); // no folders, no ".."
  const full = path.join(getResourcesDir(), name);
  return fs.existsSync(full) ? full : null;
}

export function isExternalUrl(fileUrl: string | null | undefined) {
  return !!fileUrl && /^https?:\/\//i.test(fileUrl);
}

/** Admin, free products (signed-in) and paid orders can download. */
export function userCanDownload(
  product: { id: string; priceCents: number },
  user: { id?: string; role?: string } | null | undefined
) {
  if (!user?.id) return false;
  if (user.role === "admin") return true;
  if (product.priceCents === 0) return true;
  const paid = db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, user.id), eq(orders.itemType, "product"), eq(orders.itemId, product.id), eq(orders.status, "paid")))
    .get();
  return !!paid;
}

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".zip": "application/zip",
};
export function downloadMime(file: string) {
  return MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
}
