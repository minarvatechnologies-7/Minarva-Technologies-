import Link from "next/link";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

const audiences = [
  ["Shops", "CCTV, computers, networking, backup power and business technology support."],
  ["Offices", "Workplace computers, networking, security, websites and business software."],
  ["Schools", "Technology and security requirements organized around campus use cases."],
  ["Apartments", "Security, access and automation solutions for shared residential properties."],
  ["Hotels", "Technology, security, networking and automation solution enquiries."],
  ["Warehouses", "CCTV, access, networking and operational technology planning."],
  ["Small Businesses", "Practical technology stacks that can grow with the business."],
  ["Homes", "Security, automation, computers, networking and power solutions for modern homes."],
];

export default function BusinessSolutionsPage() {
  return <main className="site-page catalogPage">
    <SiteHeader />
    <section className="catalogHero section"><p className="eyebrow">BUSINESS & PROPERTY SOLUTIONS</p><h1>Technology designed around<br /><em>how your space works.</em></h1><p className="muted">Start with the problem, not the product. Choose your environment and turn the requirement into a structured enquiry, survey or project conversation.</p></section>
    <section className="section"><div className="grid">{audiences.map(([title,text],i)=><article className="card" key={title}><div className="num">0{i+1}</div><h2>{title}</h2><p>{text}</p><Link href={`/ai?business=${encodeURIComponent(title)}`}>Plan requirement ↗</Link></article>)}</div></section>
    <section className="section"><div className="projectBox"><div><p className="eyebrow">MULTI-SOLUTION PROJECT?</p><h2>Bring security, IT, networking and automation into one plan.</h2><p>Use the assistant or speak directly with the Minarva team to structure your requirement before quotation.</p></div><Link className="site-btn site-btn-primary" href="/#contact">Request a consultation <span>→</span></Link></div></section>
    <SiteFooter />
  </main>;
}
