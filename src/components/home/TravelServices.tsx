import Link from "next/link";
import { Container } from "@/components/ui/Container";

const services = [
  { label: "Flights", detail: "Find the best way there", href: "/contact?subject=Flights%20enquiry", mark: "FL" },
  { label: "Hotels", detail: "Stay somewhere memorable", href: "/hotels", mark: "HT" },
  { label: "Holiday packages", detail: "Journeys with the details handled", href: "/packages", mark: "HP" },
  { label: "Travel stories", detail: "Ideas for your next escape", href: "/stories", mark: "TS" },
];

export function TravelServices() {
  return (
    <section className="border-b border-line bg-ivory-warm py-10 sm:py-12">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Plan it your way</p>
            <h2 className="mt-2 font-display text-3xl text-forest sm:text-4xl">Everything for the journey ahead.</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[54%]">
            {services.map((service) => (
              <Link key={service.label} href={service.href} className="group rounded-xl border border-line bg-cream p-4 transition-all hover:-translate-y-0.5 hover:border-terracotta/50 hover:shadow-soft">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-[10px] font-bold tracking-wide text-ivory">{service.mark}</span>
                <span className="mt-3 block text-sm font-bold text-forest group-hover:text-terracotta">{service.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-charcoal-soft">{service.detail}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 rounded-xl bg-forest px-5 py-4 text-ivory sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm"><span className="font-bold text-terracotta-light">Early planner offer</span> · Save 10% on selected Rajasthan and Kerala journeys.</p>
          <Link href="/packages" className="shrink-0 text-sm font-bold text-ivory underline decoration-terracotta-light underline-offset-4 hover:text-terracotta-light">View offers</Link>
        </div>
      </Container>
    </section>
  );
}