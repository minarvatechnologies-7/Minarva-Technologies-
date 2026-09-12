"use client";

import { FormEvent, useEffect, useState } from "react";

const nextStatuses = ["TECHNICIAN_ON_THE_WAY", "INSPECTION", "ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED", "COMPLETED"];

export default function TechnicianPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/technician/jobs", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Unable to load jobs");
    setJobs(data.jobs ?? []);
  }

  async function update(id: string, status?: string, note?: string) {
    setError("");
    setMessage("");
    const response = await fetch("/api/technician/work", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ticketId: id, status, note }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Unable to update job"); return; }
    setNotes((current) => ({ ...current, [id]: "" }));
    setMessage(`${data.publicTicketId} updated successfully.`);
    await load();
  }

  useEffect(() => { void load(); }, []);

  function submitNote(event: FormEvent, id: string) {
    event.preventDefault();
    const note = notes[id]?.trim();
    if (note) void update(id, undefined, note);
  }

  return (
    <main className="portalShell">
      <header className="portalHeader"><a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a><div><strong>Technician Workspace</strong><small>Assigned service jobs</small></div><a className="portalLink" href="/customer">Customer Portal</a></header>
      <section className="portalHero"><p className="eyebrow">TECHNICIAN PORTAL</p><h1>Your jobs, in one place.</h1><p>Review customer context, update progress and leave a traceable work note for every assigned ticket.</p></section>
      {error && <div className="portalAlert">{error}</div>}
      {message && <div className="portalNotice">{message}</div>}
      <section className="jobList">
        {jobs.length === 0 ? <div className="emptyState"><h2>No assigned open jobs</h2><p>New assignments will appear here once a service manager assigns them.</p></div> : jobs.map(job => (
          <article className="jobCard" key={job.id}>
            <div className="jobTop"><strong>{job.publicTicketId}</strong><span>{job.priority}</span></div>
            <h2>{job.serviceSlug}</h2>
            <p>{job.problem || "No problem description provided."}</p>
            <div className="jobMeta"><span>{job.customer.name}</span><span>{job.customer.phone}</span><span>{job.location || job.customer.city || "Location not specified"}</span></div>
            {job.appointment?.scheduledAt && <div className="jobMeta"><span>Appointment: {new Date(job.appointment.scheduledAt).toLocaleString("en-IN")}</span></div>}
            {job.timeline?.length > 0 && <div className="jobTimeline"><b>Latest timeline</b>{job.timeline.slice(0, 3).map((entry: any, index: number) => <div key={`${entry.createdAt}-${index}`}><span>{entry.status.replaceAll("_", " ")}</span><small>{entry.note || "Status updated"} · {new Date(entry.createdAt).toLocaleString("en-IN")}</small></div>)}</div>}
            <div className="jobActions"><select aria-label={`Update ${job.publicTicketId}`} value={job.status} onChange={e => void update(job.id, e.target.value)}><option value={job.status}>{job.status.replaceAll("_", " ")}</option>{nextStatuses.filter(s => s !== job.status).map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select><a className="portalButton" href={`tel:${job.customer.phone}`}>Call customer</a></div>
            <form className="workNoteForm" onSubmit={(event) => submitNote(event, job.id)}><textarea rows={3} value={notes[job.id] || ""} onChange={e => setNotes((current) => ({ ...current, [job.id]: e.target.value }))} placeholder="Add inspection findings, work performed, parts needed, or customer remarks…" /><button className="portalButton" type="submit">Save work note</button></form>
          </article>
        ))}
      </section>
    </main>
  );
}
