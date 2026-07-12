export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import Link from "next/link";
import { Plus } from "lucide-react";
import { deleteProduct } from "@/lib/actions/products";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export default function AdminProductsPage() {
  const allProducts = db.select().from(products).all();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold-600">Admin</p>
          <h1 className="mt-2 font-display text-3xl text-navy-900">Resources</h1>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800">
          <Plus size={16} /> New product
        </Link>
      </div>

      <div className="mt-8 divide-y divide-navy-900/10 border border-navy-900/10 bg-white">
        {allProducts.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-display text-navy-900">{p.title}</p>
              <p className="text-xs text-navy-900/50">{p.slug} · {p.type} · ${(p.priceCents / 100).toFixed(2)} · {p.published ? "Published" : "Draft"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/products/${p.id}`} className="eyebrow px-3 py-1.5 text-navy-900 hover:text-gold-600">
                Edit
              </Link>
              <form action={deleteProduct.bind(null, p.id)}>
                <ConfirmSubmitButton confirmMessage={`Delete "${p.title}"?`} className="eyebrow px-3 py-1.5 text-red-600 hover:text-red-800">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {allProducts.length === 0 && <p className="p-6 text-navy-900/50">No products yet.</p>}
      </div>
    </div>
  );
}
