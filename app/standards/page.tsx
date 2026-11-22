import Link from "next/link";
import DisclaimerNote from "@/components/DisclaimerNote";

export const metadata = {
  title: "Standards & Curriculum Mapping | BVLOS Safety Academy",
  description:
    "How BVLOS Safety Academy's SMS and BVLOS curricula are organized around FAA 14 CFR Part 5, FAA AC 120-92D, ICAO Annex 19 / Doc 9859, and IS-BAO.",
};

const LAST_REVIEWED = "November 22, 2026";

const frameworks = [
  {
    name: "FAA 14 CFR Part 5",
    kind: "Federal regulation",
    what:
      "The FAA's Safety Management Systems rule. It defines the four SMS components: Safety Policy (Subpart B), Safety Risk Management (C), Safety Assurance (D), and Safety Promotion (E), plus SMS documentation and records (F).",
    who:
      "Required for Part 121 and Part 135 certificate holders, §91.147 air tour Letter of Authorization holders, and certain Part 21 type/production certificate holders. It is not mandatory for Part 107 remote pilots.",
    how:
      "Our SMS curriculum is structured around the same four components and uses the same terminology, so a drone operator building a voluntary SMS can organize it exactly the way Part 5 organizes one.",
  },
  {
    name: "FAA Advisory Circular 120-92D",
    kind: "FAA guidance (May 2024)",
    what:
      "\"Safety Management Systems for Aviation Service Providers.\" It describes one acceptable means of meeting Part 5 and offers guidance for organizations that choose to build a voluntary SMS. It cancels AC 120-92B.",
    who:
      "Part 5 certificate holders, and other aviation organizations that want a voluntary SMS. Advisory circulars are guidance, not regulation.",
    how:
      "We use the AC's component-and-element breakdown as a reference when teaching how to write and maintain SMS documentation.",
  },
  {
    name: "ICAO Annex 19 and Doc 9859",
    kind: "International standard and guidance",
    what:
      "Annex 19 (Safety Management) and the Safety Management Manual (Doc 9859) set out the SMS framework that national rules such as Part 5 are built on.",
    who:
      "States and aviation service providers worldwide. Useful when your clients, contracts, or operations cross borders.",
    how:
      "The same four-component structure appears in our curriculum, so what you learn transfers to ICAO-based requirements outside the United States.",
  },
  {
    name: "IS-BAO (IBAC)",
    kind: "Voluntary industry standard",
    what:
      "The International Standard for Business Aircraft Operations, administered by the International Business Aviation Council. It audits SMS maturity in three stages and includes a Remote Piloted Aircraft System (RPAS) option that IBAC introduced in beta in 2021.",
    who:
      "Operators that choose to register voluntarily, often because a client, insurer, or flight department asks for it. Requirements vary by client, so confirm what yours accepts.",
    how:
      "Our SMS course covers the SMS elements that a maturity-based audit looks for. BSA is not an IBAC auditor or accredited training provider, and completing our course does not register you to IS-BAO.",
  },
];

export default function StandardsPage() {
  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <p className="eyebrow text-gold-400">Standards</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
            Standards &amp; curriculum mapping
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Safety managers, insurers, and corporate clients already audit against a handful of recognized SMS
            frameworks. Our curricula are organized around them, so the training you buy is easy to trace to the
            structure your reviewers expect.
          </p>
          <div className="mt-8 max-w-2xl">
            <DisclaimerNote variant="dark" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="border-l-2 border-gold-500 bg-gold-500/5 p-5 text-sm text-navy-900/80">
            <p className="font-medium text-navy-900">What &quot;mapped to&quot; means here</p>
            <p className="mt-2">
              It describes how our course material is organized. It does not mean a course is approved, accredited,
              endorsed, or recognized by the FAA, EASA, ICAO, IBAC, or any other body, and it does not mean that
              completing a course makes you or your organization compliant with, or certified to, any standard.
              Compliance and certification are decisions made by the relevant authority, auditor, or client.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {frameworks.map((f) => (
              <article key={f.name} className="border border-navy-900/10">
                <header className="border-b border-navy-900/10 bg-navy-900 px-6 py-4">
                  <h2 className="font-display text-xl text-white">{f.name}</h2>
                  <p className="eyebrow mt-1 text-gold-400">{f.kind}</p>
                </header>
                <dl className="divide-y divide-navy-900/10 text-sm">
                  {[
                    ["What it is", f.what],
                    ["Who it applies to", f.who],
                    ["How our curriculum relates", f.how],
                  ].map(([label, body]) => (
                    <div key={label} className="grid gap-2 px-6 py-4 sm:grid-cols-[180px_1fr]">
                      <dt className="eyebrow text-navy-900/50">{label}</dt>
                      <dd className="text-navy-900/80">{body}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <div className="mt-12 border border-navy-900/10 p-6">
            <h2 className="font-display text-xl text-navy-900">Regulatory context for BVLOS</h2>
            <p className="mt-3 text-sm text-navy-900/70">
              In the United States, BVLOS operations are currently authorized through Part 107 waivers or other
              existing authority. The FAA proposed a dedicated Part 108 in August 2025; as of {LAST_REVIEWED} we have
              not seen a final rule published. In Europe, EASA&apos;s specific category uses SORA 2.5. Our BVLOS Operations
              Fundamentals course covers these pathways and is updated as they change.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link href="/courses" className="bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800">
              Browse courses
            </Link>
            <Link href="/teams" className="border border-navy-900/20 px-6 py-3 font-medium text-navy-900 hover:border-navy-900">
              Team licensing
            </Link>
            <Link href="/legal/disclaimer" className="text-sm text-navy-900/60 underline hover:text-gold-600">
              Full disclaimer
            </Link>
          </div>
          <p className="mt-6 text-xs text-navy-900/40">Last reviewed: {LAST_REVIEWED}</p>
        </div>
      </section>
    </div>
  );
}
