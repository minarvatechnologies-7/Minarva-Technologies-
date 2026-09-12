import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueManagementNotification } from "@/lib/follow-ups";

function authorized(request: Request) {
  const workerSecret = process.env.NOTIFICATION_WORKER_SECRET;
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const cronAuthorized = Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
  const workerAuthorized = Boolean(workerSecret && request.headers.get("x-notification-worker-secret") === workerSecret);
  return cronAuthorized || workerAuthorized;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 86400000);
  let queued = 0;

  const followUpLeads = await prisma.lead.findMany({
    where: { followUpAt: { lte: now }, status: { notIn: ["WON", "LOST"] } },
    select: { id: true, leadNumber: true, name: true, serviceSlug: true, temperature: true },
    take: 50,
  });

  for (const lead of followUpLeads) {
    const recent = await prisma.notification.count({
      where: {
        type: "LEAD_FOLLOW_UP",
        createdAt: { gte: new Date(now.getTime() - 24 * 3600000) },
        payload: { path: ["leadId"], equals: lead.id },
      },
    });
    if (recent) continue;
    queued += await queueManagementNotification("LEAD_FOLLOW_UP", {
      leadId: lead.id,
      leadNumber: lead.leadNumber,
      name: lead.name,
      serviceSlug: lead.serviceSlug,
      temperature: lead.temperature,
      action: "Follow up with the lead and update the CRM.",
    });
  }

  const expiring = await prisma.warranty.findMany({
    where: { status: "ACTIVE", expiresAt: { gt: now, lte: soon } },
    select: { id: true, serialNumber: true, expiresAt: true, customer: { select: { name: true, phone: true } } },
    take: 50,
  });

  for (const warranty of expiring) {
    const recent = await prisma.notification.count({
      where: {
        type: "WARRANTY_EXPIRING",
        createdAt: { gte: new Date(now.getTime() - 7 * 86400000) },
        payload: { path: ["warrantyId"], equals: warranty.id },
      },
    });
    if (recent) continue;
    queued += await queueManagementNotification("WARRANTY_EXPIRING", {
      warrantyId: warranty.id,
      serialNumber: warranty.serialNumber,
      customer: warranty.customer.name,
      phone: warranty.customer.phone,
      expiresAt: warranty.expiresAt.toISOString(),
      action: "Review warranty and plan customer follow-up.",
    });
  }

  return NextResponse.json({ ok: true, queued, checked: { followUpLeads: followUpLeads.length, expiringWarranties: expiring.length } });
}
