import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

const services = {
  "computer-sales-service": { name: "Computer Sales & Service", summary: "Computer and laptop sales, upgrades, diagnostics and technical service for homes, shops and offices.", points: ["New and used laptop enquiries", "Desktop and computer support", "Upgrades and diagnostics", "Business and workplace technology support"] },
  "cctv-installation": { name: "CCTV Camera Installation", summary: "Plan and install CCTV security systems for homes, shops, offices and commercial properties in Thiruvananthapuram.", points: ["Camera planning and coverage discussion", "DVR/NVR and storage requirements", "Professional installation and configuration", "Remote viewing setup where supported"] },
  "home-automation": { name: "Home Automation", summary: "Practical connected-home, access-control and convenience solutions designed around the way you use your space.", points: ["Smart control concepts", "Connected devices and scenes", "Video door phone and access workflows", "Consultation and solution planning"] },
  "gate-automation": { name: "Gate Automation", summary: "Automated access solutions for residential and commercial properties.", points: ["Gate automation consultation", "Operator and access planning", "Installation coordination", "Service and troubleshooting"] },
  "solar-solutions": { name: "Solar Solutions", summary: "Solar solution planning around your energy requirements and property context.", points: ["Requirement assessment", "System planning discussion", "Installation coordination", "Ongoing service support"] },
  "inverter-solutions": { name: "Inverter Solutions", summary: "Backup power solutions for homes, shops and offices.", points: ["Load and backup requirement discussion", "Inverter selection support", "Installation and setup", "Service and troubleshooting"] },
  "erp-software": { name: "Customized Business ERP Software", summary: "Business management software tailored to the processes you need to organize and scale.", points: ["Requirement discovery", "Custom workflow design", "Business dashboard concepts", "Integration-ready architecture"] },
  "website-development": { name: "Website Development", summary: "Modern websites designed to support visibility, enquiries and business growth.", points: ["Responsive website development", "SEO-friendly information architecture", "Lead and enquiry flows", "Scalable landing-page foundations"] },
} as const;

type Slug = keyof typeof services;

export function generateStaticParams() { return Object.keys(services).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug as Slug];
  if (!service) return {};
  return { title: service.name, description: service.summary };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug as Slug];
  if (!service) notFound();

  return (
    <main className="site-page">
      <SiteHeader />
      <section className="serviceHero">
        <p className="eyebrow">MINARVA TECHNOLOGIES • THIRUVANANTHAPURAM</p>
        <h1>{service.name}</h1>
        <p>{service.summary}</p>
        <div className="actions">
          <Link className="site-btn site-btn-primary site-btn-lg" href={`/?service=${slug}#contact`}>Request a Quote <span>→</span></Link>
          <a className="site-btn site-btn-dark site-btn-lg" href="tel:+916235353732">Call +91 6235353732</a>
        </div>
      </section>
      <section className="section serviceContent">
        <div><p className="eyebrow">WHAT WE CAN HELP WITH</p><h2>A practical path from requirement to <span>solution.</span></h2></div>
        <div className="servicePoints">{service.points.map((point, index) => <article key={point}><span>0{index + 1}</span><h3>{point}</h3><p>Discuss your requirement with the Minarva team and choose the right next step for your property or business.</p></article>)}</div>
      </section>
      <section className="darkPanel serviceCta"><p className="eyebrow">NEED A RECOMMENDATION?</p><h2>Tell us what you need. <em>We’ll structure it.</em></h2><p>For site-dependent solutions, a professional survey may be appropriate before a final recommendation.</p><Link className="lightCta" href={`/?service=${slug}#contact`}>Start an enquiry →</Link></section>
      <SiteFooter />
    </main>
  );
}
