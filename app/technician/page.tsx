"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TimelineEntry = { status: string; note?: string | null; createdAt: string };
type Part = { name: string; quantity: string | number; unitCost: string | number };
type Job = {
  id: string;
  publicTicketId: string;
  serviceSlug: string;
  propertyType?: string | null;
  problem?: string | null;
  location?: string | null;
  status: string;
  priority: string;
  estimateAmount?: string | number | null;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; phone: string; whatsapp?: string | null; address?: string | null; city?: string | null };
  appointment?: { scheduledAt: string; status: string; notes?: string | null } | null;
  parts: Part[];
  timeline: TimelineEntry[];
};

const transitionMap: Record<string, string[]> = {
  NEW: ["TECHNICIAN_ON_THE_WAY", "INSPECTION"],
  ASSIGNED: ["TECHNICIAN_ON_THE_WAY", "INSPECTION"],
  TECHNICIAN_ON_THE_WAY: ["INSPECTION", "ESTIMATE_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  INSPECTION: ["ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  ESTIMATE_PENDING: ["CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  CUSTOMER_APPROVAL_PENDING: ["WORK_IN_PROGRESS", "PARTS_REQUIRED"],
  WORK_IN_PROGRESS: ["PARTS_REQUIRED", "COMPLETED"],
  PARTS_REQUIRED: ["WORK_IN_PROGRESS", "COMPLETED"],
};

function label(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()); }
function when(value?: string | null) { return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled"; }

export default function TechnicianPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/technician/jobs", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load jobs");
      setJobs(data.jobs ?? []);
      setSelectedId((current) => current && data.jobs?.some((job: Job) => job.id === current) ? current : data.jobs?.[0]?.id ?? null);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load jobs"); }
    finally { setLoading(false); }
  }

  async function update(id: string, status?: string, note?: string) {
    setBusy(id); setError(""); setMessage("");
    try {
      const response = await fetch("/api/technician/work", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ticketId: id, status, note }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update job");
      setNotes((current) => ({ ...current, [id]: "" }));
      setMessage(`${data.publicTicketId} updated successfully.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update job"); }
    finally { setBusy(null); }
  }

  useEffect(() => { void load(); }, []);

  function submitNote(event: FormEvent, id: string) {
    event.preventDefault();
    const note = notes[id]?.trim();
    if (note) void update(id, undefined, note);
  }

  const selected = jobs.find((job) => job.id === selectedId) || null;
  const visibleJobs = useMemo(() => filter === "ALL" ? jobs : jobs.filter((job) => job.status === filter), [jobs, filter]);
  const metrics = {
    active: jobs.length,
    today: jobs.filter((j) => j.appointment && new Date(j.appointment.scheduledAt).toDateString() === new Date().toDateString()).length,
    waiting: jobs.filter((j) => ["ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "PARTS_REQUIRED"].includes(j.status)).length,
    completed: jobs.filter((j) => j.status === "COMPLETED").length,
  };

  return (
    <main className="portalPage">
      <header className="portalHeader"><Link className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></Link><div><strong>Technician Workspace</strong><small>Assigned service jobs</small></div><Link className="portalLink" href="/admin">Operations</Link></header>
      <section className="portalHero"><div><p className="eyebrow">TECHNICIAN PORTAL</p><h1>Run every job from the field.</h1><p>See the customer, appointment, service history and next action before you move a ticket forward.</p></div><button className="primary" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh jobs"}</button></section>
      {error && <div className="portalAlert">{error}</div>}{message && <div className="portalNotice">{message}</div>}
      <section className="metricGrid"><article><span>Active jobs</span><strong>{metrics.active}</strong><small>Assigned open service work</small></article><article><span>Today</span><strong>{metrics.today}</strong><small>Scheduled appointments</small></article><article><span>Waiting</span><strong>{metrics.waiting}</strong><small>Estimate, approval or parts stage</small></article><article><span>Completed</span><strong>{metrics.completed}</strong><small>Visible during this active queue</small></article></section>
      <section className="portalGrid" style={{ gridTemplateColumns: selected ? "1fr 1fr" : "1fr" }}>
        <div className="portalPanel"><div className="panelTitle"><h2>My job board</h2><span>{visibleJobs.length} jobs</span></div><div className="filterBar" style={{ marginBottom: 14 }}><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="ALL">All active stages</option>{Object.keys(transitionMap).map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></div>
          {loading ? <p className="muted">Loading assigned jobs…</p> : visibleJobs.length === 0 ? <div className="portalEmpty"><h2>No jobs in this filter</h2><p>New assignments will appear here automatically.</p></div> : visibleJobs.map((job) => <button key={job.id} className="leadRow" onClick={() => setSelectedId(job.id)}><span style={{ textAlign: "left", flex: 1 }}><b>{job.publicTicketId} · {job.customer.name}</b><p>{label(job.serviceSlug)} · {job.problem || "Service request"}</p><small>{job.location || job.customer.city || "Location not specified"}</small></span><span><b>{label(job.priority)}</b><br />{label(job.status)}<small>{job.appointment ? when(job.appointment.scheduledAt) : "No appointment"}</small></span></button>)}
        </div>
        {selected && <aside className="portalPanel"><div className="panelTitle"><h2>{selected.publicTicketId}</h2><button className="textButton" onClick={() => setSelectedId(null)}>Close</button></div><div className="detailStack"><div><b>{selected.customer.name}</b><p>{selected.customer.phone}{selected.customer.city ? ` · ${selected.customer.city}` : ""}</p><p>{selected.customer.address || selected.location || "Address not specified"}</p></div><div><p className="eyebrow">SERVICE BRIEF</p><p className="muted"><strong>{label(selected.serviceSlug)}</strong></p><p className="muted">{selected.problem || "No problem description provided."}</p>{selected.propertyType && <p className="muted">Property: {selected.propertyType}</p>}</div>
          {selected.appointment && <div><p className="eyebrow">APPOINTMENT</p><p className="muted">{when(selected.appointment.scheduledAt)} · {label(selected.appointment.status)}</p><p className="muted">{selected.appointment.notes || "No appointment notes"}</p></div>}
          <div><p className="eyebrow">NEXT ACTION</p><div className="actions" style={{ gap: 8 }}>{(transitionMap[selected.status] || []).map((next) => <button key={next} className={next === "COMPLETED" ? "lightCta" : "secondary"} disabled={busy === selected.id} onClick={() => void update(selected.id, next)}>{busy === selected.id ? "Updating…" : label(next)}</button>)}</div></div>
          <div><p className="eyebrow">CONTACT</p><div className="actions"><a className="secondary" href={`tel:${selected.customer.phone}`}>Call customer</a>{selected.customer.whatsapp && <a className="secondary" href={`https://wa.me/${selected.customer.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>}</div></div>
          {selected.parts.length > 0 && <div><p className="eyebrow">PARTS</p>{selected.parts.map((part, i) => <p className="muted" key={`${part.name}-${i}`}>{part.name} · Qty {String(part.quantity)}</p>)}</div>}
          {selected.timeline.length > 0 && <div className="activityList"><b>RECENT TIMELINE</b>{selected.timeline.map((entry, index) => <div key={`${entry.createdAt}-${index}`}><p>{label(entry.status)}</p><small>{entry.note || "Status updated"} · {when(entry.createdAt)}</small></div>)}</div>}
          <form className="workNoteForm" onSubmit={(event) => submitNote(event, selected.id)}><textarea rows={4} value={notes[selected.id] || ""} onChange={e => setNotes((current) => ({ ...current, [selected.id]: e.target.value }))} placeholder="Inspection findings, work performed, parts needed, customer remarks…" /><button className="primary" type="submit" disabled={!notes[selected.id]?.trim() || busy === selected.id}>{busy === selected.id ? "Saving…" : "Save work note"}</button></form>
        </div></aside>}
      </section>
    </main>
  );
}
