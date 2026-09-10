import type { Metadata } from "next";
import { Manrope, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout/LayoutShell";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const serifDisplay = DM_Serif_Display({
  variable: "--font-serif-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Explorers Choice — Journeys Worth Remembering",
    template: "%s | Explorers Choice",
  },
  description:
    "Carefully chosen journeys, memorable places, and a travel team that handles the details. Explore curated destinations and packages with Explorers Choice.",
  openGraph: {
    type: "website",
    title: "Explorers Choice — Journeys Worth Remembering",
    description:
      "Carefully chosen journeys, memorable places, and a travel team that handles the details.",
    siteName: "Explorers Choice",
  },
  twitter: {
    card: "summary",
    title: "Explorers Choice — Journeys Worth Remembering",
    description:
      "Carefully chosen journeys, memorable places, and a travel team that handles the details.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${serifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
