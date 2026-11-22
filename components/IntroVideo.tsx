"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { parseVideoUrl } from "@/lib/video";

function withParams(src: string, params: Record<string, string>) {
  const u = new URL(src);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

/**
 * Intro video shown in a modal on the homepage.
 * mode "button": a "Watch intro" button opens it.
 * mode "auto":   opens by itself once per visitor (muted, because browsers block autoplay with sound),
 *                and the button stays available to reopen it.
 */
export default function IntroVideo({
  url,
  mode,
  buttonText,
  frequency = "once",
}: {
  url: string;
  mode: "off" | "button" | "auto";
  buttonText: string;
  frequency?: "once" | "session" | "always";
}) {
  const video = parseVideoUrl(url);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Auto-open once per visitor
  useEffect(() => {
    if (mode !== "auto" || !video) return;
    // once    -> remembered for good in this browser (localStorage)
    // session -> shown again after the browser/tab is closed (sessionStorage)
    // always  -> shown on every visit to the homepage
    const store = (): Storage | null => {
      try {
        return frequency === "once" ? localStorage : frequency === "session" ? sessionStorage : null;
      } catch {
        return null;
      }
    };
    let seen = false;
    try {
      seen = store()?.getItem("bsa-intro-seen") === url;
    } catch {}
    if (seen) return;
    const t = setTimeout(() => {
      setMuted(true);
      setOpen(true);
      try {
        store()?.setItem("bsa-intro-seen", url);
      } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, [mode, url, video, frequency]);

  // Close on Escape, lock page scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  if (mode === "off" || !video) return null;

  let src = video.src;
  if (video.kind === "iframe") {
    const isVimeo = src.includes("vimeo.com");
    src = withParams(src, isVimeo ? { autoplay: "1", ...(muted ? { muted: "1" } : {}) } : { autoplay: "1", ...(muted ? { mute: "1" } : {}) });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMuted(false);
          setOpen(true);
        }}
        className="flex items-center gap-2 px-2 py-3 font-medium text-white/80 transition hover:text-gold-400"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30">
          <Play size={14} fill="currentColor" />
        </span>
        {buttonText}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Intro video"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/85 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close video"
              className="absolute -top-11 right-0 flex items-center gap-1 text-sm text-white/80 hover:text-white"
            >
              Close <X size={18} />
            </button>
            <div className="aspect-video w-full overflow-hidden border border-white/15 bg-black">
              {video.kind === "iframe" && (
                <iframe
                  src={src}
                  title="Intro video"
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
              {video.kind === "file" && (
                <video src={video.src} controls autoPlay muted={muted} playsInline className="h-full w-full" />
              )}
              {video.kind === "link" && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-white/70">This video opens in a new tab.</p>
                  <a href={video.src} target="_blank" rel="noopener noreferrer" className="bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
                    Watch video
                  </a>
                </div>
              )}
            </div>
            {muted && video.kind !== "link" && (
              <p className="mt-3 text-center text-xs text-white/50">Playing without sound. Use the player controls to unmute.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
