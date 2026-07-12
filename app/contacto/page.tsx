import LeadForm from "@/components/LeadForm";

export default function ContactPage() {
  return (
    <div className="chart-bg-light">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="eyebrow text-gold-600">Contact</p>
        <h1 className="mt-4 font-display text-3xl text-navy-900">Get in touch</h1>
        <p className="mt-4 text-navy-900/70">
          For general inquiries, partnerships, or consulting requests, fill out the form and we'll get back to
          you shortly.
        </p>
        <div className="mt-10">
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
