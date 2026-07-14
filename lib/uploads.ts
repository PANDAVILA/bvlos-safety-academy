import path from "path";
import fs from "fs";

export function getUploadsDir() {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
  const dir = path.join(path.dirname(dbPath), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export function mimeTypeFor(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

export function isAllowedImageExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return Object.prototype.hasOwnProperty.call(MIME_TYPES, ext);
}
