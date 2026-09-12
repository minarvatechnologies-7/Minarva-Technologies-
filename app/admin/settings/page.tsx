"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Integration = { name: string; status: "configured" | "not_configured" };

export default function AdminSettingsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Record<string, Integration>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/auth/me"), fetch("/api/admin/integrations")])
      .then(async ([meResponse, integrationResponse]) => {
        const me = await meResponse.json();
        const data = await integrationResponse.json();
        if (!meResponse.ok || !me.user || !["SUPER_ADMIN", "ADMIN"].includes(me.user.role)) throw new Error("Admin access required");
        if (!integrationResponse.ok) throw new Error(data.error || "Unable to load integration status");
        setIntegrations(data.integrations || {});
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load settings");
        router.replace("/login");
      });
  }, [router]);

  return (
    <main className="portalPage">
      <header className="portalHeader">
        <a className="brand" href="/admin">MINARVA<span>TECHNOLOGIES</span></a>
        <div><span>Settings</span><a className="textButton" href="/">Website</a></div>
      </header>
      <section className="portalHero">
        <div><p className="eyebrow">SYSTEM CONFIGURATION</p><h1>Integration readiness.</h1><p>Only configuration status is shown here. Secrets are never exposed to the browser.</p></div>
      </section>
      <section className="portalGrid">
        <article className="portalPanel">
          <div className="panelTitle"><h2>Connected services</h2><span>{Object.keys(integrations).length} tracked</span></div>
          {error ? <p className="muted">{error}</p> : Object.entries(integrations).map(([key, item]) => (
            <div className="portalRow" key={key}><div><b>{item.name}</b><p>Environment-backed provider configuration</p></div><span>{item.status === "configured" ? "Configured" : "Not configured"}</span></div>
          ))}
        </article>
        <article className="portalPanel">
          <div className="panelTitle"><h2>Production checklist</h2></div>
          <div className="portalRow"><div><b>Database</b><p>Set DATABASE_URL to managed PostgreSQL</p></div><span>Required</span></div>
          <div className="portalRow"><div><b>Authentication</b><p>Use a long random AUTH_SECRET</p></div><span>Required</span></div>
          <div className="portalRow"><div><b>Messaging</b><p>Connect WhatsApp/email/SMS providers before sending</p></div><span>Optional</span></div>
          <div className="portalRow"><div><b>Payments</b><p>Configure a real provider before enabling checkout</p></div><span>Optional</span></div>
          <div className="portalRow"><div><b>AI</b><p>Add provider credentials before enabling live AI</p></div><span>Optional</span></div>
        </article>
      </section>
    </main>
  );
}
