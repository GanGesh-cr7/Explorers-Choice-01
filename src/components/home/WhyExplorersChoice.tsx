import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const reasons = [
  {
    title: "Real local guides",
    description:
      "We work year after year with the same local guides. They're part of our team, not a subcontracted service—which means you travel with people who genuinely love where they live.",
  },
  {
    title: "Small, human groups",
    description:
      "Ten to fourteen travellers, never a coach. Small groups mean better conversation, flexible pacing, and the freedom to follow a good thing when it appears.",
  },
  {
    title: "Details, handled",
    description:
      "Transport, accommodation, entries, reservations—all arranged. You get an itinerary that makes sense and a planner on call if anything changes.",
  },
  {
    title: "White space on purpose",
    description:
      "Great trips have room to breathe. We build in unhurried mornings and quiet hours, because the best memories often happen in the spaces between plans.",
  },
];

export function WhyExplorersChoice() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Editorial image column */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80"
                alt="A traveller walking a mountain ridge at golden hour"
                width={1200}
                height={1500}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden max-w-[220px] rounded-2xl border border-line bg-cream p-5 shadow-lift sm:block">
              <p className="font-display text-4xl text-terracotta">16 yrs</p>
              <p className="mt-1 text-sm text-charcoal-soft">
                designing journeys people actually remember
              </p>
            </div>
          </div>

          {/* Text column */}
          <div className="flex flex-col justify-center">
            <SectionHeading
              eyebrow="Why Explorers Choice"
              title="Travel that feels human, not transactional"
              description="We're not a booking engine. We're a small team of travellers and planners who believe the right journey is chosen carefully, paced thoughtfully and handled completely."
            />

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div key={reason.title}>
                  <h3 className="font-display text-xl text-forest">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
                    {reason.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
