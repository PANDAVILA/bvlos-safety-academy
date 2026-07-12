import Link from "next/link";

const legalNav = [
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/refunds", label: "Refund Policy" },
  { href: "/legal/consulting-scope", label: "Consulting Scope of Services" },
];

export default function LegalPageShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <section className="chart-bg">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="eyebrow text-gold-400">Legal</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          <p className="coord mt-3 text-xs text-white/40">Last updated: {updated}</p>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[220px_1fr]">
          <nav className="h-fit space-y-1 lg:sticky lg:top-24">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block border-l-2 border-transparent px-3 py-2 text-sm text-navy-900/60 hover:border-gold-500 hover:text-navy-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="prose-legal max-w-none text-navy-900/80">{children}</div>
        </div>
      </section>
    </div>
  );
}
