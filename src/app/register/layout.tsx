import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create your Explorers Choice account to keep your trips, payments and travel documents in one place.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}