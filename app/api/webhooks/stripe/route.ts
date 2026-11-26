import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfillOrder, failOrder } from "@/lib/fulfill";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Stripe calls this endpoint after a payment. Access is granted here (not on the success page),
// so a customer who pays and closes the browser still gets what they bought.
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  // The signature check is mandatory. Without it anyone could post a fake "paid" event.
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set; refusing the event.");
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
  }
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const s = event.data.object as Stripe.Checkout.Session;
      // With delayed payment methods "completed" can arrive while still unpaid: wait for the success event.
      if (s.payment_status === "paid" || s.payment_status === "no_payment_required") {
        const result = fulfillOrder(s.id, { amountCents: s.amount_total, currency: s.currency });
        if (result === "mismatch") console.error("[stripe webhook] amount/currency mismatch for session", s.id);
        if (result === "not_found") console.error("[stripe webhook] no order for session", s.id);
      }
      break;
    }
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      failOrder((event.data.object as Stripe.Checkout.Session).id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
