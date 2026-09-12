import { NextResponse } from "next/server";
import { managementRoles, requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireUser(managementRoles);
  if (!auth.user) return auth.response!;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || undefined;
  const temperature = url.searchParams.get("temperature") || undefined;
  const search = url.searchParams.get("q")?.trim() || undefined;

  const leads = await prisma.lead.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(temperature ? { temperature: temperature as never } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }, { email: { contains: search, mode: "insensitive" } }] } : {}),
    },
    orderBy: [{ temperature: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      leadNumber: true,
      name: true,
      phone: true,
      whatsapp: true,
      email: true,
      location: true,
      serviceSlug: true,
      requirement: true,
      budget: true,
      source: true,
      status: true,
      temperature: true,
      score: true,
      followUpAt: true,
      createdAt: true,
      assignedTo: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json({ ok: true, leads });
}
