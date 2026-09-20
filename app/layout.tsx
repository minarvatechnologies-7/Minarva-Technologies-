import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyticsBeacon from "@/app/components/AnalyticsBeacon";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.minarvatechnologies.com"),
  title: {
    default: "Minarva Technologies | CCTV, Computer, Networking & Smart Solutions",
    template: "%s | Minarva Technologies",
  },
  description:
    "Minarva Technologies provides CCTV installation, computer sales and service, networking, smart home, solar, inverter and business technology solutions in Thiruvananthapuram, Kerala.",
  keywords: [
    "CCTV installation Thiruvananthapuram",
    "computer service Thiruvananthapuram",
    "networking solutions Kerala",
    "home automation Thiruvananthapuram",
    "solar inverter solutions",
    "Minarva Technologies",
  ],
  openGraph: {
    title: "Minarva Technologies",
    description: "Security • IT • Networking • Smart Home • Solar & Power Solutions",
    type: "website",
    locale: "en_IN",
    siteName: "Minarva Technologies",
    url: "https://www.minarvatechnologies.com",
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
  address: {
    "@type": "PostalAddress",
    addressLocality: "Thiruvananthapuram",
    addressRegion: "Kerala",
    addressCountry: "IN",
  },
  areaServed: ["Thiruvananthapuram", "Kerala"],
  knowsAbout: [
    "CCTV Camera Installation & Service",
    "Computer & Laptop Sales and Service",
    "Networking & Wi-Fi",
    "Home Automation",
    "Biometric & Access Control",
    "Solar Solutions",
    "Inverter Solutions",
    "Business ERP Software",
    "Website Development",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <AnalyticsBeacon />
        </Suspense>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
