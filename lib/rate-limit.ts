// Small in-memory rate limiter (per server process). Good enough to stop casual brute force and
// form spam on a single Railway instance. State is lost on restart, which is acceptable here.
type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function clientIp(req: Request | { headers: Headers | Record<string, any> }): string {
  const h: any = (req as any).headers;
  const get = (k: string) => (typeof h?.get === "function" ? h.get(k) : h?.[k]);
  const xff = get("x-forwarded-for");
  const raw = (Array.isArray(xff) ? xff[0] : xff) || get("x-real-ip") || "unknown";
  return String(raw).split(",")[0].trim().slice(0, 64) || "unknown";
}

/** Returns true when the call is allowed, false when the limit has been exceeded. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    buckets.forEach((b, k) => { if (b.reset <= now) buckets.delete(k); });
  }
  const b = buckets.get(key);
  if (!b || b.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= max;
}

/** Clears a key (e.g. after a successful login). */
export function rateLimitReset(key: string) {
  buckets.delete(key);
}
