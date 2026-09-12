"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Technician = { id: string; name: string; phone?: string | null };
type Ticket = {
  id: string;
  publicTicketId: string;
  serviceSlug: string;
  problem?: string | null;
  location?: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  customer: { name: string; phone: string; city?: string | null };
  technician?: Technician | null;
  appointment?: { scheduledAt: string; status: string } | null;
};

const statuses = ["NEW", "ASSIGNED", "TECHNICIAN_ON_THE_WAY", "INSPECTION", "ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED", "COMPLETED", "DELIVERED", "CANCELLED"];
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];

function label(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function when(value?: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled";
}

function localInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function ServiceManagerPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [appointmentAt, setAppointmentAt] = useState("");
  const [appointmentType, setAppointmentType] = useState("SERVICE_VISIT");
  const [appointmentNotes, setAppointmentNotes] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load service operations");
      setTickets(data.tickets || []);
      setTechnicians(data.technicians || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load service operations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => tickets.filter((ticket) => {
    const haystack = [ticket.publicTicketId, ticket.customer.name, ticket.customer.phone, ticket.serviceSlug, ticket.location, ticket.problem].filter(Boolean).join(" ").toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (priority === "ALL" || ticket.priority === priority) && (status === "ALL" || ticket.status === status);
  }), [tickets, query, priority, status]);

  const selected = tickets.find((ticket) => ticket.id === selectedId) || null;
  const metrics = {
    active: tickets.length,
    urgent: tickets.filter((t) => t.priority === "URGENT").length,
    unassigned: tickets.filter((t) => !t.technician).length,
    today: tickets.filter((t) => t.appointment && new Date(t.appointment.scheduledAt).toDateString() === new Date().toDateString()).length,
  };

  useEffect(() => {
    if (!selected) return;
    setAppointmentAt(localInputValue(selected.appointment?.scheduledAt));
    setAppointmentType("SERVICE_VISIT");
    setAppointmentNotes("");
    setNote("");
  }, [selectedId]);

  async function mutate(ticketId: string, payload: Record<string, unknown>) {
    setBusy(ticketId);
    setError("");
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveAppointment() {
    if (!selected || !appointmentAt) return;
    await mutate(selected.id, {
      appointment: {
        scheduledAt: new Date(appointmentAt).toISOString(),
        type: appointmentType,
        notes: appointmentNotes.trim() || null,
      },
    });
  }

  return (
    <main className="portalPage">
      <header className="portalHeader">
        <Link className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></Link>
        <div><strong>Service Operations</strong><small>Control Center</small></div>
        <Link className="portalLink" href="/admin">Growth Center</Link>
      </header>

      <section className="portalHero">
        <div><p className="eyebrow">SERVICE OPERATIONS CONTROL CENTER</p><h1>Keep every job moving.</h1><p>Prioritize requests, assign technicians and keep each service journey visible from intake to completion.</p></div>
        <button className="primary" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh queue"}</button>
      </section>

      {error && <div className="portalAlert">{error}</div>}

      <section className="metricGrid">
        <article><span>Active tickets</span><strong>{metrics.active}</strong><small>Excludes completed, delivered and cancelled</small></article>
        <article><span>Urgent</span><strong>{metrics.urgent}</strong><small>Requires immediate management attention</small></article>
        <article><span>Unassigned</span><strong>{metrics.unassigned}</strong><small>Needs technician allocation</small></article>
        <article><span>Today’s appointments</span><strong>{metrics.today}</strong><small>Scheduled field/service visits</small></article>
      </section>

      <section className="portalGrid" style={{ gridTemplateColumns: selected ? "1.25fr .75fr" : "1fr" }}>
        <div className="portalPanel">
          <div className="panelTitle"><h2>Live ticket queue</h2><span>{filtered.length} shown</span></div>
          <div className="filterBar" style={{ marginBottom: 16 }}>
            <input aria-label="Search service tickets" placeholder="Search ticket, customer, phone or service" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="ALL">All priorities</option>{priorities.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select>
            <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="ALL">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
            <button className="secondary" onClick={() => { setQuery(""); setPriority("ALL"); setStatus("ALL"); }}>Reset</button>
          </div>
          {loading ? <p className="muted">Loading service queue…</p> : filtered.length === 0 ? <p className="muted">No active tickets match the current filters.</p> : filtered.map((ticket) => (
            <button key={ticket.id} className="leadRow" onClick={() => setSelectedId(ticket.id)}>
              <span style={{ textAlign: "left", flex: 1 }}><b>{ticket.publicTicketId} · {ticket.customer.name}</b><p>{label(ticket.serviceSlug)} · {ticket.problem || "Service request"}</p><small>{ticket.location || ticket.customer.city || "Location pending"}</small></span>
              <span><b>{label(ticket.priority)}</b><br />{label(ticket.status)}<small>{ticket.technician ? `Tech: ${ticket.technician.name}` : "Unassigned"}</small></span>
            </button>
          ))}
        </div>

        {selected && <aside className="portalPanel">
          <div className="panelTitle"><h2>{selected.publicTicketId}</h2><button className="textButton" onClick={() => setSelectedId(null)}>Close</button></div>
          <div className="detailStack">
            <div><b>{selected.customer.name}</b><p>{selected.customer.phone}{selected.customer.city ? ` · ${selected.customer.city}` : ""}</p></div>
            <div><p className="eyebrow">REQUEST</p><p className="muted">{selected.problem || "Service request"}</p><p className="muted">{selected.location || selected.customer.city || "Location pending"}</p></div>
            <label>Priority<select value={selected.priority} onChange={(e) => void mutate(selected.id, { priority: e.target.value })} disabled={busy === selected.id}>{priorities.map((p) => <option key={p} value={p}>{label(p)}</option>)}</select></label>
            <label>Status<select value={selected.status} onChange={(e) => void mutate(selected.id, { status: e.target.value })} disabled={busy === selected.id}>{statuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></label>
            <label>Assign technician<select value={selected.technician?.id || ""} onChange={(e) => void mutate(selected.id, { technicianId: e.target.value || null })} disabled={busy === selected.id}><option value="">Unassigned</option>{technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.name}{tech.phone ? ` · ${tech.phone}` : ""}</option>)}</select></label>
            <div><p className="eyebrow">APPOINTMENT</p><p className="muted">Current: {when(selected.appointment?.scheduledAt)}</p><label>Date & time<input type="datetime-local" value={appointmentAt} onChange={(e) => setAppointmentAt(e.target.value)} /></label><label>Visit type<input value={appointmentType} onChange={(e) => setAppointmentType(e.target.value)} maxLength={80} placeholder="SERVICE_VISIT" /></label><label>Appointment notes<textarea rows={2} maxLength={1000} value={appointmentNotes} onChange={(e) => setAppointmentNotes(e.target.value)} placeholder="Access instructions or scheduling details" /></label><button className="secondary" disabled={!appointmentAt || busy === selected.id} onClick={() => void saveAppointment()}>{busy === selected.id ? "Saving…" : selected.appointment ? "Reschedule appointment" : "Schedule appointment"}</button></div>
            <label>Operational note<textarea rows={4} maxLength={4000} placeholder="Add inspection, assignment or customer coordination note" value={note} onChange={(e) => setNote(e.target.value)} /></label>
            <button className="primary" disabled={!note.trim() || busy === selected.id} onClick={() => { const current = selected.status; void mutate(selected.id, { status: current, note: note.trim() }).then(() => setNote("")); }}>{busy === selected.id ? "Saving…" : "Add note to timeline"}</button>
          </div>
        </aside>}
      </section>
    </main>
  );
}
