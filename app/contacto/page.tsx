import LeadForm from "@/components/LeadForm";

export default function ContactoPage() {
  return (
    <div className="chart-bg-light">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="eyebrow text-gold-600">Contacto</p>
        <h1 className="mt-4 font-display text-3xl text-navy-900">Ponte en contacto con nosotros</h1>
        <p className="mt-4 text-navy-900/70">
          Para consultas generales, alianzas o solicitudes de consultoría, completa el formulario y te responderemos
          a la brevedad.
        </p>
        <div className="mt-10">
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
