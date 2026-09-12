import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const roles = ["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER", "SALES", "ACCOUNTANT", "CONTENT_MARKETING"] as const;

export async function GET() {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;

  const [followUps, newLeads, openTickets, pendingQuotes, pendingReviews, expiringWarranties] = await Promise.all([
    prisma.lead.findMany({ where: { followUpAt: { lte: new Date() }, status: { notIn: ["WON", "LOST"] } }, orderBy: { followUpAt: "asc" }, take: 12, select: { id: true, leadNumber: true, name: true, phone: true, serviceSlug: true, temperature: true, followUpAt: true } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.serviceTicket.count({ where: { status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } } }),
    prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT", "NEGOTIATION"] } } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.warranty.count({ where: { expiresAt: { gt: new Date(), lte: new Date(Date.now() + 30 * 86400000) }, status: "ACTIVE" } }),
  ]);

  return NextResponse.json({ ok: true, counts: { newLeads, openTickets, pendingQuotes, pendingReviews, expiringWarranties }, followUps });
}
