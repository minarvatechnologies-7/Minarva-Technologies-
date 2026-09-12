import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const statuses = [
  "TECHNICIAN_ON_THE_WAY",
  "INSPECTION",
  "ESTIMATE_PENDING",
  "CUSTOMER_APPROVAL_PENDING",
  "WORK_IN_PROGRESS",
  "PARTS_REQUIRED",
  "COMPLETED",
] as const;

type Status = (typeof statuses)[number];
const nextAllowed: Record<Status, Status[]> = {
  TECHNICIAN_ON_THE_WAY: ["INSPECTION", "ESTIMATE_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  INSPECTION: ["ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  ESTIMATE_PENDING: ["CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  CUSTOMER_APPROVAL_PENDING: ["WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  WORK_IN_PROGRESS: ["PARTS_REQUIRED", "COMPLETED"],
  PARTS_REQUIRED: ["WORK_IN_PROGRESS", "COMPLETED"],
  COMPLETED: [],
};

const schema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(statuses).optional(),
  note: z.string().trim().max(4000).optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser(["TECHNICIAN"]);
  if (!auth.user) return auth.response!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success || (!parsed.data.status && !parsed.data.note)) {
    return NextResponse.json({ ok: false, error: "Provide a valid status or work note" }, { status: 400 });
  }

  const current = await prisma.serviceTicket.findFirst({
    where: { id: parsed.data.ticketId, technicianId: auth.user.id },
    select: { id: true, status: true, ticketNumber: true },
  });
  if (!current) return NextResponse.json({ ok: false, error: "Assigned ticket not found" }, { status: 404 });

  if (current.status === "CANCELLED" || current.status === "DELIVERED") {
    return NextResponse.json({ ok: false, error: "This ticket is no longer active" }, { status: 409 });
  }

  const nextStatus = parsed.data.status;
  if (nextStatus && current.status !== nextStatus) {
    if (!(current.status in nextAllowed)) {
      return NextResponse.json({ ok: false, error: `Status ${current.status} cannot be changed by technician` }, { status: 409 });
    }
    if (!nextAllowed[current.status as Status].includes(nextStatus)) {
      return NextResponse.json({ ok: false, error: `Invalid status transition: ${current.status} → ${nextStatus}` }, { status: 409 });
    }
  }

  const effectiveStatus = nextStatus ?? current.status;
  const updated = await prisma.serviceTicket.update({
    where: { id: current.id },
    data: {
      status: effectiveStatus,
      completedAt: effectiveStatus === "COMPLETED" ? new Date() : undefined,
      timeline: { create: { status: effectiveStatus, note: parsed.data.note || null, photoUrls: [] } },
    },
    select: { id: true, ticketNumber: true, status: true, completedAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, ticket: updated, publicTicketId: `MN-SRV-${String(updated.ticketNumber).padStart(6, "0")}` });
}
