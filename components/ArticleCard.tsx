import Link from "next/link";
import Image from "next/image";

export default function ArticleCard({ article }: { article: any }) {
  const base = article.type === "report" ? "/informes" : "/noticias";
  return (
    <Link href={`${base}/${article.slug}`} className="group flex flex-col border border-navy-900/10 bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <span className="eyebrow absolute left-4 top-4 bg-white/90 px-2 py-1 text-navy-900">
          {article.type === "report" ? "Informe" : "Noticia"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="coord text-xs text-navy-900/40">
          {new Date(article.publishedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
        <h3 className="mt-2 font-display text-lg text-navy-900 group-hover:text-gold-600">{article.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-navy-900/60">{article.excerpt}</p>
      </div>
    </Link>
  );
}
