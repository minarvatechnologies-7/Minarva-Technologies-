import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.user.id, channel: "WEB" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, type: true, status: true, payload: true, sentAt: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, notifications });
}
