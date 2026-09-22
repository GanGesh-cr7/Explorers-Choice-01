import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StoryCard } from "@/components/cards/StoryCard";
import { getApiBaseUrl } from "@/lib/api";
import { stories as fallbackStories } from "@/data/stories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Customer Stories",
  description:
    "Real travellers, real memories. Honest stories from people who explored the world with Explorers Choice.",
};

type StoryOutput = {
  id?: number | string;
  slug?: string;
  customerName?: string;
  packageName?: string;
  destination?: string;
  travelDate?: string;
  title?: string;
  excerpt?: string;
  story?: string;
  image?: string;
  photos?: string[];
};

async function getStories(): Promise<StoryOutput[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/customer-stories`, { next: { revalidate: 60 } });
    if (!res.ok) return fallbackStories as unknown as StoryOutput[];
    const data = await res.json();
    return data.map((d: Record<string, unknown>) => ({
      ...d,
      customerName: String(d.customer_name || ""),
      packageName: String(d.package_name || ""),
      destination: String(d.destination || ""),
      travelDate: d.travel_date ? new Date(String(d.travel_date)).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "",
    }));
  } catch {
    return fallbackStories as unknown as StoryOutput[];
  }
}

export default async function StoriesPage() {
  const stories = await getStories();
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
