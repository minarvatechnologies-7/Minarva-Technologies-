"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const stages = ["NEW", "CONTACTED", "QUALIFIED", "SITE_SURVEY", "QUOTE_SENT", "NEGOTIATION", "WON", "LOST", "FOLLOW_UP"];
const temperatures = ["HOT", "WARM", "COLD"];

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [temperature, setTemperature] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const me = await fetch("/api/auth/me");
    const meBody = await me.json();
    if (!me.ok || !meBody.user || !["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER"].includes(meBody.user.role)) { router.replace("/login"); return; }
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    if (temperature) params.set("temperature", temperature);
    const response = await fetch(`/api/admin/leads?${params.toString()}`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to load leads");
    setLeads(body.leads || []);
  }

  useEffect(() => { load().catch(e => setError(e instanceof Error ? e.message : "Unable to load leads")); }, [router]);

  async function openLead(lead: any) {
    const response = await fetch(`/api/admin/leads/${lead.id}`);
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to load lead"); return; }
    setSelected(body.lead);
    setNote("");
  }

  async function save() {
    if (!selected) return;
    setError(""); setMessage("");
    const response = await fetch(`/api/admin/leads/${selected.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: selected.status, temperature: selected.temperature, followUpAt: selected.followUpAt ? new Date(selected.followUpAt).toISOString() : null, note: note.trim() || undefined }),
    });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to update lead"); return; }
    setMessage("Lead updated.");
    setSelected({ ...selected, ...body.lead });
    setNote("");
    await load();
  }

  return (
    <main className="portalPage">
      <header className="portalHeader"><a className="brand" href="/admin">MINARVA<span>TECHNOLOGIES</span></a><div><span>CRM & LEADS</span><a className="textButton" href="/admin">Control Center</a></div></header>
      <section className="portalHero"><div><p className="eyebrow">CRM WORKSPACE</p><h1>Move every lead forward.</h1><p>Filter opportunities, inspect qualification signals, schedule follow-ups and keep every sales action traceable.</p></div></section>
      <section className="portalPanel" style={{ margin: "0 6vw 18px" }}>
        <div className="filterBar"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, phone or email" /><select value={status} onChange={e => setStatus(e.target.value)}><option value="">All stages</option>{stages.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select><select value={temperature} onChange={e => setTemperature(e.target.value)}><option value="">All temperatures</option>{temperatures.map(t => <option key={t} value={t}>{t}</option>)}</select><button className="secondary" onClick={() => load().catch(e => setError(e.message))}>Apply</button></div>
      </section>
      {error && <div className="portalAlert" style={{ margin: "0 6vw 18px" }}>{error}</div>}
      <section className="portalGrid" style={{ gridTemplateColumns: selected ? "1.25fr .75fr" : "1fr" }}>
        <article className="portalPanel"><div className="panelTitle"><h2>Lead pipeline</h2><span>{leads.length} shown</span></div>{leads.length ? leads.map(lead => <button className="leadRow" key={lead.id} onClick={() => openLead(lead)}><div><b>MN-LEAD-{String(lead.leadNumber).padStart(6, "0")} · {lead.name}</b><p>{lead.serviceSlug} · {lead.source} · {lead.location || "Location not supplied"}</p></div><span>{lead.temperature} · {lead.score}<small>{lead.status.replaceAll("_", " ")}</small></span></button>) : <p className="muted">No leads match the current filters.</p>}</article>
        {selected && <article className="portalPanel"><div className="panelTitle"><h2>Lead detail</h2><span>#{selected.leadNumber}</span></div><div className="detailStack"><div><b>{selected.name}</b><p>{selected.phone}{selected.email ? ` · ${selected.email}` : ""}</p></div><p className="muted">{selected.requirement || "No requirement notes."}</p><label>Stage<select value={selected.status} onChange={e => setSelected({ ...selected, status: e.target.value })}>{stages.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label><label>Temperature<select value={selected.temperature} onChange={e => setSelected({ ...selected, temperature: e.target.value })}>{temperatures.map(t => <option key={t} value={t}>{t}</option>)}</select></label><label>Follow-up<input type="datetime-local" value={selected.followUpAt ? new Date(selected.followUpAt).toISOString().slice(0,16) : ""} onChange={e => setSelected({ ...selected, followUpAt: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label><label>Sales note<textarea rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="Add call notes, customer response or next action" /></label>{message && <div className="formSuccess">{message}</div>}<button className="primary" onClick={() => void save()}>Save lead update <span>→</span></button><div className="activityList"><b>Recent activity</b>{selected.activities?.slice(0,8).map((a: any) => <div key={a.id}><p>{a.body}</p><small>{a.user?.name || "System"} · {new Date(a.createdAt).toLocaleString()}</small></div>)}</div></div></article>}
      </section>
    </main>
  );
}
