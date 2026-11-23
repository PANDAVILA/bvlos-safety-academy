"use client";
import { parseVideoUrl } from "@/lib/video";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { marked } from "marked";
import { CheckCircle2, Circle, PlayCircle, FileText, Download } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  videoUrl: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  durationMinutes: number;
  completed: boolean;
};
type QuizQuestion = { question: string; explanation?: string; options: { text: string; correct: boolean }[] };
type ModuleGroup = { id: string; title: string; videoUrl?: string | null; quiz: QuizQuestion[]; lessons: Lesson[] };

const PASS_PERCENT = 80;

function Quiz({ quiz }: { quiz: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const isFinal = quiz.length >= 30;
  const score = quiz.reduce((acc, q, qi) => {
    const chosen = answers[qi];
    return acc + (chosen !== undefined && q.options[chosen]?.correct ? 1 : 0);
  }, 0);
  const percent = Math.round((score / quiz.length) * 100);
  const passed = percent >= PASS_PERCENT;
  const needed = Math.ceil((quiz.length * PASS_PERCENT) / 100);

  return (
    <div className="mt-12 border border-gold-500/30 bg-gold-500/5 p-6">
      <p className="eyebrow text-gold-600">{isFinal ? "Final assessment" : "Module quiz"}</p>
      <p className="mt-1 text-sm text-navy-900/60">
        {isFinal
          ? `${quiz.length} questions. You need ${needed} correct answers (${PASS_PERCENT}%) to pass.`
          : "Check your understanding before moving to the next module."}
      </p>

      <div className="mt-6 space-y-6">
        {quiz.map((q, qi) => (
          <div key={qi}>
            <p className="font-medium text-navy-900">{qi + 1}. {q.question}</p>
            <div className="mt-2 space-y-1.5">
              {q.options.map((o, oi) => {
                const chosen = answers[qi] === oi;
                const showResult = submitted;
                const isCorrect = o.correct;
                return (
                  <button
                    key={oi}
                    onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`flex w-full items-center gap-2 border px-3 py-2 text-left text-sm ${
                      showResult && isCorrect
                        ? "border-green-500 bg-green-50 text-green-800"
                        : showResult && chosen && !isCorrect
                        ? "border-red-400 bg-red-50 text-red-700"
                        : chosen
                        ? "border-gold-500 bg-white text-navy-900"
                        : "border-navy-900/15 bg-white text-navy-900/70 hover:border-navy-900/30"
                    }`}
                  >
                    {o.text}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="mt-2 border-l-2 border-gold-500 pl-3 text-sm text-navy-900/70">{q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(answers).length < quiz.length}
            className="bg-gold-500 px-6 py-2.5 font-medium text-navy-950 hover:bg-gold-400 disabled:opacity-40"
          >
            Check answers
          </button>
          <span className="coord text-xs text-navy-900/40">
            {Object.keys(answers).length} / {quiz.length} answered
          </span>
        </div>
      ) : (
        <div className="mt-6">
          <p className="font-display text-lg text-navy-900">
            Score: {score} / {quiz.length} ({percent}%)
          </p>
          <p className={`mt-1 text-sm font-medium ${passed ? "text-green-700" : "text-red-700"}`}>
            {passed
              ? isFinal
                ? "Passed. You met the 80% pass mark."
                : "Well done. You are ready for the next module."
              : `Not yet. The pass mark is ${PASS_PERCENT}%. Review the lessons and try again.`}
          </p>
          {!passed && (
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="mt-3 border border-navy-900/20 px-4 py-2 text-sm text-navy-900 hover:border-gold-500"
            >
              Retake quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function VideoPanel({ source, title }: { source: NonNullable<ReturnType<typeof parseVideoUrl>>; title: string }) {
  if (source.kind === "iframe") {
    return (
      <div className="aspect-video overflow-hidden border border-navy-900/10 bg-navy-900">
        <iframe
          src={source.src}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  if (source.kind === "file") {
    return (
      <div className="aspect-video overflow-hidden border border-navy-900/10 bg-black">
        <video src={source.src} controls playsInline className="h-full w-full" />
      </div>
    );
  }
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-4 border border-navy-900/10 bg-navy-900 p-6 text-center">
      <p className="text-white/70">This video opens in a new tab.</p>
      <a href={source.src} target="_blank" rel="noopener noreferrer" className="bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
        Watch video
      </a>
    </div>
  );
}

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
  const activeModule = moduleGroups.find((m) => m.lessons.some((l) => l.id === active?.id));
  const isLastLessonInModule = activeModule && activeModule.lessons[activeModule.lessons.length - 1]?.id === active?.id;

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
  const video = parseVideoUrl(active?.videoUrl);
  const isFirstLessonInModule = activeModule?.lessons[0]?.id === active?.id;
  const moduleVideo = isFirstLessonInModule ? parseVideoUrl(activeModule?.videoUrl) : null;

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

            {moduleVideo && (
              <div className="mt-8">
                <p className="eyebrow mb-2 text-navy-900/50">Module video</p>
                <VideoPanel source={moduleVideo} title={`${activeModule?.title ?? "Module"} video`} />
              </div>
            )}

            {video && (
              <div className="mt-8">
                {moduleVideo && <p className="eyebrow mb-2 text-navy-900/50">Lesson video</p>}
                <VideoPanel source={video} title={active.title} />
              </div>
            )}

            {active.image ? (
              <figure className={`relative mt-8 aspect-video overflow-hidden border border-navy-900/10 ${video || moduleVideo ? "bg-white" : "bg-navy-900"}`}>
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  className={video || moduleVideo ? "object-contain" : "object-cover"}
                  unoptimized
                />
              </figure>
            ) : null}

            <div
              className="prose-legal mt-8 max-w-none text-navy-900/75"
              dangerouslySetInnerHTML={{ __html: marked.parse(active.content || "") as string }}
            />

            {active.attachmentUrl && (
              <a
                href={active.attachmentUrl}
                download={active.attachmentName || undefined}
                className="mt-6 flex w-fit items-center gap-2 border border-navy-900/20 px-4 py-2.5 text-sm text-navy-900 hover:border-gold-500"
              >
                <FileText size={15} />
                {active.attachmentName || "Download attachment"}
                <Download size={14} className="text-navy-900/40" />
              </a>
            )}

            <button
              onClick={markComplete}
              disabled={progress[active.id]}
              className="mt-10 flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400 disabled:cursor-default disabled:bg-navy-900/10 disabled:text-navy-900/40"
            >
              <CheckCircle2 size={16} />
              {progress[active.id] ? "Lesson completed" : "Mark as complete"}
            </button>

            {isLastLessonInModule && activeModule && activeModule.quiz.length > 0 && <Quiz quiz={activeModule.quiz} />}
          </div>
        )}
      </section>
    </div>
  );
}
