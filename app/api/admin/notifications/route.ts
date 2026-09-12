import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const roles = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER", "ACCOUNTANT", "CONTENT_MARKETING"] as const;

export async function GET() {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.user.id, channel: "WEB" },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, type: true, status: true, payload: true, createdAt: true, sentAt: true },
  });

  return NextResponse.json({ ok: true, notifications, unread: notifications.filter((item) => item.status !== "READ").length });
}
