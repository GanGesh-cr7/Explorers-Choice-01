import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BookNowCta } from "@/components/cta/BookNowCta";
import { stories, getStoryBySlug } from "@/data/stories";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return { title: "Story not found" };
  return { title: story.title, description: story.excerpt } satisfies Metadata;
}

export default async function StoryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  const more = stories.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <Container className="max-w-3xl pt-14">
        <Link
          href="/stories"
          className="text-sm font-semibold text-forest underline-offset-4 hover:underline"
        >
          ← All customer stories
        </Link>
        <div className="mt-8">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
            <span className="text-terracotta">{story.trip}</span>
            <span aria-hidden="true">·</span>
            <span>{story.date}</span>
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight text-forest sm:text-5xl">
            {story.title}
          </h1>
          <p className="mt-6 font-display text-2xl leading-relaxed text-charcoal">{story.quote}</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl">
          <Image
            src={story.image}
            alt={story.title}
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
          />
        </div>

        <article className="mt-10 space-y-6">
          {story.body.map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed text-charcoal-soft">
              {paragraph}
            </p>
          ))}
        </article>

        <div className="mt-12 border-t border-line pt-6">
          <p className="text-sm text-charcoal-soft">
            — <span className="font-semibold text-charcoal">{story.author}</span>, travelled on{" "}
            {story.trip}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/book" variant="primary" size="md">
            Book Now
          </Button>
          <Button href="/packages" variant="outline" size="md">
            Browse Packages
          </Button>
        </div>
      </Container>

      {more.length > 0 && (
        <section className="mt-20 border-t border-line bg-ivory-warm py-16">
          <Container>
            <h2 className="font-display text-3xl text-forest">More stories</h2>
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((s) => (
                <article key={s.slug} className="group overflow-hidden rounded-2xl border border-line bg-cream shadow-card">
                  <Link href={`/stories/${s.slug}`} className="relative block aspect-[3/2] overflow-hidden bg-sand">
                    <Image src={s.image} alt={s.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </Link>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">{s.trip}</p>
                    <Link href={`/stories/${s.slug}`}>
                      <h3 className="mt-2 font-display text-xl leading-snug text-forest group-hover:text-forest-light">{s.title}</h3>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      <BookNowCta
        heading="Ready to write your own story?"
        subtext="Talk to a real travel planner and start planning a journey worth remembering."
      />
    </>
  );
}
