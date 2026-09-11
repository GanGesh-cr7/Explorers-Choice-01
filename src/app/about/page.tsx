import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookNowCta } from "@/components/cta/BookNowCta";

export const metadata: Metadata = {
  title: "About",
  description:
    "Explorers Choice is a small team of travellers and planners who believe the right journey is chosen carefully, paced thoughtfully and handled completely.",
};

const values = [
  {
    title: "Small and human",
    description:
      "We're not a booking engine or a mass tour operator. We're a team that answers the phone, knows your name, and travels alongside you in what we recommend.",
  },
  {
    title: "Place before checkbox",
    description:
      "We'd rather you see fewer places deeply than many superficially. Every itinerary is designed to let a place settle, not just be ticked off.",
  },
  {
    title: "Local, always",
    description:
      "Our guides live where they work. We invest in local families, communities and businesses because that's what makes travel meaningful for everyone.",
  },
  {
    title: "Honesty over hype",
    description:
      "If a place is better in May than August, we'll tell you. If a package isn't right for you, we'll say so. Long-term trust beats a quick sale.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=2000&q=80"
          alt="A lone traveller silhouetted on a mountain ridge at sunrise"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/60 to-transparent" />
        <Container className="relative z-10 flex h-full flex-col justify-end pb-14">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ivory/85">
            About Explorers Choice
          </p>
          <h1 className="max-w-3xl font-display text-5xl leading-tight text-ivory sm:text-6xl">
            We plan the journey. You live it.
          </h1>
        </Container>
      </section>

      {/* Story */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="Built by travellers, for travellers"
            />
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-charcoal-soft">
              <p>
                Explorers Choice began in a small kitchen over a map of Rajasthan, with
                two friends arguing about whether six days was enough for the desert. (It wasn&apos;t.
                It is now eight.) Both of us had spent years in the travel industry, watching
                great places get flattened into checklists and bus itineraries.
              </p>
              <p>
                We started Explorers Choice because we believed travel could be different —
                slower, more human, better designed. Not a luxury product, but a thoughtful one.
                Journeys with local guides who love where they live, small groups that feel like
                company, and itineraries built with just enough structure to handle the details
                and just enough white space to let the place work its magic.
              </p>
              <p>
                Today we&apos;re a small team of planners, drivers and guides across several
                countries. We still answer the phone ourselves, we still travel the routes we
                sell, and we still get genuinely excited when a guest sends us a photo of the
                sky that afternoon turned pink.
              </p>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
                alt="The Explorers Choice team on a quiet beach"
                width={1000}
                height={700}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-line bg-cream p-6 text-center">
                <p className="font-display text-4xl text-terracotta">16</p>
                <p className="mt-1 text-sm text-charcoal-soft">countries designed</p>
              </div>
              <div className="rounded-2xl border border-line bg-cream p-6 text-center">
                <p className="font-display text-4xl text-terracotta">12k+</p>
                <p className="mt-1 text-sm text-charcoal-soft">travellers guided</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-t border-line bg-ivory-warm py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="What we believe"
            title="The principles behind every journey"
            align="center"
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-line bg-cream p-7">
                <h3 className="font-display text-xl text-forest">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-charcoal-soft">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <BookNowCta
        heading="Let's plan something good."
        subtext="Whatever you're imagining, start with a conversation. A real one, with a real person."
      />
    </>
  );
}
