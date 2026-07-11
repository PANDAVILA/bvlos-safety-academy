import { NextResponse } from "next/server";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { db } from "@/lib/db";
import { courses, products, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    if (!stripeConfigured) {
      return NextResponse.json(
        { error: "Stripe no está configurado. Añade STRIPE_SECRET_KEY en .env.local" },
        { status: 501 }
      );
    }

    const { itemType, itemId } = await req.json();
    const session = await getServerSession(authOptions);

    let item: { title: string; priceCents: number; currency: string; slug: string } | undefined;
    if (itemType === "course") {
      item = db.select().from(courses).where(eq(courses.id, itemId)).get();
    } else if (itemType === "product") {
      item = db.select().from(products).where(eq(products.id, itemId)).get();
    }
    if (!item) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
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
      })
      .run();

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error al crear el pago" }, { status: 500 });
  }
}
