import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: Request) {
  const workerSecret = process.env.NOTIFICATION_WORKER_SECRET;
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const cronAuthorized = Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
  const workerAuthorized = Boolean(workerSecret && request.headers.get("x-notification-worker-secret") === workerSecret);
  return cronAuthorized || workerAuthorized;
}

async function processNotifications(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const pending = await prisma.notification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: { id: true, channel: true, type: true, payload: true },
  });

  let processed = 0;
  for (const item of pending) {
    if (item.channel === "WEB") {
      await prisma.notification.update({ where: { id: item.id }, data: { status: "SENT", sentAt: new Date() } });
      processed += 1;
      continue;
    }

    const configured = item.channel === "EMAIL" ? Boolean(process.env.RESEND_API_KEY)
      : item.channel === "WHATSAPP" ? Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
      : item.channel === "SMS" ? Boolean(process.env.SMS_PROVIDER_API_KEY)
      : false;

    if (!configured) continue;
  }

  return NextResponse.json({ ok: true, queued: pending.length, processed });
}

export const GET = processNotifications;
export const POST = processNotifications;
