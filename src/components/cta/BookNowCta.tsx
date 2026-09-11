import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const featureImages = {
  hero: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1800&q=80",
  side: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=800&q=80",
};

export function BookNowCta({
  heading = "Go somewhere worth remembering.",
  subtext = "Talk to a real travel planner today. We'll help you choose the right journey, at the right pace, with every detail handled.",
}: {
  heading?: string;
  subtext?: string;
}) {
  return (
    <section className="my-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-forest text-ivory">
          <Image
            src={featureImages.hero}
            alt="A misty mountain landscape at dawn"
            fill
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-forest/40" />
          <div className="relative z-10 flex flex-col items-start gap-8 px-8 py-16 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-20">
            <div className="max-w-xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta-light">
                Ready when you are
              </p>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl">
                {heading}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ivory/80">{subtext}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/book#trip" variant="primary" size="lg">
                Book Now
              </Button>
              <Button href="/packages" variant="onImage" size="lg">
                Browse Packages
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
