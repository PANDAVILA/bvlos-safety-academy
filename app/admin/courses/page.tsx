export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteCourse, togglePublishCourse } from "@/lib/actions/courses";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default function AdminCoursesPage() {
  const allCourses = db.select().from(courses).all();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold-600">Admin</p>
          <h1 className="mt-2 font-display text-3xl text-navy-900">Courses</h1>
        </div>
        <Link href="/admin/courses/new" className="flex items-center gap-2 bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
          <Plus size={16} /> New course
        </Link>
      </div>

      <div className="mt-8 divide-y divide-navy-900/10 border border-navy-900/10 bg-white">
        {allCourses.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-display text-navy-900">{c.title}</p>
              <p className="text-xs text-navy-900/50">{c.slug} · {c.category} · {c.level} · ${(c.priceCents / 100).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <form action={togglePublishCourse.bind(null, c.id, !c.published)}>
                <button
                  type="submit"
                  className={`eyebrow px-3 py-1.5 ${c.published ? "bg-green-600/10 text-green-700" : "bg-navy-900/10 text-navy-900/50"}`}
                >
                  {c.published ? "Published" : "Draft"}
                </button>
              </form>
              <Link href={`/admin/courses/${c.id}`} className="eyebrow px-3 py-1.5 text-navy-900 hover:text-gold-600">
                Edit
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteCourse(c.id);
                }}
              >
                <ConfirmSubmitButton
                  confirmMessage={`Delete "${c.title}"? This removes all its modules, lessons, and enrollments. This cannot be undone.`}
                  className="eyebrow px-3 py-1.5 text-red-600 hover:text-red-800"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {allCourses.length === 0 && <p className="p-6 text-navy-900/50">No courses yet.</p>}
      </div>
    </div>
  );
}
