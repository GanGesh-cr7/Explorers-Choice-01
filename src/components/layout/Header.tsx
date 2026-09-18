"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/components/providers";

const navLinks = [
  { label: "Destinations", href: "/destinations" },
  { label: "Packages", href: "/packages" },
  { label: "Hotels", href: "/hotels" },
  { label: "Trains", href: "/trains" },
  { label: "About", href: "/about" },
  { label: "Customer Stories", href: "/stories" },
  { label: "Contact", href: "/contact" },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-baseline gap-0.5" aria-label="Explorers Choice home">
      <span
        className={`font-display text-2xl tracking-tight ${
          dark ? "text-ivory" : "text-forest"
        }`}
      >
        Explorers
      </span>
      <span className="text-terracotta font-display text-2xl">Choice</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
        scrolled || open
          ? "border-line bg-ivory/95 backdrop-blur-sm"
          : "border-transparent bg-ivory"
      }`}
    >
      <Container className="flex h-18 items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors hover:text-terracotta ${
                pathname.startsWith(link.href)
                  ? "text-forest"
                  : "text-charcoal-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {user?.role === "HOTEL_OWNER" && (
            <Link href="/hotel-owner" className="text-sm font-semibold text-charcoal-soft transition-colors hover:text-forest">My Hotels</Link>
          )}
          {user ? <Link href="/account" className="text-sm font-semibold text-charcoal-soft transition-colors hover:text-forest">{user.full_name || user.email}</Link> : <Link href="/login" className="text-sm font-semibold text-charcoal-soft transition-colors hover:text-forest">Login</Link>}
          <Button href="/book#trip" variant="primary" size="sm">
            Book Now
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md text-forest lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-ivory lg:hidden">
          <Container className="flex flex-col py-4">
            <nav className="flex flex-col" aria-label="Mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/60 py-4 text-base font-semibold text-charcoal last:border-0 hover:text-terracotta"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3">
              {user?.role === "HOTEL_OWNER" && (
                <Link href="/hotel-owner" onClick={() => setOpen(false)} className="rounded-full border border-forest/25 py-2.5 text-center text-sm font-semibold text-forest">My Hotels</Link>
              )}
              {user ? <Link href="/account" onClick={() => setOpen(false)} className="rounded-full border border-forest/25 py-2.5 text-center text-sm font-semibold text-forest">My Trips</Link> : <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-forest/25 py-2.5 text-center text-sm font-semibold text-forest">Login</Link>}
              <Button href="/book#trip" variant="primary" size="md" className="w-full" onClick={() => setOpen(false)}>
                Book Now
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
