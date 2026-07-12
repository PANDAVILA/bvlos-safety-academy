export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { users, enrollments, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default function AdminUsersPage() {
  const allUsers = db.select().from(users).all();
  const allEnrollments = db.select().from(enrollments).all();
  const allOrders = db.select().from(orders).where(eq(orders.status, "paid")).all();

  return (
    <div>
      <p className="eyebrow text-gold-600">Admin</p>
      <h1 className="mt-2 font-display text-3xl text-navy-900">Users</h1>
      <p className="mt-2 text-navy-900/60">{allUsers.length} registered users.</p>

      <div className="mt-8 overflow-x-auto border border-navy-900/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-900/10 bg-navy-900/5 text-navy-900/50">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Company</th>
              <th className="p-3 font-medium">Enrollments</th>
              <th className="p-3 font-medium">Paid orders</th>
              <th className="p-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => {
              const userEnrollments = allEnrollments.filter((e) => e.userId === u.id);
              const userOrders = allOrders.filter((o) => o.userId === u.id);
              return (
                <tr key={u.id} className="border-b border-navy-900/5">
                  <td className="p-3 text-navy-900">{u.name}</td>
                  <td className="p-3 text-navy-900/70">{u.email}</td>
                  <td className="p-3">
                    <span className={`eyebrow ${u.role === "admin" ? "text-gold-600" : "text-navy-900/40"}`}>{u.role}</span>
                  </td>
                  <td className="p-3 text-navy-900/60">{u.company || "—"}</td>
                  <td className="p-3 text-navy-900/70">{userEnrollments.length}</td>
                  <td className="p-3 text-navy-900/70">{userOrders.length}</td>
                  <td className="p-3 coord text-xs text-navy-900/40">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {allUsers.length === 0 && <p className="p-6 text-navy-900/50">No registered users yet.</p>}
      </div>
    </div>
  );
}
