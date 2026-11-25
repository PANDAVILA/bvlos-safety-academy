import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_BASE, paypalConfigured } from "@/lib/paypal";
import { db } from "@/lib/db";
import { courses, products, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { TERMS_VERSION } from "@/lib/legal";

export async function POST(req: Request) {
  try {
    if (!paypalConfigured) {
      return NextResponse.json(
        { error: "PayPal checkout is not available yet. Please pay by card or email info@bvlossafetyacademy.com." },
        { status: 501 }
      );
    }
    if (!rateLimit(`checkout:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
    }
    const { itemType, itemId, acceptTerms } = await req.json();
    if (acceptTerms !== true) {
      return NextResponse.json({ error: "Please accept the Terms of Service and Refund Policy to continue." }, { status: 400 });
    }
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
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
      })
      .run();

    return NextResponse.json({ id: order.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error creating the order" }, { status: 500 });
  }
}
