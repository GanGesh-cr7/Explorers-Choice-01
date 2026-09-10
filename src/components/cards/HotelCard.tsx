import Image from "next/image";
import Link from "next/link";
import type { Hotel } from "@/data/hotels";

export function formatPrice(price: number) {
  return price.toLocaleString("en-IN");
}

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream shadow-card transition-transform duration-200 hover:-translate-y-1">
      <Link href={`/hotels/${hotel.slug}`} className="relative block aspect-[3/2] overflow-hidden bg-sand">
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/50 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
          {hotel.location}
        </span>
        <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold text-forest">
          <svg
            className="h-3.5 w-3.5 text-terracotta"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          {hotel.rating.toFixed(1)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link href={`/hotels/${hotel.slug}`}>
          <h3 className="font-display text-2xl leading-snug text-forest transition-colors group-hover:text-forest-light">
            {hotel.name}
          </h3>
          <p className="mt-1 text-sm uppercase tracking-wide text-terracotta">{hotel.location}</p>
        </Link>

        <ul className="mt-4 space-y-2">
          {hotel.highlights.slice(0, 3).map((highlight) => (
            <li key={highlight} className="flex items-start gap-2 text-sm text-charcoal-soft">
              <svg
                className="mt-1 h-3.5 w-3.5 shrink-0 text-forest"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {highlight}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-sm text-charcoal-soft">
            From{" "}
            <span className="font-display text-2xl text-forest">
              ₹{formatPrice(hotel.pricePerNight)}
            </span>{" "}
            <span className="text-xs">/ night</span>
          </p>
        </div>

        <div className="mt-4 flex gap-3">
          <Link
            href={`/hotels/${hotel.slug}`}
            className="flex-1 rounded-full border border-forest/30 py-2.5 text-center text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
          >
            View Hotel
          </Link>
          <Link
            href={`/book?hotel=${hotel.slug}`}
            className="flex-1 rounded-full bg-terracotta py-2.5 text-center text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}