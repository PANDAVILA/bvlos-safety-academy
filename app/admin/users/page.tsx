export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { users, enrollments, orders, courses } from "@/lib/db/schema";
import { enrollUsersByEmail } from "@/lib/actions/enrollments";
import { eq } from "drizzle-orm";

export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: { enrolled?: string; already?: string; missing?: string; course?: string; enroll_error?: string };
}) {
  const allCourses = db.select().from(courses).all();
  const allUsers = db.select().from(users).all();
  const allEnrollments = db.select().from(enrollments).all();
  const allOrders = db.select().from(orders).where(eq(orders.status, "paid")).all();

  return (
    <div>
      <p className="eyebrow text-gold-600">Admin</p>
      <h1 className="mt-2 font-display text-3xl text-navy-900">Users</h1>
      <p className="mt-2 text-navy-900/60">{allUsers.length} registered users.</p>

      {searchParams.enrolled !== undefined && (
        <div className="mt-6 border border-gold-500/40 bg-gold-500/10 p-4 text-sm text-navy-900">
          <p>
            Enrolled <strong>{searchParams.enrolled}</strong> user(s) in <strong>{searchParams.course}</strong>
            {Number(searchParams.already) > 0 ? ` (${searchParams.already} already enrolled)` : ""}.
          </p>
          {searchParams.missing && (
            <p className="mt-2">
              No account found for: {searchParams.missing}. Ask them to register at /register with that email, then run this again.
            </p>
          )}
        </div>
      )}
      {searchParams.enroll_error && (
        <p className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-700">Choose a course and paste at least one email address.</p>
      )}

      <form action={enrollUsersByEmail} className="mt-8 border border-navy-900/10 bg-white p-6">
        <p className="eyebrow text-gold-600">Team licenses</p>
        <h2 className="mt-2 font-display text-xl text-navy-900">Enroll users after invoicing</h2>
        <p className="mt-1 text-sm text-navy-900/60">
          Paste the emails of people who already registered (one per line or comma-separated). No payment is required.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <div>
            <label className="eyebrow text-navy-900/60">Course</label>
            <select name="courseId" required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none">
              {allCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow text-navy-900/60">Emails</label>
            <textarea name="emails" rows={4} required className="mt-2 w-full border border-navy-900/20 px-4 py-2.5 focus:border-gold-500 focus:outline-none" />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-navy-900 px-6 py-2.5 font-medium text-white hover:bg-navy-800">Enroll users</button>
      </form>

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
