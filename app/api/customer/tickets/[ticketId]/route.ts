import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;
  const { ticketId } = await params;
  const customer = await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!customer) return NextResponse.json({ ok: false, error: "Customer profile not found" }, { status: 404 });

  const ticket = await prisma.serviceTicket.findFirst({
    where: { id: ticketId, customerId: customer.id },
    select: {
      id: true, ticketNumber: true, serviceSlug: true, propertyType: true, location: true,
      problem: true, status: true, priority: true, estimateAmount: true, approvedAt: true, completedAt: true,
      createdAt: true, updatedAt: true,
      technician: { select: { name: true, phone: true } },
      appointment: { select: { scheduledAt: true, status: true, notes: true } },
      timeline: { orderBy: { createdAt: "asc" }, select: { status: true, note: true, photoUrls: true, signatureUrl: true, createdAt: true } },
      parts: { select: { name: true, quantity: true, unitCost: true } },
    },
  });
  if (!ticket) return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });

  return NextResponse.json({ ok: true, ticket: { ...ticket, publicTicketId: `MN-SRV-${String(ticket.ticketNumber).padStart(6, "0")}` } });
}
