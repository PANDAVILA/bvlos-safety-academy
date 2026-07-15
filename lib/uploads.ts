import path from "path";
import fs from "fs";

export function getUploadsDir() {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "bvlos.db");
  const dir = path.join(path.dirname(dbPath), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const ATTACHMENT_MIME_TYPES: Record<string, string> = {
  ...IMAGE_MIME_TYPES,
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function mimeTypeFor(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return ATTACHMENT_MIME_TYPES[ext] || "application/octet-stream";
}

export function isAllowedImageExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return Object.prototype.hasOwnProperty.call(IMAGE_MIME_TYPES, ext);
}

export function isAllowedAttachmentExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return Object.prototype.hasOwnProperty.call(ATTACHMENT_MIME_TYPES, ext);
}
