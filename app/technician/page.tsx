"use client";

import { useEffect, useState } from "react";

const nextStatuses = ["TECHNICIAN_ON_THE_WAY", "INSPECTION", "ESTIMATE_PENDING", "CUSTOMER_APPROVAL_PENDING", "WORK_IN_PROGRESS", "PARTS_REQUIRED", "COMPLETED"];

export default function TechnicianPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/technician/jobs", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Unable to load jobs");
    setJobs(data.jobs ?? []);
  }

  async function update(id: string, status: string) {
    const response = await fetch(`/api/technician/jobs/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) { const data = await response.json(); setError(data.error || "Unable to update job"); return; }
    await load();
  }

  useEffect(() => { void load(); }, []);

  return (
    <main className="portalShell">
      <header className="portalHeader"><a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a><div><strong>Technician Workspace</strong><small>Assigned service jobs</small></div><a className="portalLink" href="/customer">Customer Portal</a></header>
      <section className="portalHero"><p className="eyebrow">TECHNICIAN PORTAL</p><h1>Your jobs, in one place.</h1><p>Open a job, review customer context, update status and keep the service timeline current.</p></section>
      {error && <div className="portalAlert">{error}</div>}
      <section className="jobList">{jobs.length === 0 ? <div className="emptyState"><h2>No assigned open jobs</h2><p>New assignments will appear here once a service manager assigns them.</p></div> : jobs.map(job => <article className="jobCard" key={job.id}><div className="jobTop"><strong>{job.publicTicketId}</strong><span>{job.priority}</span></div><h2>{job.serviceSlug}</h2><p>{job.problem || "No problem description provided."}</p><div className="jobMeta"><span>{job.customer.name}</span><span>{job.customer.phone}</span><span>{job.location || job.customer.city || "Location not specified"}</span></div><div className="jobActions"><select aria-label={`Update ${job.publicTicketId}`} value={job.status} onChange={e => void update(job.id, e.target.value)}><option value={job.status}>{job.status.replaceAll("_", " ")}</option>{nextStatuses.filter(s => s !== job.status).map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select><a className="portalButton" href={`tel:${job.customer.phone}`}>Call customer</a></div></article>)}</section>
    </main>
  );
}
