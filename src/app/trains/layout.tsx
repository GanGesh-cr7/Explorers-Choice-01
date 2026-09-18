import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Train Tickets & Live PNR Status | Explorers Choice",
  description:
    "Book IRCTC train tickets across India with instant confirmation, live seat availability, Vande Bharat Express schedules, and live PNR tracking.",
};

export default function TrainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
