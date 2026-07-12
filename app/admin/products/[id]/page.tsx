export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateProduct } from "@/lib/actions/products";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = db.select().from(products).where(eq(products.id, params.id)).get();
  if (!product) return notFound();

  const updateWithId = updateProduct.bind(null, product.id);

  return (
    <div>
      <Link href="/admin/products" className="flex items-center gap-2 text-sm text-navy-900/60 hover:text-navy-900">
        <ArrowLeft size={14} /> Back to resources
      </Link>
      <h1 className="mt-4 font-display text-3xl text-navy-900">{product.title}</h1>

      <form action={updateWithId} className="mt-8 max-w-2xl space-y-5 border border-navy-900/10 bg-white p-6">
        <div>
          <label className="eyebrow text-navy-900/60">Title</label>
          <input name="title" defaultValue={product.title} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Slug (URL)</label>
          <input name="slug" defaultValue={product.slug} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Type</label>
          <select name="type" defaultValue={product.type} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
            <option value="ebook">eBook</option>
            <option value="template">Template</option>
            <option value="checklist">Checklist</option>
          </select>
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Description</label>
          <textarea name="description" defaultValue={product.description} rows={4} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Price (USD)</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue={(product.priceCents / 100).toFixed(2)} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Cover image path</label>
          <input name="coverImage" defaultValue={product.coverImage ?? ""} className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Downloadable file URL</label>
          <input name="fileUrl" defaultValue={product.fileUrl ?? ""} placeholder="https://..." className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-900/70">
          <input type="checkbox" name="published" defaultChecked={product.published} /> Published
        </label>
        <button type="submit" className="bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800">
          Save changes
        </button>
      </form>
    </div>
  );
}
