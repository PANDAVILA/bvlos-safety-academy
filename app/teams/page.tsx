import Link from "next/link";
import { Briefcase, ClipboardCheck, Plane, FileText, Users, Receipt } from "lucide-react";
import LeadForm from "@/components/LeadForm";
import DisclaimerNote from "@/components/DisclaimerNote";

export const metadata = {
  title: "Team Training Licenses | BVLOS Safety Academy",
  description:
    "Team licenses for drone operators: role-based SMS and BVLOS learning paths for executives, Safety Managers, and line pilots, with invoicing and enrollment handled for you.",
};

const tracks = [
  {
    icon: Briefcase,
    title: "Executives & accountable managers",
    body:
      "A focused briefing on what an SMS asks of leadership: safety policy, accountability and authority, resourcing, and how to read safety performance data without becoming the bottleneck.",
  },
  {
    icon: ClipboardCheck,
    title: "Safety Managers & ops leads",
    body:
      "The full SMS and risk-management path: hazard identification, risk assessment and controls, safety assurance and audit, documentation, and how to run the program day to day.",
  },
  {
    icon: Plane,
    title: "Line pilots & visual observers",
    body:
      "BVLOS fundamentals, airspace and chart reading, contingency planning, and reporting culture, so the people flying the mission recognize drift and report it early.",
  },
];

const how = [
  { icon: Users, title: "Tell us about your team", body: "Number of learners, roles, and what your clients or insurer expect to see." },
  { icon: FileText, title: "Receive a quote", body: "Volume pricing for 5 to 20+ seats, with the learning paths that fit each role." },
  { icon: Receipt, title: "Pay by invoice", body: "We invoice your company. No individual credit cards, no expense reports." },
  { icon: ClipboardCheck, title: "We enroll your people", body: "Learners get access to their courses and track progress. A completion summary is available on request." },
];

export default function TeamsPage() {
  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <p className="eyebrow text-gold-400">For teams</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
            Team licenses for drone operators.
          </h1>
          <p className="mt-6 max-w-2xl text-white/70">
            Train your whole operation on the same SMS and BVLOS foundation, with learning paths matched to what each
            role actually does. Licenses for 5 to 20+ people, invoiced to your company.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#quote" className="bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400">
              Request a team quote
            </a>
            <Link href="/standards" className="border border-white/30 px-6 py-3 font-medium text-white hover:border-white">
              See the standards map
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow text-gold-600">Learning paths by role</p>
          <h2 className="mt-3 font-display text-3xl text-navy-900">One program, three audiences.</h2>
          <p className="mt-3 max-w-2xl text-navy-900/70">
            Paths are assembled from our course catalog and can be extended with custom modules for your procedures.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 md:grid-cols-3">
            {tracks.map((t) => (
              <div key={t.title} className="bg-white p-8">
                <t.icon size={22} className="text-gold-600" />
                <p className="mt-4 font-display text-lg text-navy-900">{t.title}</p>
                <p className="mt-2 text-sm text-navy-900/60">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-navy-900/10 bg-navy-900/[0.03]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow text-gold-600">How it works</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {how.map((h, i) => (
              <div key={h.title}>
                <p className="coord text-xs text-navy-900/40">0{i + 1}</p>
                <h.icon size={20} className="mt-3 text-gold-600" />
                <p className="mt-3 font-display text-navy-900">{h.title}</p>
                <p className="mt-2 text-sm text-navy-900/60">{h.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-3xl text-sm text-navy-900/70">
            Want more than training? Teams often continue into an SMS manual build, a ConOps, or a gap audit with our
            consulting group. <Link href="/consulting" className="underline hover:text-gold-600">See consulting services</Link>.
          </p>
        </div>
      </section>

      <section id="quote" className="chart-bg-light border-t border-navy-900/10">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow text-gold-600">Request a team quote</p>
              <h2 className="mt-4 font-display text-3xl text-navy-900">Tell us about your team</h2>
              <p className="mt-4 text-navy-900/70">
                We will reply with pricing, the recommended learning path for each role, and next steps.
              </p>
            </div>
            <LeadForm
              defaultService="Team training license"
              showSeats
              submitLabel="Request a team quote"
              messageLabel="Roles on your team and any requirements from clients or insurers"
            />
          </div>
          <div className="mt-8">
            <DisclaimerNote />
          </div>
        </div>
      </section>
    </div>
  );
}
