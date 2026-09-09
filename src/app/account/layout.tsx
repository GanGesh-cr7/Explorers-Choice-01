"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Container } from "@/components/ui/Container";

const navItems = [
  { label: "My Trips", href: "/account" },
  { label: "Payments", href: "/account/payments" },
  { label: "Documents", href: "/account/documents" },
  { label: "Profile", href: "/account/profile" },
];

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === "/account" || pathname.startsWith("/account/bookings");
  return pathname.startsWith(href);
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-full flex items-center justify-center bg-ivory px-6">
        <p className="text-sm text-charcoal-soft">Loading your journeys…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-ivory text-charcoal">
      <header className="border-b border-line bg-ivory-warm">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="group inline-flex items-baseline gap-0.5" aria-label="Explorers Choice home">
            <span className="font-display text-xl tracking-tight text-forest">Explorers</span>
            <span className="text-terracotta font-display text-xl">Choice</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="truncate text-sm text-charcoal-soft hidden sm:block">{user.full_name || user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="shrink-0 rounded-full border border-forest/30 px-4 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
            >
              Sign out
            </button>
          </div>
        </Container>
      </header>

      <nav
        aria-label="Account navigation"
        className="sticky top-0 z-10 border-b border-line bg-ivory"
      >
        <Container className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive(pathname, item.href)
                  ? "border-forest bg-forest text-ivory"
                  : "border-line bg-ivory text-charcoal-soft hover:text-forest"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </Container>
      </nav>

      <main className="flex-1">
        <Container className="py-10 sm:py-16">{children}</Container>
      </main>
    </div>
  );
}