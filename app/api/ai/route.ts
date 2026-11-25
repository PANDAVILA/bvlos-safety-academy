import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sqlite } from "@/lib/db";
import {
  AI_ACTIONS, AiAction, buildUserMessage, callClaude, parseHazards, sanitizeMission, systemPrompt, REPORT_SECTIONS,
} from "@/lib/ai";

export const dynamic = "force-dynamic";

const FREE_USES = Number(process.env.AI_FREE_USES ?? 3); // free sample per registered user
const DAILY_CAP = Number(process.env.AI_DAILY_CAP ?? 150); // safety limit for the whole site, per day
const MAX_BODY = 80_000;

function usedBy(userId: string): number {
  return (sqlite.prepare("SELECT COUNT(*) AS n FROM ai_usage WHERE user_id = ?").get(userId) as any).n;
}
function usedToday(): number {
  return (sqlite.prepare("SELECT COUNT(*) AS n FROM ai_usage WHERE date(created_at) = date('now')").get() as any).n;
}

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
  const id = crypto.randomUUID();
  sqlite.prepare("INSERT INTO ai_usage (id, user_id, action) VALUES (?, ?, ?)").run(id, u.id, action);
  const release = () => sqlite.prepare("DELETE FROM ai_usage WHERE id = ?").run(id);

  try {
    const out = await callClaude({
      system: systemPrompt(),
      user: buildUserMessage(action, mission, instruction, lang, section),
      maxTokens: action === "report" ? 2500 : action === "review" ? 2000 : 2200,
    });
    sqlite.prepare("UPDATE ai_usage SET input_tokens = ?, output_tokens = ? WHERE id = ?").run(out.inputTokens, out.outputTokens, id);
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
    const status = e?.status as number | undefined;
    // The detail of the upstream error is shown to admins only.
    const detail = admin ? e?.detail || e?.message : undefined;
    if (e?.name === "AbortError") return NextResponse.json({ error: "timeout" }, { status: 504 });
    if (status === 401 || status === 403) return NextResponse.json({ error: "upstream_auth", detail }, { status: 502 });
    if (status === 429 || status === 529) return NextResponse.json({ error: "busy", detail }, { status: 503 });
    if (status === 400 && /credit|balance/i.test(String(e?.detail))) return NextResponse.json({ error: "no_credit", detail }, { status: 502 });
    return NextResponse.json({ error: "upstream", detail }, { status: 502 });
  }
}
