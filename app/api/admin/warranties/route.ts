import { NextResponse } from "next/server";
import { z } from "zod";
import { managementRoles, requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const warrantySchema = z.object({
  customerId: z.string().cuid(),
  productId: z.string().cuid().optional().nullable(),
  serialNumber: z.string().trim().min(2).max(160),
  invoiceRef: z.string().trim().max(120).optional().nullable(),
  purchaseDate: z.string().datetime().optional().nullable(),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  status: z.string().trim().min(2).max(40).default("ACTIVE"),
});

const claimSchema = z.object({
  warrantyId: z.string().cuid(),
  ticketId: z.string().cuid().optional().nullable(),
  status: z.enum(["OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "CLOSED"]).default("OPEN"),
  notes: z.string().trim().max(4000).optional().nullable(),
});

export async function GET(request: Request) {
  const auth = await requireUser(managementRoles);
  if (!auth.user) return auth.response!;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status")?.trim();

  const warranties = await prisma.warranty.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q ? { OR: [
        { serialNumber: { contains: q, mode: "insensitive" } },
        { invoiceRef: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { phone: { contains: q } } },
        { product: { name: { contains: q, mode: "insensitive" } } },
      ] } : {}),
    },
    orderBy: { expiresAt: "asc" },
    take: 100,
    select: {
      id: true, serialNumber: true, invoiceRef: true, purchaseDate: true, startsAt: true, expiresAt: true, status: true,
      customer: { select: { id: true, name: true, phone: true, city: true } },
      product: { select: { id: true, name: true, sku: true } },
      claims: { orderBy: { openedAt: "desc" }, take: 5, select: { id: true, status: true, openedAt: true, closedAt: true, notes: true, ticketId: true } },
    },
  });

  return NextResponse.json({ ok: true, warranties });
}

export async function POST(request: Request) {
  const auth = await requireUser(["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER", "ACCOUNTANT"]);
  if (!auth.user) return auth.response!;
  const parsed = warrantySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid warranty data" }, { status: 400 });
  if (new Date(parsed.data.expiresAt) <= new Date(parsed.data.startsAt)) {
    return NextResponse.json({ ok: false, error: "Warranty expiry must be after the start date" }, { status: 400 });
  }

  const [customer, product] = await Promise.all([
    prisma.customer.findUnique({ where: { id: parsed.data.customerId }, select: { id: true } }),
    parsed.data.productId ? prisma.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } }) : Promise.resolve(null),
  ]);
  if (!customer) return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
  if (parsed.data.productId && !product) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });

  const warranty = await prisma.warranty.create({
    data: {
      customerId: customer.id,
      productId: product?.id ?? null,
      serialNumber: parsed.data.serialNumber,
      invoiceRef: parsed.data.invoiceRef ?? null,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
      startsAt: new Date(parsed.data.startsAt),
      expiresAt: new Date(parsed.data.expiresAt),
      status: parsed.data.status,
    },
    select: { id: true, serialNumber: true, startsAt: true, expiresAt: true, status: true },
  });

  return NextResponse.json({ ok: true, warranty }, { status: 201 });
}

export async function PUT(request: Request) {
  const auth = await requireUser(["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER"]);
  if (!auth.user) return auth.response!;
  const parsed = claimSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid warranty claim data" }, { status: 400 });

  const warranty = await prisma.warranty.findUnique({ where: { id: parsed.data.warrantyId }, select: { id: true } });
  if (!warranty) return NextResponse.json({ ok: false, error: "Warranty not found" }, { status: 404 });
  if (parsed.data.ticketId) {
    const ticket = await prisma.serviceTicket.findUnique({ where: { id: parsed.data.ticketId }, select: { id: true } });
    if (!ticket) return NextResponse.json({ ok: false, error: "Ticket not found" }, { status: 404 });
  }

  const claim = await prisma.warrantyClaim.create({
    data: {
      warrantyId: warranty.id,
      ticketId: parsed.data.ticketId ?? null,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      closedAt: ["REJECTED", "CLOSED"].includes(parsed.data.status) ? new Date() : null,
    },
    select: { id: true, warrantyId: true, ticketId: true, status: true, openedAt: true, closedAt: true, notes: true },
  });

  return NextResponse.json({ ok: true, claim }, { status: 201 });
}
