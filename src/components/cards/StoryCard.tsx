import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/data/stories";

export function StoryCard({ story, featured = false }: { story: Story; featured?: boolean }) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream shadow-card ${
        featured ? "md:flex-row" : ""
      }`}
    >
      <Link
        href={`/stories/${story.slug}`}
        className={`relative block overflow-hidden bg-sand ${
          featured ? "aspect-[4/3] md:aspect-auto md:w-1/2" : "aspect-[3/2]"
        }`}
      >
        <Image
          src={story.image}
          alt={story.title}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/30 to-transparent" />
      </Link>

      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-10 md:justify-center" : ""}`}>
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-charcoal-soft">
          <span className="text-terracotta">{story.trip}</span>
          <span aria-hidden="true">·</span>
          <span>{story.date}</span>
        </div>
        <Link href={`/stories/${story.slug}`}>
          <h3
            className={`font-display text-forest transition-colors group-hover:text-forest-light ${
              featured ? "mt-4 text-3xl leading-tight sm:text-4xl" : "mt-3 text-xl leading-snug"
            }`}
          >
            {story.title}
          </h3>
        </Link>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-soft line-clamp-3">
          {story.excerpt}
        </p>
        <p className="mt-5 text-sm font-semibold text-charcoal">— {story.author}</p>
        <Link
          href={`/stories/${story.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest"
        >
          Read the story
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
        </Link>
      </div>
    </article>
  );
}
