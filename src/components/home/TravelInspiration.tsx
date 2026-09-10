import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const inspiration = [
  {
    title: "The best time to visit Rajasthan",
    tag: "When to go",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Slow travel on the Kerala backwaters",
    tag: "How to travel",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Packing for Ladakh, without overpacking",
    tag: "Plan better",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=900&q=80",
  },
];

export function TravelInspiration() {
  return (
    <section className="border-t border-line bg-ivory-warm py-20 sm:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Travel inspiration"
            title="Ideas worth lingering over"
            description="Field notes from our team and planners — practical, honest travel thinking from people who have actually been there."
          />
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-3">
          {inspiration.map((item) => (
            <Link
              key={item.title}
              href="#"
              className="group block overflow-hidden rounded-2xl border border-line bg-cream shadow-card"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/40 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
                  {item.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl leading-snug text-forest transition-colors group-hover:text-forest-light">
                  {item.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                  Read more
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
