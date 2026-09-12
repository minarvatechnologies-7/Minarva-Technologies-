import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ticketSchema = z.object({
  customerId: z.string().cuid(),
  serviceSlug: z.string().trim().min(2).max(120),
  propertyType: z.string().trim().max(120).optional(),
  location: z.string().trim().max(160).optional(),
  problem: z.string().trim().min(3).max(5000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  appointmentId: z.string().cuid().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = ticketSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid service request", details: parsed.error.flatten() }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: parsed.data.customerId } });
    if (!customer) {
      return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
    }

    const ticket = await prisma.serviceTicket.create({
      data: {
        ...parsed.data,
        timeline: {
          create: {
            status: "NEW",
            note: "Service request created by customer workflow.",
            photoUrls: [],
          },
        },
      },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      ticket,
      publicTicketId: `MN-SRV-${String(ticket.ticketNumber).padStart(6, "0")}`,
    }, { status: 201 });
  } catch (error) {
    console.error("service ticket creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create service request" }, { status: 500 });
  }
}
