import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { planners } from "@/data/extras";

export function PlannerTeam() {
  return (
    <section className="border-t border-line bg-forest text-ivory">
      <Container className="py-20 sm:py-24">
        <SectionHeading
          eyebrow="Your travel team"
          title="The people who'll plan your trip"
          description="Real people, real questions, real answers. Meet the planners who design every journey and stay on call while you travel."
        />

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {planners.map((planner) => (
            <div key={planner.name} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src={planner.image}
                  alt={planner.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover grayscale-[15%] transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/50 to-transparent opacity-60" />
              </div>
              <h3 className="mt-5 font-display text-xl text-ivory">{planner.name}</h3>
              <p className="mt-1 text-sm font-semibold text-terracotta-light">{planner.role}</p>
              <p className="mt-2 text-sm text-ivory/75">{planner.speciality}</p>
            </div>
          ))}
        </div>

        <p className="mt-14 rounded-2xl border border-ivory/15 bg-ivory/5 p-8 text-center font-display text-2xl leading-relaxed text-ivory sm:text-3xl">
          “{planners[0].quote}”
        </p>
      </Container>
    </section>
  );
}
