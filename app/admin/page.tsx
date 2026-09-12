"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const modules = [
  { title: "CRM & Leads", text: "Lead pipeline, qualification, follow-ups and source tracking.", href: "/admin#crm" },
  { title: "Customers", text: "Customer records, requests, conversations and history.", href: "/customer" },
  { title: "Service Operations", text: "Tickets, appointments, assignment and technician workflow.", href: "/service-manager" },
  { title: "Technicians", text: "Assigned jobs, field updates, work notes and completion flow.", href: "/technician" },
  { title: "Products", text: "Customer-facing catalogue with enquiry and specification journeys.", href: "/products" },
  { title: "Warranty", text: "Warranty lookup and claims foundation for post-sale support.", href: "/customer" },
  { title: "Quotes & Invoices", text: "Quotation approvals, invoices, payments and balances.", href: "/admin#finance" },
  { title: "Content & SEO", text: "Projects, blog, FAQs and search-focused business content.", href: "/admin/content" },
  { title: "AI Assistant", text: "Customer assistance, qualification and CRM handoff.", href: "/ai" },
  { title: "Marketing", text: "Campaign attribution, follow-ups, reviews and referrals.", href: "/admin/settings#marketing" },
  { title: "Integrations", text: "Prepared connections for WhatsApp, email, SMS and analytics.", href: "/admin/settings#integrations" },
  { title: "Settings", text: "Business configuration, roles and operational controls.", href: "/admin/settings" },
];

export default function AdminPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/growth-center"),
      fetch("/api/admin/leads"),
    ])
      .then(async ([meResponse, growthResponse, leadResponse]) => {
        const me = await meResponse.json();
        if (!meResponse.ok || !me.user || me.user.role === "CUSTOMER") throw new Error("Management access required");
        const growth = await growthResponse.json();
        const leadData = await leadResponse.json();
        if (!growthResponse.ok || !leadResponse.ok) throw new Error(growth.error || leadData.error || "Unable to load dashboard");
        setMetrics(growth);
        setLeads(leadData.leads || []);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load dashboard");
        router.replace("/login");
      });
  }, [router]);

  if (error || !metrics) return <main className="portalPage"><section className="portalEmpty"><p>{error || "Loading Growth Center…"}</p></section></main>;

  return (
    <main className="portalPage">
      <header className="portalHeader">
        <a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a>
        <div><span>ADMIN CONTROL CENTER</span><a className="textButton" href="/">Website</a></div>
      </header>

      <section className="portalHero">
        <div>
          <p className="eyebrow">MINARVA MANAGEMENT</p>
          <h1>Run the business from one place.</h1>
          <p>Growth, customers, service, sales, content and integrations are organized into one operational workspace.</p>
        </div>
        <a className="primary" href="/#quote">Open lead form <span>→</span></a>
      </section>

      <section className="metricGrid">
        <article><strong>{metrics.metrics.totalLeads}</strong><span>Total leads</span></article>
        <article><strong>{metrics.metrics.hotLeads}</strong><span>Hot leads</span></article>
        <article><strong>{metrics.metrics.openTickets}</strong><span>Open service tickets</span></article>
        <article><strong>{metrics.metrics.conversionRate}%</strong><span>Lead → sale conversion</span></article>
      </section>

      <section className="section" style={{ paddingTop: 10, paddingBottom: 55 }}>
        <div className="sectionHead" style={{ marginBottom: 30 }}>
          <div><p className="eyebrow">CONTROL CENTER</p><h2>Every operational <span>door.</span></h2></div>
          <p>Use the existing role-based workflows now; deeper module screens can grow around the same database and APIs without rebuilding the core.</p>
        </div>
        <div className="grid">
          {modules.map((module, index) => (
            <article className={`card ${index === 0 ? "featured" : ""}`} key={module.title}>
              <div className="num">{String(index + 1).padStart(2, "0")}</div>
              <h3>{module.title}</h3>
              <p>{module.text}</p>
              <a href={module.href}>Open module ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="portalGrid" id="crm">
        <article className="portalPanel">
          <div className="panelTitle"><h2>CRM pipeline</h2><span>{leads.length} loaded</span></div>
          {leads.length ? leads.slice(0, 8).map((lead) => (
            <div className="portalRow" key={lead.id}>
              <div><b>MN-LEAD-{String(lead.leadNumber).padStart(6, "0")} · {lead.name}</b><p>{lead.serviceSlug} · {lead.source} · {lead.location || "Location not supplied"}</p></div>
              <span>{lead.temperature} · {lead.score}</span>
            </div>
          )) : <p className="muted">No leads recorded yet.</p>}
        </article>

        <article className="portalPanel" id="finance">
          <div className="panelTitle"><h2>Sales signals</h2><span>Live records</span></div>
          <div className="portalRow"><div><b>Pending quotes</b><p>Draft, sent and negotiation-stage quotes</p></div><span>{metrics.metrics.pendingQuotes}</span></div>
          <div className="portalRow"><div><b>Won leads</b><p>Converted CRM opportunities</p></div><span>{metrics.metrics.wonLeads}</span></div>
          <div className="portalRow"><div><b>Paid revenue recorded</b><p>From payment records marked PAID</p></div><span>₹{Number(metrics.metrics.revenue).toLocaleString("en-IN")}</span></div>
        </article>
      </section>
    </main>
  );
}
