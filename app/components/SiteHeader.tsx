import Link from "next/link";

const navItems = [
  ["Home", "/"],
  ["CCTV & Security", "/services/cctv-installation"],
  ["Computers & IT", "/services/computer-sales-service"],
  ["Smart Solutions", "/services/home-automation"],
  ["Solar & Power", "/services/solar-solutions"],
  ["Business", "/business"],
];

export default function SiteHeader() {
  return (
    <>
      <div className="site-topbar">
        <div className="site-shell site-topbar-inner">
          <div className="site-topbar-left">
            <span>Thiruvananthapuram, Kerala</span>
            <a href="tel:+916235353732">+91 6235353732</a>
            <a href="mailto:minarvatechnologies@gmail.com">minarvatechnologies@gmail.com</a>
          </div>
          <div className="site-topbar-right">
            <Link href="/customer">Track Service</Link>
            <Link href="/login">Customer Login</Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="site-shell site-header-inner">
          <Link className="site-logo" href="/" aria-label="Minarva Technologies home">
            <img src="/brand/minarva-logo.jpg" alt="Minarva Technologies" />
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            <Link href="/#contact">Contact</Link>
          </nav>

          <div className="site-header-actions">
            <a className="site-btn site-btn-ghost site-hide-tablet" href="https://wa.me/916235353732" target="_blank" rel="noreferrer">WhatsApp</a>
            <Link className="site-btn site-btn-primary" href="/#contact">Get a Quote <span>→</span></Link>
          </div>

          <details className="site-mobile-menu">
            <summary aria-label="Open menu">☰</summary>
            <div className="site-mobile-menu-panel">
              {navItems.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
              <Link href="/#contact">Contact</Link>
              <a href="https://wa.me/916235353732" target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </details>
        </div>
      </header>
    </>
  );
}
