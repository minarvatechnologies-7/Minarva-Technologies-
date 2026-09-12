import Link from "next/link";

const audiences = [
  ["Shops", "CCTV, computers, networking, backup power and business technology support."],
  ["Offices", "Workplace computers, networking, security, websites and business software."],
  ["Schools", "Technology and security requirements organized around campus use cases."],
  ["Hospitals", "Security, computing and infrastructure enquiries for operational environments."],
  ["Apartments", "Security and automation solutions for shared residential properties."],
  ["Hotels", "Technology, security, networking and automation solution enquiries."],
  ["Warehouses", "CCTV, access, networking and operational technology planning."],
  ["Small Businesses", "Practical technology stacks that can grow with the business."],
];

export default function BusinessSolutionsPage() {
  return <main className="catalogPage">
    <header className="portalHeader"><Link className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></Link><div><span>B2B SOLUTIONS</span><Link className="secondary" href="/">Back</Link></div></header>
    <section className="catalogHero section"><p className="eyebrow">BUSINESS SOLUTIONS</p><h1>Technology designed around<br /><em>how businesses operate.</em></h1><p className="muted">Start with the problem, not the product. Choose your business type and turn the requirement into a structured enquiry, survey or project conversation.</p></section>
    <section className="section"><div className="grid">{audiences.map(([title,text],i)=><article className="card" key={title}><div className="num">0{i+1}</div><h2>{title}</h2><p>{text}</p><Link href={`/ai?business=${encodeURIComponent(title)}`}>Plan requirement ↗</Link></article>)}</div></section>
    <section className="section"><div className="projectBox"><div><p className="eyebrow">B2B DISCOVERY</p><h2>Need a broader technology plan?</h2><p>Use the assistant to organize your requirement, then hand it to the CRM for a qualified follow-up.</p></div><Link className="primary" href="/ai">Start discovery <span>→</span></Link></div></section>
  </main>;
}
