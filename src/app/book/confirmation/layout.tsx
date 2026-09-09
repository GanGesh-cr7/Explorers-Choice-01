import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmation",
  description: "View your Explorers Choice booking confirmation and next steps by booking reference.",
  robots: { index: false, follow: false },
};

export default function ConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}