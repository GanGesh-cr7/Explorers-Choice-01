import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Your Password",
  description: "Reset your Explorers Choice account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}