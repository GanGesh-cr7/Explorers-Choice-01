import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Cab | Explorers Choice",
  description:
    "Book local city rentals, airport transfers, and outstation cab rides across India. Instant request with email confirmation and transparent fares.",
};

export default function CabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}