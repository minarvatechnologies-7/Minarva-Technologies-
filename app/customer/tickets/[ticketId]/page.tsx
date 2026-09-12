import Link from "next/link";

export default function CustomerTicketDetailPage() {
  return (
    <main className="portalPage">
      <header className="portalHeader"><Link className="brand" href="/customer">MINARVA<span>TECHNOLOGIES</span></Link><div><span>Service Ticket</span><Link className="textButton" href="/customer">Back to portal</Link></div></header>
      <section className="portalHero"><div><p className="eyebrow">SERVICE TRACKING</p><h1>Track your service request.</h1><p>Ticket details are loaded securely for the signed-in customer. Use the portal to follow status, appointment and service timeline updates.</p></div></section>
      <section className="portalGrid"><article className="portalPanel"><div className="panelTitle"><h2>Ticket access</h2><span>Customer only</span></div><p className="muted">This route is connected to the authenticated customer ticket API. A client-side detail view can consume <code>/api/customer/tickets/[ticketId]</code> without exposing another customer’s records.</p><Link className="primary" href="/customer">Return to service requests <span>→</span></Link></article><article className="portalPanel"><div className="panelTitle"><h2>What you can track</h2></div><div className="portalRow"><div><b>Current status</b><p>Latest service workflow state</p></div><span>Live</span></div><div className="portalRow"><div><b>Technician</b><p>Assigned technician context when available</p></div><span>Live</span></div><div className="portalRow"><div><b>Timeline</b><p>Status notes, photos and completion records</p></div><span>Live</span></div></article></section>
    </main>
  );
}
