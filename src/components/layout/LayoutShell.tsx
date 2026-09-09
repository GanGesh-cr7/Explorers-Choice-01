"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccount = pathname.startsWith("/account");

  return (
    <AuthProvider>
      {!isAccount && <Header />}
      <main className="flex-1">{children}</main>
      {!isAccount && <Footer />}
    </AuthProvider>
  );
}