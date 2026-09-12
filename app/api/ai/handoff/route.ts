import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { qualifyRequirement } from "@/lib/ai/qualification";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional(),
  message: z.string().trim().min(2).max(5000),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid handoff data" }, { status: 400 });

    const qualification = qualifyRequirement(parsed.data.message);
    const lead = await prisma.lead.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        location: parsed.data.location || null,
        serviceSlug: qualification.serviceSlug,
        requirement: parsed.data.message,
        source: "WEBSITE",
        status: "QUALIFIED",
        temperature: qualification.temperature,
        score: qualification.score,
        metadata: { aiQualification: qualification },
        activities: { create: { type: "AI_HANDOFF", body: `AI qualification: ${qualification.temperature} (${qualification.score}/100), intent ${qualification.intent}.` } },
      },
      select: { leadNumber: true, status: true, temperature: true, score: true },
    });

    return NextResponse.json({ ok: true, publicLeadId: `MN-LEAD-${String(lead.leadNumber).padStart(6, "0")}`, lead, qualification }, { status: 201 });
  } catch (error) {
    console.error("AI handoff failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create qualified enquiry" }, { status: 500 });
  }
}
