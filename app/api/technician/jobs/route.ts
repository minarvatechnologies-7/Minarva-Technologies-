import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const openStatuses = ["NEW", "ASSIGNED", "TECHNICIAN_ON_THE_WAY", "INSPECTION", "ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED"] as const;

export async function GET() {
  const auth = await requireUser(["TECHNICIAN"]);
  if (!auth.user) return auth.response!;

  const tickets = await prisma.serviceTicket.findMany({
    where: { technicianId: auth.user.id, status: { in: openStatuses as any } },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 50,
    select: {
      id: true, ticketNumber: true, serviceSlug: true, propertyType: true, location: true,
      problem: true, status: true, priority: true, estimateAmount: true, createdAt: true, updatedAt: true,
      customer: { select: { id: true, name: true, phone: true, whatsapp: true, address: true, city: true } },
      appointment: { select: { scheduledAt: true, status: true, notes: true } },
      parts: { select: { name: true, quantity: true, unitCost: true } },
      timeline: { orderBy: { createdAt: "desc" }, take: 5, select: { status: true, note: true, photoUrls: true, createdAt: true } },
    },
  });

  return NextResponse.json({ ok: true, jobs: tickets.map((ticket) => ({ ...ticket, publicTicketId: `MN-SRV-${String(ticket.ticketNumber).padStart(6, "0")}` })) });
}
