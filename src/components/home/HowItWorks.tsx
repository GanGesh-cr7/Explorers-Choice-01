import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    number: "01",
    title: "Tell us what moves you",
    description:
      "Pick a destination or package, or call us with nothing but a feeling. We'll listen to how you like to travel and what you want to take home.",
  },
  {
    number: "02",
    title: "We shape the journey",
    description:
      "A dedicated planner builds your itinerary around the best seasons, the right pace and the details most travellers never think about.",
  },
  {
    number: "03",
    title: "Travel with confidence",
    description:
      "Flights, stays, guides and every reservation are arranged. You get a clear plan, a point of contact, and the space to simply enjoy it.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-sand-light/60 py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Three simple steps to a trip you'll remember"
          align="center"
        />

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <span className="font-display text-6xl text-terracotta/30">{step.number}</span>
              <h3 className="mt-3 font-display text-2xl text-forest">{step.title}</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-charcoal-soft">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
