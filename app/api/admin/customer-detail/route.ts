import { NextResponse } from "next/server";
import { managementRoles, requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUser(managementRoles);
  if (!auth.user) return auth.response!;
  const customerId = new URL(request.url).searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ ok: false, error: "customerId is required" }, { status: 400 });

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true, name: true, phone: true, whatsapp: true, email: true, address: true, city: true, district: true, notes: true, createdAt: true, updatedAt: true,
      leads: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, leadNumber: true, serviceSlug: true, status: true, temperature: true, score: true, source: true, createdAt: true } },
      tickets: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, ticketNumber: true, serviceSlug: true, status: true, priority: true, location: true, createdAt: true, updatedAt: true } },
      quotations: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, quoteNumber: true, status: true, total: true, validUntil: true, createdAt: true } },
      invoices: { orderBy: { issuedAt: "desc" }, take: 20, select: { id: true, invoiceNumber: true, status: true, total: true, balance: true, issuedAt: true, dueAt: true } },
      warranties: { orderBy: { expiresAt: "asc" }, take: 20, select: { id: true, serialNumber: true, startsAt: true, expiresAt: true, status: true, product: { select: { name: true } } } },
    },
  });
  if (!customer) return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ ok: true, customer });
}
