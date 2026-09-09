import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Journey",
  description:
    "Start your journey with Explorers Choice. Choose a package, tell us about your trip and a real travel planner will confirm the details.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}