import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

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

    const payment = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: parsed.data.invoiceId },
        select: { id: true, balance: true },
      });
      if (!invoice) throw new Error("Invoice not found");
      if (parsed.data.status === "PAID" && parsed.data.amount > Number(invoice.balance)) {
        throw new Error("Payment exceeds outstanding balance");
      }

      const isPaid = parsed.data.status === "PAID";
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
      if (isPaid) {
        const newBalance = Math.max(Number(invoice.balance) - parsed.data.amount, 0);
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            balance: newBalance,
            status: newBalance === 0 ? "PAID" : "PARTIALLY_PAID",
          },
        });
      }
      return created;
    });

    return NextResponse.json({ ok: true, paymentId: payment.id, status: payment.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record payment";
    const status = message === "Invoice not found" ? 404 : message === "Payment exceeds outstanding balance" ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
