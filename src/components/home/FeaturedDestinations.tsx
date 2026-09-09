import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { destinations } from "@/data/destinations";

export function FeaturedDestinations() {
  const featured = destinations.filter((d) => d.featured);

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Where to go"
            title="Destinations we can't stop talking about"
            description="Every place we feature has been travelled, re-travelled and refined by our team. These are the ones our clients keep coming back for."
          />
          <Link
            href="/destinations"
            className="shrink-0 text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            View all destinations
          </Link>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} />
          ))}
        </div>
      </Container>
    </section>
  );
}
