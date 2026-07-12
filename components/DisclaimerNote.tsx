import Link from "next/link";
import { Info } from "lucide-react";

export default function DisclaimerNote({ variant = "light" }: { variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <div
      className={`flex items-start gap-3 border-l-2 border-gold-500 px-4 py-3 text-sm ${
        isDark ? "bg-white/5 text-white/60" : "bg-gold-500/5 text-navy-900/70"
      }`}
    >
      <Info size={16} className="mt-0.5 shrink-0 text-gold-500" />
      <p>
        BVLOS Safety Academy is an independent provider, not affiliated with or certified by the FAA, EASA,
        ICAO, or any aviation authority.{" "}
        <Link href="/legal/disclaimer" className="underline hover:text-gold-500">
          Read the full disclaimer
        </Link>
        .
      </p>
    </div>
  );
}
