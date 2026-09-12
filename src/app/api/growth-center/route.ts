import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [leadCount, hotLeads, openTickets, pendingQuotes, recentWon, recentRevenue] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { temperature: "HOT", status: { notIn: ["WON", "LOST"] } } }),
      prisma.serviceTicket.count({ where: { status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } } }),
      prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT", "NEGOTIATION"] } } }),
      prisma.lead.count({ where: { status: "WON" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    ]);

    const revenue = Number(recentRevenue._sum.amount ?? 0);
    const conversionRate = leadCount ? Number(((recentWon / leadCount) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      ok: true,
      metrics: {
        totalLeads: leadCount,
        hotLeads,
        openTickets,
        pendingQuotes,
        wonLeads: recentWon,
        revenue,
        conversionRate,
      },
      funnel: [
        { stage: "Traffic", key: "traffic" },
        { stage: "Lead", key: "leads", value: leadCount },
        { stage: "Qualified Lead", key: "qualified" },
        { stage: "Appointment", key: "appointments" },
        { stage: "Quote", key: "quotes", value: pendingQuotes },
        { stage: "Sale", key: "sales", value: recentWon },
        { stage: "Review", key: "reviews" },
        { stage: "Referral", key: "referrals" },
        { stage: "Repeat Business", key: "repeat" },
      ],
    });
  } catch (error) {
    console.error("growth center failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load Growth Center" }, { status: 500 });
  }
}
