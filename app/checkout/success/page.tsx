import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <div className="chart-bg-light flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-20">
      <div className="max-w-md border border-navy-900/10 bg-white p-10 text-center">
        <CheckCircle2 size={40} className="mx-auto text-gold-600" />
        <h1 className="mt-6 font-display text-2xl text-navy-900">Payment complete</h1>
        <p className="mt-3 text-navy-900/60">
          Thank you for your purchase. Your content is now available in your dashboard. A receipt has been sent to your email by our payment processor.
        </p>
        <Link href="/dashboard" className="mt-8 inline-block bg-navy-900 px-6 py-3 font-medium text-white hover:bg-navy-800">
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}
