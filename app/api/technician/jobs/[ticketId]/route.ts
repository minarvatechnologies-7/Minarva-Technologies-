import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["ASSIGNED", "TECHNICIAN_ON_THE_WAY", "INSPECTION", "ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED", "COMPLETED", "DELIVERED"]),
  note: z.string().trim().max(4000).optional(),
  photoUrls: z.array(z.string().url()).max(10).optional(),
  signatureUrl: z.string().url().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const auth = await requireUser(["TECHNICIAN"]);
  if (!auth.user) return auth.response!;
  const { ticketId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid job update" }, { status: 400 });

  const ticket = await prisma.serviceTicket.findFirst({ where: { id: ticketId, technicianId: auth.user.id } });
  if (!ticket) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });

  const updated = await prisma.serviceTicket.update({
    where: { id: ticket.id },
    data: {
      status: parsed.data.status,
      completedAt: ["COMPLETED", "DELIVERED"].includes(parsed.data.status) ? new Date() : null,
      timeline: { create: {
        status: parsed.data.status,
        note: parsed.data.note || null,
        photoUrls: parsed.data.photoUrls ?? [],
        signatureUrl: parsed.data.signatureUrl || null,
      } },
    },
    select: { id: true, ticketNumber: true, status: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, ticket: updated, publicTicketId: `MN-SRV-${String(updated.ticketNumber).padStart(6, "0")}` });
}
