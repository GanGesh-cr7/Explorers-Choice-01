"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Container } from "@/components/ui/Container";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Enquiries", href: "/admin/enquiries" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Destinations", href: "/admin/destinations" },
  { label: "Packages", href: "/admin/packages" },
  { label: "Hotels", href: "/admin/hotels" },
  { label: "Offers", href: "/admin/offers" },
  { label: "Stories", href: "/admin/stories" },
  { label: "Staff", href: "/admin/staff", adminOnly: true },
  { label: "Settings", href: "/admin/settings", adminOnly: true },
  { label: "Audit Log", href: "/admin/audit-log", managerOnly: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !user.is_staff)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";
  const visibleNav = navItems.filter((item) => {
    if (item.adminOnly && user?.role !== "ADMIN") return false;
    if (item.managerOnly && !isManager) return false;
    return true;
  });

  const activeLinkRef = (el: HTMLAnchorElement | null) => {
    if (el) {
      el.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
    }
  };

  if (loading || !user || !user.is_staff) {
    return (
      <div className="min-h-full flex items-center justify-center bg-ivory px-6">
        <p className="text-sm text-charcoal-soft">Loading workspace…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-ivory text-charcoal">
      <header className="border-b border-line bg-forest text-ivory">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/admin" className="inline-flex items-baseline gap-0.5" aria-label="Explorers Choice workspace">
            <span className="font-display text-xl tracking-tight text-ivory">Explorers</span>
            <span className="font-display text-xl text-terracotta-light">Choice</span>
            <span className="ml-2 rounded-full border border-ivory/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ivory/80">
              Workspace
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden text-sm text-ivory/80 transition-colors hover:text-ivory sm:block">
              View site
            </Link>
            <span className="truncate text-sm text-ivory/80 hidden md:block">{user.full_name || user.email}</span>
            <span className="rounded-full border border-terracotta-light/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-terracotta-light">
              {user.role}
            </span>
          </div>
        </Container>
      </header>

      <nav aria-label="Workspace navigation" className="sticky top-0 z-10 border-b border-line bg-ivory">
        <Container className="flex gap-2 overflow-x-auto py-3 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={active ? activeLinkRef : undefined}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-forest bg-forest text-ivory"
                    : "border-line bg-ivory text-charcoal-soft hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </Container>
      </nav>

      <main className="flex-1">
        <Container className="py-10 sm:py-12">{children}</Container>
      </main>
    </div>
  );
}