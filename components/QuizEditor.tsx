"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Option = { text: string; correct: boolean };
type Question = { question: string; options: Option[] };

export default function QuizEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const initial: Question[] = (() => {
    try {
      const parsed = JSON.parse(defaultValue || "[]");
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
    } catch {
      return [];
    }
  })();

  const [questions, setQuestions] = useState<Question[]>(initial);

  function addQuestion() {
    setQuestions([...questions, { question: "", options: [{ text: "", correct: true }, { text: "", correct: false }] }]);
  }
  function removeQuestion(qi: number) {
    setQuestions(questions.filter((_, i) => i !== qi));
  }
  function updateQuestion(qi: number, text: string) {
    const next = [...questions];
    next[qi] = { ...next[qi], question: text };
    setQuestions(next);
  }
  function addOption(qi: number) {
    const next = [...questions];
    next[qi] = { ...next[qi], options: [...next[qi].options, { text: "", correct: false }] };
    setQuestions(next);
  }
  function removeOption(qi: number, oi: number) {
    const next = [...questions];
    next[qi] = { ...next[qi], options: next[qi].options.filter((_, i) => i !== oi) };
    setQuestions(next);
  }
  function updateOptionText(qi: number, oi: number, text: string) {
    const next = [...questions];
    const options = [...next[qi].options];
    options[oi] = { ...options[oi], text };
    next[qi] = { ...next[qi], options };
    setQuestions(next);
  }
  function setCorrect(qi: number, oi: number) {
    const next = [...questions];
    const options = next[qi].options.map((o, i) => ({ ...o, correct: i === oi }));
    next[qi] = { ...next[qi], options };
    setQuestions(next);
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(questions)} />

      {questions.length === 0 && <p className="text-xs text-navy-900/40">No quiz yet for this module.</p>}

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="border border-navy-900/15 bg-navy-900/[0.02] p-4">
            <div className="flex items-start gap-2">
              <input
                value={q.question}
                onChange={(e) => updateQuestion(qi, e.target.value)}
                placeholder={`Question ${qi + 1}`}
                className="flex-1 border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
              />
              <button type="button" onClick={() => removeQuestion(qi)} className="p-2 text-red-600 hover:text-red-800">
                <Trash2 size={15} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={o.correct}
                    onChange={() => setCorrect(qi, oi)}
                    title="Mark as correct answer"
                  />
                  <input
                    value={o.text}
                    onChange={(e) => updateOptionText(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 border border-navy-900/20 px-3 py-1.5 text-sm focus:border-gold-500 focus:outline-none"
                  />
                  <button type="button" onClick={() => removeOption(qi, oi)} className="text-navy-900/30 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addOption(qi)}
                className="eyebrow flex items-center gap-1 text-navy-900/40 hover:text-navy-900"
              >
                <Plus size={12} /> Add option
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="eyebrow mt-3 flex items-center gap-1 border border-navy-900/20 px-3 py-2 text-navy-900 hover:border-gold-500"
      >
        <Plus size={13} /> Add question
      </button>
    </div>
  );
}
