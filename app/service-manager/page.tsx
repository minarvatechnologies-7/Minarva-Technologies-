import Link from "next/link";

export default function ServiceManagerPage() {
  return (
    <main className="portalShell">
      <header className="portalHeader"><Link className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></Link><div><strong>Service Operations</strong><small>Management workspace</small></div><Link className="portalLink" href="/admin">Growth Center</Link></header>
      <section className="portalHero"><p className="eyebrow">SERVICE OPERATIONS</p><h1>Keep every job moving.</h1><p>Review incoming service requests, prioritize work, assign technicians and maintain a clear ticket trail.</p></section>
      <section className="portalGrid"><article className="portalCard"><span className="portalIcon">01</span><h2>Open queue</h2><p>See all active tickets by priority, service, location and current status.</p><Link href="/admin">Open ticket queue →</Link></article><article className="portalCard"><span className="portalIcon">02</span><h2>Assignments</h2><p>Match active technicians to jobs and move tickets into an explicit assigned state.</p><Link href="/admin">Manage assignments →</Link></article><article className="portalCard"><span className="portalIcon">03</span><h2>Service history</h2><p>Use ticket timelines to keep inspection notes, photos, parts and completion events traceable.</p><Link href="/admin">Review operations →</Link></article></section>
    </main>
  );
}
