export type VideoSource =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string };

const YT_ID = /^[\w-]{11}$/;

/**
 * Turns whatever link an admin pastes into something the lesson viewer can play.
 * Supports YouTube (watch, youtu.be, shorts, live, embed, mobile), Vimeo (public and unlisted),
 * Loom, Google Drive files, and direct .mp4/.webm/.mov files. Anything else becomes a plain link
 * so the student always sees something instead of an empty box.
 */
export function parseVideoUrl(raw: string | null | undefined): VideoSource | null {
  const input = (raw ?? "").trim();
  if (!input) return null;

  // Allow pasting an <iframe ...src="..."> embed snippet
  const iframeSrc = input.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  const candidate = iframeSrc ? iframeSrc[1] : input;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  // YouTube
  if (host === "youtu.be" && parts[0] && YT_ID.test(parts[0])) {
    return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${parts[0]}?rel=0` };
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && YT_ID.test(v)) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${v}?rel=0` };
    if (["embed", "shorts", "live", "v"].includes(parts[0]) && parts[1] && YT_ID.test(parts[1])) {
      return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${parts[1]}?rel=0` };
    }
  }

  // Vimeo (public, unlisted with hash, and player links)
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const idIndex = parts.findIndex((p) => /^\d{6,}$/.test(p));
    if (idIndex !== -1) {
      const id = parts[idIndex];
      const hash = url.searchParams.get("h") || (/^[0-9a-f]{8,}$/i.test(parts[idIndex + 1] || "") ? parts[idIndex + 1] : "");
      return { kind: "iframe", src: `https://player.vimeo.com/video/${id}?dnt=1${hash ? `&h=${hash}` : ""}` };
    }
  }

  // Loom
  if (host === "loom.com" && (parts[0] === "share" || parts[0] === "embed") && parts[1]) {
    return { kind: "iframe", src: `https://www.loom.com/embed/${parts[1]}` };
  }

  // Synthesia: share page (share.synthesia.io/<id>) or embed (share.synthesia.io/embeds/videos/<id>)
  if (host === "share.synthesia.io") {
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const id = parts[0] === "embeds" && parts[1] === "videos" ? parts[2] : parts[0];
    if (id && UUID.test(id)) {
      return { kind: "iframe", src: `https://share.synthesia.io/embeds/videos/${id}?language=${url.searchParams.get("language") || "en"}` };
    }
  }

  // Google Drive file (must be shared as "Anyone with the link")
  if (host === "drive.google.com") {
    const m = url.pathname.match(/\/file\/d\/([\w-]+)/);
    const id = m?.[1] || url.searchParams.get("id");
    if (id) return { kind: "iframe", src: `https://drive.google.com/file/d/${id}/preview` };
  }

  // Direct video file
  if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(url.pathname)) {
    return { kind: "file", src: url.toString() };
  }

  // Unknown host: let the student open it instead of showing nothing
  return { kind: "link", src: url.toString() };
}
