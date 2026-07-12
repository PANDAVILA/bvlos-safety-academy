export const dynamic = "force-dynamic";

import { createArticle } from "@/lib/actions/articles";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewArticlePage() {
  return (
    <div>
      <Link href="/admin/articles" className="flex items-center gap-2 text-sm text-navy-900/60 hover:text-navy-900">
        <ArrowLeft size={14} /> Back to articles
      </Link>
      <h1 className="mt-4 font-display text-3xl text-navy-900">New article</h1>

      <form action={createArticle} className="mt-8 max-w-2xl space-y-5 border border-navy-900/10 bg-white p-6">
        <div>
          <label className="eyebrow text-navy-900/60">Title</label>
          <input name="title" required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Slug (URL) — leave blank to auto-generate</label>
          <input name="slug" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Type</label>
          <select name="type" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
            <option value="news">News</option>
            <option value="report">Report</option>
          </select>
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Excerpt (short summary)</label>
          <textarea name="excerpt" rows={2} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Body</label>
          <textarea name="body" rows={8} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Author</label>
          <input name="author" defaultValue="BVLOS Safety Academy" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Cover image path</label>
          <input name="coverImage" defaultValue="/brand/hero-1.png" className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-900/70">
          <input type="checkbox" name="published" defaultChecked /> Published
        </label>
        <button type="submit" className="bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
          Create article
        </button>
      </form>
    </div>
  );
}
