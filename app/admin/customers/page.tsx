"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const me = await fetch("/api/auth/me");
    const body = await me.json();
    if (!me.ok || !body.user || !["SUPER_ADMIN", "ADMIN", "SALES", "SERVICE_MANAGER", "ACCOUNTANT", "CONTENT_MARKETING"].includes(body.user.role)) { router.replace("/login"); return; }
    const response = await fetch(`/api/admin/customers${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load customers");
    setCustomers(data.customers || []);
  }

  async function openCustomer(id: string) {
    const response = await fetch(`/api/admin/customer-detail?customerId=${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Unable to load customer"); return; }
    setSelected(data.customer);
  }

  useEffect(() => { void load().catch(e => setError(e instanceof Error ? e.message : "Unable to load customers")); }, [router]);

  return <main className="portalPage">
    <header className="portalHeader"><a className="brand" href="/admin">MINARVA<span>TECHNOLOGIES</span></a><div><span>CUSTOMERS</span><a className="textButton" href="/admin">Control Center</a></div></header>
    <section className="portalHero"><div><p className="eyebrow">CUSTOMER MANAGEMENT</p><h1>One customer. One history.</h1><p>Search customer records and inspect their complete relationship with Minarva across leads, service, quotations, invoices and warranty.</p></div></section>
    <section className="portalPanel" style={{ margin: "0 6vw 18px" }}><div className="filterBar"><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void load(); }} placeholder="Search name, phone, email or city" /><button className="secondary" onClick={() => void load()}>Search</button></div></section>
    {error && <div className="portalAlert" style={{ margin: "0 6vw 18px" }}>{error}</div>}
    <section className="portalGrid" style={{ gridTemplateColumns: selected ? "1.05fr .95fr" : "1fr" }}>
      <article className="portalPanel"><div className="panelTitle"><h2>Customer directory</h2><span>{customers.length} shown</span></div>{customers.length ? customers.map(c => <button className="leadRow" key={c.id} onClick={() => void openCustomer(c.id)}><div><b>{c.name}</b><p>{c.phone}{c.email ? ` · ${c.email}` : ""} · {c.city || "Location not supplied"}</p></div><span>{c._count.tickets} tickets · {c._count.invoices} invoices<small>{c._count.warranties} warranties</small></span></button>) : <p className="muted">No customer records match.</p>}</article>
      {selected && <article className="portalPanel"><div className="panelTitle"><h2>{selected.name}</h2><span>{selected.city || ""}</span></div><div className="detailStack"><p>{selected.phone}{selected.email ? ` · ${selected.email}` : ""}</p><p className="muted">{selected.address || "No address supplied."}</p><div className="portalRow"><b>Leads</b><span>{selected.leads.length}</span></div><div className="portalRow"><b>Service tickets</b><span>{selected.tickets.length}</span></div><div className="portalRow"><b>Quotations</b><span>{selected.quotations.length}</span></div><div className="portalRow"><b>Invoices</b><span>{selected.invoices.length}</span></div><div className="portalRow"><b>Warranties</b><span>{selected.warranties.length}</span></div><h3>Recent service</h3>{selected.tickets.slice(0,5).map((t:any)=><div className="portalRow" key={t.id}><div><b>MN-SRV-{String(t.ticketNumber).padStart(6,"0")}</b><p>{t.serviceSlug}</p></div><span>{t.status.replaceAll("_"," ")}</span></div>)}<h3>Recent invoices</h3>{selected.invoices.slice(0,5).map((i:any)=><div className="portalRow" key={i.id}><div><b>{i.invoiceNumber}</b><p>{i.status}</p></div><span>₹{Number(i.balance).toLocaleString("en-IN")}</span></div>)}</div></article>}
    </section>
  </main>;
}
