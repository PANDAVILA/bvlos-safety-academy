import { db } from "@/lib/db";
import { orders, enrollments } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Marks an order as paid and gives access. Safe to call more than once for the same order
 * (Stripe can deliver an event twice). When the paid amount is known it must match the order.
 */
export function fulfillOrder(
  providerRef: string,
  paid?: { amountCents?: number | null; currency?: string | null }
): "fulfilled" | "already" | "not_found" | "mismatch" {
  const order = db.select().from(orders).where(eq(orders.providerRef, providerRef)).get();
  if (!order) return "not_found";
  if (order.status === "paid") return "already";

  if (paid?.amountCents != null && paid.amountCents !== order.amountCents) return "mismatch";
  if (paid?.currency && paid.currency.toLowerCase() !== order.currency.toLowerCase()) return "mismatch";

  db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id)).run();

  if (order.itemType === "course" && order.userId) {
    const existing = db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, order.userId), eq(enrollments.courseId, order.itemId)))
      .get();
    if (!existing) db.insert(enrollments).values({ userId: order.userId, courseId: order.itemId }).run();
  }
  return "fulfilled";
}

export function failOrder(providerRef: string) {
  const order = db.select().from(orders).where(eq(orders.providerRef, providerRef)).get();
  if (order && order.status === "pending") {
    db.update(orders).set({ status: "failed" }).where(eq(orders.id, order.id)).run();
  }
}

/** True when this user already owns the item (enrolled course or paid product). */
export function alreadyOwns(userId: string, itemType: string, itemId: string): boolean {
  if (itemType === "course") {
    return !!db.select().from(enrollments).where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, itemId))).get();
  }
  return !!db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.itemType, itemType), eq(orders.itemId, itemId), eq(orders.status, "paid")))
    .get();
}
