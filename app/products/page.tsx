import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

const categories = [
  ["CCTV & Security", "Cameras, recorders, storage, access and security components"],
  ["Computers", "Laptops, desktops, upgrades and business setups"],
  ["Networking", "Wi-Fi, switches, routers, structured cabling and infrastructure"],
  ["Automation", "Home, access and gate automation solutions"],
  ["Solar & Power", "Solar and inverter solution enquiries"],
];

export default function ProductsPage() {
  return (
    <main className="site-page catalogPage">
      <SiteHeader />
      <section className="catalogHero section"><p className="eyebrow">PRODUCTS & EQUIPMENT</p><h1>Explore solutions.<br /><em>Request the right fit.</em></h1><p className="muted">Live stock and pricing should only be published when connected to verified inventory. Until then, use this catalogue to start a product or project enquiry.</p></section>
      <section className="section"><div className="grid">{categories.map(([title, text], i) => <article className="card" key={title}><div className="num">0{i + 1}</div><h2>{title}</h2><p>{text}</p><Link href="/#contact">Request options ↗</Link></article>)}</div></section>
      <section className="section"><div className="projectBox"><div><p className="eyebrow">NEED HELP CHOOSING?</p><h2>Tell us the use case, not just the model number.</h2><p>Share your requirement and we can help narrow down the most practical product category and configuration.</p></div><Link className="site-btn site-btn-primary" href="/ai">Ask the AI Assistant <span>→</span></Link></div></section>
      <SiteFooter />
    </main>
  );
}
