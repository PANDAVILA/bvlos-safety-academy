export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { consultingLeads } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { updateLeadStatus } from "@/lib/actions/leads";

const statuses = ["new", "contacted", "won", "lost"];

export default function AdminLeadsPage() {
  const leads = db.select().from(consultingLeads).orderBy(desc(consultingLeads.createdAt)).all();

  return (
    <div>
      <p className="eyebrow text-gold-600">Admin</p>
      <h1 className="mt-2 font-display text-3xl text-navy-900">Consulting Leads</h1>

      <div className="mt-8 divide-y divide-navy-900/10 border border-navy-900/10 bg-white">
        {leads.map((lead) => (
          <div key={lead.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-navy-900">{lead.name}</p>
                <p className="text-sm text-navy-900/60">{lead.email} {lead.company ? `· ${lead.company}` : ""}</p>
                <p className="mt-1 text-xs text-gold-600">{lead.serviceInterest}</p>
              </div>
              <form action={updateLeadStatus.bind(null, lead.id, "")} className="flex items-center gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    formAction={updateLeadStatus.bind(null, lead.id, s)}
                    className={`eyebrow px-2.5 py-1 ${lead.status === s ? "bg-navy-900 text-white" : "bg-navy-900/5 text-navy-900/50 hover:bg-navy-900/10"}`}
                  >
                    {s}
                  </button>
                ))}
              </form>
            </div>
            {lead.message && <p className="mt-3 text-sm text-navy-900/70">{lead.message}</p>}
            <p className="coord mt-2 text-xs text-navy-900/30">
              {lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-US") : ""}
            </p>
          </div>
        ))}
        {leads.length === 0 && <p className="p-6 text-navy-900/50">No consulting leads yet.</p>}
      </div>
    </div>
  );
}
