export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import BuyButtons from "@/components/BuyButtons";

const typeLabel: Record<string, string> = { ebook: "eBook", template: "Plantilla", checklist: "Checklist" };

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const product = db.select().from(products).where(eq(products.slug, params.slug)).get();
  if (!product) return notFound();

  return (
    <div className="chart-bg-light">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden border border-navy-900/10">
          {product.coverImage && <Image src={product.coverImage} alt={product.title} fill className="object-cover" />}
        </div>
        <div>
          <p className="eyebrow text-gold-600">{typeLabel[product.type]}</p>
          <h1 className="mt-3 font-display text-3xl text-navy-900">{product.title}</h1>
          <p className="mt-4 text-navy-900/70">{product.description}</p>
          <p className="mt-8 font-display text-3xl text-navy-900">${(product.priceCents / 100).toFixed(2)} {product.currency}</p>
          <div className="mt-6 max-w-sm">
            <BuyButtons itemType="product" itemId={product.id} priceCents={product.priceCents} currency={product.currency} />
          </div>
        </div>
      </div>
    </div>
  );
}
