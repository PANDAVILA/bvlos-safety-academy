import { NextResponse } from "next/server";
import { getPayPalAccessToken, PAYPAL_BASE } from "@/lib/paypal";
import { db } from "@/lib/db";
import { orders, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
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
      const order = db.select().from(orders).where(eq(orders.providerRef, orderId)).get();
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

    return NextResponse.json(data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Error capturing the payment" }, { status: 500 });
  }
}
