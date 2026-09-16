import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { BookNowCta } from "@/components/cta/BookNowCta";
import { getPackagesFromApi } from "@/lib/catalog";
import { PackageFilterGrid } from "@/components/packages/PackageFilterGrid";

// BUG-08: revalidate so admin catalog edits publish to the public site.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Browse our curated travel packages. Every journey is planned, priced and perfected with local guides, handpicked stays and a dedicated travel planner.",
};

export default async function PackagesPage() {
  // BUG-08: prefer the live API catalog; fall back to static data when offline.
  const packages = await getPackagesFromApi();

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
          <PackageFilterGrid initialPackages={packages} />
        </Container>
      </section>

      <BookNowCta
        heading="Not sure where to start?"
        subtext="Tell us a destination, a feeling or nothing at all. Our travel planners will help you find the right journey."
      />
    </>
  );
}
