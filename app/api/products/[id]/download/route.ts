import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { downloadMime, isExternalUrl, resolveLocalResource, userCanDownload } from "@/lib/downloads";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = db.select().from(products).where(eq(products.id, params.id)).get();
  if (!product || !product.fileUrl) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) {
    const back = encodeURIComponent(`/resources/${product.slug}`);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${back}`, req.url));
  }
  if (!userCanDownload(product, user)) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  if (isExternalUrl(product.fileUrl)) {
    return NextResponse.redirect(product.fileUrl!);
  }

  const full = resolveLocalResource(product.fileUrl);
  if (!full) return NextResponse.json({ error: "File not found on server" }, { status: 404 });

  const name = path.basename(full);
  const buffer = fs.readFileSync(full);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": downloadMime(name),
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
