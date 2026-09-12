import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser(["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER"]);
  if (!auth.user) return auth.response!;

  const tickets = await prisma.serviceTicket.findMany({
    where: { status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 100,
    select: {
      id: true, ticketNumber: true, serviceSlug: true, problem: true, location: true,
      status: true, priority: true, createdAt: true, updatedAt: true,
      customer: { select: { name: true, phone: true, city: true } },
      technician: { select: { id: true, name: true, phone: true } },
      appointment: { select: { scheduledAt: true, status: true } },
    },
  });
  const technicians = await prisma.user.findMany({ where: { role: "TECHNICIAN", active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, phone: true } });

  return NextResponse.json({ ok: true, tickets: tickets.map(t => ({ ...t, publicTicketId: `MN-SRV-${String(t.ticketNumber).padStart(6, "0")}` })), technicians });
}
