import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StoryCard } from "@/components/cards/StoryCard";
import { stories } from "@/data/stories";

export function CustomerStories() {
  const [featuredStory, ...moreStories] = stories;

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Customer stories"
            title="Real travellers, real memories"
            description="Not testimonials plucked off a booking form—honest stories from people who travelled with us, told in their own words."
          />
          <Link
            href="/stories"
            className="shrink-0 text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            All customer stories
          </Link>
        </div>

        <div className="mt-12 grid gap-7 lg:grid-cols-2">
          <StoryCard story={featuredStory} featured />
          <div className="grid gap-7 sm:grid-cols-2">
            {moreStories.slice(0, 2).map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
