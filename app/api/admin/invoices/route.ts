import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

const roles = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALES", "SERVICE_MANAGER"] as const;

const schema = z.object({
  invoiceNumber: z.string().trim().min(2).max(80),
  customerId: z.string().cuid(),
  total: z.number().positive().max(100000000),
  dueAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid invoice data" }, { status: 400 });
    const customer = await prisma.customer.findUnique({ where: { id: parsed.data.customerId }, select: { id: true } });
    if (!customer) return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: parsed.data.invoiceNumber,
        customerId: customer.id,
        total: parsed.data.total,
        balance: parsed.data.total,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
      },
      select: { id: true, invoiceNumber: true, status: true, total: true, balance: true, issuedAt: true, dueAt: true },
    });
    return NextResponse.json({ ok: true, invoice }, { status: 201 });
  } catch (error) {
    console.error("invoice creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create invoice" }, { status: 500 });
  }
}
