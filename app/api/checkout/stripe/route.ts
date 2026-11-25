import { NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { db } from "@/lib/db";
import { courses, products, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { TERMS_VERSION } from "@/lib/legal";

export async function POST(req: Request) {
  try {
    if (!stripeConfigured) {
      return NextResponse.json(
        { error: "Online checkout is not available yet. To enroll, please email info@bvlossafetyacademy.com and we will send you an invoice." },
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

    let item: { title: string; priceCents: number; currency: string; slug: string } | undefined;
    if (itemType === "course") {
      item = db.select().from(courses).where(eq(courses.id, itemId)).get();
    } else if (itemType === "product") {
      item = db.select().from(products).where(eq(products.id, itemId)).get();
    }
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "en",
      payment_method_types: ["card"],
      customer_email: session?.user?.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: item.currency.toLowerCase(),
            product_data: { name: item.title },
            unit_amount: item.priceCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: { itemType, itemId, userId: (session?.user as any)?.id ?? "" },
    });

    db.insert(orders)
      .values({
        userId: (session?.user as any)?.id ?? null,
        itemType,
        itemId,
        amountCents: item.priceCents,
        currency: item.currency,
        provider: "stripe",
        providerRef: checkoutSession.id,
        status: "pending",
        email: session?.user?.email ?? null,
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
      })
      .run();

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "We could not start checkout. Please try again or email info@bvlossafetyacademy.com." }, { status: 500 });
  }
}
