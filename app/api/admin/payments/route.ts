import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

const roles = ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] as const;
const schema = z.object({
  invoiceId: z.string().cuid(),
  amount: z.number().positive().max(100000000),
  provider: z.string().trim().max(80).optional(),
  reference: z.string().trim().max(160).optional(),
  status: z.enum(["PENDING", "PAID", "FAILED"]).default("PENDING"),
  paidAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payment data" }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({ where: { id: parsed.data.invoiceId }, select: { id: true, total: true, balance: true } });
    if (!invoice) return NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
    if (parsed.data.amount > Number(invoice.balance)) {
      return NextResponse.json({ ok: false, error: "Payment exceeds outstanding balance" }, { status: 400 });
    }

    const isPaid = parsed.data.status === "PAID";
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: parsed.data.amount,
          provider: parsed.data.provider,
          reference: parsed.data.reference,
          status: parsed.data.status,
          paidAt: isPaid ? (parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date()) : undefined,
        },
      });
      if (!isPaid) return created;

      const newBalance = Math.max(Number(invoice.balance) - parsed.data.amount, 0);
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          balance: newBalance,
          status: newBalance === 0 ? "PAID" : "PARTIALLY_PAID",
        },
      });
      return created;
    });

    return NextResponse.json({ ok: true, paymentId: payment.id, status: payment.status });
  } catch (error) {
    console.error("payment recording failed", error);
    return NextResponse.json({ ok: false, error: "Unable to record payment" }, { status: 500 });
  }
}
