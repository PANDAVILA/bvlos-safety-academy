"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Correo o contraseña incorrectos.");
    else router.push("/panel");
  }

  return (
    <div className="chart-bg-light flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-20">
      <div className="w-full max-w-md border border-navy-900/10 bg-white p-8">
        <p className="eyebrow text-gold-600">Acceso</p>
        <h1 className="mt-3 font-display text-2xl text-navy-900">Inicia sesión</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="eyebrow text-navy-900/60">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-sm text-navy-900/60">
          ¿No tienes cuenta? <Link href="/registro" className="text-gold-600 hover:underline">Crea una aquí</Link>
        </p>
      </div>
    </div>
  );
}
