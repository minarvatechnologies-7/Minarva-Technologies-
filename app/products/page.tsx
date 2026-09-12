import Link from "next/link";

const categories = [
  ["Computers", "Laptops, desktops, upgrades and business setups"],
  ["CCTV & Security", "Cameras, recorders, storage and security components"],
  ["Networking", "Connectivity, networking and infrastructure"],
  ["Automation", "Home and gate automation solutions"],
  ["Energy", "Solar and inverter solution enquiries"],
];

export default function ProductsPage() {
  return (
    <main className="catalogPage">
      <header className="portalHeader">
        <Link className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></Link>
        <div><span>PRODUCT CATALOGUE</span><Link className="secondary" href="/">Back to website</Link></div>
      </header>
      <section className="catalogHero section">
        <p className="eyebrow">PRODUCTS & EQUIPMENT</p>
        <h1>Explore solutions.<br /><em>Request the right fit.</em></h1>
        <p className="muted">The catalogue is structured for products, specifications, images, enquiry, quotation and related service journeys. Live stock and pricing appear only when connected to real business data.</p>
      </section>
      <section className="section">
        <div className="grid">{categories.map(([title, text], i) => <article className="card" key={title}><div className="num">0{i + 1}</div><h2>{title}</h2><p>{text}</p><Link href={`/products/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>Browse category ↗</Link></article>)}</div>
      </section>
      <section className="section"><div className="projectBox"><div><p className="eyebrow">USED LAPTOPS</p><h2>Looking for a used laptop?</h2><p>Used-device listings can be published here with condition, specifications and enquiry details once verified inventory is connected.</p></div><Link className="primary" href="/ai">Ask the AI Assistant <span>→</span></Link></div></section>
    </main>
  );
}
