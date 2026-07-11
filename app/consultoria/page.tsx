import Image from "next/image";
import { ShieldCheck, FileText, Users, Globe2 } from "lucide-react";
import LeadForm from "@/components/LeadForm";

const services = [
  { icon: ShieldCheck, title: "Evaluación SORA", desc: "Cálculo de GRC, ARC y estrategia de mitigación completa para tu expediente de operación." },
  { icon: FileText, title: "Safety Case", desc: "Elaboración del safety case integral requerido para autorizaciones BVLOS de categoría específica." },
  { icon: Users, title: "SMS a medida", desc: "Diseño e implementación de tu Sistema de Gestión de Seguridad, con auditoría de madurez incluida." },
  { icon: Globe2, title: "ConOps y volumen operacional", desc: "Definición del concepto de operaciones y del volumen operacional/contingencia para tu misión." },
];

export default function ConsultoriaPage() {
  return (
    <div>
      <section className="chart-bg relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow text-gold-400">Consultoría</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">
              Expertise técnico para operaciones BVLOS complejas.
            </h1>
            <p className="mt-6 max-w-lg text-white/70">
              Trabajamos junto a operadores, fabricantes y administraciones públicas para construir expedientes de
              operación sólidos, defendibles y, sobre todo, seguros en la práctica.
            </p>
          </div>
          <Image src="/brand/hero-2.png" alt="Consultoría BVLOS" width={900} height={650} className="w-full border border-white/10 object-cover" />
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
            <p className="eyebrow text-gold-600">Solicita una propuesta</p>
            <h2 className="mt-4 font-display text-3xl text-navy-900">Hablemos de tu operación</h2>
            <p className="mt-4 text-navy-900/70">
              Cuéntanos qué necesitas y un consultor especializado revisará tu caso para proponerte el alcance y
              tiempos de un proyecto a medida.
            </p>
          </div>
          <LeadForm />
        </div>
      </section>
    </div>
  );
}
