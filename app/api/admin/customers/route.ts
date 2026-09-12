import { NextResponse } from "next/server";
import { z } from "zod";
import { managementRoles, requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUser(managementRoles);
  if (!auth.user) return auth.response!;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const customers = await prisma.customer.findMany({
    where: q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ] } : undefined,
    orderBy: { updatedAt: "desc" }, take: 100,
    select: {
      id: true, name: true, phone: true, whatsapp: true, email: true, city: true, district: true, createdAt: true, updatedAt: true,
      _count: { select: { leads: true, tickets: true, quotations: true, invoices: true, warranties: true } },
    },
  });
  return NextResponse.json({ ok: true, customers });
}

const schema = z.object({ name: z.string().trim().min(2).max(120), phone: z.string().trim().min(7).max(30), whatsapp: z.string().trim().max(30).optional(), email: z.string().trim().email().max(160).optional().or(z.literal("")), address: z.string().trim().max(500).optional(), city: z.string().trim().max(100).optional(), district: z.string().trim().max(100).optional(), notes: z.string().trim().max(4000).optional() });

export async function POST(request: Request) {
  const auth = await requireUser(["SUPER_ADMIN", "ADMIN"]);
  if (!auth.user) return auth.response!;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid customer data" }, { status: 400 });
  const customer = await prisma.customer.create({ data: { ...parsed.data, email: parsed.data.email || null } });
  return NextResponse.json({ ok: true, customer }, { status: 201 });
}
