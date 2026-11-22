import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import ArticleCard from "@/components/ArticleCard";

export default function ReportsPage() {
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
          <p className="eyebrow text-gold-400">Research</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Technical Reports</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Case studies, operational data analysis, and technical reports from the BVLOS Safety Academy research team.
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
