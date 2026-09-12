import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  technicianId: z.string().min(1).optional().nullable(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  status: z.enum(["NEW", "ASSIGNED", "TECHNICIAN_ON_THE_WAY", "INSPECTION", "ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED", "COMPLETED", "DELIVERED", "CANCELLED"]).optional(),
  note: z.string().trim().max(4000).optional(),
  appointment: z.object({
    scheduledAt: z.string().datetime(),
    type: z.string().trim().min(2).max(80).default("SERVICE_VISIT"),
    notes: z.string().trim().max(1000).optional().nullable(),
  }).optional().nullable(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const auth = await requireUser(["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER"]);
  if (!auth.user) return auth.response!;
  const { ticketId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid ticket update" }, { status: 400 });

  if (parsed.data.technicianId) {
    const technician = await prisma.user.findFirst({ where: { id: parsed.data.technicianId, role: "TECHNICIAN", active: true }, select: { id: true } });
    if (!technician) return NextResponse.json({ ok: false, error: "Active technician not found" }, { status: 400 });
  }

  const ticket = await prisma.serviceTicket.findUnique({ where: { id: ticketId }, select: { id: true, status: true, customerId: true, appointmentId: true } });
  if (!ticket) return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });

  const nextStatus = parsed.data.status ?? (parsed.data.technicianId ? "ASSIGNED" : ticket.status);
  const updated = await prisma.$transaction(async (tx) => {
    let appointmentId = ticket.appointmentId;
    if (parsed.data.appointment) {
      const appointmentData = {
        type: parsed.data.appointment.type,
        scheduledAt: new Date(parsed.data.appointment.scheduledAt),
        notes: parsed.data.appointment.notes ?? null,
        status: "SCHEDULED",
      };
      if (appointmentId) {
        await tx.appointment.update({ where: { id: appointmentId }, data: appointmentData });
      } else {
        const appointment = await tx.appointment.create({ data: { ...appointmentData, customerId: ticket.customerId } });
        appointmentId = appointment.id;
      }
    }
    return tx.serviceTicket.update({
      where: { id: ticketId },
      data: {
        technicianId: parsed.data.technicianId === undefined ? undefined : parsed.data.technicianId,
        priority: parsed.data.priority,
        status: nextStatus,
        appointmentId: appointmentId || undefined,
        timeline: parsed.data.status || parsed.data.technicianId || parsed.data.note || parsed.data.appointment ? {
          create: {
            status: nextStatus,
            note: parsed.data.note || (parsed.data.appointment ? `Appointment scheduled for ${new Date(parsed.data.appointment.scheduledAt).toLocaleString("en-IN")}.` : parsed.data.technicianId ? "Technician assigned by service management." : null),
            photoUrls: [],
          },
        } : undefined,
      },
      select: { id: true, ticketNumber: true, technicianId: true, priority: true, status: true, appointmentId: true, updatedAt: true, appointment: { select: { scheduledAt: true, status: true, type: true, notes: true } } },
    });
  });

  return NextResponse.json({ ok: true, ticket: updated, publicTicketId: `MN-SRV-${String(updated.ticketNumber).padStart(6, "0")}` });
}
