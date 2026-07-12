export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, Newspaper, ShoppingBag, Mail, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/articles", label: "News & Reports", icon: Newspaper },
  { href: "/admin/products", label: "Resources", icon: ShoppingBag },
  { href: "/admin/leads", label: "Consulting Leads", icon: Mail },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="border-r border-navy-900/10 bg-navy-900 text-white">
        <div className="border-b border-white/10 p-6">
          <p className="eyebrow text-gold-400">Admin</p>
          <p className="mt-1 text-sm text-white/60">{session.user?.email}</p>
        </div>
        <nav className="p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-2 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-gold-400"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="mt-4 flex items-center gap-2 border-t border-white/10 px-2 py-2.5 pt-4 text-sm text-white/50 hover:text-gold-400"
          >
            <ArrowLeft size={16} />
            Back to site
          </Link>
        </nav>
      </aside>
      <main className="chart-bg-light p-6 lg:p-10">{children}</main>
    </div>
  );
}
