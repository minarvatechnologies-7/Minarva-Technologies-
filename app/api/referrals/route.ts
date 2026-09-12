import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  leadId: z.string().min(10).max(80),
});

export async function POST(request: Request) {
  const auth = await requireUser(["CUSTOMER"]);
  if (!auth.user) return auth.response!;

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid referral" }, { status: 400 });

    const customer = await prisma.customer.findUnique({ where: { userId: auth.user.id }, select: { id: true } });
    if (!customer) return NextResponse.json({ ok: false, error: "Customer profile not found" }, { status: 404 });

    const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId }, select: { id: true } });
    if (!lead) return NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });

    const referral = await prisma.referral.create({
      data: { referrerId: customer.id, leadId: lead.id, status: "PENDING" },
      select: { id: true, status: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, referral }, { status: 201 });
  } catch (error) {
    console.error("referral creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create referral" }, { status: 500 });
  }
}
