"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", website: "" });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, acceptTerms: accepted }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create the account.");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (signInRes?.error) router.push("/login");
    else router.push("/dashboard");
  }

  return (
    <div className="chart-bg-light flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md border border-navy-900/10 bg-white p-8">
        <p className="eyebrow text-gold-600">Create account</p>
        <h1 className="mt-3 font-display text-2xl text-navy-900">Join the Academy</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="eyebrow text-navy-900/60">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Company (optional)</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Email address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Password (min. 10 characters, letters and numbers)</label>
            <input
              type="password"
              required
              minLength={10}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          {/* Honeypot: hidden from people, bots fill it in */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
            <label>Website</label>
            <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <label className="flex items-start gap-3 text-sm text-navy-900/70">
            <input
              type="checkbox"
              required
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-gold-500"
            />
            <span>
              I am at least 18 years old and I agree to the{" "}
              <Link href="/legal/terms" target="_blank" className="text-gold-600 underline">Terms of Service</Link>
              {" "}and the{" "}
              <Link href="/legal/privacy" target="_blank" className="text-gold-600 underline">Privacy Policy</Link>.
            </span>
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !accepted}
            className="w-full bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-navy-900/60">
          Already have an account? <Link href="/login" className="text-gold-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
