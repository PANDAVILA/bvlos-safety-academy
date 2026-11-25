import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultingLeads } from "@/lib/db/schema";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().max(200),
  company: z.string().max(200).optional(),
  serviceInterest: z.string().min(1).max(200),
  message: z.string().max(5000).optional(),
  consent: z.literal(true),
  website: z.string().optional(), // honeypot: real people leave it empty
});

export async function POST(req: Request) {
  if (!rateLimit(`leads:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { consent: _c, website, ...lead } = parsed.data;
  if (website) return NextResponse.json({ ok: true }); // silently drop bots
  db.insert(consultingLeads).values({ ...lead, consentAt: new Date().toISOString() }).run();
  return NextResponse.json({ ok: true });
}
