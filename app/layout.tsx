import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// The font variable sits on <html>: the Dashboard shell tokens live on :root and read it from there.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const DESCRIPTION = "Mark your own visit by browser time zone or add simulated ones, and see them on a map of five fixed cities. Kept in this browser; not analytics.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Visitor Map | Bookchaowalit",
  description: DESCRIPTION,
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  openGraph: { type: "website", title: "Visitor Map | Bookchaowalit", description: DESCRIPTION, siteName: "Bookchaowalit" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
