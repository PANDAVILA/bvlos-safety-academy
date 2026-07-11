import Link from "next/link";
import Image from "next/image";
import { Clock, BarChart3 } from "lucide-react";

const levelLabel: Record<string, string> = {
  foundation: "Fundamentos",
  advanced: "Avanzado",
  specialist: "Especialista",
};

export default function CourseCard({ course }: { course: any }) {
  const price = course.priceCents === 0 ? "Gratis" : `$${(course.priceCents / 100).toFixed(0)}`;
  return (
    <Link href={`/cursos/${course.slug}`} className="group flex flex-col border border-navy-900/10 bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
        {course.coverImage && (
          <Image
            src={course.coverImage}
            alt={course.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <span className="eyebrow absolute left-4 top-4 bg-gold-500 px-2 py-1 text-navy-950">
          {levelLabel[course.level] ?? course.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow text-gold-600">{course.category}</p>
        <h3 className="mt-2 font-display text-lg text-navy-900">{course.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-navy-900/60">{course.subtitle}</p>
        <div className="mt-6 flex items-center justify-between border-t border-navy-900/10 pt-4">
          <div className="flex items-center gap-4 text-xs text-navy-900/50">
            <span className="flex items-center gap-1"><Clock size={13} /> {course.durationHours}h</span>
            <span className="flex items-center gap-1"><BarChart3 size={13} /> {levelLabel[course.level] ?? course.level}</span>
          </div>
          <span className="font-display text-navy-900">{price}</span>
        </div>
      </div>
    </Link>
  );
}
