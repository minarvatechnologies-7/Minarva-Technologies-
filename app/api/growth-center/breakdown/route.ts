import { NextResponse } from "next/server";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER", "ACCOUNTANT", "CONTENT_MARKETING"] as const;

export async function GET() {
  const auth = await requireUser([...STAFF_ROLES]);
  if (!auth.user) return auth.response!;

  try {
    const leads = await prisma.lead.findMany({
      select: { serviceSlug: true, source: true, location: true, status: true, temperature: true },
    });

    const byService = new Map<string, { leads: number; won: number; hot: number }>();
    const bySource = new Map<string, { leads: number; won: number }>();
    const byLocation = new Map<string, { leads: number; won: number }>();

    for (const lead of leads) {
      const service = byService.get(lead.serviceSlug) ?? { leads: 0, won: 0, hot: 0 };
      service.leads += 1;
      if (lead.status === "WON") service.won += 1;
      if (lead.temperature === "HOT" && !["WON", "LOST"].includes(lead.status)) service.hot += 1;
      byService.set(lead.serviceSlug, service);

      const source = bySource.get(lead.source) ?? { leads: 0, won: 0 };
      source.leads += 1;
      if (lead.status === "WON") source.won += 1;
      bySource.set(lead.source, source);

      if (lead.location?.trim()) {
        const key = lead.location.trim();
        const location = byLocation.get(key) ?? { leads: 0, won: 0 };
        location.leads += 1;
        if (lead.status === "WON") location.won += 1;
        byLocation.set(key, location);
      }
    }

    const mapRows = (map: Map<string, { leads: number; won: number; hot?: number }>) =>
      [...map.entries()]
        .map(([key, value]) => ({ key, ...value, conversionRate: value.leads ? Number(((value.won / value.leads) * 100).toFixed(1)) : 0 }))
        .sort((a, b) => b.leads - a.leads);

    return NextResponse.json({
      ok: true,
      byService: mapRows(byService).slice(0, 20),
      bySource: mapRows(bySource).slice(0, 20),
      byLocation: mapRows(byLocation).slice(0, 20),
    });
  } catch (error) {
    console.error("growth breakdown failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load Growth Center breakdown" }, { status: 500 });
  }
}
