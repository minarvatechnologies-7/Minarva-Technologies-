"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/auth/me"), fetch("/api/growth-center"), fetch("/api/admin/leads")])
      .then(async ([meResponse, growthResponse, leadResponse]) => {
        const me = await meResponse.json();
        if (!meResponse.ok || !me.user || me.user.role === "CUSTOMER") throw new Error("Management access required");
        const growth = await growthResponse.json();
        const leadData = await leadResponse.json();
        if (!growthResponse.ok || !leadResponse.ok) throw new Error(growth.error || leadData.error || "Unable to load dashboard");
        setMetrics(growth);
        setLeads(leadData.leads || []);
      })
      .catch((err) => { setError(err instanceof Error ? err.message : "Unable to load dashboard"); router.replace("/login"); });
  }, [router]);

  if (error || !metrics) return <main className="portalPage"><section className="portalEmpty"><p>{error || "Loading Growth Center…"}</p></section></main>;

  return (
    <main className="portalPage">
      <header className="portalHeader"><a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a><div><span>Growth Center</span><a className="textButton" href="/">Website</a></div></header>
      <section className="portalHero"><div><p className="eyebrow">MINARVA GROWTH CENTER</p><h1>Know what needs attention.</h1><p>Leads, service workload and sales signals in one management view.</p></div><a className="primary" href="/#quote">Create test enquiry <span>→</span></a></section>
      <section className="metricGrid"><article><strong>{metrics.metrics.totalLeads}</strong><span>Total leads</span></article><article><strong>{metrics.metrics.hotLeads}</strong><span>Hot leads</span></article><article><strong>{metrics.metrics.openTickets}</strong><span>Open service tickets</span></article><article><strong>{metrics.metrics.conversionRate}%</strong><span>Lead → sale conversion</span></article></section>
      <section className="portalGrid"><article className="portalPanel"><div className="panelTitle"><h2>CRM pipeline</h2><span>{leads.length} loaded</span></div>{leads.length ? leads.map((lead) => <div className="portalRow" key={lead.id}><div><b>MN-LEAD-{String(lead.leadNumber).padStart(6, "0")} · {lead.name}</b><p>{lead.serviceSlug} · {lead.source} · {lead.location || "Location not supplied"}</p></div><span>{lead.temperature} · {lead.score}</span></div>) : <p className="muted">No leads recorded yet.</p>}</article><article className="portalPanel"><div className="panelTitle"><h2>Sales signals</h2></div><div className="portalRow"><div><b>Pending quotes</b><p>Draft, sent and negotiation-stage quotes</p></div><span>{metrics.metrics.pendingQuotes}</span></div><div className="portalRow"><div><b>Won leads</b><p>Converted CRM opportunities</p></div><span>{metrics.metrics.wonLeads}</span></div><div className="portalRow"><div><b>Paid revenue recorded</b><p>From payment records marked PAID</p></div><span>₹{Number(metrics.metrics.revenue).toLocaleString("en-IN")}</span></div></article></section>
    </main>
  );
}
