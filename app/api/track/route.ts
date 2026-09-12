import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const eventSchema = z.object({
  type: z.string().trim().min(2).max(80),
  path: z.string().trim().max(500).optional(),
  source: z.string().trim().max(120).optional(),
  campaign: z.string().trim().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid analytics event" }, { status: 400 });

  const campaignKey = parsed.data.campaign || parsed.data.source;
  if (campaignKey) {
    const campaign = await prisma.campaign.upsert({
      where: { sourceKey: campaignKey },
      update: {},
      create: { name: campaignKey, channel: parsed.data.source || "OTHER", sourceKey: campaignKey },
    });
    await prisma.campaignEvent.create({ data: { campaignId: campaign.id, eventType: parsed.data.type, metadata: { path: parsed.data.path, ...(parsed.data.metadata || {}) } } });
  }
  return NextResponse.json({ ok: true });
}
