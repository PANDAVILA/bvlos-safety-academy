export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteArticle } from "@/lib/actions/articles";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default function AdminArticlesPage() {
  const allArticles = db.select().from(articles).all();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold-600">Admin</p>
          <h1 className="mt-2 font-display text-3xl text-navy-900">News & Reports</h1>
        </div>
        <Link href="/admin/articles/new" className="flex items-center gap-2 bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
          <Plus size={16} /> New article
        </Link>
      </div>

      <div className="mt-8 divide-y divide-navy-900/10 border border-navy-900/10 bg-white">
        {allArticles.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-display text-navy-900">{a.title}</p>
              <p className="text-xs text-navy-900/50">{a.slug} · {a.type} · {a.published ? "Published" : "Draft"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/articles/${a.id}`} className="eyebrow px-3 py-1.5 text-navy-900 hover:text-gold-600">
                Edit
              </Link>
              <form action={deleteArticle.bind(null, a.id)}>
                <ConfirmSubmitButton confirmMessage={`Delete "${a.title}"?`} className="eyebrow px-3 py-1.5 text-red-600 hover:text-red-800">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {allArticles.length === 0 && <p className="p-6 text-navy-900/50">No articles yet.</p>}
      </div>
    </div>
  );
}
