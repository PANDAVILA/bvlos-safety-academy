import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { passwordProblem } from "@/lib/password";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { TERMS_VERSION } from "@/lib/legal";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(1).max(200),
  acceptTerms: z.literal(true),
  website: z.string().optional(), // honeypot
  company: z.string().optional(),
  country: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`register:${clientIp(req)}`, 15, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const missingTerms = parsed.error.issues.some((i) => i.path[0] === "acceptTerms");
      return NextResponse.json(
        { error: missingTerms ? "You must accept the Terms of Service and Privacy Policy." : "Invalid data" },
        { status: 400 }
      );
    }
    const { name, email, password, company, country, website } = parsed.data;
    if (website) return NextResponse.json({ ok: true }); // bot filled the hidden field
    const problem = passwordProblem(password, email);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const existing = db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
    if (existing) {
      return NextResponse.json({ error: "That email is already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    db.insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        passwordHash,
        company,
        country,
        role: "student",
        termsAcceptedAt: new Date().toISOString(),
        termsVersion: TERMS_VERSION,
      })
      .run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
