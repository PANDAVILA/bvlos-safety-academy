"use client";
import { useState } from "react";

const services = [
  "SMS assessment",
  "ConOps design",
  "SMS audit / design",
  "Full safety case",
  "In-company training",
  "Other",
];

export default function LeadForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", serviceInterest: services[0], message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="border border-gold-500/40 bg-gold-500/10 p-8">
        <p className="font-display text-xl text-navy-900">Request received.</p>
        <p className="mt-2 text-navy-900/70">Our consulting team will get back to you within 48 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-navy-900/10 bg-white p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="eyebrow text-navy-900/60">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow text-navy-900/60">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="eyebrow text-navy-900/60">Company / operator</label>
        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none" />
      </div>
      <div>
        <label className="eyebrow text-navy-900/60">Service of interest</label>
        <select value={form.serviceInterest} onChange={(e) => setForm({ ...form, serviceInterest: e.target.value })} className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none">
          {services.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="eyebrow text-navy-900/60">Tell us about your operation</label>
        <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2 w-full border border-navy-900/20 px-4 py-3 focus:border-gold-500 focus:outline-none" />
      </div>
      {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
      <button type="submit" disabled={status === "loading"} className="bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800 disabled:opacity-60">
        {status === "loading" ? "Sending…" : "Request a proposal"}
      </button>
    </form>
  );
}
