import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER", "CONTENT_MARKETING"] as const;

export async function GET() {
  const auth = await requireUser([...STAFF_ROLES]);
  if (!auth.user) return auth.response!;

  const [followUps, expiringWarranties, pendingQuotes, recentLeads] = await Promise.all([
    prisma.lead.findMany({ where: { followUpAt: { lte: new Date() }, status: { notIn: ["WON", "LOST"] } }, orderBy: { followUpAt: "asc" }, take: 25, select: { id: true, leadNumber: true, name: true, phone: true, serviceSlug: true, temperature: true, followUpAt: true } }),
    prisma.warranty.findMany({ where: { status: "ACTIVE", expiresAt: { lte: new Date(Date.now() + 30 * 86400000) } }, orderBy: { expiresAt: "asc" }, take: 25, select: { id: true, serialNumber: true, expiresAt: true, customer: { select: { name: true, phone: true } }, product: { select: { name: true } } } }),
    prisma.quotation.findMany({ where: { status: { in: ["SENT", "NEGOTIATION"] } }, orderBy: { createdAt: "asc" }, take: 25, select: { id: true, quoteNumber: true, status: true, total: true, validUntil: true, customer: { select: { name: true, phone: true } } } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { id: true, leadNumber: true, name: true, serviceSlug: true, source: true, temperature: true, score: true, createdAt: true } }),
  ]);

  return NextResponse.json({ ok: true, queues: { followUps, expiringWarranties, pendingQuotes, recentLeads } });
}
