import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";

export default function ArticleDetail({ params }: { params: { slug: string } }) {
  const article = db.select().from(articles).where(eq(articles.slug, params.slug)).get();
  if (!article) return notFound();

  return (
    <article>
      <section className="chart-bg">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <p className="eyebrow text-gold-400">{article.type === "report" ? "Informe" : "Noticia"}</p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{article.title}</h1>
          <p className="mt-4 coord text-sm text-white/50">
            {article.author} ·{" "}
            {new Date(article.publishedAt as string).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          {article.coverImage && (
            <div className="relative mb-10 aspect-video overflow-hidden border border-navy-900/10">
              <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
            </div>
          )}
          <p className="text-lg text-navy-900/80">{article.excerpt}</p>
          <p className="mt-6 whitespace-pre-line text-navy-900/70">{article.body}</p>
        </div>
      </section>
    </article>
  );
}
