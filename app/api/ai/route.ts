import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FREE_USES, DAILY_CAP, usedBy, usedToday, reserveUse, aiErrorResponse } from "@/lib/ai-usage";
import {
  AI_ACTIONS, AiAction, buildUserMessage, callClaude, parseHazards, sanitizeMission, systemPrompt, REPORT_SECTIONS,
} from "@/lib/ai";

export const dynamic = "force-dynamic";

const MAX_BODY = 80_000;

// Status for the app: is the visitor signed in, and how many free uses are left.
export async function GET() {
  const session = await getServerSession(authOptions);
  const configured = !!process.env.ANTHROPIC_API_KEY;
  if (!session?.user) return NextResponse.json({ signedIn: false, configured });
  const u: any = session.user;
  const admin = u.role === "admin";
  const used = usedBy(u.id);
  return NextResponse.json({
    signedIn: true, configured, admin, name: u.name || "",
    used, limit: admin ? null : FREE_USES, remaining: admin ? null : Math.max(0, FREE_USES - used),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "auth" }, { status: 401 });
  const u: any = session.user;
  const admin = u.role === "admin";

  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: "too_large" }, { status: 413 });
  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const action = body?.action as AiAction;
  if (!AI_ACTIONS.includes(action)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const mission = sanitizeMission(body?.mission);
  if (!mission) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const instruction = typeof body?.instruction === "string" ? body.instruction.slice(0, 600) : "";
  const lang = body?.lang === "es" ? "es" : "en";
  const section = typeof body?.section === "string" && REPORT_SECTIONS[body.section] ? body.section : "risk";

  // Limits: free sample per user (admins exempt) and a daily cap for the whole site.
  const used = usedBy(u.id);
  if (!admin && used >= FREE_USES) {
    return NextResponse.json({ error: "quota", used, limit: FREE_USES }, { status: 429 });
  }
  if (usedToday() >= DAILY_CAP) return NextResponse.json({ error: "capacity" }, { status: 429 });

  // Reserve the use first (so parallel requests cannot bypass the limit); release it if the call fails.
  const reservation = reserveUse(u.id, action);
  const release = reservation.release;

  try {
    const out = await callClaude({
      system: systemPrompt(),
      user: buildUserMessage(action, mission, instruction, lang, section),
      maxTokens: action === "report" ? 2500 : action === "review" ? 2000 : 2200,
    });
    reservation.tokens(out.inputTokens, out.outputTokens);
    const usedNow = used + 1;
    const remaining = admin ? null : Math.max(0, FREE_USES - usedNow);

    if (action === "hazards") {
      const hazards = parseHazards(out.text);
      if (!hazards) { release(); return NextResponse.json({ error: "format" }, { status: 502 }); }
      return NextResponse.json({ ok: true, action, hazards, remaining });
    }
    if (!out.text) { release(); return NextResponse.json({ error: "empty" }, { status: 502 }); }
    return NextResponse.json({ ok: true, action, text: out.text, remaining });
  } catch (e: any) {
    release();
    const r = aiErrorResponse(e, admin);
    return NextResponse.json(r.body, { status: r.status });
  }
}
