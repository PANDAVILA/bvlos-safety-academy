export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { courses, modules, lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  updateCourse,
  createModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/actions/courses";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const course = db.select().from(courses).where(eq(courses.id, params.id)).get();
  if (!course) return notFound();

  const courseModules = db.select().from(modules).where(eq(modules.courseId, course.id)).all();
  const modulesWithLessons = courseModules.map((m) => ({
    module: m,
    lessons: db.select().from(lessons).where(eq(lessons.moduleId, m.id)).all(),
  }));

  const updateCourseWithId = updateCourse.bind(null, course.id);

  return (
    <div>
      <Link href="/admin/courses" className="flex items-center gap-2 text-sm text-navy-900/60 hover:text-navy-900">
        <ArrowLeft size={14} /> Back to courses
      </Link>
      <h1 className="mt-4 font-display text-3xl text-navy-900">{course.title}</h1>

      {/* Course fields */}
      <form action={updateCourseWithId} className="mt-8 max-w-2xl space-y-5 border border-navy-900/10 bg-white p-6">
        <p className="eyebrow text-gold-600">Course details</p>
        <div>
          <label className="eyebrow text-navy-900/60">Title</label>
          <input name="title" defaultValue={course.title} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Slug (URL)</label>
          <input name="slug" defaultValue={course.slug} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Subtitle</label>
          <input name="subtitle" defaultValue={course.subtitle ?? ""} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Description</label>
          <textarea name="description" defaultValue={course.description} rows={4} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-navy-900/60">Level</label>
            <select name="level" defaultValue={course.level} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
              <option value="foundation">Foundation</option>
              <option value="advanced">Advanced</option>
              <option value="specialist">Specialist</option>
            </select>
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Category</label>
            <select name="category" defaultValue={course.category} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
              <option value="bvlos">BVLOS</option>
              <option value="risk-assessment">Risk assessment</option>
              <option value="sms">SMS</option>
              <option value="conops">ConOps</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-navy-900/60">Price (USD)</label>
            <input name="price" type="number" step="0.01" min="0" defaultValue={(course.priceCents / 100).toFixed(2)} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Duration (hours)</label>
            <input name="durationHours" type="number" min="0" defaultValue={course.durationHours} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Cover image path</label>
          <input name="coverImage" defaultValue={course.coverImage ?? ""} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-900/70">
          <input type="checkbox" name="published" defaultChecked={course.published} /> Published
        </label>
        <button type="submit" className="bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800">
          Save changes
        </button>
      </form>

      {/* Modules & lessons */}
      <div className="mt-12 max-w-2xl">
        <p className="eyebrow text-gold-600">Content</p>
        <h2 className="mt-2 font-display text-xl text-navy-900">Modules & lessons</h2>

        <div className="mt-6 space-y-6">
          {modulesWithLessons.map(({ module: m, lessons: moduleLessons }) => (
            <div key={m.id} className="border border-navy-900/10 bg-white">
              <div className="flex items-center justify-between border-b border-navy-900/10 bg-navy-900/5 p-4">
                <p className="font-display text-navy-900">{m.title}</p>
                <form action={deleteModule.bind(null, course.id, m.id)}>
                  <ConfirmSubmitButton
                    confirmMessage={`Delete module "${m.title}" and all its lessons?`}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={15} />
                  </ConfirmSubmitButton>
                </form>
              </div>

              <div className="divide-y divide-navy-900/5">
                {moduleLessons.map((l) => (
                  <details key={l.id} className="p-4">
                    <summary className="cursor-pointer text-sm font-medium text-navy-900">{l.title}</summary>
                    <form action={updateLesson.bind(null, course.id, l.id)} className="mt-4 space-y-3">
                      <input name="title" defaultValue={l.title} className="w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" placeholder="Lesson title" />
                      <textarea name="content" defaultValue={l.content} rows={3} className="w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" placeholder="Lesson content" />
                      <div className="flex items-center gap-4">
                        <input name="durationMinutes" type="number" min="1" defaultValue={l.durationMinutes} className="w-24 border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" />
                        <label className="flex items-center gap-2 text-xs text-navy-900/60">
                          <input type="checkbox" name="isPreview" defaultChecked={l.isPreview} /> Free preview
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="submit" className="eyebrow bg-navy-900 px-3 py-1.5 text-white hover:bg-navy-800">
                          Save
                        </button>
                      </div>
                    </form>
                    <form action={deleteLesson.bind(null, course.id, l.id)} className="mt-2">
                      <ConfirmSubmitButton confirmMessage={`Delete lesson "${l.title}"?`} className="eyebrow text-red-600 hover:text-red-800">
                        Delete lesson
                      </ConfirmSubmitButton>
                    </form>
                  </details>
                ))}
              </div>

              <form action={createLesson.bind(null, course.id, m.id)} className="space-y-2 border-t border-navy-900/10 p-4">
                <p className="eyebrow text-navy-900/40">Add a lesson</p>
                <input name="title" placeholder="Lesson title" required className="w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" />
                <textarea name="content" placeholder="Lesson content" rows={2} className="w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" />
                <div className="flex items-center gap-3">
                  <input name="durationMinutes" type="number" min="1" defaultValue={15} className="w-24 border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" />
                  <button type="submit" className="eyebrow flex items-center gap-1 bg-gold-500 px-3 py-1.5 text-navy-950 hover:bg-gold-400">
                    <Plus size={13} /> Add lesson
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>

        <form action={createModule.bind(null, course.id)} className="mt-6 flex items-center gap-3 border border-dashed border-navy-900/20 p-4">
          <input name="title" placeholder="New module title" required className="flex-1 border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" />
          <button type="submit" className="eyebrow flex items-center gap-1 bg-navy-900 px-4 py-2 text-white hover:bg-navy-800">
            <Plus size={13} /> Add module
          </button>
        </form>
      </div>
    </div>
  );
}
