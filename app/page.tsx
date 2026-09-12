import LeadForm from "@/app/components/LeadForm";

const services = [
  { title: "Computer Sales & Service", text: "Reliable computers, upgrades, diagnostics and technical support." },
  { title: "CCTV & Security", text: "CCTV installation, service and security solutions for homes and businesses." },
  { title: "Home Automation", text: "Connected, convenient and smarter living solutions." },
  { title: "Gate Automation", text: "Practical automated access solutions for modern properties." },
  { title: "Solar Solutions", text: "Solar solutions designed around your energy requirements." },
  { title: "Inverter Solutions", text: "Backup power solutions for homes, shops and offices." },
  { title: "Business ERP Software", text: "Customized management software for growing businesses." },
  { title: "Website Development", text: "Fast, modern websites built to support business growth." },
];

const audiences = ["Shops", "Offices", "Homes", "Apartments", "Schools", "Hotels", "Warehouses", "Small Businesses"];

export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top">MINARVA<span>TECHNOLOGIES</span></a>
        <nav aria-label="Primary navigation">
          <a href="#services">Solutions</a><a href="#process">How it works</a><a href="#projects">Projects</a><a href="#contact">Contact</a>
        </nav>
        <a className="navCta" href="https://wa.me/916235353732">WhatsApp</a>
      </header>

      <section id="top" className="hero">
        <div className="heroGlow" />
        <p className="eyebrow">TECHNOLOGY • SECURITY • AUTOMATION • BUSINESS SOLUTIONS</p>
        <h1>Build a smarter, safer business with <em>Minarva.</em></h1>
        <p className="heroCopy">Premium technology and security solutions for homes, shops and businesses in Trivandrum — from computers and CCTV to automation, energy and custom software.</p>
        <div className="actions"><a className="primary" href="#quote">Get a Quote <span>→</span></a><a className="secondary" href="tel:+916235353732">Call +91 62353 53732</a></div>
        <div className="trust"><span>Since 2013</span><span>•</span><span>Kawdiar, Trivandrum</span><span>•</span><span>Service-led technology partner</span></div>
      </section>

      <section id="services" className="section">
        <div className="sectionHead"><div><p className="eyebrow">ONE PARTNER. MANY SOLUTIONS.</p><h2>Technology that works<br /><span>for your business.</span></h2></div><p>From a dependable computer setup to a complete business technology stack, choose the solution you need today and scale when you are ready.</p></div>
        <div className="grid">{services.map((service, i) => <article className={`card ${i === 1 ? "featured" : ""}`} key={service.title}><div className="num">0{i + 1}</div><h3>{service.title}</h3><p>{service.text}</p><a href="#quote">Explore solution <span>↗</span></a></article>)}</div>
      </section>

      <section className="split" id="process">
        <div className="darkPanel"><p className="eyebrow">FROM ENQUIRY TO COMPLETION</p><h2>A better service experience, <em>by design.</em></h2><p>Tell us what you need. We structure the requirement, recommend the right path and keep the journey clear.</p><a className="lightCta" href="#quote">Book a free consultation →</a></div>
        <div className="steps"><div><b>01</b><h3>Understand</h3><p>We capture your requirement, property context and priorities.</p></div><div><b>02</b><h3>Recommend</h3><p>Get a practical solution tailored to your use case and budget.</p></div><div><b>03</b><h3>Deliver</h3><p>Installation, service or implementation with a clear job trail.</p></div><div><b>04</b><h3>Support</h3><p>Service history, warranty information and future support stay organized.</p></div></div>
      </section>

      <section className="audience section"><p className="eyebrow">BUILT FOR REAL-WORLD NEEDS</p><h2>Solutions for the places<br /><span>that matter.</span></h2><div className="pills">{audiences.map(a => <span key={a}>{a}</span>)}</div></section>

      <section id="projects" className="section project"><div className="projectBox"><div><p className="eyebrow">PROJECTS & KNOWLEDGE</p><h2>Turn every successful project into your next growth opportunity.</h2><p>Our platform architecture is ready for project stories, case studies, FAQs, guides and conversion-focused landing pages — without inventing customer claims or results.</p></div><a className="primary" href="#quote">Start a project <span>→</span></a></div></section>

      <section id="quote" className="quote section"><div><p className="eyebrow">LET’S TALK</p><h2>Have a requirement?<br /><em>Let’s make a plan.</em></h2><p>Request a quote, site survey or consultation. Your enquiry now enters the platform lead pipeline for qualification and follow-up.</p></div><LeadForm /></section>

      <footer id="contact"><div><a className="brand" href="#top">MINARVA<span>TECHNOLOGIES</span></a><p>Technology • Security • Automation • Business Solutions</p></div><div><strong>Kawdiar, Trivandrum, Kerala</strong><p>+91 62353 53732<br />minarvatechnologies@gmail.com<br />www.minarvatechnologies.com</p></div></footer>
    </main>
  );
}
