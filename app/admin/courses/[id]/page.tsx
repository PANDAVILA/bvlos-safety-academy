export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { courses, modules, lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, PlayCircle } from "lucide-react";
import {
  updateCourse,
  createModule,
  deleteModule,
  moveModule,
  updateModuleQuiz,
  createLesson,
  updateLesson,
  deleteLesson,
  moveLesson,
  enrollSelfForPreview,
} from "@/lib/actions/courses";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ImageUploadField from "@/components/ImageUploadField";
import AttachmentUploadField from "@/components/AttachmentUploadField";
import MarkdownEditor from "@/components/MarkdownEditor";
import QuizEditor from "@/components/QuizEditor";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const course = db.select().from(courses).where(eq(courses.id, params.id)).get();
  if (!course) return notFound();

  const courseModules = db.select().from(modules).where(eq(modules.courseId, course.id)).all().sort((a, b) => a.order - b.order);
  const modulesWithLessons = courseModules.map((m) => ({
    module: m,
    lessons: db.select().from(lessons).where(eq(lessons.moduleId, m.id)).all().sort((a, b) => a.order - b.order),
  }));

  const updateCourseWithId = updateCourse.bind(null, course.id);

  return (
    <div>
      <Link href="/admin/courses" className="flex items-center gap-2 text-sm text-navy-900/60 hover:text-navy-900">
        <ArrowLeft size={14} /> Back to courses
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-navy-900">{course.title}</h1>
        <form action={enrollSelfForPreview.bind(null, course.id)}>
          <button type="submit" className="eyebrow flex items-center gap-2 border border-gold-500 px-4 py-2 text-gold-600 hover:bg-gold-500 hover:text-navy-950">
            <PlayCircle size={15} /> Preview as enrolled student
          </button>
        </form>
      </div>

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
        <div>
          <label className="eyebrow text-navy-900/60">What you&apos;ll learn (one per line)</label>
          <textarea
            name="learningOutcomes"
            defaultValue={course.learningOutcomes ?? ""}
            rows={4}
            placeholder={"Calculate GRC and ARC step by step\nBuild a defensible ConOps\nDesign mitigations that hold up under audit"}
            className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-navy-900/40">Shown as a bullet checklist on the course page before purchase.</p>
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
        <ImageUploadField name="coverImage" label="Cover image" defaultValue={course.coverImage ?? ""} />
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
          {modulesWithLessons.map(({ module: m, lessons: moduleLessons }, mi) => (
            <div key={m.id} className="border border-navy-900/10 bg-white">
              <div className="flex items-center justify-between border-b border-navy-900/10 bg-navy-900/5 p-4">
                <p className="font-display text-navy-900">{m.title}</p>
                <div className="flex items-center gap-1">
                  <form action={moveModule.bind(null, course.id, m.id, "up")}>
                    <button type="submit" disabled={mi === 0} className="p-1.5 text-navy-900/50 hover:text-navy-900 disabled:opacity-20">
                      <ArrowUp size={15} />
                    </button>
                  </form>
                  <form action={moveModule.bind(null, course.id, m.id, "down")}>
                    <button type="submit" disabled={mi === modulesWithLessons.length - 1} className="p-1.5 text-navy-900/50 hover:text-navy-900 disabled:opacity-20">
                      <ArrowDown size={15} />
                    </button>
                  </form>
                  <form action={deleteModule.bind(null, course.id, m.id)}>
                    <ConfirmSubmitButton
                      confirmMessage={`Delete module "${m.title}" and all its lessons?`}
                      className="p-1.5 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={15} />
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>

              <div className="divide-y divide-navy-900/5">
                {moduleLessons.map((l, li) => (
                  <details key={l.id} className="p-4">
                    <summary className="cursor-pointer text-sm font-medium text-navy-900">{l.title}</summary>

                    <div className="mt-3 flex items-center gap-1">
                      <form action={moveLesson.bind(null, course.id, m.id, l.id, "up")}>
                        <button type="submit" disabled={li === 0} className="flex items-center gap-1 text-xs text-navy-900/50 hover:text-navy-900 disabled:opacity-20">
                          <ArrowUp size={13} /> Move up
                        </button>
                      </form>
                      <span className="mx-1 text-navy-900/20">·</span>
                      <form action={moveLesson.bind(null, course.id, m.id, l.id, "down")}>
                        <button type="submit" disabled={li === moduleLessons.length - 1} className="flex items-center gap-1 text-xs text-navy-900/50 hover:text-navy-900 disabled:opacity-20">
                          <ArrowDown size={13} /> Move down
                        </button>
                      </form>
                    </div>

                    <form action={updateLesson.bind(null, course.id, l.id)} className="mt-4 space-y-3">
                      <input name="title" defaultValue={l.title} className="w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" placeholder="Lesson title" />

                      <div>
                        <label className="eyebrow text-navy-900/50">Content</label>
                        <div className="mt-1">
                          <MarkdownEditor name="content" defaultValue={l.content} rows={5} />
                        </div>
                      </div>

                      <ImageUploadField name="image" label="Lesson image (optional)" defaultValue={l.image ?? ""} />

                      <div>
                        <label className="eyebrow text-navy-900/50">Video URL (optional)</label>
                        <input
                          name="videoUrl"
                          defaultValue={l.videoUrl ?? ""}
                          placeholder="https://www.youtube.com/watch?v=... or Vimeo link"
                          className="mt-2 w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <AttachmentUploadField
                        urlFieldName="attachmentUrl"
                        nameFieldName="attachmentName"
                        label="Downloadable attachment (optional)"
                        defaultUrl={l.attachmentUrl ?? ""}
                        defaultName={l.attachmentName ?? ""}
                      />

                      <div className="flex items-center gap-4">
                        <input name="durationMinutes" type="number" min="1" defaultValue={l.durationMinutes} className="w-24 border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none" />
                        <label className="flex items-center gap-2 text-xs text-navy-900/60">
                          <input type="checkbox" name="isPreview" defaultChecked={l.isPreview} /> Free preview
                        </label>
                      </div>
                      <button type="submit" className="eyebrow bg-navy-900 px-3 py-1.5 text-white hover:bg-navy-800">
                        Save
                      </button>
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

              <details className="border-t border-navy-900/10 p-4">
                <summary className="eyebrow cursor-pointer text-gold-600">Module quiz ({(() => {
                  try { return JSON.parse(m.quizJson || "[]").length; } catch { return 0; }
                })()} questions)</summary>
                <form action={async (formData: FormData) => {
                  "use server";
                  await updateModuleQuiz(course.id, m.id, String(formData.get("quiz") || "[]"));
                }} className="mt-4">
                  <QuizEditor name="quiz" defaultValue={m.quizJson ?? "[]"} />
                  <button type="submit" className="eyebrow mt-4 bg-navy-900 px-4 py-2 text-white hover:bg-navy-800">
                    Save quiz
                  </button>
                </form>
              </details>
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
