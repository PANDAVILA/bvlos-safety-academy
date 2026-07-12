import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_BASE, paypalConfigured } from "@/lib/paypal";
import { db } from "@/lib/db";
import { courses, products, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    if (!paypalConfigured) {
      return NextResponse.json(
        { error: "PayPal is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env.local" },
        { status: 501 }
      );
    }
    const { itemType, itemId } = await req.json();
    const session = await getServerSession(authOptions);

    let item: { title: string; priceCents: number; currency: string } | undefined;
    if (itemType === "course") {
      item = db.select().from(courses).where(eq(courses.id, itemId)).get();
    } else if (itemType === "product") {
      item = db.select().from(products).where(eq(products.id, itemId)).get();
    }
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const accessToken = await getPayPalAccessToken();
    const amount = (item.priceCents / 100).toFixed(2);

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: item.title,
            amount: { currency_code: item.currency, value: amount },
          },
        ],
      }),
    });
    const order = await res.json();

    db.insert(orders)
      .values({
        userId: (session?.user as any)?.id ?? null,
        itemType,
        itemId,
        amountCents: item.priceCents,
        currency: item.currency,
        provider: "paypal",
        providerRef: order.id,
        status: "pending",
        email: session?.user?.email ?? null,
      })
      .run();

    return NextResponse.json({ id: order.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error creating the order" }, { status: 500 });
  }
}
