"use client";

import { useState } from "react";

export default function AIAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyse() {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      setResult(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="aiFab" onClick={() => setOpen(true)} aria-label="Open Minarva AI assistant">AI Assistant</button>
      {open && (
        <div className="aiOverlay" role="dialog" aria-modal="true" aria-label="Minarva AI assistant">
          <div className="aiModal">
            <div className="panelTitle"><div><p className="eyebrow">MINARVA AI</p><h2>How can we help?</h2></div><button className="textButton" onClick={() => setOpen(false)}>Close</button></div>
            <p className="muted">I’m an AI assistant. I can help understand your requirement and route you to the right next step.</p>
            <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Example: Need 8 CCTV cameras for a shop in Trivandrum." />
            <button className="primary" onClick={analyse} disabled={loading}>{loading ? "Analysing…" : "Analyse requirement →"}</button>
            {result?.ok && <div className="aiQuickResult"><strong>{result.qualification.temperature} · {result.qualification.score}/100</strong><span>{result.qualification.serviceSlug}</span><span>{result.qualification.intent} · {result.qualification.nextAction}</span>{result.qualification.questions?.slice(0, 2).map((q: string) => <p key={q}>{q}</p>)}</div>}
            <p className="aiDisclaimer">AI guidance is preliminary. Final technical recommendations may require a professional site survey.</p>
          </div>
        </div>
      )}
    </>
  );
}
