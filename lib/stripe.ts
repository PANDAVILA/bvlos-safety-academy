import Stripe from "stripe";

// Keys live ONLY in Railway variables (never in code): STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
// STRIPE_API_URL is for automated tests against a fake Stripe server; leave it unset in production.
const testUrl = process.env.STRIPE_API_URL ? new URL(process.env.STRIPE_API_URL) : null;

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20" as any,
  ...(testUrl
    ? { host: testUrl.hostname, port: testUrl.port || undefined, protocol: testUrl.protocol.replace(":", "") as "http" | "https" }
    : {}),
});

export const stripeConfigured = Boolean(
  process.env.STRIPE_SECRET_KEY && /^[sr]k_/.test(process.env.STRIPE_SECRET_KEY)
);

/** Public site address used for Stripe return URLs (never trust the request's Origin header). */
export function siteUrl(req?: Request): string {
  const env = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (env) return env;
  return req?.headers.get("origin") || "http://localhost:3000";
}
