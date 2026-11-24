import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import BuyButtons from "@/components/BuyButtons";
import { formatPrice } from "@/lib/format";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userCanDownload } from "@/lib/downloads";
import { Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const typeLabel: Record<string, string> = { ebook: "eBook", template: "Template", checklist: "Checklist" };

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = db.select().from(products).where(eq(products.slug, params.slug)).get();
  if (!product) return notFound();
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  const canDownload = !!product.fileUrl && userCanDownload(product, user);
  const isFree = product.priceCents === 0;

  return (
    <div className="chart-bg-light">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden border border-navy-900/10">
          {product.coverImage && <Image src={product.coverImage} alt={product.title} fill className="object-cover" />}
        </div>
        <div>
          <p className="eyebrow text-gold-600">{typeLabel[product.type]}</p>
          <h1 className="mt-3 font-display text-3xl text-navy-900">{product.title}</h1>
          <p className="mt-4 whitespace-pre-line text-navy-900/70">{product.description}</p>
          <p className="mt-8 font-display text-3xl text-navy-900">{formatPrice(product.priceCents, product.currency, { withCode: true })}</p>
          <div className="mt-6 max-w-sm">
            {canDownload ? (
              <a
                href={`/api/products/${product.id}/download`}
                className="flex w-full items-center justify-center gap-2 bg-gold-500 px-6 py-3 font-semibold text-navy-950 transition hover:bg-gold-400"
              >
                <Download size={18} /> Download
              </a>
            ) : isFree && product.fileUrl ? (
              <Link
                href={`/login?callbackUrl=/resources/${product.slug}`}
                className="flex w-full items-center justify-center gap-2 bg-gold-500 px-6 py-3 font-semibold text-navy-950 transition hover:bg-gold-400"
              >
                <Download size={18} /> Sign in to download (free)
              </Link>
            ) : (
              <BuyButtons itemType="product" itemId={product.id} priceCents={product.priceCents} currency={product.currency} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
