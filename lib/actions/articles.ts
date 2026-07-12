"use server";

import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
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

export async function createArticle(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "");
  db.insert(articles)
    .values({
      slug: slugify(String(formData.get("slug") || title)),
      title,
      excerpt: String(formData.get("excerpt") || ""),
      body: String(formData.get("body") || ""),
      type: String(formData.get("type") || "news"),
      coverImage: String(formData.get("coverImage") || "/brand/hero-1.png"),
      author: String(formData.get("author") || "BVLOS Safety Academy"),
      published: formData.get("published") === "on",
    })
    .run();

  revalidatePath("/admin/articles");
  revalidatePath("/noticias");
  revalidatePath("/informes");
  redirect("/admin/articles");
}

export async function updateArticle(id: string, formData: FormData) {
  await requireAdmin();
  db.update(articles)
    .set({
      title: String(formData.get("title") || ""),
      slug: slugify(String(formData.get("slug") || "")),
      excerpt: String(formData.get("excerpt") || ""),
      body: String(formData.get("body") || ""),
      type: String(formData.get("type") || "news"),
      coverImage: String(formData.get("coverImage") || "/brand/hero-1.png"),
      author: String(formData.get("author") || "BVLOS Safety Academy"),
      published: formData.get("published") === "on",
    })
    .where(eq(articles.id, id))
    .run();

  revalidatePath("/admin/articles");
  revalidatePath("/noticias");
  revalidatePath("/informes");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  db.delete(articles).where(eq(articles.id, id)).run();
  revalidatePath("/admin/articles");
  revalidatePath("/noticias");
  revalidatePath("/informes");
}
