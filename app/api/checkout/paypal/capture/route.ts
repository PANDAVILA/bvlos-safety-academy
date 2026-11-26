import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fulfillOrder } from "@/lib/fulfill";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const me = (await getServerSession(authOptions))?.user as any;
    if (!me?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    const mine = db.select().from(orders).where(eq(orders.providerRef, String(orderId))).get();
    if (!mine || mine.userId !== me.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const accessToken = await getPayPalAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();

    if (data.status === "COMPLETED") {
      const cap = data.purchase_units?.[0]?.payments?.captures?.[0];
      const cents = cap?.amount?.value != null ? Math.round(parseFloat(cap.amount.value) * 100) : undefined;
      fulfillOrder(String(orderId), { amountCents: cents, currency: cap?.amount?.currency_code });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error capturing the payment" }, { status: 500 });
  }
}
