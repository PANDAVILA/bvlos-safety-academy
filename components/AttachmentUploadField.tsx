"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, FileText } from "lucide-react";

export default function AttachmentUploadField({
  urlFieldName,
  nameFieldName,
  label,
  defaultUrl,
  defaultName,
}: {
  urlFieldName: string;
  nameFieldName: string;
  label: string;
  defaultUrl?: string;
  defaultName?: string;
}) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [name, setName] = useState(defaultName || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "attachment");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.url);
      setName(file.name);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="eyebrow text-navy-900/60">{label}</label>
      <input type="hidden" name={urlFieldName} value={url} />
      <input type="hidden" name={nameFieldName} value={name} />

      <div className="mt-2 flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-navy-900/20 px-4 py-2 text-sm text-navy-900 hover:border-gold-500 disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "Uploading…" : "Upload file"}
        </button>
        {url && (
          <>
            <span className="flex items-center gap-1 text-xs text-navy-900/60">
              <FileText size={13} /> {name || "file"}
            </span>
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setName("");
              }}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
            >
              <X size={13} /> Remove
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <p className="mt-1 text-xs text-navy-900/40">PDF, DOC, DOCX, PPT, or PPTX — max 15MB.</p>
    </div>
  );
}
