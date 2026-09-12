import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, publicUserSelect, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid login data" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
    if (!user || !user.active || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    }
    await createSession(user.id);
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      active: user.active,
    } satisfies Record<keyof typeof publicUserSelect, unknown>;
    return NextResponse.json({ ok: true, user: safeUser });
  } catch (error) {
    console.error("login failed", error);
    return NextResponse.json({ ok: false, error: "Unable to sign in" }, { status: 500 });
  }
}
