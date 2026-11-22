"use server";

import { db } from "@/lib/db";
import { users, courses, enrollments } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Enroll a list of registered users into a course without payment.
 * Used for team licenses that are invoiced outside the site.
 * Emails that do not belong to a registered account are reported back so they can be asked to sign up first.
 */
export async function enrollUsersByEmail(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get("courseId") || "");
  const raw = String(formData.get("emails") || "");
  const emails = Array.from(
    new Set(
      raw
        .split(/[\s,;]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@"))
    )
  );

  const course = db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (!course || emails.length === 0) redirect("/admin/users?enroll_error=1");

  let enrolled = 0;
  let already = 0;
  const missing: string[] = [];

  for (const email of emails) {
    const user = db.select().from(users).where(sql`lower(${users.email}) = ${email}`).get();
    if (!user) {
      missing.push(email);
      continue;
    }
    const existing = db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)))
      .get();
    if (existing) {
      already++;
      continue;
    }
    db.insert(enrollments).values({ userId: user.id, courseId }).run();
    enrolled++;
  }

  revalidatePath("/admin/users");
  const params = new URLSearchParams({
    enrolled: String(enrolled),
    already: String(already),
    course: course.title,
  });
  if (missing.length) params.set("missing", missing.join(", "));
  redirect(`/admin/users?${params.toString()}`);
}
