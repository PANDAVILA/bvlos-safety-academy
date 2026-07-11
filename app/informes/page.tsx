import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import ArticleCard from "@/components/ArticleCard";

export default function InformesPage() {
  const list = db
    .select()
    .from(articles)
    .where(and(eq(articles.published, true), eq(articles.type, "report")))
    .orderBy(desc(articles.publishedAt))
    .all();

  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow text-gold-400">Investigación</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Informes técnicos</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Estudios de caso, análisis de datos operativos y reportes técnicos elaborados por el departamento de
            investigación de BVLOS Safety Academy.
          </p>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
