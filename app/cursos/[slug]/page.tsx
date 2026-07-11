import { db } from "@/lib/db";
import { courses, modules, lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Lock, PlayCircle, Clock } from "lucide-react";
import BuyButtons from "@/components/BuyButtons";

export default function CourseDetail({ params }: { params: { slug: string } }) {
  const course = db.select().from(courses).where(eq(courses.slug, params.slug)).get();
  if (!course) return notFound();

  const courseModules = db.select().from(modules).where(eq(modules.courseId, course.id)).all();
  const allLessons = courseModules.map((m) => ({
    module: m,
    lessons: db.select().from(lessons).where(eq(lessons.moduleId, m.id)).all(),
  }));

  const totalLessons = allLessons.reduce((acc, m) => acc + m.lessons.length, 0);
  const price = course.priceCents === 0 ? "Gratis" : `$${(course.priceCents / 100).toFixed(0)} ${course.currency}`;

  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow text-gold-400">{course.category.toUpperCase()} · {course.level.toUpperCase()}</p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-white/70">{course.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2"><Clock size={15} /> {course.durationHours} horas</span>
              <span className="flex items-center gap-2"><PlayCircle size={15} /> {totalLessons} lecciones</span>
            </div>
          </div>
          <div className="border border-white/15 bg-navy-950/40 p-6">
            <div className="relative aspect-video overflow-hidden">
              {course.coverImage && <Image src={course.coverImage} alt={course.title} fill className="object-cover" />}
            </div>
            <p className="mt-6 font-display text-2xl text-white">{price}</p>
            <div className="mt-4">
              <BuyButtons itemType="course" itemId={course.id} priceCents={course.priceCents} currency={course.currency} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl text-navy-900">Sobre este curso</h2>
            <p className="mt-4 text-navy-900/70">{course.description}</p>

            <h2 className="mt-14 font-display text-2xl text-navy-900">Contenido del curso</h2>
            <div className="mt-6 divide-y divide-navy-900/10 border border-navy-900/10">
              {allLessons.map(({ module, lessons: ls }) => (
                <div key={module.id} className="p-6">
                  <p className="eyebrow text-gold-600">{module.title}</p>
                  <ul className="mt-4 space-y-3">
                    {ls.map((l) => (
                      <li key={l.id} className="flex items-center justify-between text-sm text-navy-900/70">
                        <span className="flex items-center gap-2">
                          {l.isPreview ? <PlayCircle size={15} className="text-gold-600" /> : <Lock size={15} className="text-navy-900/30" />}
                          {l.title}
                        </span>
                        <span className="coord text-xs text-navy-900/40">{l.durationMinutes} min</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit border border-navy-900/10 bg-navy-900 p-6 text-white">
            <p className="eyebrow text-gold-400">Incluye</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {[
                "Acceso de por vida al contenido",
                "Certificado de finalización",
                "Plantillas y recursos descargables",
                "Actualizaciones normativas incluidas",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-gold-400" />
                  {i}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
