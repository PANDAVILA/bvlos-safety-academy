import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-gold-500/20 text-white">
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
              <li><Link href="/courses" className="hover:text-gold-400">Course catalog</Link></li>
              <li><Link href="/dashboard" className="hover:text-gold-400">My dashboard</Link></li>
              <li><Link href="/resources" className="hover:text-gold-400">eBooks & templates</Link></li>
              <li><Link href="/teams" className="hover:text-gold-400">Team licensing</Link></li>
              <li><Link href="/standards" className="hover:text-gold-400">Standards & mapping</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Content</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/news" className="hover:text-gold-400">News</Link></li>
              <li><Link href="/reports" className="hover:text-gold-400">Technical reports</Link></li>
              <li><Link href="/aerosafety-case" className="hover:text-gold-400">AeroSafety Case</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Consulting</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li><Link href="/consulting" className="hover:text-gold-400">Services</Link></li>
              <li><Link href="/consulting#contact" className="hover:text-gold-400">Request a proposal</Link></li>
              <li><Link href="/contact" className="hover:text-gold-400">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-white/40">
            BVLOS Safety Academy is an independent training and consulting provider. We are not affiliated with,
            endorsed by, or certified by the FAA, EASA, ICAO, or any aviation authority. Course certificates and
            consulting deliverables do not constitute regulatory certification.{" "}
            <Link href="/legal/disclaimer" className="text-gold-400 hover:underline">
              Read the full disclaimer.
            </Link>
          </p>

          <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-white/40 lg:flex-row lg:items-center">
            <p>© {new Date().getFullYear()} BVLOS Safety Academy. All rights reserved.</p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/legal/disclaimer" className="hover:text-gold-400">Disclaimer</Link>
              <Link href="/legal/terms" className="hover:text-gold-400">Terms of Service</Link>
              <Link href="/legal/privacy" className="hover:text-gold-400">Privacy Policy</Link>
              <Link href="/legal/refunds" className="hover:text-gold-400">Refund Policy</Link>
              <Link href="/legal/consulting-scope" className="hover:text-gold-400">Consulting Scope</Link>
              <Link href="/legal/app-terms" className="hover:text-gold-400">App &amp; AI Terms</Link>
              <Link href="/legal/ai-use" className="hover:text-gold-400">AI Use Policy</Link>
              <Link href="/legal/security" className="hover:text-gold-400">Security</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
