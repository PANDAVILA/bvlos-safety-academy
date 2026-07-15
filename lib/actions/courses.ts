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
      learningOutcomes: String(formData.get("learningOutcomes") || ""),
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
      learningOutcomes: String(formData.get("learningOutcomes") || ""),
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

export async function updateModuleQuiz(courseId: string, moduleId: string, quizJson: string) {
  await requireAdmin();
  db.update(modules).set({ quizJson }).where(eq(modules.id, moduleId)).run();
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/aprender/${courseId}`);
}

export async function moveModule(courseId: string, moduleId: string, direction: "up" | "down") {
  await requireAdmin();
  const all = db.select().from(modules).where(eq(modules.courseId, courseId)).all().sort((a, b) => a.order - b.order);
  const idx = all.findIndex((m) => m.id === moduleId);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapWith < 0 || swapWith >= all.length) return;

  const a = all[idx];
  const b = all[swapWith];
  db.update(modules).set({ order: b.order }).where(eq(modules.id, a.id)).run();
  db.update(modules).set({ order: a.order }).where(eq(modules.id, b.id)).run();
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
      image: String(formData.get("image") || "") || null,
      videoUrl: String(formData.get("videoUrl") || "") || null,
      attachmentUrl: String(formData.get("attachmentUrl") || "") || null,
      attachmentName: String(formData.get("attachmentName") || "") || null,
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
      image: String(formData.get("image") || "") || null,
      videoUrl: String(formData.get("videoUrl") || "") || null,
      attachmentUrl: String(formData.get("attachmentUrl") || "") || null,
      attachmentName: String(formData.get("attachmentName") || "") || null,
      durationMinutes: parseInt(String(formData.get("durationMinutes") || "10"), 10),
      isPreview: formData.get("isPreview") === "on",
    })
    .where(eq(lessons.id, lessonId))
    .run();
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/aprender/${courseId}`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  await requireAdmin();
  db.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId)).run();
  db.delete(lessons).where(eq(lessons.id, lessonId)).run();
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function moveLesson(courseId: string, moduleId: string, lessonId: string, direction: "up" | "down") {
  await requireAdmin();
  const all = db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).all().sort((a, b) => a.order - b.order);
  const idx = all.findIndex((l) => l.id === lessonId);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapWith < 0 || swapWith >= all.length) return;

  const a = all[idx];
  const b = all[swapWith];
  db.update(lessons).set({ order: b.order }).where(eq(lessons.id, a.id)).run();
  db.update(lessons).set({ order: a.order }).where(eq(lessons.id, b.id)).run();
  revalidatePath(`/admin/courses/${courseId}`);
}
