export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { courses, modules, lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, Lock, PlayCircle, Clock } from "lucide-react";
import Link from "next/link";
import BuyButtons from "@/components/BuyButtons";
import DisclaimerNote from "@/components/DisclaimerNote";
import { formatPrice } from "@/lib/format";

export default function CourseDetail({ params }: { params: { slug: string } }) {
  const course = db.select().from(courses).where(eq(courses.slug, params.slug)).get();
  if (!course) return notFound();

  const courseModules = db.select().from(modules).where(eq(modules.courseId, course.id)).all().sort((a, b) => a.order - b.order);
  const allLessons = courseModules.map((m) => ({
    module: m,
    lessons: db.select().from(lessons).where(eq(lessons.moduleId, m.id)).all().sort((a, b) => a.order - b.order),
  }));

  const totalLessons = allLessons.reduce((acc, m) => acc + m.lessons.length, 0);
  const price = formatPrice(course.priceCents, course.currency, { withCode: true });

  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow text-gold-400">{course.category.toUpperCase()} · {course.level.toUpperCase()}</p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{course.title}</h1>
            <p className="mt-4 max-w-2xl text-white/70">{course.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2"><Clock size={15} /> {course.durationHours} hours</span>
              <span className="flex items-center gap-2"><PlayCircle size={15} /> {totalLessons} lessons</span>
            </div>
          </div>
          <div className="border border-white/15 bg-navy-950/40 p-6">
            <div className="relative aspect-video overflow-hidden">
              {course.coverImage && <Image src={course.coverImage} alt={course.title} fill className="object-cover" />}
            </div>
            <p className="mt-6 font-display text-2xl text-white">{price}</p>
            <div className="mt-4">
              <BuyButtons itemType="course" itemId={course.id} priceCents={course.priceCents} currency={course.currency} tone="dark" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl text-navy-900">About this course</h2>
            <p className="mt-4 text-navy-900/70">{course.description}</p>

            {course.learningOutcomes && course.learningOutcomes.trim() && (
              <>
                <h2 className="mt-10 font-display text-2xl text-navy-900">What you&apos;ll learn</h2>
                <ul className="mt-4 space-y-3">
                  {course.learningOutcomes
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => (
                      <li key={line} className="flex items-start gap-3 text-navy-900/80">
                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-gold-600" />
                        <span>{line}</span>
                      </li>
                    ))}
                </ul>
              </>
            )}

            {course.frameworks && course.frameworks.trim() && (
              <div className="mt-12 border border-navy-900/10 bg-navy-900/[0.03] p-6">
                <h2 className="font-display text-xl text-navy-900">Curriculum reference frameworks</h2>
                <p className="mt-2 text-sm text-navy-900/60">
                  This course is organized around the frameworks below so your training records map cleanly to the
                  structure auditors, insurers, and clients already use.
                </p>
                <ul className="mt-4 space-y-2">
                  {course.frameworks
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => (
                      <li key={line} className="flex items-start gap-3 text-sm text-navy-900/80">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gold-600" />
                        <span>{line}</span>
                      </li>
                    ))}
                </ul>
                <p className="mt-4 text-xs text-navy-900/50">
                  &quot;Mapped to&quot; describes how our curriculum is organized. It does not mean this course is approved,
                  accredited, or endorsed by the FAA, EASA, ICAO, IBAC, or any other body.{" "}
                  <Link href="/standards" className="text-gold-600 underline">See the full standards map</Link>.
                </p>
              </div>
            )}

            <h2 className="mt-14 font-display text-2xl text-navy-900">Course content</h2>
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

          <aside className="h-fit space-y-6">
           <div className="border border-navy-900/10 bg-navy-900 p-6 text-white">
            <p className="eyebrow text-gold-400">Included</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {[
                "Lifetime access to the content",
                "BSA certificate of completion (not an FAA/EASA/ICAO credential)",
                "Downloadable templates and resources",
                "Regulatory updates included",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-gold-400" />
                  {i}
                </li>
              ))}
            </ul>
           </div>

           <div className="border border-navy-900/10 bg-white p-6">
             <p className="eyebrow text-gold-600">Training a team?</p>
             <p className="mt-3 text-sm text-navy-900/70">
               Team licenses for 5 to 20+ people, with learning paths for executives, Safety Managers, and line pilots,
               invoiced and enrolled for you.
             </p>
             <Link href="/teams" className="mt-4 inline-block text-sm font-medium text-navy-900 underline hover:text-gold-600">
               See team licensing
             </Link>
           </div>

           <div className="border border-navy-900/10 bg-white p-6">
             <p className="eyebrow text-gold-600">Need it implemented?</p>
             <p className="mt-3 text-sm text-navy-900/70">
               Want help turning this into your own SMS manual, ConOps, or a gap audit of your operation?
             </p>
             <Link href="/consulting#contact" className="mt-4 inline-block text-sm font-medium text-navy-900 underline hover:text-gold-600">
               Talk to a consultant
             </Link>
           </div>
          </aside>
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <DisclaimerNote />
        </div>
      </section>
    </div>
  );
}
