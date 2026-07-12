export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Globe2, Users, TrendingUp, FileText, Newspaper, Radar } from "lucide-react";
import { db } from "@/lib/db";
import { courses, articles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import CourseCard from "@/components/CourseCard";
import ArticleCard from "@/components/ArticleCard";

export default function Home() {
  const featuredCourses = db.select().from(courses).where(eq(courses.published, true)).all().slice(0, 3);
  const latestArticles = db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.publishedAt)).all().slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="chart-bg relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <p className="eyebrow text-gold-400">Knowledge · Standards · Safety</p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
              The most dangerous BVLOS risk is the one nobody reports.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/70">
              Specialized training, certifications, and consulting for teams operating beyond visual line of
              sight. We turn regulatory compliance into real operational safety.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/cursos"
                className="group flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 transition hover:bg-gold-400"
              >
                Browse course catalog
                <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/aerosafety-case"
                className="flex items-center gap-2 border border-white/25 px-6 py-3 font-medium text-white transition hover:border-gold-400 hover:text-gold-400"
              >
                Try AeroSafety Case
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-white/80 sm:max-w-md">
              <div>
                <p className="font-display text-2xl text-gold-400">40+</p>
                <p className="eyebrow mt-1 text-white/40">Technical modules</p>
              </div>
              <div>
                <p className="font-display text-2xl text-gold-400">18</p>
                <p className="eyebrow mt-1 text-white/40">Countries</p>
              </div>
              <div>
                <p className="font-display text-2xl text-gold-400">SMS</p>
                <p className="eyebrow mt-1 text-white/40">Aligned</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 border border-gold-500/20" />
            <Image
              src="/brand/hero-1.png"
              alt="BVLOS operator analyzing airspace"
              width={900}
              height={700}
              className="relative w-full object-cover"
              priority
            />
            <div className="absolute -bottom-6 -left-6 hidden border border-navy-900/10 bg-white px-5 py-4 shadow-xl lg:block">
              <p className="coord text-xs text-navy-900/50">RISK CLASS</p>
              <p className="font-display text-lg text-navy-900">GRC 4 · ARC-c</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE IS NOT SAFETY */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="eyebrow text-gold-600">The operational gap</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
              Compliance is not safety.
            </h2>
            <p className="mt-5 text-navy-900/70">
              Meeting the regulation certifies a paper trail; it doesn&apos;t certify that the crew will recognize
              operational drift in real time. BVLOS Safety Academy trains remote pilots, operations managers, and
              SMS teams to close that gap with judgment, not just paperwork.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Methodology grounded in SMS, ConOps, and real risk management",
                "Case studies from anonymized real-world incidents",
                "Certification valid for authority-facing operational files",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-navy-900/80">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-gold-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2">
            <Image
              src="/brand/hero-2.png"
              alt="Compliance is not safety"
              width={900}
              height={650}
              className="w-full border border-navy-900/10 object-cover"
            />
          </div>
        </div>
      </section>

      {/* OPERATIONAL DRIFT feature strip */}
      <section className="chart-bg-light border-y border-navy-900/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <Image
              src="/brand/drift-1.png"
              alt="Operational drift in BVLOS operations"
              width={900}
              height={650}
              className="w-full border border-navy-900/10 object-cover"
            />
            <div>
              <p className="eyebrow text-gold-600">Operational drift</p>
              <h3 className="mt-4 font-display text-3xl font-semibold text-navy-900">
                The silent risk in BVLOS operations.
              </h3>
              <p className="mt-5 text-navy-900/70">
                The gap between the planned route and the actual track grows gradually and almost
                imperceptibly. Our risk mitigation modules train teams to spot that drift before it becomes a
                reportable event.
              </p>
              <Link href="/cursos?categoria=risk-assessment" className="mt-6 inline-flex items-center gap-2 font-medium text-navy-900 hover:text-gold-600">
                View risk management courses <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM PILLARS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-600">The platform</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
              Everything a BVLOS team needs, in one place.
            </h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: "LMS Academy", desc: "Tiered courses with assessments, certificates, and progress tracking.", href: "/cursos" },
              { icon: Newspaper, title: "News", desc: "Regulatory and industry updates for the BVLOS sector, curated by experts.", href: "/noticias" },
              { icon: FileText, title: "Reports", desc: "Technical analysis, case studies, and incident reports.", href: "/informes" },
              { icon: Radar, title: "AeroSafety Case", desc: "Try our risk assessment and safety case tool.", href: "/aerosafety-case" },
            ].map((f) => (
              <Link key={f.title} href={f.href} className="group flex flex-col gap-4 bg-white p-8 transition hover:bg-navy-900">
                <f.icon size={22} className="text-gold-600 group-hover:text-gold-400" />
                <p className="font-display text-lg text-navy-900 group-hover:text-white">{f.title}</p>
                <p className="text-sm text-navy-900/60 group-hover:text-white/60">{f.desc}</p>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-navy-900 group-hover:text-gold-400">
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="chart-bg-light border-y border-navy-900/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-gold-600">Training</p>
              <h2 className="mt-4 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">Featured courses</h2>
            </div>
            <Link href="/cursos" className="flex items-center gap-2 font-medium text-navy-900 hover:text-gold-600">
              View full catalog <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featuredCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTING CTA */}
      <section className="chart-bg relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow text-gold-400">Consulting</p>
              <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
                Need expert support for your operational file?
              </h2>
              <p className="mt-5 text-white/70">
                We design ConOps, risk assessments, safety cases, and tailored SMS programs for operators,
                manufacturers, and public administrations.
              </p>
              <Link
                href="/consultoria"
                className="mt-8 inline-flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400"
              >
                Request a proposal <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe2, label: "SMS assessment" },
                { icon: Users, label: "SMS audit" },
                { icon: FileText, label: "Safety case" },
                { icon: TrendingUp, label: "Tailored ConOps" },
              ].map((s) => (
                <div key={s.label} className="border border-white/15 p-6">
                  <s.icon size={20} className="text-gold-400" />
                  <p className="mt-4 text-sm text-white/80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEWS / REPORTS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-gold-600">Latest publications</p>
              <h2 className="mt-4 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
                Industry news and reports
              </h2>
            </div>
            <Link href="/noticias" className="flex items-center gap-2 font-medium text-navy-900 hover:text-gold-600">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {latestArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
