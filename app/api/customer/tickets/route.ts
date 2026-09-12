import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  serviceSlug: z.string().trim().min(2).max(120),
  problem: z.string().trim().min(2).max(4000),
  location: z.string().trim().max(250).optional(),
  propertyType: z.string().trim().max(120).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export async function POST(request: Request) {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;

  const customer = await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
  if (!customer) return NextResponse.json({ ok: false, error: "Customer profile not found" }, { status: 404 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid service request" }, { status: 400 });

  try {
    const ticket = await prisma.serviceTicket.create({
      data: {
        customerId: customer.id,
        serviceSlug: parsed.data.serviceSlug,
        problem: parsed.data.problem,
        location: parsed.data.location || null,
        propertyType: parsed.data.propertyType || null,
        priority: parsed.data.priority,
        timeline: { create: { status: "NEW", note: "Service request received from customer portal.", photoUrls: [] } },
      },
      select: { id: true, ticketNumber: true, status: true, priority: true, serviceSlug: true, createdAt: true },
    });

    return NextResponse.json({
      ok: true,
      ticket,
      publicTicketId: `MN-SRV-${String(ticket.ticketNumber).padStart(6, "0")}`,
    }, { status: 201 });
  } catch (error) {
    console.error("customer ticket creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create service request" }, { status: 500 });
  }
}
