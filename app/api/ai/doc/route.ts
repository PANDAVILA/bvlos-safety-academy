import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { openClaudeStream } from "@/lib/ai";
import { FREE_USES, DAILY_CAP, usedBy, usedToday, reserveUse, aiErrorResponse } from "@/lib/ai-usage";
import { DOC_TYPES, docSystem, docUserMessage } from "@/lib/docs";
import { sanitizeContext } from "@/lib/safeti";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_BODY = 60_000;
const ERR = "\u0000ERR:"; // marker in the stream: an error happened after the text started
const TRUNC = "\u0000TRUNC";

// Writes a long document and streams it as plain text. One document = one use of the shared AI allowance.
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

  const docType = String(body?.doc_type || "");
  if (!DOC_TYPES[docType]) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const lang = body?.lang === "es" ? "es" : "en";
  const notes = typeof body?.notes === "string" ? body.notes.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, 3000) : "";
  let missionJson: string | null = null;
  if (body?.mission && typeof body.mission === "object") {
    const ctx = JSON.parse(sanitizeContext({ mission: body.mission }));
    if (ctx.openMission) missionJson = JSON.stringify(ctx.openMission);
  }
  const clip = (v: any, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
  const org = body?.org ? { name: clip(body.org.name, 120), operatorNumber: clip(body.org.operatorNumber, 60) } : null;

  const used = usedBy(u.id);
  if (!admin && used >= FREE_USES) return NextResponse.json({ error: "quota", used, limit: FREE_USES }, { status: 429 });
  if (usedToday() >= DAILY_CAP) return NextResponse.json({ error: "capacity" }, { status: 429 });

  const reservation = reserveUse(u.id, "document");
  let stream: Awaited<ReturnType<typeof openClaudeStream>>;
  try {
    stream = await openClaudeStream({
      system: docSystem(),
      user: docUserMessage({ docType, lang, notes, missionJson, org, today: new Date().toISOString().slice(0, 10) }),
      maxTokens: 14000,
    });
  } catch (e: any) {
    reservation.release();
    const r = aiErrorResponse(e, admin);
    return NextResponse.json(r.body, { status: r.status });
  }

  const enc = new TextEncoder(), dec = new TextDecoder();
  const remaining = admin ? null : Math.max(0, FREE_USES - (used + 1));
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream.body.getReader();
      let buf = "", chars = 0, inTok = 0, outTok = 0, stop = "", failed = false;
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            let ev: any; try { ev = JSON.parse(line.slice(5).trim()); } catch { continue; }
            if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) {
              chars += ev.delta.text.length; controller.enqueue(enc.encode(ev.delta.text));
            } else if (ev.type === "message_start") inTok = ev.message?.usage?.input_tokens || 0;
            else if (ev.type === "message_delta") { outTok = ev.usage?.output_tokens || outTok; stop = ev.delta?.stop_reason || stop; }
            else if (ev.type === "error") { failed = true; }
          }
        }
      } catch { failed = true; }
      stream.done();
      reservation.tokens(inTok, outTok);
      if (!chars) { reservation.release(); controller.enqueue(enc.encode(ERR + (failed ? "upstream" : "empty"))); }
      else if (failed) controller.enqueue(enc.encode(ERR + "interrupted"));
      else if (stop === "max_tokens") controller.enqueue(enc.encode(TRUNC));
      controller.close();
    },
    cancel() { stream.abort(); },
  });
  return new Response(out, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store, no-transform", "x-accel-buffering": "no", "x-remaining": remaining == null ? "" : String(remaining) },
  });
}
