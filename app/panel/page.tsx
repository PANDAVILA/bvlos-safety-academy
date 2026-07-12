export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { enrollments, courses, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, ShoppingBag } from "lucide-react";

export default async function PanelPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = (session.user as any).id;

  const myEnrollments = db.select().from(enrollments).where(eq(enrollments.userId, userId)).all();
  const myCourses = myEnrollments.map((e) => ({
    enrollment: e,
    course: db.select().from(courses).where(eq(courses.id, e.courseId)).get(),
  }));

  const myOrders = db.select().from(orders).where(eq(orders.userId, userId)).all();

  return (
    <div className="chart-bg-light min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="eyebrow text-gold-600">My dashboard</p>
        <h1 className="mt-3 font-display text-3xl text-navy-900">Hi, {session.user?.name}</h1>

        <h2 className="mt-14 font-display text-xl text-navy-900">My courses</h2>
        {myCourses.length === 0 ? (
          <p className="mt-4 text-navy-900/60">
            You're not enrolled in any courses yet. <Link href="/cursos" className="text-gold-600 hover:underline">Browse the catalog</Link>.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myCourses.map(({ enrollment, course }) =>
              course ? (
                <Link
                  key={enrollment.id}
                  href={`/aprender/${course.id}`}
                  className="group flex flex-col border border-navy-900/10 bg-white"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                    {course.coverImage && <Image src={course.coverImage} alt={course.title} fill className="object-cover" />}
                  </div>
                  <div className="p-5">
                    <p className="font-display text-navy-900">{course.title}</p>
                    <div className="mt-3 h-1.5 w-full bg-navy-900/10">
                      <div className="h-1.5 bg-gold-500" style={{ width: `${enrollment.progressPercent}%` }} />
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-xs text-navy-900/50">
                      <PlayCircle size={13} /> {Math.round(enrollment.progressPercent)}% complete
                    </p>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        )}

        <h2 className="mt-16 font-display text-xl text-navy-900">Purchase history</h2>
        {myOrders.length === 0 ? (
          <p className="mt-4 text-navy-900/60">You don't have any purchases yet.</p>
        ) : (
          <div className="mt-6 divide-y divide-navy-900/10 border border-navy-900/10 bg-white">
            {myOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-4 text-sm">
                <span className="flex items-center gap-2 text-navy-900/70">
                  <ShoppingBag size={14} /> {o.itemType} · {o.provider}
                </span>
                <span className="coord text-xs text-navy-900/40">
                  ${(o.amountCents / 100).toFixed(2)} {o.currency}
                </span>
                <span className={`eyebrow ${o.status === "paid" ? "text-green-600" : "text-gold-600"}`}>{o.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
