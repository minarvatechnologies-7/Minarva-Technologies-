"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Invoice = {
  id: string; invoiceNumber: string; status: string; total: number | string; balance: number | string; issuedAt: string; dueAt: string | null;
  customer: { id: string; name: string; phone: string; city: string | null };
  payments: { id: string; amount: number | string; provider: string | null; reference: string | null; status: string; paidAt: string | null; createdAt: string }[];
};

type Customer = { id: string; name: string; phone: string };

const money = (v: number | string) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function FinancePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ invoiceNumber: "", customerId: "", total: "", dueAt: "" });
  const [payment, setPayment] = useState({ invoiceId: "", amount: "", provider: "", reference: "" });

  async function load() {
    const me = await fetch("/api/auth/me");
    const meBody = await me.json();
    if (!me.ok || !meBody.user || !["SUPER_ADMIN", "ADMIN", "ACCOUNTANT", "SALES", "SERVICE_MANAGER"].includes(meBody.user.role)) { router.replace("/login"); return; }
    const query = new URLSearchParams();
    if (q.trim()) query.set("q", q.trim());
    if (status !== "ALL") query.set("status", status);
    const [invoiceResponse, customerResponse] = await Promise.all([
      fetch(`/api/admin/invoices${query.toString() ? `?${query}` : ""}`, { cache: "no-store" }),
      fetch("/api/admin/customers", { cache: "no-store" }),
    ]);
    const invoiceBody = await invoiceResponse.json();
    const customerBody = await customerResponse.json();
    if (!invoiceResponse.ok) throw new Error(invoiceBody.error || "Unable to load invoices");
    setInvoices(invoiceBody.invoices || []);
    setCustomers((customerBody.customers || []).map((c: any) => ({ id: c.id, name: c.name, phone: c.phone })));
  }

  useEffect(() => { void load().catch((e) => setError(e instanceof Error ? e.message : "Unable to load finance workspace")); }, [router]);

  const metrics = useMemo(() => ({
    total: invoices.reduce((n, i) => n + Number(i.total), 0),
    outstanding: invoices.reduce((n, i) => n + Number(i.balance), 0),
    collected: invoices.reduce((n, i) => n + Number(i.total) - Number(i.balance), 0),
    overdue: invoices.filter(i => i.dueAt && new Date(i.dueAt) < new Date() && Number(i.balance) > 0).length,
  }), [invoices]);

  async function createInvoice(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const response = await fetch("/api/admin/invoices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invoiceNumber: form.invoiceNumber, customerId: form.customerId, total: Number(form.total), dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to create invoice"); return; }
    setMessage(`Invoice ${body.invoice.invoiceNumber} created.`); setForm({ invoiceNumber: "", customerId: "", total: "", dueAt: "" }); await load();
  }

  async function recordPayment(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const selected = invoices.find(i => i.id === payment.invoiceId);
    if (!selected) { setError("Select an invoice"); return; }
    const response = await fetch("/api/admin/payments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invoiceId: payment.invoiceId, amount: Number(payment.amount), provider: payment.provider || undefined, reference: payment.reference || undefined, status: "PAID" }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error || "Unable to record payment"); return; }
    setMessage(`Payment recorded for ${selected.invoiceNumber}.`); setPayment({ invoiceId: "", amount: "", provider: "", reference: "" }); await load();
  }

  return <main className="portalPage">
    <header className="portalHeader"><Link className="brand" href="/admin">MINARVA<span>TECHNOLOGIES</span></Link><div><span>FINANCE</span><Link className="textButton" href="/admin">Control Center</Link></div></header>
    <section className="portalHero"><div><p className="eyebrow">INVOICES & PAYMENTS</p><h1>Keep every rupee traceable.</h1><p>Invoice creation, outstanding balances and payment records stay in one management workspace.</p></div></section>
    {error && <div className="portalAlert">{error}</div>}
    {message && <div className="formSuccess" style={{ margin: "0 6vw 18px" }}>{message}</div>}
    <section className="metricGrid"><article><strong>{money(metrics.total)}</strong><span>Invoice value shown</span></article><article><strong>{money(metrics.collected)}</strong><span>Collected</span></article><article><strong>{money(metrics.outstanding)}</strong><span>Outstanding</span></article><article><strong>{metrics.overdue}</strong><span>Overdue invoices</span></article></section>
    <section className="portalGrid">
      <article className="portalPanel"><div className="panelTitle"><h2>Create invoice</h2><span>Manual billing</span></div><form onSubmit={createInvoice}><label>Invoice number<input required value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="MN-INV-000001" /></label><label>Customer<select required value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}><option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select></label><label>Total amount<input required type="number" min="0.01" step="0.01" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} /></label><label>Due at<input type="datetime-local" value={form.dueAt} onChange={e => setForm({ ...form, dueAt: e.target.value })} /></label><button className="primary" type="submit">Create invoice <span>→</span></button></form></article>
      <article className="portalPanel"><div className="panelTitle"><h2>Record payment</h2><span>PAID updates balance</span></div><form onSubmit={recordPayment}><label>Invoice<select required value={payment.invoiceId} onChange={e => { const invoice = invoices.find(i => i.id === e.target.value); setPayment({ ...payment, invoiceId: e.target.value, amount: invoice && Number(invoice.balance) > 0 ? String(Number(invoice.balance)) : payment.amount }); }}><option value="">Select invoice</option>{invoices.filter(i => Number(i.balance) > 0).map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} · {i.customer.name} · {money(i.balance)} due</option>)}</select></label><label>Amount<input required type="number" min="0.01" step="0.01" value={payment.amount} onChange={e => setPayment({ ...payment, amount: e.target.value })} /></label><label>Provider<input value={payment.provider} onChange={e => setPayment({ ...payment, provider: e.target.value })} placeholder="UPI / Bank / Cash / Gateway" /></label><label>Reference<input value={payment.reference} onChange={e => setPayment({ ...payment, reference: e.target.value })} /></label><button className="secondary" type="submit">Record payment</button></form></article>
    </section>
    <section className="portalPanel" style={{ margin: "0 6vw 70px" }}><div className="panelTitle"><h2>Invoice ledger</h2><span>{invoices.length} shown</span></div><div className="filterBar" style={{ marginBottom: 16 }}><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void load(); }} placeholder="Search invoice, customer or phone" /><select value={status} onChange={e => { setStatus(e.target.value); setTimeout(() => void load(), 0); }}><option value="ALL">All</option><option value="UNPAID">Unpaid</option><option value="PARTIALLY_PAID">Partially paid</option><option value="PAID">Paid</option></select><button className="secondary" onClick={() => void load()}>Search</button></div>{invoices.length ? invoices.map(i => <div className="portalRow" key={i.id}><div><b>{i.invoiceNumber} · {i.customer.name}</b><p>{i.customer.phone}{i.customer.city ? ` · ${i.customer.city}` : ""}</p><small>Issued {new Date(i.issuedAt).toLocaleDateString("en-IN")}{i.dueAt ? ` · Due ${new Date(i.dueAt).toLocaleDateString("en-IN")}` : ""}</small>{i.payments.length > 0 && <small> · {i.payments.length} recent payment record(s)</small>}</div><span>{i.status}<small>Total {money(i.total)} · Balance {money(i.balance)}</small></span></div>) : <p className="muted">No invoices match.</p>}</section>
  </main>;
}
