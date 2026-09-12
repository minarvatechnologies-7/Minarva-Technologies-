import { NextResponse } from "next/server";
import { z } from "zod";
import { managementRoles, requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "SITE_SURVEY", "QUOTE_SENT", "NEGOTIATION", "WON", "LOST", "FOLLOW_UP"]).optional(),
  temperature: z.enum(["HOT", "WARM", "COLD"]).optional(),
  assignedToId: z.string().cuid().nullable().optional(),
  followUpAt: z.string().datetime().nullable().optional(),
  note: z.string().trim().max(4000).optional(),
});

export async function GET(_: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const auth = await requireUser(managementRoles);
  if (!auth.user) return auth.response!;
  const { leadId } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true, leadNumber: true, name: true, phone: true, whatsapp: true, email: true, location: true,
      serviceSlug: true, requirement: true, budget: true, source: true, status: true, temperature: true,
      score: true, followUpAt: true, createdAt: true, updatedAt: true,
      assignedTo: { select: { id: true, name: true, role: true } },
      activities: { orderBy: { createdAt: "desc" }, take: 30, select: { id: true, type: true, body: true, createdAt: true, user: { select: { name: true } } } },
    },
  });
  if (!lead) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true, lead, publicLeadId: `MN-LEAD-${String(lead.leadNumber).padStart(6, "0")}` });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const auth = await requireUser(managementRoles);
  if (!auth.user) return auth.response!;
  const { leadId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid lead update" }, { status: 400 });

  if (parsed.data.assignedToId) {
    const assignee = await prisma.user.findFirst({ where: { id: parsed.data.assignedToId, active: true, role: { in: ["SUPER_ADMIN", "ADMIN", "SALES"] } }, select: { id: true } });
    if (!assignee) return NextResponse.json({ ok: false, error: "Active sales/management user not found" }, { status: 400 });
  }

  const current = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, status: true, temperature: true, assignedToId: true, followUpAt: true } });
  if (!current) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });

  const changes: string[] = [];
  if (parsed.data.status && parsed.data.status !== current.status) changes.push(`Status: ${current.status} → ${parsed.data.status}`);
  if (parsed.data.temperature && parsed.data.temperature !== current.temperature) changes.push(`Temperature: ${current.temperature} → ${parsed.data.temperature}`);
  if (parsed.data.assignedToId !== undefined && parsed.data.assignedToId !== current.assignedToId) changes.push(`Assignment updated`);
  if (parsed.data.followUpAt !== undefined) changes.push(parsed.data.followUpAt ? `Follow-up: ${parsed.data.followUpAt}` : "Follow-up cleared");
  if (parsed.data.note) changes.push(parsed.data.note);

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: parsed.data.status,
      temperature: parsed.data.temperature,
      assignedToId: parsed.data.assignedToId === undefined ? undefined : parsed.data.assignedToId,
      followUpAt: parsed.data.followUpAt === undefined ? undefined : (parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : null),
      activities: changes.length ? { create: { userId: auth.user.id, type: "LEAD_UPDATED", body: changes.join(" | ") } } : undefined,
    },
    select: { id: true, leadNumber: true, status: true, temperature: true, score: true, assignedTo: { select: { id: true, name: true, role: true } }, followUpAt: true, updatedAt: true },
  });

  return NextResponse.json({ ok: true, lead: updated, publicLeadId: `MN-LEAD-${String(updated.leadNumber).padStart(6, "0")}` });
}
