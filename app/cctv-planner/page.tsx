"use client";
import { useState } from "react";

export default function CCTVPlanner() {
  const [result, setResult] = useState<{score:number;temperature:string;nextAction:string;questions:string[]}|null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(form: HTMLFormElement) {
    setLoading(true);
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch("/api/ai/qualify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, serviceSlug: "cctv-installation", requirement: `Property: ${data.propertyType}. Cameras: ${data.cameraCount}. Area: ${data.area}. Priority: ${data.priority}. Requirement: ${data.requirement}`, intent: "CCTV_PLANNER" }) });
    const json = await response.json();
    setResult(json.result ?? null);
    setLoading(false);
  }

  return <main className="aiPage"><div className="aiShell">
    <a className="backLink" href="/">← Minarva Technologies</a>
    <section className="aiIntro"><p className="eyebrow">CCTV PLANNER</p><h1>Plan your CCTV requirement before the conversation.</h1><p>Answer a few practical questions. The assistant will organize the requirement and suggest what to clarify next. It is an estimate aid, not a replacement for an on-site professional survey.</p></section>
    <form className="aiForm" onSubmit={(e) => { e.preventDefault(); void submit(e.currentTarget); }}>
      <label>Property type<select name="propertyType" defaultValue="Shop"><option>Home</option><option>Shop</option><option>Office</option><option>Warehouse</option><option>Apartment</option><option>Other</option></select></label>
      <label>Approx. camera count<input name="cameraCount" inputMode="numeric" placeholder="e.g. 8" /></label>
      <label>Area / location context<input name="area" placeholder="e.g. front, entrance, parking, interior" /></label>
      <label>Priority<select name="priority" defaultValue="NORMAL"><option value="NORMAL">Normal</option><option value="SOON">Soon</option><option value="URGENT">Urgent</option></select></label>
      <label>What do you need?<textarea name="requirement" rows={5} placeholder="Night vision, remote viewing, recording period, blind spots, etc." /></label>
      <button className="primary" type="submit" disabled={loading}>{loading ? "Analyzing…" : "Analyze CCTV requirement →"}</button>
    </form>
    {result && <section className="aiResult"><div><span>Temperature</span><strong>{result.temperature}</strong></div><div><span>Lead score</span><strong>{result.score}/100</strong></div><div><span>Next action</span><strong>{result.nextAction}</strong></div><div className="aiQuestions"><span>Clarify next</span><ul>{result.questions.map((q) => <li key={q}>{q}</li>)}</ul></div></section>}
  </div></main>;
}
