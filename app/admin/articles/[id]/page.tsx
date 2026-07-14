export const dynamic = "force-dynamic";
import ImageUploadField from "@/components/ImageUploadField";

import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateArticle } from "@/lib/actions/articles";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const article = db.select().from(articles).where(eq(articles.id, params.id)).get();
  if (!article) return notFound();

  const updateWithId = updateArticle.bind(null, article.id);

  return (
    <div>
      <Link href="/admin/articles" className="flex items-center gap-2 text-sm text-navy-900/60 hover:text-navy-900">
        <ArrowLeft size={14} /> Back to articles
      </Link>
      <h1 className="mt-4 font-display text-3xl text-navy-900">{article.title}</h1>

      <form action={updateWithId} className="mt-8 max-w-2xl space-y-5 border border-navy-900/10 bg-white p-6">
        <div>
          <label className="eyebrow text-navy-900/60">Title</label>
          <input name="title" defaultValue={article.title} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Slug (URL)</label>
          <input name="slug" defaultValue={article.slug} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Type</label>
          <select name="type" defaultValue={article.type} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
            <option value="news">News</option>
            <option value="report">Report</option>
          </select>
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Excerpt</label>
          <textarea name="excerpt" defaultValue={article.excerpt} rows={2} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Body</label>
          <textarea name="body" defaultValue={article.body} rows={8} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Author</label>
          <input name="author" defaultValue={article.author} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <ImageUploadField name="coverImage" label="Cover image" defaultValue={article.coverImage ?? ""} />
        <label className="flex items-center gap-2 text-sm text-navy-900/70">
          <input type="checkbox" name="published" defaultChecked={article.published} /> Published
        </label>
        <button type="submit" className="bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800">
          Save changes
        </button>
      </form>
    </div>
  );
}
