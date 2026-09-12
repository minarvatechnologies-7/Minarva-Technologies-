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

export async function GET(request: Request) {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status")?.trim();
  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { OR: [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { phone: { contains: q } } },
      ] } : {}),
    },
    orderBy: { issuedAt: "desc" },
    take: 100,
    select: {
      id: true, invoiceNumber: true, status: true, total: true, balance: true, issuedAt: true, dueAt: true,
      customer: { select: { id: true, name: true, phone: true, city: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, amount: true, provider: true, reference: true, status: true, paidAt: true, createdAt: true } },
    },
  });
  return NextResponse.json({ ok: true, invoices });
}

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
