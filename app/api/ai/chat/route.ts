import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callClaudeChat } from "@/lib/ai";
import { FREE_USES, DAILY_CAP, usedBy, usedToday, reserveUse, aiErrorResponse } from "@/lib/ai-usage";
import { TOOLS, chatSystem, cleanAssistantContent, sanitizeContext, sanitizeMessages } from "@/lib/safeti";

export const dynamic = "force-dynamic";

const MAX_BODY = 120_000;

// SAFETI chat. Each message of the user is one use of the shared AI allowance.
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

  const messages = sanitizeMessages(body?.messages);
  if (!messages) return NextResponse.json({ error: "bad_history" }, { status: 400 });
  const context = sanitizeContext(body?.context);

  const used = usedBy(u.id);
  if (!admin && used >= FREE_USES) return NextResponse.json({ error: "quota", used, limit: FREE_USES }, { status: 429 });
  if (usedToday() >= DAILY_CAP) return NextResponse.json({ error: "capacity" }, { status: 429 });

  const reservation = reserveUse(u.id, "chat");
  try {
    const out = await callClaudeChat({ system: chatSystem(context), messages, tools: TOOLS, maxTokens: 3000 });
    reservation.tokens(out.inputTokens, out.outputTokens);
    const truncated = out.stopReason === "max_tokens";
    const content = cleanAssistantContent(out.content, truncated);
    if (!content.length) { reservation.release(); return NextResponse.json({ error: "empty" }, { status: 502 }); }
    const remaining = admin ? null : Math.max(0, FREE_USES - (used + 1));
    return NextResponse.json({ ok: true, content, truncated, remaining });
  } catch (e: any) {
    reservation.release();
    const r = aiErrorResponse(e, admin);
    return NextResponse.json(r.body, { status: r.status });
  }
}
