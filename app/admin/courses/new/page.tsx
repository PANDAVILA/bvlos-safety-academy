export const dynamic = "force-dynamic";
import ImageUploadField from "@/components/ImageUploadField";

import { createCourse } from "@/lib/actions/courses";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewCoursePage() {
  return (
    <div>
      <Link href="/admin/courses" className="flex items-center gap-2 text-sm text-navy-900/60 hover:text-navy-900">
        <ArrowLeft size={14} /> Back to courses
      </Link>
      <h1 className="mt-4 font-display text-3xl text-navy-900">New course</h1>

      <form action={createCourse} className="mt-8 max-w-2xl space-y-5 border border-navy-900/10 bg-white p-6">
        <div>
          <label className="eyebrow text-navy-900/60">Title</label>
          <input name="title" required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Slug (URL) — leave blank to auto-generate from title</label>
          <input name="slug" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Subtitle</label>
          <input name="subtitle" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Description</label>
          <textarea name="description" rows={4} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-navy-900/60">Level</label>
            <select name="level" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
              <option value="foundation">Foundation</option>
              <option value="advanced">Advanced</option>
              <option value="specialist">Specialist</option>
            </select>
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Category</label>
            <select name="category" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
              <option value="bvlos">BVLOS</option>
              <option value="risk-assessment">Risk assessment</option>
              <option value="sms">SMS</option>
              <option value="conops">ConOps</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="eyebrow text-navy-900/60">Price (USD, 0 = free)</label>
            <input name="price" type="number" step="0.01" min="0" defaultValue="0" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Duration (hours)</label>
            <input name="durationHours" type="number" min="0" defaultValue="0" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
        </div>
        <ImageUploadField name="coverImage" label="Cover image" defaultValue="/brand/hero-1.png" />
        <label className="flex items-center gap-2 text-sm text-navy-900/70">
          <input type="checkbox" name="published" defaultChecked /> Published (visible on the site)
        </label>
        <button type="submit" className="bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
          Create course
        </button>
      </form>
    </div>
  );
}
