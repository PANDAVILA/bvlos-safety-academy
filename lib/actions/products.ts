"use server";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "");
  db.insert(products)
    .values({
      slug: slugify(String(formData.get("slug") || title)),
      title,
      description: String(formData.get("description") || ""),
      type: String(formData.get("type") || "ebook"),
      priceCents: Math.round(parseFloat(String(formData.get("price") || "0")) * 100),
      coverImage: String(formData.get("coverImage") || "/brand/hero-1.png"),
      fileUrl: String(formData.get("fileUrl") || ""),
      published: formData.get("published") === "on",
    })
    .run();

  revalidatePath("/admin/products");
  revalidatePath("/tienda");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  db.update(products)
    .set({
      title: String(formData.get("title") || ""),
      slug: slugify(String(formData.get("slug") || "")),
      description: String(formData.get("description") || ""),
      type: String(formData.get("type") || "ebook"),
      priceCents: Math.round(parseFloat(String(formData.get("price") || "0")) * 100),
      coverImage: String(formData.get("coverImage") || "/brand/hero-1.png"),
      fileUrl: String(formData.get("fileUrl") || ""),
      published: formData.get("published") === "on",
    })
    .where(eq(products.id, id))
    .run();

  revalidatePath("/admin/products");
  revalidatePath("/tienda");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  db.delete(products).where(eq(products.id, id)).run();
  revalidatePath("/admin/products");
  revalidatePath("/tienda");
}
