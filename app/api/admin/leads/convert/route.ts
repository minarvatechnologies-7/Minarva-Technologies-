import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({ leadId: z.string().cuid(), createAppointment: z.boolean().default(false), scheduledAt: z.string().datetime().optional(), appointmentType: z.string().trim().max(120).optional(), appointmentNotes: z.string().trim().max(2000).optional() });
const roles = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER"] as const;

export async function POST(request: Request) {
  const auth = await requireUser([...roles]);
  if (!auth.user) return auth.response!;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid conversion data" }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id: parsed.data.leadId } });
      if (!lead) throw new Error("Lead not found");
      if (lead.status === "LOST") throw new Error("Lost leads cannot be converted");

      let customer = lead.customerId ? await tx.customer.findUnique({ where: { id: lead.customerId } }) : null;
      if (!customer) {
        customer = await tx.customer.create({
          data: { name: lead.name, phone: lead.phone, whatsapp: lead.whatsapp, email: lead.email, city: lead.location, notes: lead.requirement },
        });
      }

      let appointment = null;
      if (parsed.data.createAppointment) {
        if (!parsed.data.scheduledAt) throw new Error("scheduledAt is required when creating an appointment");
        appointment = await tx.appointment.create({
          data: { leadId: lead.id, customerId: customer.id, type: parsed.data.appointmentType || "SITE_SURVEY", scheduledAt: new Date(parsed.data.scheduledAt), notes: parsed.data.appointmentNotes },
        });
      }

      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: { customerId: customer.id, status: parsed.data.createAppointment ? "SITE_SURVEY" : (lead.status === "NEW" ? "CONTACTED" : lead.status), activities: { create: { userId: auth.user.id, type: "LEAD_CONVERTED", body: `Lead linked to customer ${customer.id}${appointment ? ` and appointment ${appointment.id}` : ""}.` } } },
        select: { id: true, leadNumber: true, status: true, customerId: true },
      });

      return { customer, appointment, lead: updatedLead };
    });

    return NextResponse.json({ ok: true, result: { customerId: result.customer.id, lead: result.lead, appointment: result.appointment } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Unable to convert lead" }, { status: 400 });
  }
}
