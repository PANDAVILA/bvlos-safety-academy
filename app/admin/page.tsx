export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { users, courses, enrollments, orders, consultingLeads, articles, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default function AdminDashboard() {
  const userCount = db.select().from(users).all().length;
  const courseCount = db.select().from(courses).all().length;
  const enrollmentCount = db.select().from(enrollments).all().length;
  const paidOrders = db.select().from(orders).where(eq(orders.status, "paid")).all();
  const revenueCents = paidOrders.reduce((sum, o) => sum + o.amountCents, 0);
  const leadCount = db.select().from(consultingLeads).where(eq(consultingLeads.status, "new")).all().length;
  const articleCount = db.select().from(articles).all().length;
  const productCount = db.select().from(products).all().length;

  const stats = [
    { label: "Users", value: userCount, href: "/admin/users" },
    { label: "Courses", value: courseCount, href: "/admin/courses" },
    { label: "Enrollments", value: enrollmentCount, href: "/admin/users" },
    { label: "Revenue (paid orders)", value: `$${(revenueCents / 100).toFixed(2)}`, href: "/admin/users" },
    { label: "New consulting leads", value: leadCount, href: "/admin/leads" },
    { label: "News & reports", value: articleCount, href: "/admin/articles" },
    { label: "Digital products", value: productCount, href: "/admin/products" },
  ];

  return (
    <div>
      <p className="eyebrow text-gold-600">Admin</p>
      <h1 className="mt-2 font-display text-3xl text-navy-900">Dashboard</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border border-navy-900/10 bg-white p-6 hover:border-gold-500">
            <p className="eyebrow text-navy-900/40">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-navy-900">{s.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
