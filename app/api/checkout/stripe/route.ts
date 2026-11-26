import { NextResponse } from "next/server";
import { stripe, stripeConfigured, siteUrl } from "@/lib/stripe";
import { alreadyOwns } from "@/lib/fulfill";
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
    const userId = (session?.user as any)?.id as string | undefined;
    // Purchases must belong to an account, otherwise the buyer would pay and get no access.
    if (!userId) return NextResponse.json({ error: "Please sign in or create an account before paying." }, { status: 401 });

    let item: { title: string; priceCents: number; currency: string; slug: string } | undefined;
    if (itemType === "course") {
      item = db.select().from(courses).where(eq(courses.id, itemId)).get();
    } else if (itemType === "product") {
      item = db.select().from(products).where(eq(products.id, itemId)).get();
    }
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (!item.priceCents || item.priceCents <= 0) return NextResponse.json({ error: "This item is free." }, { status: 400 });
    if (alreadyOwns(userId, itemType, itemId)) return NextResponse.json({ error: "You already have access to this item." }, { status: 409 });

    const origin = siteUrl(req);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      // We are the seller (no Managed Payments / merchant of record). New Stripe accounts have it on by
      // default, and then every product needs a tax code, so switch it off for these sessions.
      managed_payments: { enabled: false },
      locale: "en",
      customer_email: session?.user?.email ?? undefined,
      client_reference_id: userId,
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
      metadata: { itemType, itemId, userId },
    } as any);

    db.insert(orders)
      .values({
        userId,
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
