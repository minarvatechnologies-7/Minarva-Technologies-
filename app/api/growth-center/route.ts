import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [leadCount, hotLeads, openTickets, pendingQuotes, wonLeads, paidRevenue] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { temperature: "HOT", status: { notIn: ["WON", "LOST"] } } }),
      prisma.serviceTicket.count({ where: { status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } } }),
      prisma.quotation.count({ where: { status: { in: ["DRAFT", "SENT", "NEGOTIATION"] } } }),
      prisma.lead.count({ where: { status: "WON" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    ]);
    const revenue = Number(paidRevenue._sum.amount ?? 0);
    const conversionRate = leadCount ? Number(((wonLeads / leadCount) * 100).toFixed(1)) : 0;
    const [qualifiedLeads, appointments, quotes, reviews, referrals] = await Promise.all([
      prisma.lead.count({ where: { status: { in: ["QUALIFIED", "SITE_SURVEY", "QUOTE_SENT", "NEGOTIATION", "WON"] } } }),
      prisma.appointment.count(),
      prisma.quotation.count(),
      prisma.review.count({ where: { status: "APPROVED" } }),
      prisma.referral.count(),
    ]);
    return NextResponse.json({
      ok: true,
      metrics: { totalLeads: leadCount, hotLeads, openTickets, pendingQuotes, wonLeads, revenue, conversionRate },
      funnel: [
        { stage: "Traffic", key: "traffic" },
        { stage: "Lead", key: "leads", value: leadCount },
        { stage: "Qualified Lead", key: "qualified", value: qualifiedLeads },
        { stage: "Appointment", key: "appointments", value: appointments },
        { stage: "Quote", key: "quotes", value: quotes },
        { stage: "Sale", key: "sales", value: wonLeads },
        { stage: "Review", key: "reviews", value: reviews },
        { stage: "Referral", key: "referrals", value: referrals },
      ],
    });
  } catch (error) {
    console.error("growth center failed", error);
    return NextResponse.json({ ok: false, error: "Unable to load Growth Center" }, { status: 500 });
  }
}
