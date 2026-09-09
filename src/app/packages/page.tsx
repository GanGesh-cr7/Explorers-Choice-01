import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PackageCard } from "@/components/cards/PackageCard";
import { BookNowCta } from "@/components/cta/BookNowCta";
import { packages } from "@/data/packages";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Browse our curated travel packages. Every journey is planned, priced and perfected with local guides, handpicked stays and a dedicated travel planner.",
};

export default function PackagesPage() {
  return (
    <>
      <section className="border-b border-line bg-ivory-warm">
        <Container className="py-16 sm:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            Curated journeys
          </p>
          <h1 className="font-display text-5xl leading-tight text-forest sm:text-6xl">
            Travel Packages
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal-soft">
            Thoughtfully paced, honestly priced, and designed around how you actually want to
            travel.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        </Container>
      </section>

      <BookNowCta
        heading="Not sure where to start?"
        subtext="Tell us a destination, a feeling or nothing at all. Our travel planners will help you find the right journey."
      />
    </>
  );
}
