import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courses, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { itemId } = await req.json();
  const course = db.select().from(courses).where(eq(courses.id, itemId)).get();
  if (!course || course.priceCents !== 0) {
    return NextResponse.json({ error: "This course is not free" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const existing = db.select().from(enrollments).where(eq(enrollments.courseId, itemId)).all().find((e) => e.userId === userId);
  if (!existing) {
    db.insert(enrollments).values({ userId, courseId: itemId }).run();
  }
  return NextResponse.json({ ok: true });
}
