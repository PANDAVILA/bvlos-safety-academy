export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { courses, modules, lessons, enrollments, lessonProgress } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import LessonViewer from "@/components/LessonViewer";

export default async function LearnPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = (session.user as any).id;

  const course = db.select().from(courses).where(eq(courses.id, params.courseId)).get();
  if (!course) return notFound();

  const isFree = course.priceCents === 0;
  const enrollment = db.select().from(enrollments).where(eq(enrollments.courseId, course.id)).all().find((e) => e.userId === userId);
  if (!enrollment && !isFree) redirect(`/cursos/${course.slug}`);

  const courseModules = db.select().from(modules).where(eq(modules.courseId, course.id)).all().sort((a, b) => a.order - b.order);
  const progressRows = db.select().from(lessonProgress).all().filter((p) => p.userId === userId);

  const moduleGroups = courseModules.map((m) => ({
    id: m.id,
    title: m.title,
    quiz: (() => {
      try {
        return JSON.parse(m.quizJson || "[]");
      } catch {
        return [];
      }
    })(),
    lessons: db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, m.id))
      .all()
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        id: l.id,
        title: l.title,
        content: l.content,
        image: l.image,
        videoUrl: l.videoUrl,
        attachmentUrl: l.attachmentUrl,
        attachmentName: l.attachmentName,
        durationMinutes: l.durationMinutes,
        completed: Boolean(progressRows.find((p) => p.lessonId === l.id)?.completed),
      })),
  }));

  return (
    <LessonViewer
      courseTitle={course.title}
      moduleGroups={moduleGroups}
      initialLessonId={moduleGroups[0]?.lessons[0]?.id ?? ""}
    />
  );
}
