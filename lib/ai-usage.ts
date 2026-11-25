// Usage limits shared by all AI features (AI assistant tools and SAFETI chat).
// One "use" = one request that reaches the AI. A failed request is released and not counted.
import { sqlite } from "@/lib/db";

export const FREE_USES = Number(process.env.AI_FREE_USES ?? 10); // free sample per registered user
export const DAILY_CAP = Number(process.env.AI_DAILY_CAP ?? 300); // safety limit for the whole site, per day

export function usedBy(userId: string): number {
  return (sqlite.prepare("SELECT COUNT(*) AS n FROM ai_usage WHERE user_id = ?").get(userId) as any).n;
}
export function usedToday(): number {
  return (sqlite.prepare("SELECT COUNT(*) AS n FROM ai_usage WHERE date(created_at) = date('now')").get() as any).n;
}

// Reserve a use before calling the AI (so parallel requests cannot bypass the limit).
export function reserveUse(userId: string, action: string) {
  const id = crypto.randomUUID();
  sqlite.prepare("INSERT INTO ai_usage (id, user_id, action) VALUES (?, ?, ?)").run(id, userId, action);
  return {
    id,
    release: () => { sqlite.prepare("DELETE FROM ai_usage WHERE id = ?").run(id); },
    tokens: (i: number, o: number) => { sqlite.prepare("UPDATE ai_usage SET input_tokens = ?, output_tokens = ? WHERE id = ?").run(i, o, id); },
  };
}

// Maps an error thrown by the AI call to the JSON answer for the browser.
export function aiErrorResponse(e: any, admin: boolean): { body: any; status: number } {
  const status = e?.status as number | undefined;
  // The detail of the upstream error is shown to admins only.
  const detail = admin ? e?.detail || e?.message : undefined;
  if (e?.name === "AbortError") return { body: { error: "timeout" }, status: 504 };
  if (status === 401 || status === 403) return { body: { error: "upstream_auth", detail }, status: 502 };
  if (status === 429 || status === 529) return { body: { error: "busy", detail }, status: 503 };
  if (status === 400 && /credit|balance/i.test(String(e?.detail))) return { body: { error: "no_credit", detail }, status: 502 };
  return { body: { error: "upstream", detail }, status: 502 };
}
