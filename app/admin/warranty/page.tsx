"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Warranty = { id: string; serialNumber: string; invoiceRef: string | null; purchaseDate: string | null; startsAt: string; expiresAt: string; status: string; customer: { id: string; name: string; phone: string; city: string | null }; product: { id: string; name: string; sku: string | null } | null; claims: { id: string; status: string; openedAt: string; closedAt: string | null; notes: string | null; ticketId: string | null }[] };
type Customer = { id: string; name: string; phone: string };
type Product = { id: string; name: string; sku: string | null };

const label = (v: string) => v.replaceAll("_", " ").replace(/\\b\\w/g, (c) => c.toUpperCase());
const date = (v: string | null) => v ? new Date(v).toLocaleDateString("en-IN") : "—";
const expired = (v: string) => new Date(v) < new Date();

export default function WarrantyPage() {
  const router = useRouter();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ customerId: "", productId: "", serialNumber: "", invoiceRef: "", startsAt: "", expiresAt: "" });
  const [claim, setClaim] = useState({ warrantyId: "", ticketId: "", status: "OPEN", notes: "" });

  async function load() {
    const me = await fetch("/api/auth/me");
    const meBody = await me.json();
    if (!me.ok || !meBody.user || !["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER", "ACCOUNTANT"].includes(meBody.user.role)) { router.replace("/login"); return; }
    const [w, c] = await Promise.all([
      fetch(`/api/admin/warranties${q.trim() || status !== "ALL" ? `?${new URLSearchParams({ ...(q.trim() ? { q: q.trim() } : {}), ...(status !== "ALL" ? { status } : {}) }).toString()}` : "", { cache: "no-store" }),
      fetch("/api/admin/customers", { cache: "no-store" }),
    ]);
    const wd = await w.json(); const cd = await c.json();
    if (!w.ok) throw new Error(wd.error || "Unable to load warranties");
    setWarranties(wd.warranties || []);
    setCustomers((cd.customers || []).map((x: any) => ({ id: x.id, name: x.name, phone: x.phone })));
    const productResponse = await fetch("/api/admin/products", { cache: "no-store" });
    const pd = await productResponse.json();
    if (productResponse.ok) setProducts((pd.products || []).map((x: any) => ({ id: x.id, name: x.name, sku: x.sku })));
  }

  useEffect(() => { void load().catch((e) => setError(e instanceof Error ? e.message : "Unable to load warranties")); }, [router]);

  const metrics = useMemo(() => ({
    total: warranties.length,
    active: warranties.filter(w => w.status === "ACTIVE" && !expired(w.expiresAt)).length,
    expiring: warranties.filter(w => w.status === "ACTIVE" && new Date(w.expiresAt).getTime() - Date.now() <= 30 * 86400000 && new Date(w.expiresAt) >= new Date()).length,
    claims: warranties.reduce((n, w) => n + w.claims.filter(c => !["REJECTED", "CLOSED"].includes(c.status)).length, 0),
  }), [warranties]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const payload = { ...form, productId: form.productId || null, invoiceRef: form.invoiceRef || null, purchaseDate: null, startsAt: new Date(form.startsAt).toISOString(), expiresAt: new Date(form.expiresAt).toISOString() };
    const res = await fetch("/api/admin/warranties", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const body = await res.json();
    if (!res.ok) { setError(body.error || "Unable to save warranty"); return; }
    setMessage("Warranty registered."); setForm({ customerId: "", productId: "", serialNumber: "", invoiceRef: "", startsAt: "", expiresAt: "" }); await load();
  }

  async function createClaim(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    const res = await fetch("/api/admin/warranties", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...claim, ticketId: claim.ticketId || null }) });
    const body = await res.json();
    if (!res.ok) { setError(body.error || "Unable to open claim"); return; }
    setMessage(`Warranty claim ${body.claim.id} created.`); setClaim({ warrantyId: "", ticketId: "", status: "OPEN", notes: "" }); await load();
  }

  return <main className="portalPage">
    <header className="portalHeader"><Link className="brand" href="/admin">MINARVA<span>TECHNOLOGIES</span></Link><div><span>WARRANTY MANAGEMENT</span><Link className="textButton" href="/admin">Control Center</Link></div></header>
    <section className="portalHero"><div><p className="eyebrow">WARRANTY & CLAIMS</p><h1>Keep post-sale support traceable.</h1><p>Register verified warranty records, spot upcoming expiries and link warranty claims to service tickets.</p></div></section>
    {error && <div className="portalAlert">{error}</div>}
    {message && <div className="formSuccess" style={{ margin: "0 6vw 18px" }}>{message}</div>}
    <section className="metricGrid"><article><strong>{metrics.total}</strong><span>Warranty records</span></article><article><strong>{metrics.active}</strong><span>Active</span></article><article><strong>{metrics.expiring}</strong><span>Expiring within 30 days</span></article><article><strong>{metrics.claims}</strong><span>Open claims</span></article></section>
    <section className="portalGrid">
      <article className="portalPanel"><div className="panelTitle"><h2>Register warranty</h2><span>Verified data only</span></div><form onSubmit={submit}><label>Customer<select required value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}><option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</select></label><label>Product<select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}><option value="">Optional product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}{p.sku ? ` · ${p.sku}` : ""}</option>)}</select></label><label>Serial number<input required value={form.serialNumber} onChange={e => setForm({ ...form, serialNumber: e.target.value })} /></label><label>Invoice reference<input value={form.invoiceRef} onChange={e => setForm({ ...form, invoiceRef: e.target.value })} /></label><label>Starts at<input required type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} /></label><label>Expires at<input required type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></label><button className="primary" type="submit">Register warranty <span>→</span></button></form></article>
      <article className="portalPanel"><div className="panelTitle"><h2>Open claim</h2><span>Links into service workflow</span></div><form onSubmit={createClaim}><label>Warranty<select required value={claim.warrantyId} onChange={e => setClaim({ ...claim, warrantyId: e.target.value })}><option value="">Select warranty</option>{warranties.map(w => <option key={w.id} value={w.id}>{w.serialNumber} · {w.customer.name}</option>)}</select></label><label>Related ticket ID<input value={claim.ticketId} onChange={e => setClaim({ ...claim, ticketId: e.target.value })} placeholder="Optional service ticket ID" /></label><label>Claim status<select value={claim.status} onChange={e => setClaim({ ...claim, status: e.target.value })}>{["OPEN","IN_REVIEW","APPROVED","REJECTED","CLOSED"].map(s => <option key={s}>{s}</option>)}</select></label><label>Notes<textarea rows={5} maxLength={4000} value={claim.notes} onChange={e => setClaim({ ...claim, notes: e.target.value })} placeholder="Issue reported, verification notes, resolution context" /></label><button className="secondary" type="submit">Create claim</button></form></article>
    </section>
    <section className="portalPanel" style={{ margin: "0 6vw 70px" }}><div className="panelTitle"><h2>Warranty register</h2><span>{warranties.length} shown</span></div><div className="filterBar" style={{ marginBottom: 16 }}><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void load(); }} placeholder="Search serial, invoice, customer or product" /><select value={status} onChange={e => { setStatus(e.target.value); setTimeout(() => void load(), 0); }}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="EXPIRED">Expired</option><option value="CANCELLED">Cancelled</option></select><button className="secondary" onClick={() => void load()}>Search</button></div>{warranties.length ? warranties.map(w => <div className="portalRow" key={w.id}><div><b>{w.serialNumber}</b><p>{w.product?.name || "Registered product"} · {w.customer.name} · {w.customer.phone}</p><small>Validity {date(w.startsAt)} → {date(w.expiresAt)} · Invoice {w.invoiceRef || "—"}</small></div><span>{expired(w.expiresAt) && w.status === "ACTIVE" ? "EXPIRED" : label(w.status)}<small>{w.claims.length} claims</small></span></div>) : <p className="muted">No warranty records match.</p>}</section>
  </main>;
}
