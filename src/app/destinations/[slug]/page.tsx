import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PackageCard } from "@/components/cards/PackageCard";
import { BookNowCta } from "@/components/cta/BookNowCta";
import { destinations, getDestinationBySlug } from "@/data/destinations";
import { getPackagesByDestination } from "@/data/packages";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) return { title: "Destination not found" };
  return {
    title: destination.name,
    description: destination.tagline,
  } satisfies Metadata;
}

export default async function DestinationDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();

  const relatedPackages = getPackagesByDestination(slug);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[440px] overflow-hidden">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/60 via-forest-dark/10 to-transparent" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-14">
          <Badge variant="forest" size="md" className="mb-4 w-fit">
            {destination.region}
          </Badge>
          <h1 className="font-display text-5xl leading-tight text-ivory sm:text-6xl">
            {destination.name}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-wide text-ivory/80">{destination.country}</p>
        </Container>
      </section>

      {/* Detail Content */}
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              About the destination
            </p>
            <h2 className="mt-4 font-display text-3xl leading-snug text-forest sm:text-4xl">
              {destination.tagline}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-charcoal-soft">
              {destination.description}
            </p>

            <div className="mt-10">
              <h3 className="font-display text-2xl text-forest">Highlights</h3>
              <ul className="mt-4 space-y-3">
                {destination.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-charcoal-soft">
                    <svg className="mt-1 h-4 w-4 shrink-0 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="rounded-2xl border border-line bg-cream p-8 shadow-card">
            <h3 className="font-display text-xl text-forest">At a glance</h3>
            <div className="mt-5 space-y-4">
              {destination.stats.map((stat) => (
                <div key={stat.label} className="flex justify-between border-b border-line/60 pb-3 text-sm">
                  <span className="text-charcoal-soft">{stat.label}</span>
                  <span className="font-semibold text-forest">{stat.value}</span>
                </div>
              ))}
              <div className="flex justify-between border-b border-line/60 pb-3 text-sm">
                <span className="text-charcoal-soft">Best time</span>
                <span className="font-semibold text-forest">{destination.bestTime}</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button href={`/book?destination=${slug}`} variant="primary" size="md" className="w-full">
                Book Now
              </Button>
              <Button href="/packages" variant="outline" size="md" className="w-full">
                View All Packages
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Related packages */}
      {relatedPackages.length > 0 && (
        <section className="border-t border-line bg-ivory-warm py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Packages"
              title={`Journeys to ${destination.name}`}
              description={`Our curated travel packages for ${destination.name}, planned by our local experts.`}
            />
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPackages.map((pkg) => (
                <PackageCard key={pkg.slug} pkg={pkg} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <BookNowCta />
    </>
  );
}
