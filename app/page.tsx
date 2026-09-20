import Link from "next/link";
import LeadForm from "@/app/components/LeadForm";
import AIAssistantLauncher from "@/app/components/AIAssistantLauncher";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";

const services = [
  {
    icon: "camera",
    title: "CCTV & Security Systems",
    text: "Camera planning, installation, DVR/NVR setup, mobile viewing and service support for homes and businesses.",
    href: "/services/cctv-installation",
    meta: "Home • Shop • Office",
  },
  {
    icon: "computer",
    title: "Computer & Laptop Solutions",
    text: "Sales, upgrades, diagnostics, repair and dependable on-site IT support for personal and business use.",
    href: "/services/computer-sales-service",
    meta: "Sales • Service • Upgrades",
  },
  {
    icon: "network",
    title: "Networking & Wi-Fi",
    text: "Structured connectivity, Wi-Fi coverage, switches, routers and infrastructure planning for reliable day-to-day operations.",
    href: "/#contact",
    meta: "LAN • Wi-Fi • Infrastructure",
  },
  {
    icon: "smart",
    title: "Smart Home & Access",
    text: "Home automation, video door phones, biometric access and practical smart-control solutions designed around your space.",
    href: "/services/home-automation",
    meta: "Automation • VDP • Access",
  },
  {
    icon: "solar",
    title: "Solar & Power Backup",
    text: "Solar and inverter solutions planned around your load, property and backup requirements.",
    href: "/services/solar-solutions",
    meta: "Solar • Inverter • Backup",
  },
  {
    icon: "software",
    title: "Business Software & Web",
    text: "Customized ERP workflows, business tools and modern websites built to support operations, visibility and growth.",
    href: "/services/erp-software",
    meta: "ERP • Websites • Digital",
  },
];

const process = [
  ["01", "Understand", "We start with the actual requirement, property context, priorities and budget range."],
  ["02", "Plan", "The right hardware, coverage, installation approach or software path is structured clearly."],
  ["03", "Deliver", "Products, installation, configuration and handover are handled with practical documentation."],
  ["04", "Support", "Service, warranty guidance and future upgrades stay easier to manage after installation."],
];

const faqs = [
  ["Do you provide on-site service in Thiruvananthapuram?", "Yes. Site-dependent work such as CCTV, networking, automation, solar and computer support can be handled on-site based on availability and requirement."],
  ["Can CCTV be viewed from a mobile phone?", "Yes, where the selected camera/recorder platform supports remote access and the site has suitable internet connectivity. We can configure mobile viewing during installation."],
  ["Do you support homes as well as businesses?", "Yes. Minarva Technologies serves residential, retail, office and other commercial requirements."],
  ["Can I request a site survey or quotation online?", "Yes. Use the enquiry form below, WhatsApp us, or use the CCTV Planner for an initial requirement summary."],
  ["Do you work with major security brands?", "We can source and support leading security brands based on project fit, availability and customer requirement."],
];

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    camera: <><path d="M4 8.5 18 5v10L4 11.5z"/><path d="M18 8h2.5a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 20.5 12H18"/><path d="M8 13v3"/><path d="M6 16h4"/></>,
    computer: <><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></>,
    network: <><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="m7.8 7.2 3 8.6M16.2 7.2l-3 8.6M8 6h8"/></>,
    smart: <><path d="M12 3a7 7 0 0 0-4.2 12.6c.8.6 1.2 1.5 1.2 2.4h6c0-.9.4-1.8 1.2-2.4A7 7 0 0 0 12 3z"/><path d="M9.5 21h5"/><path d="M9 18h6"/></>,
    solar: <><circle cx="7" cy="7" r="3"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4"/><path d="M14 12h7l-1 8h-7z"/><path d="m15 15 4-1M14.5 18l4-1"/></>,
    software: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="m8 14 2 2-2 2M13 18h3"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function Home() {
  return (
    <main className="site-page">
      <SiteHeader />

      <section className="site-hero" id="top">
        <div className="site-hero-pattern" />
        <div className="site-shell site-hero-grid">
          <div className="site-hero-copy">
            <p className="site-kicker">THIRUVANANTHAPURAM • SECURITY • IT • AUTOMATION</p>
            <h1>Technology that <span>protects, connects</span> & powers your world.</h1>
            <p className="site-hero-lead">One trusted technology partner for CCTV, computers, networking, smart home, solar, power backup and business solutions.</p>
            <div className="site-hero-actions">
              <a className="site-btn site-btn-primary site-btn-lg" href="#contact">Book a Free Consultation <span>→</span></a>
              <a className="site-btn site-btn-dark site-btn-lg" href="https://wa.me/916235353732" target="_blank" rel="noreferrer">Chat on WhatsApp</a>
            </div>
            <div className="site-proof-row">
              <span>✓ Professional installation</span>
              <span>✓ On-site support</span>
              <span>✓ Mobile viewing setup</span>
            </div>
          </div>

          <div className="site-hero-visual" aria-label="Minarva CCTV and technology solutions">
            <div className="site-hero-image-wrap">
              <img src="/site/home-cctv.jpg" alt="CCTV installation for a modern home" />
              <div className="site-hero-image-shade" />
            </div>
            <div className="site-floating-card site-floating-card-top">
              <span className="site-dot" />
              <div><strong>Remote Monitoring</strong><small>View supported CCTV systems from your phone</small></div>
            </div>
            <div className="site-floating-card site-floating-card-bottom">
              <Icon name="camera" />
              <div><strong>Security for every space</strong><small>Home • Shop • Office • Commercial</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-trust-strip">
        <div className="site-shell site-trust-grid">
          <div><strong>Security</strong><span>CCTV, access & surveillance</span></div>
          <div><strong>IT</strong><span>Computers, service & networking</span></div>
          <div><strong>Automation</strong><span>Smart home & convenience</span></div>
          <div><strong>Power</strong><span>Solar & inverter solutions</span></div>
        </div>
      </section>

      <section className="site-section" id="services">
        <div className="site-shell">
          <div className="site-section-head">
            <div>
              <p className="site-kicker">COMPLETE TECHNOLOGY SOLUTIONS</p>
              <h2>Everything you need, <span>under one roof.</span></h2>
            </div>
            <p>Choose a single service or build a complete solution. We focus on practical recommendations, clean installation and dependable support.</p>
          </div>

          <div className="site-service-grid">
            {services.map((service) => (
              <article className="site-service-card" key={service.title}>
                <div className="site-service-icon"><Icon name={service.icon} /></div>
                <div className="site-service-meta">{service.meta}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <Link href={service.href}>Explore solution <span>↗</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-showcase">
        <div className="site-shell">
          <div className="site-section-head site-section-head-light">
            <div>
              <p className="site-kicker site-kicker-light">SECURITY, BUILT AROUND REAL SPACES</p>
              <h2>See what better protection <span>looks like.</span></h2>
            </div>
            <p>From retail counters to family homes, the right surveillance plan should be easy to use, neatly installed and appropriate for the actual risk points.</p>
          </div>

          <div className="site-showcase-grid">
            <article className="site-showcase-card site-showcase-tall">
              <img src="/site/business-security.jpg" alt="Retail and office CCTV security solutions" />
              <div className="site-showcase-overlay"><span>BUSINESS SECURITY</span><h3>Shops & Offices</h3><p>Retail, office and commercial CCTV with professional setup.</p></div>
            </article>
            <article className="site-showcase-card">
              <img src="/site/day-night.jpg" alt="Day and night security monitoring" />
              <div className="site-showcase-overlay"><span>24/7 AWARENESS</span><h3>Day & Night Monitoring</h3></div>
            </article>
            <article className="site-showcase-card site-showcase-blue">
              <div className="site-showcase-blue-content">
                <span>CCTV PLANNER</span>
                <h3>Not sure how many cameras you need?</h3>
                <p>Use our guided CCTV Planner to organize your property, coverage and priority before speaking with our team.</p>
                <Link className="site-btn site-btn-light" href="/cctv-planner">Plan My CCTV Setup <span>→</span></Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="site-section site-about" id="about">
        <div className="site-shell site-about-grid">
          <div className="site-about-copy">
            <p className="site-kicker">ABOUT MINARVA TECHNOLOGIES</p>
            <h2>One team for the technology behind <span>your home and business.</span></h2>
            <p>Minarva Technologies brings security, IT, automation, power and digital solutions together so customers can work with one practical technology partner instead of coordinating multiple vendors.</p>
            <div className="site-feature-list">
              <div><b>01</b><span><strong>Requirement-first approach</strong><small>We start with what you actually need, not a pre-set package.</small></span></div>
              <div><b>02</b><span><strong>Professional setup</strong><small>Clean installation, configuration and handover for supported solutions.</small></span></div>
              <div><b>03</b><span><strong>Support after installation</strong><small>Service and troubleshooting when your system needs attention.</small></span></div>
            </div>
          </div>
          <div className="site-about-panel">
            <p className="site-mini-label">POPULAR SECURITY & IT BRANDS</p>
            <div className="site-brand-cloud">
              {['Hikvision','Dahua','CP Plus','Prama','Honeywell','ZKTeco','Trueview','TVS','W-Box'].map((brand) => <span key={brand}>{brand}</span>)}
            </div>
            <div className="site-about-contact-card">
              <p>Need help choosing the right solution?</p>
              <strong>Talk to Minarva.</strong>
              <a href="tel:+916235353732">+91 6235353732</a>
            </div>
          </div>
        </div>
      </section>

      <section className="site-process">
        <div className="site-shell">
          <div className="site-section-head site-section-head-light">
            <div><p className="site-kicker site-kicker-light">HOW WE WORK</p><h2>A clearer path from <span>requirement to solution.</span></h2></div>
            <p>No confusing process. Tell us the problem, get the right recommendation, complete the installation or service, and keep support within reach.</p>
          </div>
          <div className="site-process-grid">
            {process.map(([num, title, text]) => <article key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="site-section site-business-banner">
        <div className="site-shell site-business-inner">
          <div>
            <p className="site-kicker">FOR HOMES, SHOPS, OFFICES & COMMERCIAL SPACES</p>
            <h2>Need a complete technology plan for your property or business?</h2>
            <p>We can combine CCTV, computers, networking, automation, power and digital systems into one structured requirement.</p>
          </div>
          <div className="site-business-actions">
            <Link className="site-btn site-btn-primary site-btn-lg" href="/business">Explore Business Solutions <span>→</span></Link>
            <Link className="site-btn site-btn-ghost site-btn-lg" href="/ai">Use AI Assistant</Link>
          </div>
        </div>
      </section>

      <section className="site-section site-faq">
        <div className="site-shell site-faq-grid">
          <div className="site-faq-intro">
            <p className="site-kicker">COMMON QUESTIONS</p>
            <h2>Quick answers before you <span>get in touch.</span></h2>
            <p>For project-specific recommendations, share the property and requirement details so the solution can be assessed correctly.</p>
          </div>
          <div className="site-faq-list">
            {faqs.map(([q,a]) => <details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="site-contact" id="contact">
        <div className="site-shell site-contact-grid">
          <div className="site-contact-copy">
            <p className="site-kicker site-kicker-light">LET’S TALK</p>
            <h2>Tell us what you need. <span>We’ll help plan the next step.</span></h2>
            <p>Request a quote, site visit or consultation. For urgent service enquiries, WhatsApp or call us directly.</p>
            <div className="site-contact-methods">
              <a href="tel:+916235353732"><b>Call / WhatsApp</b><span>+91 6235353732</span></a>
              <a href="mailto:minarvatechnologies@gmail.com"><b>Email</b><span>minarvatechnologies@gmail.com</span></a>
              <div><b>Location</b><span>Thiruvananthapuram, Kerala</span></div>
            </div>
          </div>
          <div className="site-form-card"><LeadForm /></div>
        </div>
      </section>

      <SiteFooter />
      <a className="site-whatsapp-fab" href="https://wa.me/916235353732" target="_blank" rel="noreferrer" aria-label="Chat with Minarva Technologies on WhatsApp">WhatsApp</a>
      <AIAssistantLauncher />
    </main>
  );
}
