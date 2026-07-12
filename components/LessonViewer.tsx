"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  content: string;
  durationMinutes: number;
  completed: boolean;
};
type ModuleGroup = { id: string; title: string; lessons: Lesson[] };

export default function LessonViewer({
  courseTitle,
  moduleGroups,
  initialLessonId,
}: {
  courseTitle: string;
  moduleGroups: ModuleGroup[];
  initialLessonId: string;
}) {
  const router = useRouter();
  const flat = moduleGroups.flatMap((m) => m.lessons);
  const [activeId, setActiveId] = useState(initialLessonId || flat[0]?.id);
  const [progress, setProgress] = useState<Record<string, boolean>>(
    Object.fromEntries(flat.map((l) => [l.id, l.completed]))
  );
  const active = flat.find((l) => l.id === activeId) ?? flat[0];

  async function markComplete() {
    if (!active) return;
    setProgress((p) => ({ ...p, [active.id]: true }));
    await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: active.id }),
    });
    router.refresh();
  }

  const completedCount = Object.values(progress).filter(Boolean).length;
  const percent = flat.length ? Math.round((completedCount / flat.length) * 100) : 0;

  return (
    <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[320px_1fr]">
      <aside className="border-r border-navy-900/10 bg-white">
        <div className="border-b border-navy-900/10 p-6">
          <p className="eyebrow text-gold-600">Course</p>
          <p className="mt-1 font-display text-navy-900">{courseTitle}</p>
          <div className="mt-4 h-1.5 w-full bg-navy-900/10">
            <div className="h-1.5 bg-gold-500 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="coord mt-2 text-xs text-navy-900/40">{percent}% complete</p>
        </div>
        <nav className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {moduleGroups.map((m) => (
            <div key={m.id} className="border-b border-navy-900/5 p-4">
              <p className="eyebrow px-2 text-navy-900/40">{m.title}</p>
              <div className="mt-2 space-y-1">
                {m.lessons.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setActiveId(l.id)}
                    className={`flex w-full items-center gap-2 px-2 py-2 text-left text-sm ${
                      l.id === activeId ? "bg-navy-900 text-white" : "text-navy-900/70 hover:bg-navy-900/5"
                    }`}
                  >
                    {progress[l.id] ? (
                      <CheckCircle2 size={15} className="shrink-0 text-gold-500" />
                    ) : (
                      <Circle size={15} className="shrink-0 opacity-40" />
                    )}
                    <span className="flex-1">{l.title}</span>
                    <span className="coord text-[10px] opacity-50">{l.durationMinutes}m</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <section className="chart-bg-light p-8 lg:p-16">
        {active && (
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow flex items-center gap-2 text-gold-600">
              <PlayCircle size={14} /> Lesson
            </p>
            <h1 className="mt-3 font-display text-2xl text-navy-900 sm:text-3xl">{active.title}</h1>
            <div className="mt-8 aspect-video border border-navy-900/10 bg-navy-900" />
            <p className="mt-8 whitespace-pre-line text-navy-900/75">{active.content}</p>

            <button
              onClick={markComplete}
              disabled={progress[active.id]}
              className="mt-10 flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400 disabled:cursor-default disabled:bg-navy-900/10 disabled:text-navy-900/40"
            >
              <CheckCircle2 size={16} />
              {progress[active.id] ? "Lesson completed" : "Mark as complete"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
