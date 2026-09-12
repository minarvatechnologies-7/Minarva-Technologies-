"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Dashboard = {
  customer: { name: string; phone: string; email: string | null; city: string | null; tickets: any[]; quotations: any[]; invoices: any[]; warranties: any[] };
  summary: { openTickets: number; activeWarranties: number; outstandingBalance: number; pendingQuotes: number };
};

export default function CustomerPortal() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [quoteBusy, setQuoteBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/customer/dashboard", { cache: "no-store" });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Unable to load portal");
    setData(body);
  }

  useEffect(() => {
    load().catch((err) => { setError(err instanceof Error ? err.message : "Unable to load portal"); if (err instanceof Error && err.message === "Authentication required") router.push("/login"); });
  }, [router]);

  async function quoteAction(id: string, action: "APPROVE" | "REJECT") {
    setQuoteBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/customer/quotations/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Unable to update quotation");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update quotation");
    } finally {
      setQuoteBusy(null);
    }
  }

  async function signOut() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }

  if (error && !data) return <main className="portalPage"><section className="portalEmpty"><p>{error}</p><a className="secondary" href="/login">Sign in</a></section></main>;
  if (!data) return <main className="portalPage"><section className="portalEmpty"><p>Loading your portal…</p></section></main>;

  return (
    <main className="portalPage">
      <header className="portalHeader"><a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a><div><span>Customer Portal</span><button className="textButton" onClick={signOut}>Sign out</button></div></header>
      <section className="portalHero"><div><p className="eyebrow">CUSTOMER PORTAL</p><h1>Hello, {data.customer.name}.</h1><p>Everything important about your Minarva service journey in one place.</p></div><a className="primary" href="/#quote">New enquiry <span>→</span></a></section>
      {error && <div className="portalAlert">{error}</div>}
      <section className="metricGrid"><article><strong>{data.summary.openTickets}</strong><span>Open service tickets</span></article><article><strong>{data.summary.pendingQuotes}</strong><span>Pending quotes</span></article><article><strong>{data.summary.activeWarranties}</strong><span>Active warranties</span></article><article><strong>₹{data.summary.outstandingBalance.toLocaleString("en-IN")}</strong><span>Outstanding balance</span></article></section>
      <section className="portalGrid">
        <article className="portalPanel"><div className="panelTitle"><h2>Service requests</h2><span>{data.customer.tickets.length}</span></div>{data.customer.tickets.length ? data.customer.tickets.map((ticket) => <div className="portalRow" key={ticket.id}><div><b>MN-SRV-{String(ticket.ticketNumber).padStart(6, "0")}</b><p>{ticket.serviceSlug}</p></div><span>{ticket.status.replaceAll("_", " ")}</span><a className="textButton" href={`/customer/tickets/${ticket.id}`}>View</a></div>) : <p className="muted">No service requests yet.</p>}</article>
        <article className="portalPanel"><div className="panelTitle"><h2>Quotations</h2><span>{data.customer.quotations.length}</span></div>{data.customer.quotations.length ? data.customer.quotations.map((quote) => { const actionable = ["SENT", "NEGOTIATION"].includes(quote.status); return <div className="portalRow" key={quote.id}><div><b>Quote #{quote.quoteNumber}</b><p>{new Date(quote.createdAt).toLocaleDateString()} · {quote.status}</p></div><span>₹{Number(quote.total).toLocaleString("en-IN")}</span>{actionable && <div className="actions"><button className="secondary" disabled={quoteBusy === quote.id} onClick={() => void quoteAction(quote.id, "REJECT")}>Reject</button><button className="primary" disabled={quoteBusy === quote.id} onClick={() => void quoteAction(quote.id, "APPROVE")}>Approve <span>→</span></button></div>}</div> }) : <p className="muted">No quotations yet.</p>}</article>
        <article className="portalPanel"><div className="panelTitle"><h2>Warranty</h2><span>{data.customer.warranties.length}</span></div>{data.customer.warranties.length ? data.customer.warranties.map((warranty) => <div className="portalRow" key={warranty.id}><div><b>{warranty.product?.name || "Registered product"}</b><p>{warranty.serialNumber}</p></div><span>{new Date(warranty.expiresAt).toLocaleDateString()}</span></div>) : <p className="muted">No warranty records yet.</p>}</article>
        <article className="portalPanel"><div className="panelTitle"><h2>Invoices</h2><span>{data.customer.invoices.length}</span></div>{data.customer.invoices.length ? data.customer.invoices.map((invoice) => <div className="portalRow" key={invoice.id}><div><b>{invoice.invoiceNumber}</b><p>{invoice.status}</p></div><span>₹{Number(invoice.balance).toLocaleString("en-IN")}</span></div>) : <p className="muted">No invoices yet.</p>}</article>
      </section>
    </main>
  );
}
