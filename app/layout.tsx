import type { Metadata } from "next";
import AnalyticsBeacon from "@/app/components/AnalyticsBeacon";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.minarvatechnologies.com"),
  title: {
    default: "Minarva Technologies | Technology, Security & Automation Solutions",
    template: "%s | Minarva Technologies",
  },
  description:
    "Premium technology, security, automation and business solutions from Minarva Technologies, Kawdiar, Trivandrum.",
  openGraph: {
    title: "Minarva Technologies",
    description: "Technology • Security • Automation • Business Solutions",
    type: "website",
    locale: "en_IN",
    siteName: "Minarva Technologies",
  },
  alternates: { canonical: "https://www.minarvatechnologies.com" },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Minarva Technologies",
  url: "https://www.minarvatechnologies.com",
  telephone: "+91 6235353732",
  email: "minarvatechnologies@gmail.com",
  foundingDate: "2013",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kawdiar",
    addressLocality: "Thiruvananthapuram",
    addressRegion: "Kerala",
    addressCountry: "IN",
  },
  areaServed: ["Thiruvananthapuram", "Kerala"],
  knowsAbout: ["Computer Sales & Service", "CCTV Camera Installation & Service", "Home Automation", "Gate Automation", "Solar Panel Solutions", "Inverter Solutions", "Business Management ERP Software", "Website Development"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AnalyticsBeacon />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
