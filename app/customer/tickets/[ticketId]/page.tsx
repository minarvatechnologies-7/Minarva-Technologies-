"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Ticket = {
  publicTicketId: string;
  serviceSlug: string;
  propertyType: string | null;
  location: string | null;
  problem: string | null;
  status: string;
  priority: string;
  estimateAmount: number | string | null;
  technician: { name: string; phone: string | null } | null;
  appointment: { scheduledAt: string; status: string; notes: string | null } | null;
  timeline: { status: string; note: string | null; createdAt: string }[];
};

const label = (value: string) => value.replaceAll("_", " ");

export default function CustomerTicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.ticketId) return;
    fetch(`/api/customer/tickets/${params.ticketId}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Unable to load ticket");
        return body.ticket as Ticket;
      })
      .then(setTicket)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load ticket"));
  }, [params.ticketId]);

  if (error) return <main className="portalPage"><section className="portalEmpty"><p>{error}</p><Link className="secondary" href="/customer">Back to portal</Link></section></main>;
  if (!ticket) return <main className="portalPage"><section className="portalEmpty"><p>Loading service ticket…</p></section></main>;

  return (
    <main className="portalPage">
      <header className="portalHeader"><Link className="brand" href="/customer">MINARVA<span>TECHNOLOGIES</span></Link><div><span>{ticket.publicTicketId}</span><Link className="textButton" href="/customer">Back to portal</Link></div></header>
      <section className="portalHero"><div><p className="eyebrow">SERVICE TRACKING</p><h1>{label(ticket.status)}</h1><p>{ticket.publicTicketId} · {ticket.serviceSlug} · Priority {ticket.priority}</p></div></section>
      <section className="metricGrid"><article><strong>{label(ticket.status)}</strong><span>Current status</span></article><article><strong>{ticket.technician?.name || "Pending"}</strong><span>Assigned technician</span></article><article><strong>{ticket.appointment ? new Date(ticket.appointment.scheduledAt).toLocaleString("en-IN") : "Not scheduled"}</strong><span>Appointment</span></article><article><strong>{ticket.estimateAmount != null ? `₹${Number(ticket.estimateAmount).toLocaleString("en-IN")}` : "Pending"}</strong><span>Estimate</span></article></section>
      <section className="portalGrid">
        <article className="portalPanel"><div className="panelTitle"><h2>Service details</h2></div><div className="portalRow"><div><b>Problem / requirement</b><p>{ticket.problem || "Not provided"}</p></div></div><div className="portalRow"><div><b>Location</b><p>{ticket.location || "Not provided"}</p></div></div><div className="portalRow"><div><b>Property type</b><p>{ticket.propertyType || "Not provided"}</p></div></div></article>
        <article className="portalPanel"><div className="panelTitle"><h2>Service timeline</h2><span>{ticket.timeline.length} events</span></div>{ticket.timeline.length ? ticket.timeline.map((event, index) => <div className="portalRow" key={`${event.createdAt}-${index}`}><div><b>{label(event.status)}</b><p>{event.note || "Status updated."}</p></div><span>{new Date(event.createdAt).toLocaleString("en-IN")}</span></div>) : <p className="muted">No timeline events yet.</p>}</article>
      </section>
    </main>
  );
}
