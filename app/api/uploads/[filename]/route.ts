import { NextResponse } from "next/server";
import { getUploadsDir, mimeTypeFor } from "@/lib/uploads";
import path from "path";
import fs from "fs";

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  // Prevent path traversal - only allow a bare filename, no slashes or dots-dots
  const filename = params.filename;
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(getUploadsDir(), filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeTypeFor(filename),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
