import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["TECHNICIAN_ON_THE_WAY", "INSPECTION", "ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED", "COMPLETED"]).optional(),
  note: z.string().trim().max(4000).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser(["TECHNICIAN"]);
  if (!auth.user) return auth.response!;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success || !body.ticketId || (!parsed.data.status && !parsed.data.note)) return NextResponse.json({ ok: false, error: "Provide a ticketId and a valid status or work note" }, { status: 400 });
  const current = await prisma.serviceTicket.findFirst({ where: { id: body.ticketId, technicianId: auth.user.id }, select: { id: true, status: true, ticketNumber: true } });
  if (!current) return NextResponse.json({ ok: false, error: "Assigned ticket not found" }, { status: 404 });
  const nextStatus = parsed.data.status ?? current.status;
  const updated = await prisma.serviceTicket.update({ where: { id: current.id }, data: { status: nextStatus, completedAt: nextStatus === "COMPLETED" ? new Date() : undefined, timeline: { create: { status: nextStatus, note: parsed.data.note || null, photoUrls: [] } } }, select: { id: true, ticketNumber: true, status: true, completedAt: true, updatedAt: true } });
  return NextResponse.json({ ok: true, ticket: updated, publicTicketId: `MN-SRV-${String(updated.ticketNumber).padStart(6, "0")}` });
}
