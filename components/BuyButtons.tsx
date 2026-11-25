"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function BuyButtons({
  itemType,
  itemId,
  priceCents,
  currency,
  tone = "light",
}: {
  itemType: "course" | "product";
  itemId: string;
  priceCents: number;
  currency: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<"stripe" | "paypal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  if (priceCents === 0) {
    return (
      <button
        onClick={async () => {
          if (!session) return router.push("/login");
          // Free item: enroll directly
          const res = await fetch("/api/enroll-free", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemType, itemId }),
          });
          if (res.ok) router.push("/dashboard");
        }}
        className="w-full bg-gold-500 px-6 py-3 font-medium text-navy-950 hover:bg-gold-400"
      >
        Enroll for free
      </button>
    );
  }

  async function handleStripe() {
    setError(null);
    setLoading("stripe");
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, itemId, acceptTerms: accepted }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "We could not start checkout. Please try again or email info@bvlossafetyacademy.com.");
    } catch {
      setError("We could not start checkout. Please try again or email info@bvlossafetyacademy.com.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="border border-gold-600/40 bg-gold-500/10 p-3 text-sm text-navy-900">{error}</p>}
      <label className={`flex items-start gap-2 text-xs ${dark ? "text-white/70" : "text-navy-900/70"}`}>
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-gold-500" />
        <span>
          I agree to the <Link href="/legal/terms" target="_blank" className="underline">Terms of Service</Link>,{" "}
          <Link href="/legal/refunds" target="_blank" className="underline">Refund Policy</Link> and{" "}
          <Link href="/legal/disclaimer" target="_blank" className="underline">Disclaimer</Link>, and I understand that
          course certificates are not an FAA or other regulatory authorization.
        </span>
      </label>
      <button
        onClick={handleStripe}
        disabled={loading !== null || !accepted}
        className={`flex w-full items-center justify-center gap-2 px-6 py-3 font-medium disabled:opacity-60 ${
          dark ? "bg-gold-500 text-navy-950 hover:bg-gold-400" : "bg-navy-900 text-white hover:bg-navy-800"
        }`}
      >
        <CreditCard size={16} />
        {loading === "stripe" ? "Redirecting to secure checkout…" : "Pay by card"}
      </button>

      {paypalClientId ? (
        <PayPalScriptProvider options={{ clientId: paypalClientId, currency }}>
          <PayPalButtons
            disabled={!accepted}
            forceReRender={[accepted, itemId]}
            style={{ layout: "horizontal", color: "gold", height: 45, tagline: false }}
            createOrder={async () => {
              const res = await fetch("/api/checkout/paypal/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemType, itemId, acceptTerms: accepted }),
              });
              const data = await res.json();
              if (!data.id) throw new Error(data.error || "PayPal could not create the order.");
              return data.id;
            }}
            onApprove={async (data) => {
              await fetch("/api/checkout/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID }),
              });
              router.push("/checkout/success");
            }}
            onError={() => setError("We could not complete the PayPal payment. Please try again.")}
          />
        </PayPalScriptProvider>
      ) : null}
      <p className={`text-center text-xs ${dark ? "text-white/50" : "text-navy-900/50"}`}>
        Prices in {currency.toUpperCase()}. Card payments are processed securely by Stripe; we never see or store your card number.
      </p>
    </div>
  );
}
