import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PackageCard } from "@/components/cards/PackageCard";
import { packages } from "@/data/packages";

export function FeaturedPackages() {
  const featured = packages.filter((p) => p.featured).slice(0, 3);

  return (
    <section className="border-y border-line bg-ivory-warm py-20 sm:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Signature journeys"
            title="Travel packages built around you"
            description="Seven days or three weeks, adventuring or unwinding—each package is planned, priced and perfected, with a dedicated planner on call."
          />
          <Link
            href="/packages"
            className="shrink-0 text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            View all packages
          </Link>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </Container>
    </section>
  );
}
