import { notFound } from "next/navigation";
import type { Metadata } from "next";

const services = {
  "computer-sales-service": { name: "Computer Sales & Service", summary: "Computer sales, upgrades, diagnostics and technical service for homes, shops and offices.", points: ["New and used laptop enquiries", "Desktop and computer support", "Upgrades and diagnostics", "Business and workplace technology support"] },
  "cctv-installation": { name: "CCTV Camera Installation", summary: "Plan and install CCTV security systems for homes, shops, offices and other properties.", points: ["Camera planning and coverage discussion", "DVR/NVR and storage requirements", "Installation and configuration", "Remote viewing setup where supported"] },
  "home-automation": { name: "Home Automation", summary: "Connected technology solutions designed around practical home and lifestyle needs.", points: ["Smart control concepts", "Connected devices and scenes", "Convenience and security workflows", "Consultation and solution planning"] },
  "gate-automation": { name: "Gate Automation", summary: "Automated access solutions for residential and commercial properties.", points: ["Gate automation consultation", "Operator and access planning", "Installation coordination", "Service and troubleshooting"] },
  "solar-solutions": { name: "Solar Solutions", summary: "Solar solution planning around your energy requirements and property context.", points: ["Requirement assessment", "System planning discussion", "Installation coordination", "Ongoing service support"] },
  "inverter-solutions": { name: "Inverter Solutions", summary: "Backup power solutions for homes, shops and offices.", points: ["Load and backup requirement discussion", "Inverter selection support", "Installation and setup", "Service and troubleshooting"] },
  "erp-software": { name: "Customized Business ERP Software", summary: "Business management software tailored to the processes you need to organize and scale.", points: ["Requirement discovery", "Custom workflow design", "Business dashboard concepts", "Future integration-ready architecture"] },
  "website-development": { name: "Website Development", summary: "Modern websites designed to support visibility, enquiries and business growth.", points: ["Responsive website development", "SEO-friendly information architecture", "Lead and enquiry flows", "Scalable content and landing-page foundations"] },
} as const;

type Slug = keyof typeof services;

export function generateStaticParams() { return Object.keys(services).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug as Slug];
  if (!service) return {};
  return { title: `${service.name} | Minarva Technologies`, description: service.summary };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug as Slug];
  if (!service) notFound();

  return (
    <main>
      <header className="nav"><a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a><nav><a href="/">Home</a><a href="/#services">Solutions</a><a href="/#contact">Contact</a></nav><a className="navCta" href="https://wa.me/916235353732">WhatsApp</a></header>
      <section className="serviceHero"><p className="eyebrow">MINARVA TECHNOLOGIES • TRIVANDRUM</p><h1>{service.name}</h1><p>{service.summary}</p><div className="actions"><a className="primary" href="/?service=${slug}#quote">Request a Quote <span>→</span></a><a className="secondary" href="tel:+916235353732">Call +91 62353 53732</a></div></section>
      <section className="section serviceContent"><div><p className="eyebrow">WHAT WE CAN HELP WITH</p><h2>A practical path from requirement to <span>solution.</span></h2></div><div className="servicePoints">{service.points.map((point) => <article key={point}><span>01</span><h3>{point}</h3><p>Discuss your requirement with the Minarva team and choose the right next step for your property or business.</p></article>)}</div></section>
      <section className="darkPanel serviceCta"><p className="eyebrow">NEED A RECOMMENDATION?</p><h2>Tell us what you need. <em>We’ll structure it.</em></h2><p>Use the enquiry flow to share your requirement. For site-dependent solutions, a professional survey may be appropriate before a final recommendation.</p><a className="lightCta" href="/?service=${slug}#quote">Start an enquiry →</a></section>
      <footer><div><a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a><p>Technology • Security • Automation • Business Solutions</p></div><div><strong>Kawdiar, Trivandrum, Kerala</strong><p>+91 62353 53732<br />minarvatechnologies@gmail.com</p></div></footer>
    </main>
  );
}
