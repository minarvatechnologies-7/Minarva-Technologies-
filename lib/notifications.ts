import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type NotificationChannel = "WEB" | "EMAIL" | "WHATSAPP" | "SMS" | "PUSH";

type CreateNotificationInput = {
  userId: string;
  channel: NotificationChannel;
  type: string;
  payload: Record<string, unknown>;
};

export async function queueNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      channel: input.channel,
      type: input.type,
      payload: input.payload as Prisma.InputJsonValue,
      status: "PENDING",
    },
  });
}

export async function queueNotifications(inputs: CreateNotificationInput[]) {
  if (!inputs.length) return { count: 0 };
  return prisma.notification.createMany({
    data: inputs.map((input) => ({
      userId: input.userId,
      channel: input.channel,
      type: input.type,
      payload: input.payload as Prisma.InputJsonValue,
      status: "PENDING",
    })),
  });
}
