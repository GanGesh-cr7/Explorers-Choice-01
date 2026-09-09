import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StoryCard } from "@/components/cards/StoryCard";
import { stories } from "@/data/stories";

export const metadata: Metadata = {
  title: "Customer Stories",
  description:
    "Real travellers, real memories. Honest stories from people who explored the world with Explorers Choice.",
};

export default function StoriesPage() {
  const [featured, ...rest] = stories;

  return (
    <>
      <section className="border-b border-line bg-ivory-warm">
        <Container className="py-16 sm:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            Customer stories
          </p>
          <h1 className="font-display text-5xl leading-tight text-forest sm:text-6xl">
            Real travellers, real memories
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal-soft">
            Not testimonials plucked off a booking form — honest stories from people who
            travelled with us, told in their own words.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          {featured && (
            <div className="mb-10">
              <StoryCard story={featured} featured />
            </div>
          )}
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
