"use client";

import { FormEvent, useState } from "react";

export default function AIAssistantPage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/ai/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aiPage">
      <div className="aiShell">
        <a href="/" className="brand">MINARVA<span>TECHNOLOGIES</span></a>
        <div className="aiIntro">
          <p className="eyebrow">MINARVA AI ASSISTANT</p>
          <h1>Tell us what you need.</h1>
          <p>Describe your requirement in plain language. The assistant can identify the likely service, intent, urgency and next step.</p>
        </div>
        <form className="aiForm" onSubmit={submit}>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} placeholder="Example: I need CCTV for my 2-floor shop and would like a site visit this week." required />
          <button className="primary" type="submit" disabled={loading}>{loading ? "Analysing…" : "Analyse requirement →"}</button>
        </form>
        {result?.ok && (
          <section className="aiResult" aria-live="polite">
            <div><span>Service</span><strong>{result.qualification.serviceSlug}</strong></div>
            <div><span>Intent</span><strong>{result.qualification.intent}</strong></div>
            <div><span>Urgency</span><strong>{result.qualification.urgency}</strong></div>
            <div><span>Lead temperature</span><strong>{result.qualification.temperature} · {result.qualification.score}/100</strong></div>
            <div><span>Next action</span><strong>{result.qualification.nextAction}</strong></div>
            <div className="aiQuestions"><span>Useful follow-up questions</span><ul>{result.qualification.questions.map((q: string) => <li key={q}>{q}</li>)}</ul></div>
            <p className="aiDisclaimer">{result.disclaimer}</p>
          </section>
        )}
      </div>
    </main>
  );
}
