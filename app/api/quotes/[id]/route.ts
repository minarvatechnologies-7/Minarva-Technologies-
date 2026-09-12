import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/access";

const managementRoles = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER"] as const;

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser([...managementRoles, "CUSTOMER"]);
  if (!auth.user) return auth.response!;
  const { id } = await context.params;

  const parsed = z.object({ action: z.enum(["SEND", "APPROVE", "REJECT", "CANCEL"]) }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid quotation action" }, { status: 400 });

  const quote = await prisma.quotation.findUnique({ where: { id }, select: { id: true, customerId: true, status: true } });
  if (!quote) return NextResponse.json({ ok: false, error: "Quotation not found" }, { status: 404 });

  const customer = auth.user.role === "CUSTOMER"
    ? await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true } })
    : null;
  if (auth.user.role === "CUSTOMER" && (!customer || customer.id !== quote.customerId)) {
    return NextResponse.json({ ok: false, error: "Quotation not found" }, { status: 404 });
  }

  const action = parsed.data.action;
  if (auth.user.role === "CUSTOMER" && !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ ok: false, error: "Action not allowed" }, { status: 403 });
  }
  if (action === "SEND" && auth.user.role === "CUSTOMER") return NextResponse.json({ ok: false, error: "Action not allowed" }, { status: 403 });

  const statusMap = { SEND: "SENT", APPROVE: "APPROVED", REJECT: "REJECTED", CANCEL: "CANCELLED" } as const;
  const updated = await prisma.quotation.update({ where: { id }, data: { status: statusMap[action] }, select: { id: true, quoteNumber: true, status: true, total: true, validUntil: true } });

  return NextResponse.json({ ok: true, quote: updated });
}
