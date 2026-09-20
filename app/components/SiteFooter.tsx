import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-shell site-footer-grid">
        <div className="site-footer-brand">
          <img src="/brand/minarva-logo.jpg" alt="Minarva Technologies" />
          <p>Security, IT, automation and power solutions for homes and businesses in Thiruvananthapuram.</p>
          <div className="site-social-links" aria-label="Social links">
            <a href="https://www.instagram.com/minarvatechnologies" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://wa.me/916235353732" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>

        <div>
          <h3>Solutions</h3>
          <Link href="/services/cctv-installation">CCTV & Security</Link>
          <Link href="/services/computer-sales-service">Computer Sales & Service</Link>
          <Link href="/services/home-automation">Home Automation</Link>
          <Link href="/services/solar-solutions">Solar Solutions</Link>
          <Link href="/services/inverter-solutions">Inverter Solutions</Link>
        </div>

        <div>
          <h3>Quick links</h3>
          <Link href="/products">Products</Link>
          <Link href="/business">Business Solutions</Link>
          <Link href="/cctv-planner">CCTV Planner</Link>
          <Link href="/ai">AI Assistant</Link>
          <Link href="/customer">Service Portal</Link>
        </div>

        <div className="site-footer-contact">
          <h3>Contact</h3>
          <p><strong>Thiruvananthapuram, Kerala</strong></p>
          <a href="tel:+916235353732">+91 6235353732</a>
          <a href="mailto:minarvatechnologies@gmail.com">minarvatechnologies@gmail.com</a>
          <a href="https://www.minarvatechnologies.com">www.minarvatechnologies.com</a>
        </div>
      </div>
      <div className="site-shell site-footer-bottom">
        <span>© {new Date().getFullYear()} Minarva Technologies. All rights reserved.</span>
        <span>Smarter solutions for a safer tomorrow.</span>
      </div>
    </footer>
  );
}
