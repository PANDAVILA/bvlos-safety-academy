import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="chart-bg border-t border-gold-500/20 text-white">
      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Image src="/brand/logo-white.png" alt="BVLOS Safety Academy" width={220} height={60} className="h-14 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Training, standards, and consulting for safe BVLOS operations worldwide.
            </p>
            <p className="eyebrow mt-6 text-gold-400">Knowledge · Standards · Safety</p>
          </div>

          <div>
            <p className="eyebrow text-white/50">Academy</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/cursos" className="hover:text-gold-400">Course catalog</Link></li>
              <li><Link href="/panel" className="hover:text-gold-400">My dashboard</Link></li>
              <li><Link href="/tienda" className="hover:text-gold-400">eBooks & templates</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Content</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/noticias" className="hover:text-gold-400">News</Link></li>
              <li><Link href="/informes" className="hover:text-gold-400">Technical reports</Link></li>
              <li><Link href="/aerosafety-case" className="hover:text-gold-400">AeroSafety Case</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Consulting</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/consultoria" className="hover:text-gold-400">Services</Link></li>
              <li><Link href="/consultoria#contacto" className="hover:text-gold-400">Request a proposal</Link></li>
              <li><Link href="/contacto" className="hover:text-gold-400">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 lg:flex-row lg:items-center">
          <p>© {new Date().getFullYear()} BVLOS Safety Academy. All rights reserved.</p>
          <p className="coord">39.4699° N · 0.3763° W — HQ OPS</p>
        </div>
      </div>
    </footer>
  );
}
