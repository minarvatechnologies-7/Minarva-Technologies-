import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, publicUserSelect } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(30),
  password: z.string().min(8).max(128),
});

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const throttle = rateLimit(`register:${clientKey(request)}`, 5, 15 * 60_000);
  if (!throttle.allowed) return NextResponse.json({ ok: false, error: "Too many registration attempts" }, { status: 429 });
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid registration data" }, { status: 400 });
    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ ok: false, error: "An account with this email already exists" }, { status: 409 });
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        phone: parsed.data.phone,
        passwordHash,
        role: "CUSTOMER",
        customer: { create: { name: parsed.data.name, phone: parsed.data.phone, email } },
      },
      select: publicUserSelect,
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("registration failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create account" }, { status: 500 });
  }
}
