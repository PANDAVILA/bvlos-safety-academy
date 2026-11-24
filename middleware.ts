import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import maintenance from "./lib/maintenance.json";

// Maintenance mode.
// ON  when lib/maintenance.json has "enabled": true, or the MAINTENANCE_MODE variable is "1"/"true".
// OFF when the file has "enabled": false (or MAINTENANCE_MODE is "0"/"false", which wins over the file).
// While ON, visitors see /maintenance. Only a signed-in admin can browse and edit the site.

function maintenanceOn(): boolean {
  const v = (process.env.MAINTENANCE_MODE || "").trim().toLowerCase();
  if (v === "1" || v === "true" || v === "on") return true;
  if (v === "0" || v === "false" || v === "off") return false;
  return maintenance.enabled === true;
}

const ALWAYS_ALLOWED = ["/login", "/maintenance", "/api/auth", "/api/webhooks"];

export async function middleware(req: NextRequest) {
  if (!maintenanceOn()) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const headers = new Headers(req.headers);
  headers.set("x-maintenance", "1");

  if (ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next({ request: { headers } });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if ((token as any)?.role === "admin") return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "The site is under maintenance. Please try again later." },
      { status: 503, headers: { "Retry-After": "3600" } }
    );
  }

  const res = NextResponse.rewrite(new URL("/maintenance", req.url), { request: { headers } });
  res.headers.set("Retry-After", "3600");
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}

export const config = {
  // Skip Next internals and any file with an extension (images, templates, fonts, favicon).
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
