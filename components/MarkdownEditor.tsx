"use client";

import { useRef, useState } from "react";
import { Bold, Italic, List, Heading2 } from "lucide-react";

export default function MarkdownEditor({
  name,
  defaultValue,
  rows = 6,
}: {
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  const [value, setValue] = useState(defaultValue || "");
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after: string = before) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    setValue(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertLinePrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    setValue(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-1 border border-b-0 border-navy-900/20 bg-navy-900/5 p-1">
        <button type="button" onClick={() => wrapSelection("**")} className="p-1.5 text-navy-900/60 hover:bg-navy-900/10" title="Bold">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => wrapSelection("_")} className="p-1.5 text-navy-900/60 hover:bg-navy-900/10" title="Italic">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => insertLinePrefix("## ")} className="p-1.5 text-navy-900/60 hover:bg-navy-900/10" title="Heading">
          <Heading2 size={14} />
        </button>
        <button type="button" onClick={() => insertLinePrefix("- ")} className="p-1.5 text-navy-900/60 hover:bg-navy-900/10" title="Bullet list">
          <List size={14} />
        </button>
        <span className="ml-2 text-[10px] text-navy-900/30">Markdown supported</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        className="w-full border border-navy-900/20 px-3 py-2 text-sm focus:border-gold-500 focus:outline-none"
      />
    </div>
  );
}
