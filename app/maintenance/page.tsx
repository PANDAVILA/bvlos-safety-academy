import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Under maintenance | BVLOS Safety Academy",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 py-16 text-center text-white">
      <Image src="/brand/logo-white.png" alt="BVLOS Safety Academy" width={360} height={180} priority />
      <p className="eyebrow mt-10 text-gold-400">Scheduled maintenance</p>
      <h1 className="mt-4 font-display text-3xl sm:text-4xl">We are upgrading the Academy</h1>
      <p className="mt-5 max-w-xl text-white/70">
        BVLOS Safety Academy is temporarily offline while we publish new courses and improvements.
        We will be back shortly. Thank you for your patience.
      </p>
      <Link href="/login" className="mt-12 text-xs uppercase tracking-widest text-white/40 hover:text-gold-400">
        Administrator sign in
      </Link>
    </div>
  );
}
