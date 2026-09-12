"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Warranty = {
  id: string;
  serialNumber: string;
  invoiceRef: string | null;
  purchaseDate: string | null;
  startsAt: string;
  expiresAt: string;
  status: string;
  customer: { id: string; name: string; phone: string; city: string | null };
  product: { id: string; name: string; sku: string | null } | null;
  claims: { id: string; status: string; openedAt: string; closedAt: string | null; notes: string | null; ticketId: string | null }[];
};
type Customer = { id: string; name: string; phone: string };
type Product = { id: string; name: string; sku: string | null };

const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
const formatDate = (value: string | null) => (value ? new Date(value).toLocaleDateString("en-IN") : "—");
const isExpired = (value: string) => new Date(value) < new Date();

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
    const allowedRoles = ["SUPER_ADMIN", "ADMIN", "SERVICE_MANAGER", "ACCOUNTANT"];
    if (!me.ok || !meBody.user || !allowedRoles.includes(meBody.user.role)) {
      router.replace("/login");
      return;
    }

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "ALL") params.set("status", status);
    const suffix = params.toString() ? `?${params.toString()}` : "";

    const [warrantyResponse, customerResponse, productResponse] = await Promise.all([
      fetch(`/api/admin/warranties${suffix}`, { cache: "no-store" }),
      fetch("/api/admin/customers", { cache: "no-store" }),
      fetch("/api/admin/products", { cache: "no-store" }),
    ]);

    const warrantyData = await warrantyResponse.json();
    const customerData = await customerResponse.json();
    const productData = await productResponse.json();
    if (!warrantyResponse.ok) throw new Error(warrantyData.error || "Unable to load warranties");

    setWarranties(warrantyData.warranties || []);
    setCustomers((customerData.customers || []).map((item: Customer) => ({ id: item.id, name: item.name, phone: item.phone })));
    if (productResponse.ok) {
      setProducts((productData.products || []).map((item: Product) => ({ id: item.id, name: item.name, sku: item.sku })));
    }
  }

  useEffect(() => {
    void load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load warranties"));
  }, [router]);

  const metrics = useMemo(() => ({
    total: warranties.length,
    active: warranties.filter((item) => item.status === "ACTIVE" && !isExpired(item.expiresAt)).length,
    expiring: warranties.filter((item) => {
      const expiry = new Date(item.expiresAt).getTime();
      return item.status === "ACTIVE" && expiry - Date.now() <= 30 * 86400000 && expiry >= Date.now();
    }).length,
    claims: warranties.reduce((count, item) => count + item.claims.filter((itemClaim) => !["REJECTED", "CLOSED"].includes(itemClaim.status)).length, 0),
  }), [warranties]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      ...form,
      productId: form.productId || null,
      invoiceRef: form.invoiceRef || null,
      purchaseDate: null,
      startsAt: new Date(form.startsAt).toISOString(),
      expiresAt: new Date(form.expiresAt).toISOString(),
    };
    const response = await fetch("/api/admin/warranties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Unable to save warranty");
      return;
    }
    setMessage("Warranty registered.");
    setForm({ customerId: "", productId: "", serialNumber: "", invoiceRef: "", startsAt: "", expiresAt: "" });
    await load();
  }

  async function createClaim(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/warranties", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...claim, ticketId: claim.ticketId || null }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error || "Unable to open claim");
      return;
    }
    setMessage(`Warranty claim ${body.claim.id} created.`);
    setClaim({ warrantyId: "", ticketId: "", status: "OPEN", notes: "" });
    await load();
  }

  return (
    <main className="portalPage">
      <header className="portalHeader">
        <Link className="brand" href="/admin">MINARVA<span>TECHNOLOGIES</span></Link>
        <div><span>WARRANTY MANAGEMENT</span><Link className="textButton" href="/admin">Control Center</Link></div>
      </header>
      <section className="portalHero"><div><p className="eyebrow">WARRANTY & CLAIMS</p><h1>Keep post-sale support traceable.</h1><p>Register verified warranty records, spot upcoming expiries and link warranty claims to service tickets.</p></div></section>
      {error && <div className="portalAlert">{error}</div>}
      {message && <div className="formSuccess" style={{ margin: "0 6vw 18px" }}>{message}</div>}
      <section className="metricGrid">
        <article><strong>{metrics.total}</strong><span>Warranty records</span></article>
        <article><strong>{metrics.active}</strong><span>Active</span></article>
        <article><strong>{metrics.expiring}</strong><span>Expiring within 30 days</span></article>
        <article><strong>{metrics.claims}</strong><span>Open claims</span></article>
      </section>
      <section className="portalGrid">
        <article className="portalPanel">
          <div className="panelTitle"><h2>Register warranty</h2><span>Verified data only</span></div>
          <form onSubmit={submit}>
            <label>Customer<select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}</select></label>
            <label>Product<select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })}><option value="">Optional product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}{product.sku ? ` · ${product.sku}` : ""}</option>)}</select></label>
            <label>Serial number<input required value={form.serialNumber} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} /></label>
            <label>Invoice reference<input value={form.invoiceRef} onChange={(event) => setForm({ ...form, invoiceRef: event.target.value })} /></label>
            <label>Starts at<input required type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></label>
            <label>Expires at<input required type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} /></label>
            <button className="primary" type="submit">Register warranty <span>→</span></button>
          </form>
        </article>
        <article className="portalPanel">
          <div className="panelTitle"><h2>Open claim</h2><span>Links into service workflow</span></div>
          <form onSubmit={createClaim}>
            <label>Warranty<select required value={claim.warrantyId} onChange={(event) => setClaim({ ...claim, warrantyId: event.target.value })}><option value="">Select warranty</option>{warranties.map((warranty) => <option key={warranty.id} value={warranty.id}>{warranty.serialNumber} · {warranty.customer.name}</option>)}</select></label>
            <label>Related ticket ID<input value={claim.ticketId} onChange={(event) => setClaim({ ...claim, ticketId: event.target.value })} placeholder="Optional service ticket ID" /></label>
            <label>Claim status<select value={claim.status} onChange={(event) => setClaim({ ...claim, status: event.target.value })}>{["OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "CLOSED"].map((claimStatus) => <option key={claimStatus}>{claimStatus}</option>)}</select></label>
            <label>Notes<textarea rows={5} maxLength={4000} value={claim.notes} onChange={(event) => setClaim({ ...claim, notes: event.target.value })} placeholder="Issue reported, verification notes, resolution context" /></label>
            <button className="secondary" type="submit">Create claim</button>
          </form>
        </article>
      </section>
      <section className="portalPanel" style={{ margin: "0 6vw 70px" }}>
        <div className="panelTitle"><h2>Warranty register</h2><span>{warranties.length} shown</span></div>
        <div className="filterBar" style={{ marginBottom: 16 }}>
          <input value={q} onChange={(event) => setQ(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(); }} placeholder="Search serial, invoice, customer or product" />
          <select value={status} onChange={(event) => { setStatus(event.target.value); setTimeout(() => void load(), 0); }}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="EXPIRED">Expired</option><option value="CANCELLED">Cancelled</option></select>
          <button className="secondary" onClick={() => void load()}>Search</button>
        </div>
        {warranties.length ? warranties.map((warranty) => (
          <div className="portalRow" key={warranty.id}>
            <div><b>{warranty.serialNumber}</b><p>{warranty.product?.name || "Registered product"} · {warranty.customer.name} · {warranty.customer.phone}</p><small>Validity {formatDate(warranty.startsAt)} → {formatDate(warranty.expiresAt)} · Invoice {warranty.invoiceRef || "—"}</small></div>
            <span>{isExpired(warranty.expiresAt) && warranty.status === "ACTIVE" ? "EXPIRED" : label(warranty.status)}<small>{warranty.claims.length} claims</small></span>
          </div>
        )) : <p className="muted">No warranty records match.</p>}
      </section>
    </main>
  );
}
