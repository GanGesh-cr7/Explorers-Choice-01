import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PackageCard } from "@/components/cards/PackageCard";
import { BookNowCta } from "@/components/cta/BookNowCta";
import { getPackageFromApi, getPackagesFromApi } from "@/lib/catalog";
import { packages as fallbackPackages } from "@/data/packages";

export const revalidate = 60;

export async function generateStaticParams() {
  return fallbackPackages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackageFromApi(slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: pkg.name,
    description: pkg.summary,
  } satisfies Metadata;
}

export default async function PackageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = await getPackageFromApi(slug);
  if (!pkg) notFound();

  const allPackages = await getPackagesFromApi();
  const related = allPackages
    .filter((p) => p.destinationSlug === pkg.destinationSlug && p.slug !== slug)
    .slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[65vh] min-h-[400px] overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/65 via-forest-dark/15 to-transparent" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-14">
          <span className="mb-3 inline-flex w-fit rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
            {pkg.country}
          </span>
          <h1 className="font-display text-5xl leading-tight text-ivory sm:text-6xl">
            {pkg.name}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-wide text-ivory/80">
            {pkg.duration} · From{" "}
            <span className="font-display text-xl">₹{pkg.startingPrice.toLocaleString("en-IN")}</span> per person
          </p>
        </Container>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
              The journey
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-charcoal-soft">
              {pkg.summary}
            </p>

            {/* Highlights */}
            <div className="mt-10">
              <h3 className="font-display text-2xl text-forest">Highlights</h3>
              <ul className="mt-4 space-y-3">
                {pkg.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-charcoal-soft">
                    <svg className="mt-1 h-4 w-4 shrink-0 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Itinerary */}
            <div className="mt-12">
              <SectionHeading eyebrow="Day by day" title="Your itinerary" />
              <div className="mt-8 space-y-6">
                {pkg.itinerary.map((day) => (
                  <div
                    key={day.day}
                    className="flex gap-5 rounded-2xl border border-line bg-cream p-5 sm:p-6"
                  >
                    <span className="font-display text-lg text-terracotta sm:text-xl">{day.day}</span>
                    <div>
                      <h4 className="font-semibold text-forest">{day.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-charcoal-soft">
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's included */}
            <div className="mt-12">
              <h3 className="font-display text-2xl text-forest">What&apos;s included</h3>
              <ul className="mt-4 space-y-3">
                {pkg.included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-charcoal-soft">
                    <svg className="mt-1 h-4 w-4 shrink-0 text-forest" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="h-fit rounded-2xl border border-line bg-cream p-8 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Starting from</p>
            <p className="mt-2">
              <span className="font-display text-4xl text-forest">
                ₹{pkg.startingPrice.toLocaleString("en-IN")}
              </span>{" "}
              <span className="text-sm text-charcoal-soft">/ person</span>
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-line/60 pb-3">
                <span className="text-charcoal-soft">Duration</span>
                <span className="font-semibold text-forest">{pkg.duration}</span>
              </div>
              <div className="flex justify-between border-b border-line/60 pb-3">
                <span className="text-charcoal-soft">Destination</span>
                <span className="font-semibold text-forest">{pkg.destination}</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button href={`/book?package=${slug}`} variant="primary" size="md" className="w-full">
                Book Now
              </Button>
              <Link
                href={`/destinations/${pkg.destinationSlug}`}
                className="rounded-full border border-forest/30 py-3 text-center text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
              >
                View {pkg.destination}
              </Link>
            </div>
            <p className="mt-6 text-xs text-center text-charcoal-soft">
              Or speak to a planner: <Link href="/contact" className="font-semibold text-terracotta hover:underline">Get in touch</Link>
            </p>
          </div>
        </Container>
      </section>

      {/* Related packages */}
      {related.length > 0 && (
        <section className="border-t border-line bg-ivory-warm py-16 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="More journeys"
              title={`More in ${pkg.destination}`}
            />
            <div className="mt-12 grid gap-7 sm:grid-cols-2">
              {related.map((rp) => (
                <PackageCard key={rp.slug} pkg={rp} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <BookNowCta />
    </>
  );
}
