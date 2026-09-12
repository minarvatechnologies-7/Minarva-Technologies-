"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };
type Product = { id: string; name: string; slug: string; sku: string | null; active: boolean; isUsed: boolean; category: { name: string } };

export default function AdminProductsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ categoryId: "", name: "", slug: "", sku: "", description: "", isUsed: false });

  const load = async () => {
    const meResponse = await fetch("/api/auth/me");
    const me = await meResponse.json();
    if (!meResponse.ok || !me.user || !["SUPER_ADMIN", "ADMIN"].includes(me.user.role)) {
      router.replace("/login");
      return;
    }
    const response = await fetch("/api/admin/products");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load catalogue");
    setCategories(data.categories || []);
    setProducts(data.products || []);
    setForm((current) => ({ ...current, categoryId: current.categoryId || data.categories?.[0]?.id || "" }));
  };

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load catalogue"));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.slug || form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Unable to create product");
      return;
    }
    setMessage("Product saved to the catalogue.");
    setForm((current) => ({ ...current, name: "", slug: "", sku: "", description: "", isUsed: false }));
    await load();
  };

  return (
    <main className="portalPage">
      <header className="portalHeader">
        <Link className="brand" href="/admin">MINARVA<span>TECHNOLOGIES</span></Link>
        <div><span>PRODUCT MANAGEMENT</span><Link className="textButton" href="/products">Public catalogue</Link></div>
      </header>
      <section className="portalHero">
        <div><p className="eyebrow">CATALOGUE CONTROL</p><h1>Keep the product data real.</h1><p>Add verified products, specifications and used-device listings without inventing live stock or prices.</p></div>
      </section>
      <section className="portalGrid">
        <article className="portalPanel">
          <div className="panelTitle"><h2>Add product</h2><span>Admin only</span></div>
          <form onSubmit={submit}>
            <label>Category<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated when blank" /></label>
            <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
            <label>Description<textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label><input type="checkbox" checked={form.isUsed} onChange={(e) => setForm({ ...form, isUsed: e.target.checked })} /> Used device listing</label>
            {message && <div className="formSuccess">{message}</div>}
            {error && <div className="formError">{error}</div>}
            <button className="primary" type="submit">Save product <span>→</span></button>
          </form>
        </article>
        <article className="portalPanel">
          <div className="panelTitle"><h2>Catalogue records</h2><span>{products.length} shown</span></div>
          {products.length ? products.map((product) => <div className="portalRow" key={product.id}><div><b>{product.name}</b><p>{product.category.name} · {product.sku || "No SKU"}{product.isUsed ? " · USED" : ""}</p></div><span>{product.active ? "ACTIVE" : "INACTIVE"}</span></div>) : <p className="muted">No products have been added yet.</p>}
        </article>
      </section>
    </main>
  );
}
