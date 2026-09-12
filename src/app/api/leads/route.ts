import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { leadSources } from "@/lib/domain";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  whatsapp: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional(),
  serviceSlug: z.string().trim().min(2).max(120),
  requirement: z.string().trim().max(4000).optional(),
  budget: z.string().trim().max(120).optional(),
  source: z.enum(leadSources).default("WEBSITE"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function qualifyLead(input: z.infer<typeof leadSchema>) {
  const text = `${input.requirement ?? ""} ${input.serviceSlug}`.toLowerCase();
  let score = 10;
  if (input.phone) score += 10;
  if (input.location) score += 10;
  if (input.email) score += 5;
  if (/this week|today|urgent|asap|immediate|soon/.test(text)) score += 30;
  if (/cctv|camera|security|erp|website|solar|inverter|automation/.test(text)) score += 10;
  if (/8|10|12|16|20|business|office|shop|school|hospital|apartment/.test(text)) score += 15;

  const temperature = score >= 65 ? "HOT" : score >= 40 ? "WARM" : "COLD";
  return { score: Math.min(score, 100), temperature } as const;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid lead data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const qualified = qualifyLead(parsed.data);
    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        whatsapp: parsed.data.whatsapp || null,
        location: parsed.data.location || null,
        requirement: parsed.data.requirement || null,
        budget: parsed.data.budget || null,
        metadata: parsed.data.metadata,
        score: qualified.score,
        temperature: qualified.temperature,
        activities: {
          create: {
            type: "LEAD_CREATED",
            body: `Lead created from ${parsed.data.source}. Initial qualification: ${qualified.temperature} (${qualified.score}/100).`,
          },
        },
      },
      select: {
        id: true,
        leadNumber: true,
        status: true,
        temperature: true,
        score: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        lead,
        publicLeadId: `MN-LEAD-${String(lead.leadNumber).padStart(6, "0")}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("lead creation failed", error);
    return NextResponse.json({ ok: false, error: "Unable to create lead" }, { status: 500 });
  }
}
