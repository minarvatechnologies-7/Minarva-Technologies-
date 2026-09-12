import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

const itemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().positive().max(100000),
  unitPrice: z.number().nonnegative().max(100000000),
  productId: z.string().cuid().optional(),
});

const schema = z.object({
  customerId: z.string().cuid(),
  leadId: z.string().cuid().optional(),
  validUntil: z.string().datetime().optional(),
  notes: z.string().trim().max(4000).optional(),
  items: z.array(itemSchema).min(1).max(100),
});

const quoteRoles = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER"] as const;

export async function POST(request: Request) {
  const auth = await requireUser([...quoteRoles]);
  if (!auth.user) return auth.response!;

  try {
    const parsed = schema.safeParse(await request.json());
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
        items: {
          create: parsed.data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            productId: item.productId,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ ok: true, quote }, { status: 201 });
  } catch (error) {
    console.error("quotation creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create quotation" }, { status: 500 });
  }
}
