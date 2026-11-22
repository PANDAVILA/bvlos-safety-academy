import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BVLOS Safety Academy — Launching soon',
  description:
    'BVLOS Safety Academy is preparing for launch. Training, standards and consulting for beyond visual line of sight operations.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MantenimientoPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-6 py-20">
      {/* Carta aeronautica de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/aero-chart-overlay.svg')" }}
      />

      <div className="relative w-full max-w-2xl">
        {/* Bloque NOTAM */}
        <div className="border border-white/20 bg-black/30 backdrop-blur-sm">
          {/* Cabecera */}
          <div className="flex items-baseline justify-between border-b border-white/20 px-6 py-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
              NOTAM BSA-001
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
              Status · Pre-launch
            </span>
          </div>

          {/* Cuerpo */}
          <div className="px-6 py-12 sm:px-10 sm:py-16">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              Knowledge · Standards · Safety
            </p>

            <h1 className="mt-6 font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl">
              BVLOS
              <br />
              Safety Academy
            </h1>

            <div className="mt-8 h-px w-16 bg-white/30" />

            <p className="mt-8 max-w-lg text-base leading-relaxed text-white/75">
              The platform is being prepared for launch. Training programmes,
              safety management resources and consulting services for beyond
              visual line of sight operations will be available shortly.
            </p>

            <p className="mt-6 text-base leading-relaxed text-white/75">
              For enquiries in the meantime, write to{' '}
              <a
                href="mailto:info@bvlossafetyacademy.com"
                className="text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                info@bvlossafetyacademy.com
              </a>
              .
            </p>
          </div>

          {/* Pie */}
          <div className="border-t border-white/20 px-6 py-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
              Manuel Ignacio Pérez Pan · BVLOS Safety Academy
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
