"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se pudo crear la cuenta.");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (signInRes?.error) router.push("/login");
    else router.push("/panel");
  }

  return (
    <div className="chart-bg-light flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md border border-navy-900/10 bg-white p-8">
        <p className="eyebrow text-gold-600">Crear cuenta</p>
        <h1 className="mt-3 font-display text-2xl text-navy-900">Únete a la Academia</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="eyebrow text-navy-900/60">Nombre completo</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Empresa (opcional)</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Correo electrónico</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Contraseña (mín. 8 caracteres)</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400 disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-6 text-sm text-navy-900/60">
          ¿Ya tienes cuenta? <Link href="/login" className="text-gold-600 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
