"use server";

import { db } from "@/lib/db";
import { courses, modules, lessons, enrollments, lessonProgress } from "@/lib/db/schema";
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

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "");
  const slug = slugify(String(formData.get("slug") || title));

  db.insert(courses)
    .values({
      slug,
      title,
      subtitle: String(formData.get("subtitle") || ""),
      description: String(formData.get("description") || ""),
      level: String(formData.get("level") || "foundation"),
      category: String(formData.get("category") || "bvlos"),
      priceCents: Math.round(parseFloat(String(formData.get("price") || "0")) * 100),
      durationHours: parseInt(String(formData.get("durationHours") || "0"), 10),
      coverImage: String(formData.get("coverImage") || "/brand/hero-1.png"),
      published: formData.get("published") === "on",
    })
    .run();

  revalidatePath("/admin/courses");
  revalidatePath("/cursos");
  redirect("/admin/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();
  db.update(courses)
    .set({
      title: String(formData.get("title") || ""),
      slug: slugify(String(formData.get("slug") || "")),
      subtitle: String(formData.get("subtitle") || ""),
      description: String(formData.get("description") || ""),
      level: String(formData.get("level") || "foundation"),
      category: String(formData.get("category") || "bvlos"),
      priceCents: Math.round(parseFloat(String(formData.get("price") || "0")) * 100),
      durationHours: parseInt(String(formData.get("durationHours") || "0"), 10),
      coverImage: String(formData.get("coverImage") || "/brand/hero-1.png"),
      published: formData.get("published") === "on",
    })
    .where(eq(courses.id, courseId))
    .run();

  revalidatePath("/admin/courses");
  revalidatePath("/cursos");
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  await requireAdmin();
  const courseModules = db.select().from(modules).where(eq(modules.courseId, courseId)).all();
  for (const m of courseModules) {
    const moduleLessons = db.select().from(lessons).where(eq(lessons.moduleId, m.id)).all();
    for (const l of moduleLessons) {
      db.delete(lessonProgress).where(eq(lessonProgress.lessonId, l.id)).run();
    }
    db.delete(lessons).where(eq(lessons.moduleId, m.id)).run();
  }
  db.delete(modules).where(eq(modules.courseId, courseId)).run();
  db.delete(enrollments).where(eq(enrollments.courseId, courseId)).run();
  db.delete(courses).where(eq(courses.id, courseId)).run();

  revalidatePath("/admin/courses");
  revalidatePath("/cursos");
}

export async function togglePublishCourse(courseId: string, published: boolean) {
  await requireAdmin();
  db.update(courses).set({ published }).where(eq(courses.id, courseId)).run();
  revalidatePath("/admin/courses");
  revalidatePath("/cursos");
}

// ---- Modules ----
export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin();
  const existing = db.select().from(modules).where(eq(modules.courseId, courseId)).all();
  db.insert(modules)
    .values({
      courseId,
      title: String(formData.get("title") || "New module"),
      order: existing.length,
    })
    .run();
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteModule(courseId: string, moduleId: string) {
  await requireAdmin();
  const moduleLessons = db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).all();
  for (const l of moduleLessons) {
    db.delete(lessonProgress).where(eq(lessonProgress.lessonId, l.id)).run();
  }
  db.delete(lessons).where(eq(lessons.moduleId, moduleId)).run();
  db.delete(modules).where(eq(modules.id, moduleId)).run();
  revalidatePath(`/admin/courses/${courseId}`);
}

// ---- Lessons ----
export async function createLesson(courseId: string, moduleId: string, formData: FormData) {
  await requireAdmin();
  const existing = db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).all();
  db.insert(lessons)
    .values({
      moduleId,
      title: String(formData.get("title") || "New lesson"),
      content: String(formData.get("content") || ""),
      durationMinutes: parseInt(String(formData.get("durationMinutes") || "10"), 10),
      order: existing.length,
      isPreview: formData.get("isPreview") === "on",
    })
    .run();
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
  await requireAdmin();
  db.update(lessons)
    .set({
      title: String(formData.get("title") || ""),
      content: String(formData.get("content") || ""),
      durationMinutes: parseInt(String(formData.get("durationMinutes") || "10"), 10),
      isPreview: formData.get("isPreview") === "on",
    })
    .where(eq(lessons.id, lessonId))
    .run();
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  db.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId)).run();
  db.delete(lessons).where(eq(lessons.id, lessonId)).run();
  revalidatePath(`/admin/courses/${courseId}`);
}
