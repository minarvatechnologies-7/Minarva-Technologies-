import type { Metadata } from "next";
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
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
