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
    locale: "en_US",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Explorers Choice Tours — Journeys Worth Remembering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explorers Choice — Journeys Worth Remembering",
    description:
      "Carefully chosen journeys, memorable places, and a travel team that handles the details.",
    images: ["/images/og-cover.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
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
