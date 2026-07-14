import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/login");
  }
  return session;
}

// For use inside API route handlers, where redirect() isn't appropriate.
// Returns the session if the caller is an admin, or null otherwise.
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") return null;
  return session;
}
