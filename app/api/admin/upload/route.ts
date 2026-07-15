import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { getUploadsDir, isAllowedImageExt, isAllowedAttachmentExt } from "@/lib/uploads";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const MAX_SIZE = 15 * 1024 * 1024; // 15MB (covers PDFs/slides too)

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  const kind = String(formData.get("kind") || "image"); // "image" | "attachment"

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const isAllowed = kind === "attachment" ? isAllowedAttachmentExt(file.name) : isAllowedImageExt(file.name);
  if (!isAllowed) {
    const allowed = kind === "attachment" ? "PDF, DOC, DOCX, PPT, PPTX, or an image" : "PNG, JPG, WEBP, GIF, or SVG";
    return NextResponse.json({ error: `Unsupported file type. Use ${allowed}.` }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const safeName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const uploadsDir = getUploadsDir();
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadsDir, safeName), buffer);

  return NextResponse.json({ url: `/api/uploads/${safeName}`, filename: safeName, originalName: file.name });
}
