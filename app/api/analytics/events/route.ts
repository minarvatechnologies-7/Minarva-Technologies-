import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const eventSchema = z.object({
  eventType: z.string().trim().min(2).max(80),
  path: z.string().trim().max(500).optional(),
  source: z.string().trim().max(80).optional(),
  campaign: z.string().trim().max(160).optional(),
  serviceSlug: z.string().trim().max(120).optional(),
  leadId: z.string().trim().max(80).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = eventSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid analytics event" }, { status: 400 });

    const data = parsed.data;
    const sourceKey = data.campaign || data.source;
    if (sourceKey) {
      const campaign = await prisma.campaign.findUnique({ where: { sourceKey } });
      if (campaign) {
        await prisma.campaignEvent.create({
          data: {
            campaignId: campaign.id,
            eventType: data.eventType,
            leadId: data.leadId,
            metadata: { path: data.path, serviceSlug: data.serviceSlug, ...(data.metadata ?? {}) },
          },
        });
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true, tracked: false });
  } catch (error) {
    console.error("analytics event failed", error);
    return NextResponse.json({ ok: false, error: "Unable to track event" }, { status: 500 });
  }
}
