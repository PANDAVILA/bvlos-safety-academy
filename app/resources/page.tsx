import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

const typeLabel: Record<string, string> = { ebook: "eBook", template: "Template", checklist: "Checklist" };

export default function ResourcesPage() {
  const list = db.select().from(products).where(eq(products.published, true)).all();

  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow text-gold-400">Digital resources</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
            eBooks, Templates & Checklists
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            Ready-to-use material for your safety documentation and operations: guides, editable templates, and checklists developed by our technical team.
          </p>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => (
              <Link key={p.id} href={`/resources/${p.slug}`} className="group flex flex-col border border-navy-900/10 bg-white">
                <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                  {p.coverImage && <Image src={p.coverImage} alt={p.title} fill className="object-cover transition duration-500 group-hover:scale-105" />}
                  <span className="eyebrow absolute left-4 top-4 bg-gold-500 px-2 py-1 text-navy-950">{typeLabel[p.type]}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-navy-900">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-navy-900/60">{p.description}</p>
                  <p className="mt-auto pt-4 font-display text-navy-900">{formatPrice(p.priceCents, p.currency || "USD")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
