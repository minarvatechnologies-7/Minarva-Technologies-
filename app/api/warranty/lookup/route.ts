import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({ serialNumber: z.string().trim().min(2).max(160) });

export async function POST(request: Request) {
  const auth = await requireUser(["CUSTOMER", "SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER", "TECHNICIAN"]);
  if (!auth.user) return auth.response!;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid serial number" }, { status: 400 });

  const warranty = await prisma.warranty.findFirst({
    where: { serialNumber: parsed.data.serialNumber },
    select: {
      id: true, serialNumber: true, invoiceRef: true, purchaseDate: true, startsAt: true, expiresAt: true, status: true,
      product: { select: { name: true, slug: true, sku: true } },
      customer: { select: { id: true, name: true } },
      claims: { orderBy: { openedAt: "desc" }, take: 20, select: { id: true, openedAt: true, closedAt: true, status: true, notes: true } },
    },
  });
  if (!warranty) return NextResponse.json({ ok: false, error: "Warranty record not found" }, { status: 404 });

  if (auth.user.role === "CUSTOMER") {
    const customer = await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
    if (!customer || customer.id !== warranty.customer.id) return NextResponse.json({ ok: false, error: "Warranty record not found" }, { status: 404 });
  }

  const active = warranty.status === "ACTIVE" && warranty.expiresAt > new Date();
  return NextResponse.json({ ok: true, warranty: { ...warranty, active } });
}
