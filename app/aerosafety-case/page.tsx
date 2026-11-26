import type { Metadata } from "next";
import { ArrowUpRight, Bot, ClipboardCheck, FilePenLine, Gauge, ListChecks, ShieldAlert } from "lucide-react";
import DisclaimerNote from "@/components/DisclaimerNote";
import SafetiMark from "@/components/SafetiMark";
import SafetiOrb from "@/components/SafetiOrb";

export const metadata: Metadata = {
  title: "SAFETI AI and SMS AI APP",
  description:
    "SAFETI is the AI assistant of our SMS app. It builds your UAS missions, reviews your risk assessments and drafts your safety documents.",
};

// The 14 document types SAFETI can draft (see lib/docs.ts).
const DOCUMENTS = [
  "Safety Management System (SMS) Manual",
  "Safety Risk Assessment Report",
  "Risk Matrix and Acceptance Criteria",
  "Concept of Operations (ConOps)",
  "UAS Operations Manual",
  "Emergency Response and Contingency Plan",
  "Crew Training and Currency Programme",
  "Maintenance and Inspection Programme",
  "BVLOS Waiver Safety Case Narrative",
  "Hazard Log and Risk Register",
  "Safety Policy Statement",
  "Occurrence Reporting Procedure",
  "Flight Checklists Set",
  "Safety Assurance Plan (SPIs and audits)",
];

export default function AeroSafetyCasePage() {
  // The app is served from this same site (files in public/tools/aerosafety-case).
  const appUrl = "/tools/aerosafety-case/index.html";

  return (
    <div>
      {/* HERO: SAFETI is the protagonist */}
      <section className="chart-bg relative overflow-hidden lg:flex lg:min-h-[calc(100svh-5.5rem)] lg:items-center">
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-10">
          <div>
            <p className="eyebrow text-gold-400">SMS AI APP · AeroSafety Case</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-5xl xl:text-6xl">
              Meet SAFETI, the AI for your safety documents and missions.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              SAFETI is an AI assistant specialized in UAS operations. Tell it about your operation and it builds your
              mission, reviews your risks and drafts the safety documents you need, inside our SMS app.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400"
              >
                Try SAFETI in the app
                <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#safeti"
                className="flex items-center gap-2 border border-white/25 px-6 py-3 font-medium text-white hover:border-gold-400 hover:text-gold-400"
              >
                See what SAFETI does
              </a>
            </div>
            <div className="mt-8">
              <DisclaimerNote variant="dark" />
            </div>
          </div>

          {/* SAFETI orb with floating example messages */}
          <div className="relative mx-auto w-full max-w-md lg:-translate-y-8">
            <SafetiOrb size={305} />
            <p className="safeti-bubble absolute left-0 top-2 hidden max-w-[13rem] bg-gold-500/95 px-4 py-3 text-sm text-navy-950 shadow-xl sm:block">
              Plan a BVLOS pipeline inspection, 12 km corridor.
            </p>
            <p
              className="safeti-bubble absolute bottom-6 right-0 hidden max-w-[15rem] border border-white/20 bg-navy-950/90 px-4 py-3 text-sm text-white/90 shadow-xl backdrop-blur sm:block"
              style={{ animationDelay: "1.4s" }}
            >
              Got it. I will set up the mission and propose the first hazards.
            </p>
            <div className="mt-14 flex flex-wrap justify-center gap-2">
              {["Mission created", "Hazards proposed", "Hazard Log draft"].map((t) => (
                <span key={t} className="coord rounded-full border border-gold-500/40 px-3 py-1 text-[11px] text-gold-400">
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-white/40">Example conversation for illustration.</p>
          </div>
        </div>
      </section>

      {/* WHAT SAFETI DOES */}
      <section id="safeti" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-600">SAFETI AI</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
              A safety colleague that works with you, not a blank page.
            </h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 sm:grid-cols-3">
            {[
              {
                icon: Bot,
                title: "Builds your missions",
                desc: "Chat about your operation. SAFETI asks for what is missing, collects your data and coordinates and fills in the mission for you.",
              },
              {
                icon: ClipboardCheck,
                title: "Reviews your risks",
                desc: "SAFETI reads your mission, points out gaps and suggests hazards you may have missed, so your assessment is more complete.",
              },
              {
                icon: FilePenLine,
                title: "Drafts your documents",
                desc: "From an SMS manual to a hazard log, SAFETI writes a first draft in FAA-style structure using your mission data. You review and complete it.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-white p-8">
                <f.icon size={24} className="text-gold-600" />
                <p className="mt-4 font-display text-xl text-navy-900">{f.title}</p>
                <p className="mt-2 text-sm text-navy-900/65">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCUMENTS */}
      <section className="chart-bg-light border-y border-navy-900/10">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <p className="eyebrow text-gold-600">Documents</p>
              <h2 className="mt-4 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
                14 types of documents, drafted for you.
              </h2>
              <p className="mt-5 text-navy-900/70">
                Open a mission, pick a document and SAFETI writes it using your own data. Print it or save it as PDF from
                the app, then complete it with your organization&apos;s details.
              </p>
              <p className="mt-4 text-sm text-navy-900/55">
                Drafts are a starting point for a qualified person to review. They are not approved or reviewed by the FAA.
              </p>
            </div>
            <ul className="grid gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 sm:grid-cols-2">
              {DOCUMENTS.map((d) => (
                <li key={d} className="flex items-start gap-3 bg-white px-5 py-4 text-sm text-navy-900">
                  <FilePenLine size={16} className="mt-0.5 shrink-0 text-gold-600" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* THE APP */}
      <section id="detalle" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="eyebrow text-gold-600">The app</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
              AeroSafety Case, the SMS app where SAFETI works.
            </h2>
            <p className="mt-4 text-navy-900/70">
              Model your mission, assess the risk with the FAA / ICAO risk matrix and generate a printable mission report.
              SAFETI is built into it, one click away.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 sm:grid-cols-3">
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
            <div className="flex justify-center">
              <SafetiMark size={64} />
            </div>
            <p className="mt-4 font-display text-2xl">Want a guided demo for your team?</p>
            <p className="mt-3 text-white/60">Our consulting team can show you SAFETI and support you through implementation.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400"
              >
                Try SAFETI <ArrowUpRight size={16} />
              </a>
              <a
                href="/consulting#contact"
                className="inline-flex items-center gap-2 border border-white/25 px-6 py-3 font-medium text-white hover:border-gold-400 hover:text-gold-400"
              >
                Request a demo
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
