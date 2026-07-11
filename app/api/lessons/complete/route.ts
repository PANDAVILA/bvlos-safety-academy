import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { lessonProgress, lessons, modules, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id;
  const { lessonId } = await req.json();

  const existing = db.select().from(lessonProgress).where(eq(lessonProgress.lessonId, lessonId)).all().find((p) => p.userId === userId);
  if (!existing) {
    db.insert(lessonProgress).values({ userId, lessonId, completed: true, completedAt: new Date().toISOString() }).run();
  } else if (!existing.completed) {
    db.update(lessonProgress).set({ completed: true, completedAt: new Date().toISOString() }).where(eq(lessonProgress.id, existing.id)).run();
  }

  // Recompute course progress
  const lesson = db.select().from(lessons).where(eq(lessons.id, lessonId)).get();
  if (lesson) {
    const mod = db.select().from(modules).where(eq(modules.id, lesson.moduleId)).get();
    if (mod) {
      const courseModules = db.select().from(modules).where(eq(modules.courseId, mod.courseId)).all();
      const allLessonIds = courseModules.flatMap((m) => db.select().from(lessons).where(eq(lessons.moduleId, m.id)).all().map((l) => l.id));
      const completedCount = db
        .select()
        .from(lessonProgress)
        .all()
        .filter((p) => p.userId === userId && p.completed && allLessonIds.includes(p.lessonId)).length;
      const percent = allLessonIds.length ? (completedCount / allLessonIds.length) * 100 : 0;

      const enrollment = db.select().from(enrollments).where(eq(enrollments.courseId, mod.courseId)).all().find((e) => e.userId === userId);
      if (enrollment) {
        db.update(enrollments)
          .set({ progressPercent: percent, status: percent >= 100 ? "completed" : "active" })
          .where(eq(enrollments.id, enrollment.id))
          .run();
      }
    }
  }

  return NextResponse.json({ ok: true });
}
