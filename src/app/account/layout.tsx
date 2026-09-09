"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const navItems = [
  { label: "My Trips", href: "/account" },
  { label: "Payments", href: "/account/payments" },
  { label: "Documents", href: "/account/documents" },
  { label: "Profile", href: "/account/profile" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-full flex flex-col bg-ivory text-charcoal">
      <header className="border-b border-line bg-ivory-warm">
        <Container className="flex h-18 items-center justify-between">
          <Link href="/" className="group inline-flex items-baseline gap-0.5" aria-label="Explorers Choice home">
            <span className="font-display text-2xl tracking-tight text-forest">Explorers</span>
            <span className="text-terracotta font-display text-2xl">Choice</span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Account navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-colors hover:text-terracotta ${
                  pathname.startsWith(item.href) ? "text-forest" : "text-charcoal-soft"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-charcoal-soft hidden sm:block">{user?.full_name || user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </Container>
      </header>
      <main className="flex-1">
        <Container className="py-10 sm:py-16">{children}</Container>
      </main>
    </div>
  );
}