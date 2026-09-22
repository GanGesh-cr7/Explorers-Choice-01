import type { Hotel } from "@/data/hotels";
import { hotels as demoHotels } from "@/data/hotels";
import { getApiBaseUrl } from "@/lib/api";

type ApiHotel = {
  id: number;
  slug: string;
  name: string;
  location: string;
  destination: string;
  tagline: string;
  description: string;
  image: string;
  price_per_night: number;
  currency: string;
  amenities: string[];
  highlights: string[];
  created_at: string;
  updated_at: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80";

function toHotel(api: ApiHotel): Hotel {
  return {
    slug: api.slug,
    name: api.name,
    location: api.location,
    destination: api.destination,
    tagline: api.tagline,
    description: api.description,
    image: api.image || FALLBACK_IMAGE,
    rating: 0,
    pricePerNight: api.price_per_night,
    currency: api.currency || "INR", // BUG-14: preserve API currency
    amenities: api.amenities ?? [],
    highlights: api.highlights ?? [],
  };
}

export async function getHotelsFromApi(): Promise<Hotel[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/hotels`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as ApiHotel[];
    return data.map(toHotel);
  } catch {
    return [];
  }
}

export async function getMergedHotels(): Promise<Hotel[]> {
  const apiHotels = await getHotelsFromApi();
  const apiSlugs = new Set(apiHotels.map((h) => h.slug));
  const uniqueDemo = demoHotels.filter((h) => !apiSlugs.has(h.slug));
  return [...apiHotels, ...uniqueDemo];
}
