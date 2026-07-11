import { db } from "@/lib/db";
import { courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import CourseCard from "@/components/CourseCard";

const categories = [
  { value: "", label: "Todas" },
  { value: "bvlos", label: "BVLOS" },
  { value: "risk-assessment", label: "Gestión de riesgo" },
  { value: "sms", label: "SMS" },
  { value: "conops", label: "ConOps" },
];

export default function CoursesPage({ searchParams }: { searchParams: { categoria?: string } }) {
  const all = db.select().from(courses).where(eq(courses.published, true)).all();
  const filtered = searchParams.categoria
    ? all.filter((c) => c.category === searchParams.categoria)
    : all;

  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="eyebrow text-gold-400">Academia</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Catálogo de cursos</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Formación estructurada por niveles, de fundamentos regulatorios a metodologías avanzadas de evaluación
            de riesgo y gestión de la seguridad operacional.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <a
                key={c.value}
                href={c.value ? `/cursos?categoria=${c.value}` : "/cursos"}
                className={`eyebrow border px-4 py-2 ${
                  (searchParams.categoria ?? "") === c.value
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-navy-900/15 text-navy-900/70 hover:border-navy-900"
                }`}
              >
                {c.label}
              </a>
            ))}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-10 text-navy-900/50">No hay cursos publicados en esta categoría todavía.</p>
          )}
        </div>
      </section>
    </div>
  );
}
