import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (!secret || !sig) {
      // Dev fallback: no signature verification if webhook secret isn't configured
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, secret);
    }
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const order = db.select().from(orders).where(eq(orders.providerRef, session.id)).get();
    if (order) {
      db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id)).run();
      if (order.itemType === "course" && order.userId) {
        const existing = db
          .select()
          .from(enrollments)
          .where(eq(enrollments.userId, order.userId))
          .all()
          .find((e) => e.courseId === order.itemId);
        if (!existing) {
          db.insert(enrollments)
            .values({ userId: order.userId, courseId: order.itemId })
            .run();
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
