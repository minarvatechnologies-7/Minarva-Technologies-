import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const itemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive().max(100000),
  unitPrice: z.number().nonnegative().max(100000000),
  productId: z.string().cuid().optional(),
});

const createSchema = z.object({
  customerId: z.string().cuid(),
  leadId: z.string().cuid().optional(),
  validUntil: z.string().datetime().optional(),
  notes: z.string().trim().max(4000).optional(),
  items: z.array(itemSchema).min(1).max(100),
});

const updateSchema = z.object({
  quoteId: z.string().cuid(),
  status: z.enum(["DRAFT", "SENT", "NEGOTIATION", "APPROVED", "REJECTED", "CANCELLED"]),
});

const quoteRoles = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER"] as const;

export async function POST(request: Request) {
  const { requireUser } = await import("@/lib/access");
  const auth = await requireUser([...quoteRoles]);
  if (!auth.user) return auth.response!;

  try {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid quotation data" }, { status: 400 });

    const customer = await prisma.customer.findUnique({ where: { id: parsed.data.customerId }, select: { id: true } });
    if (!customer) return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });

    const subtotal = parsed.data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const quote = await prisma.quotation.create({
      data: {
        customerId: customer.id,
        leadId: parsed.data.leadId,
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : undefined,
        notes: parsed.data.notes,
        subtotal,
        tax: 0,
        total: subtotal,
        items: { create: parsed.data.items.map((item) => ({ description: item.description, quantity: item.quantity, unitPrice: item.unitPrice, amount: item.quantity * item.unitPrice, productId: item.productId })) },
      },
      include: { items: true },
    });
    return NextResponse.json({ ok: true, quote }, { status: 201 });
  } catch (error) {
    console.error("quotation creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create quotation" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { requireUser } = await import("@/lib/access");
  const auth = await requireUser([...quoteRoles]);
  if (!auth.user) return auth.response!;

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid quotation status update" }, { status: 400 });

  const quote = await prisma.quotation.findUnique({ where: { id: parsed.data.quoteId }, select: { id: true, quoteNumber: true, status: true, validUntil: true, customerId: true, total: true, customer: { select: { userId: true } } } });
  if (!quote) return NextResponse.json({ ok: false, error: "Quotation not found" }, { status: 404 });

  const transitionMap: Record<string, string[]> = {
    DRAFT: ["SENT", "CANCELLED"],
    SENT: ["NEGOTIATION", "APPROVED", "REJECTED", "CANCELLED"],
    NEGOTIATION: ["SENT", "APPROVED", "REJECTED", "CANCELLED"],
    APPROVED: ["CANCELLED"],
    REJECTED: [],
    CANCELLED: [],
  };
  if (quote.status !== parsed.data.status && !transitionMap[quote.status]?.includes(parsed.data.status)) {
    return NextResponse.json({ ok: false, error: `Cannot move quotation from ${quote.status} to ${parsed.data.status}` }, { status: 409 });
  }
  if (["SENT", "NEGOTIATION"].includes(parsed.data.status) && quote.validUntil && quote.validUntil < new Date()) {
    return NextResponse.json({ ok: false, error: "Cannot send an expired quotation" }, { status: 409 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.quotation.update({ where: { id: quote.id }, data: { status: parsed.data.status }, select: { id: true, quoteNumber: true, status: true, validUntil: true, updatedAt: true } });
    if (parsed.data.status !== "APPROVED") return { updated, invoice: null };

    const invoiceNumber = `MN-INV-${String(quote.quoteNumber).padStart(6, "0")}`;
    const invoice = await tx.invoice.upsert({
      where: { invoiceNumber },
      create: { invoiceNumber, customerId: quote.customerId, total: quote.total, balance: quote.total },
      update: {},
      select: { id: true, invoiceNumber: true, status: true, total: true, balance: true },
    });
    await tx.auditLog.create({ data: { userId: auth.user.id, action: "QUOTATION_APPROVED", entity: "Quotation", entityId: quote.id, metadata: { invoiceId: invoice.id, invoiceNumber } } });
    if (quote.customer.userId) {
      await tx.notification.create({ data: { userId: quote.customer.userId, channel: "WEB", type: "QUOTATION_APPROVED", status: "PENDING", payload: { quoteId: quote.id, quoteNumber: quote.quoteNumber, invoiceId: invoice.id, invoiceNumber } } });
    }
    return { updated, invoice };
  });

  return NextResponse.json({ ok: true, quote: result.updated, invoice: result.invoice });
}
