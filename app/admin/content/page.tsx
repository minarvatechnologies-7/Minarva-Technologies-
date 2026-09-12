"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminContentPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/content").then(async (r) => {
      const body = await r.json();
      if (!r.ok) throw new Error(body.error || "Management access required");
      setData(body);
    }).catch((e) => { setError(e.message); router.replace("/login"); });
  }, [router]);

  if (!data) return <main className="portalPage"><section className="portalEmpty"><p>{error || "Loading content workspace…"}</p></section></main>;
  return (
    <main className="portalPage">
      <header className="portalHeader"><a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a><div><a className="textButton" href="/admin">Growth Center</a><a className="textButton" href="/">Website</a></div></header>
      <section className="portalHero"><div><p className="eyebrow">CONTENT & KNOWLEDGE</p><h1>Publish useful content.</h1><p>Manage blog posts, FAQs and project stories without fabricating customer claims or results.</p></div></section>
      <section className="portalGrid">
        <article className="portalPanel"><div className="panelTitle"><h2>Blog posts</h2><span>{data.posts.length}</span></div>{data.posts.map((p: any) => <div className="portalRow" key={p.id}><div><b>{p.title}</b><p>/{p.slug} · {p.category || "Uncategorised"}</p></div><span>{p.publishedAt ? "Published" : "Draft"}</span></div>)}</article>
        <article className="portalPanel"><div className="panelTitle"><h2>FAQs</h2><span>{data.faqs.length}</span></div>{data.faqs.map((f: any) => <div className="portalRow" key={f.id}><div><b>{f.question}</b><p>{f.category || "General"}</p></div><span>{f.published ? "Live" : "Hidden"}</span></div>)}</article>
        <article className="portalPanel"><div className="panelTitle"><h2>Projects</h2><span>{data.projects.length}</span></div>{data.projects.map((p: any) => <div className="portalRow" key={p.id}><div><b>{p.title}</b><p>{p.location || "Location not supplied"}</p></div><span>{p.published ? "Live" : "Draft"}</span></div>)}</article>
      </section>
    </main>
  );
}
