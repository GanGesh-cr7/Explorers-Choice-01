import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Header";

const exploreLinks = [
  { label: "Destinations", href: "/destinations" },
  { label: "Packages", href: "/packages" },
  { label: "Rajasthan", href: "/destinations/rajasthan" },
  { label: "Kerala", href: "/destinations/kerala" },
  { label: "Ladakh", href: "/destinations/ladakh" },
  { label: "Goa", href: "/destinations/goa" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Customer Stories", href: "/stories" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ivory-warm">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-charcoal-soft">
              Carefully chosen journeys, memorable places, and a travel team that
              handles the details.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/explorerschoice_tours?stkn=NHRqYmdxdDNqajNp"
                className="rounded-full border border-forest/20 px-4 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=infoexplorerschoice@gmail.com"
                className="rounded-full border border-forest/20 px-4 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
                aria-label="Gmail"
              >
                Gmail
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              Explore
            </h3>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-soft transition-colors hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              Company
            </h3>
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-soft transition-colors hover:text-forest"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              Ready to travel?
            </h3>
            <p className="mt-5 text-sm text-charcoal-soft">
              Talk to a real travel planner about your next journey.
            </p>
            <Link
              href="/book#trip"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark"
            >
              Book Now
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-xs text-charcoal-soft">
            © {new Date().getFullYear()} Explorers Choice. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-charcoal-soft hover:text-forest">
              Privacy
            </a>
            <a href="#" className="text-xs text-charcoal-soft hover:text-forest">
              Terms
            </a>
            <a href="#" className="text-xs text-charcoal-soft hover:text-forest">
              Booking conditions
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
