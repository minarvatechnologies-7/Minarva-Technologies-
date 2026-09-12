import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MANAGEMENT_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER"] as const;

export async function queueNotification(userId: string, type: string, payload: Record<string, unknown>, channel = "WEB") {
  return prisma.notification.create({
    data: { userId, channel, type, payload: payload as Prisma.InputJsonValue, status: "PENDING" },
  });
}

export async function queueManagementNotification(type: string, payload: Record<string, unknown>) {
  const users = await prisma.user.findMany({ where: { role: { in: [...MANAGEMENT_ROLES] }, active: true }, select: { id: true } });
  if (!users.length) return 0;
  await prisma.notification.createMany({
    data: users.map((user) => ({ userId: user.id, channel: "WEB", type, payload: payload as Prisma.InputJsonValue, status: "PENDING" })),
  });
  return users.length;
}
