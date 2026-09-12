import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;

  const customer = await prisma.customer.findUnique({
    where: { userId: auth.user.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      tickets: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          ticketNumber: true,
          serviceSlug: true,
          status: true,
          priority: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          timeline: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, note: true, createdAt: true } },
        },
      },
      quotations: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, quoteNumber: true, status: true, total: true, validUntil: true, createdAt: true } },
      invoices: { orderBy: { issuedAt: "desc" }, take: 10, select: { id: true, invoiceNumber: true, status: true, total: true, balance: true, issuedAt: true, dueAt: true } },
      warranties: { orderBy: { expiresAt: "asc" }, take: 10, select: { id: true, serialNumber: true, invoiceRef: true, startsAt: true, expiresAt: true, status: true, product: { select: { name: true } } } },
    },
  });

  if (!customer) return NextResponse.json({ ok: false, error: "Customer profile not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    customer,
    summary: {
      openTickets: customer.tickets.filter((ticket) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(ticket.status)).length,
      activeWarranties: customer.warranties.filter((warranty) => warranty.status === "ACTIVE" && warranty.expiresAt > new Date()).length,
      outstandingBalance: customer.invoices.reduce((sum, invoice) => sum + Number(invoice.balance), 0),
      pendingQuotes: customer.quotations.filter((quote) => ["SENT", "NEGOTIATION"].includes(quote.status)).length,
    },
  });
}
