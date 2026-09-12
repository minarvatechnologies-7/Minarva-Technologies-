import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const allowedActions = ["APPROVE", "REJECT"] as const;

type Action = (typeof allowedActions)[number];

export async function GET(_: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;
  const { quoteId } = await params;
  const customer = await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!customer) return NextResponse.json({ ok: false, error: "Customer profile not found" }, { status: 404 });

  const quote = await prisma.quotation.findFirst({
    where: { id: quoteId, customerId: customer.id },
    select: {
      id: true, quoteNumber: true, status: true, validUntil: true, subtotal: true, tax: true, total: true, notes: true, createdAt: true,
      items: { orderBy: { id: "asc" }, select: { description: true, quantity: true, unitPrice: true, amount: true, product: { select: { name: true } } } },
    },
  });
  if (!quote) return NextResponse.json({ ok: false, error: "Quotation not found" }, { status: 404 });
  return NextResponse.json({ ok: true, quote });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;
  const { quoteId } = await params;
  const body = await request.json().catch(() => null) as { action?: Action } | null;
  if (!body?.action || !allowedActions.includes(body.action)) {
    return NextResponse.json({ ok: false, error: "Action must be APPROVE or REJECT" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true, userId: true } });
  if (!customer) return NextResponse.json({ ok: false, error: "Customer profile not found" }, { status: 404 });

  const quote = await prisma.quotation.findFirst({ where: { id: quoteId, customerId: customer.id }, select: { id: true, quoteNumber: true, status: true, validUntil: true, total: true } });
  if (!quote) return NextResponse.json({ ok: false, error: "Quotation not found" }, { status: 404 });
  if (!["SENT", "NEGOTIATION"].includes(quote.status)) {
    return NextResponse.json({ ok: false, error: `Quotation is not actionable in ${quote.status} state` }, { status: 409 });
  }
  if (quote.validUntil && quote.validUntil < new Date()) {
    return NextResponse.json({ ok: false, error: "Quotation has expired" }, { status: 409 });
  }

  const status = body.action === "APPROVE" ? "APPROVED" : "REJECTED";
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.quotation.update({ where: { id: quote.id }, data: { status }, select: { id: true, quoteNumber: true, status: true, updatedAt: true } });
    if (status !== "APPROVED") return { updated, invoice: null };

    const invoiceNumber = `MN-INV-${String(quote.quoteNumber).padStart(6, "0")}`;
    const invoice = await tx.invoice.upsert({
      where: { invoiceNumber },
      create: { invoiceNumber, customerId: customer.id, total: quote.total, balance: quote.total },
      update: {},
      select: { id: true, invoiceNumber: true, status: true, total: true, balance: true },
    });
    await tx.auditLog.create({ data: { userId: auth.user.id, action: "QUOTATION_APPROVED", entity: "Quotation", entityId: quote.id, metadata: { invoiceId: invoice.id, invoiceNumber } } });
    if (customer.userId) {
      await tx.notification.create({
        data: { userId: customer.userId, channel: "WEB", type: "QUOTATION_APPROVED", status: "PENDING", payload: { quoteId: quote.id, quoteNumber: quote.quoteNumber, invoiceId: invoice.id, invoiceNumber } },
      });
    }
    return { updated, invoice };
  });

  return NextResponse.json({ ok: true, quote: result.updated, invoice: result.invoice });
}
