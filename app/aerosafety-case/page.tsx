import { ArrowUpRight, Gauge, ListChecks, ShieldAlert } from "lucide-react";

export default function AeroSafetyCasePage() {
  const appUrl = process.env.NEXT_PUBLIC_AEROSAFETY_CASE_URL || "#";

  return (
    <div>
      <section className="chart-bg relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-gold-400">Herramienta</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">AeroSafety Case</h1>
            <p className="mt-6 max-w-lg text-white/70">
              La plataforma de evaluación de riesgo y documentación de safety case para operaciones UAS, desarrollada
              por nuestro equipo. Modela tu misión, calcula el riesgo y genera la documentación de tu expediente.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400"
              >
                Probar la app
                <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="#detalle" className="flex items-center gap-2 border border-white/25 px-6 py-3 font-medium text-white hover:border-gold-400 hover:text-gold-400">
                Ver qué incluye
              </a>
            </div>
            {appUrl === "#" && (
              <p className="mt-4 text-xs text-white/40">
                Configura NEXT_PUBLIC_AEROSAFETY_CASE_URL en tu .env.local para enlazar tu instancia desplegada.
              </p>
            )}
          </div>
          <div className="border border-white/15 bg-navy-950/40 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-white/50">
              <span className="coord">MISSION_ID: BVLOS-0417</span>
              <span className="coord text-gold-400">GRC 4 · ARC-c</span>
            </div>
            <div className="mt-4 space-y-3">
              {["Definición del ConOps", "Cálculo de GRC intrínseco", "Determinación del ARC", "Estrategia de mitigación"].map((s, i) => (
                <div key={s} className="flex items-center justify-between border border-white/10 px-4 py-3 text-sm text-white/80">
                  <span>{s}</span>
                  <span className="coord text-xs text-gold-400">{String(i + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="detalle" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 sm:grid-cols-3">
            {[
              { icon: Gauge, title: "Evaluación de riesgo", desc: "Calcula GRC y ARC siguiendo la metodología SORA, con trazabilidad completa de cada supuesto." },
              { icon: ListChecks, title: "Seguimiento de mitigaciones", desc: "Cataloga y monitorea el estado de cada mitigación operacional y técnica de tu operación." },
              { icon: ShieldAlert, title: "Documentación del safety case", desc: "Genera el expediente documental listo para presentar ante la autoridad competente." },
            ].map((f) => (
              <div key={f.title} className="bg-white p-8">
                <f.icon size={22} className="text-gold-600" />
                <p className="mt-4 font-display text-lg text-navy-900">{f.title}</p>
                <p className="mt-2 text-sm text-navy-900/60">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-navy-900/10 bg-navy-900 p-10 text-center text-white">
            <p className="font-display text-2xl">¿Quieres una demo guiada para tu equipo?</p>
            <p className="mt-3 text-white/60">Nuestro equipo de consultoría puede acompañarte en la implantación.</p>
            <a href="/consultoria#contacto" className="mt-6 inline-flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
              Solicitar demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
