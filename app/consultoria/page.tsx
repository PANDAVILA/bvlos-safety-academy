import Image from "next/image";
import { ShieldCheck, FileText, Users, Globe2 } from "lucide-react";
import LeadForm from "@/components/LeadForm";

const services = [
  { icon: ShieldCheck, title: "SORA Assessment", desc: "Full ground and air risk calculation (GRC, ARC) and mitigation strategy for your operational dossier." },
  { icon: FileText, title: "Safety Case", desc: "Development of the complete safety case required for specific-category BVLOS authorizations." },
  { icon: Users, title: "Custom SMS", desc: "Design and implementation of your Safety Management System, including a maturity audit." },
  { icon: Globe2, title: "ConOps & Operational Volume", desc: "Definition of the concept of operations and the operational/contingency volume for your mission." },
];

export default function ConsultingPage() {
  return (
    <div>
      <section className="chart-bg relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-gold-400">Consulting</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
              Technical expertise for complex BVLOS operations.
            </h1>
            <p className="mt-6 max-w-lg text-white/70">
              We work alongside operators, manufacturers, and public authorities to build operational dossiers
              that are solid, defensible, and — above all — safe in practice.
            </p>
          </div>
          <Image src="/brand/hero-2.png" alt="BVLOS consulting" width={900} height={650} className="w-full border border-white/10 object-cover" />
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.title} className="bg-white p-8">
                <s.icon size={22} className="text-gold-600" />
                <p className="mt-4 font-display text-lg text-navy-900">{s.title}</p>
                <p className="mt-2 text-sm text-navy-900/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="chart-bg-light border-t border-navy-900/10">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-24 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow text-gold-600">Request a proposal</p>
            <h2 className="mt-4 font-display text-3xl text-navy-900">Let's talk about your operation</h2>
            <p className="mt-4 text-navy-900/70">
              Tell us what you need and a specialized consultant will review your case to propose the scope and
              timeline of a tailored project.
            </p>
          </div>
          <LeadForm />
        </div>
      </section>
    </div>
  );
}
