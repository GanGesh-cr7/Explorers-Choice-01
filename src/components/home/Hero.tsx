import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[88vh] min-h-[540px] w-full sm:h-[86vh]">
        <Image
          src="https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=2000&q=80"
          alt="A glacier lagoon in Iceland reflecting the mountains at twilight"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-forest-dark/20 to-transparent" />

        <Container className="relative z-10 flex h-full flex-col justify-end pb-16 sm:pb-20">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-ivory/85">
              Explorers Choice — Curated Journeys
            </p>
            <h1 className="font-display text-5xl leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
              Go somewhere worth remembering.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/90 sm:text-xl">
              Carefully chosen journeys, memorable places, and a travel team that
              handles the details.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/packages" variant="primary" size="lg">
                Explore Packages
              </Button>
              <Button href="/book" variant="onImage" size="lg">
                Book Now
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
