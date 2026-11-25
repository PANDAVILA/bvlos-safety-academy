import { ArrowUpRight, Gauge, ListChecks, ShieldAlert } from "lucide-react";
import DisclaimerNote from "@/components/DisclaimerNote";

export default function AeroSafetyCasePage() {
  // The app is served from this same site (files in public/tools/aerosafety-case).
  const appUrl = "/tools/aerosafety-case/index.html";

  return (
    <div>
      <section className="chart-bg relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-gold-400">Tool</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">AeroSafety Case</h1>
            <p className="mt-6 max-w-lg text-white/70">
              The operational risk and safety management tool for UAS operations, built by our team.
              Model your mission, assess the risk with the FAA / ICAO risk matrix, and generate a printable mission report.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400"
              >
                Try the app
                <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a href="#detalle" className="flex items-center gap-2 border border-white/25 px-6 py-3 font-medium text-white hover:border-gold-400 hover:text-gold-400">
                See what's included
              </a>
            </div>
            <div className="mt-8">
              <DisclaimerNote variant="dark" />
            </div>
          </div>
          <div className="border border-white/15 bg-navy-950/40 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-white/50">
              <span className="coord">DEMO MISSION · BVLOS</span>
              <span className="coord text-gold-400">GO WITH MITIGATIONS</span>
            </div>
            <div className="mt-4 space-y-3">
              {["Mission, location and crew", "Hazard identification", "FAA / ICAO risk matrix", "GO / NO-GO decision"].map((s, i) => (
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
              { icon: Gauge, title: "Risk assessment", desc: "Rate every hazard with the FAA AC 120-92D / ICAO risk matrix (severity A–E × likelihood 1–5), before and after mitigations, with each assumption recorded." },
              { icon: ListChecks, title: "Mitigation tracking", desc: "Link operational and technical mitigations to each hazard and follow their status until they are implemented and verified." },
              { icon: ShieldAlert, title: "Safety case documentation", desc: "Generate a printable mission report with hazards, mitigations, pre-flight checklist and the GO / NO-GO decision." },
            ].map((f) => (
              <div key={f.title} className="bg-white p-8">
                <f.icon size={22} className="text-gold-600" />
                <p className="mt-4 font-display text-lg text-navy-900">{f.title}</p>
                <p className="mt-2 text-sm text-navy-900/60">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-navy-900/10 bg-navy-900 p-10 text-center text-white">
            <p className="font-display text-2xl">Want a guided demo for your team?</p>
            <p className="mt-3 text-white/60">Our consulting team can support you through implementation.</p>
            <a href="/consulting#contact" className="mt-6 inline-flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
              Request a demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
