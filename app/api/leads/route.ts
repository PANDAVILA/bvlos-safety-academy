import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultingLeads } from "@/lib/db/schema";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  serviceInterest: z.string().min(1),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  db.insert(consultingLeads).values(parsed.data).run();
  return NextResponse.json({ ok: true });
}
