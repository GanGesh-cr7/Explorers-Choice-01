import type { Destination } from "@/data/destinations";
import { destinations as fallbackDestinations } from "@/data/destinations";
import type { Package as CatalogPackage } from "@/data/packages";
import { packages as fallbackPackages } from "@/data/packages";

const API_URL = (process.env.EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

export type ApiItineraryDay = {
  id?: number;
  package_id?: number;
  day_number: number;
  title: string;
  description: string;
  activities: string[];
  meals: string;
  accommodation: string;
  transportation: string;
};

export type ApiPackageFaq = {
  id?: number;
  question: string;
  answer: string;
  sort_order?: number;
};

export type CatalogPackageDetail = CatalogPackage & {
  accommodationSummary: string;
  transportationSummary: string;
  mealSummary: string;
  included: string[];
  excluded: string[];
  cancellationPolicy: string;
  importantInformation: string[];
  gallery: string[];
  itineraryDays: ApiItineraryDay[];
  faqs: ApiPackageFaq[];
};

function toDestination(api: Record<string, unknown>): Destination {
  const stats = [
    { label: "Duration", value: String(api.recommended_duration ?? "") },
    { label: "Season", value: String(api.best_time ?? "") },
  ];
  return {
    slug: String(api.slug),
    name: String(api.name),
    country: String(api.country),
    tagline: String(api.short_description ?? ""),
    description: String(api.description ?? ""),
    image: String(api.hero_image ?? ""),
    region: String(api.region ?? ""),
    bestTime: String(api.best_time ?? ""),
    highlights: Array.isArray(api.highlights) ? api.highlights.map(String) : [],
    stats,
    featured: Boolean(api.is_featured),
  };
}

function toPackage(api: Record<string, unknown>, detail = false): CatalogPackageDetail {
  const destination = api.destination as Record<string, unknown> | undefined;
  const durationDays = Number(api.duration_days ?? 0);
  const durationNights = Number(api.duration_nights ?? Math.max(durationDays - 1, 0));
  const itinerary = Array.isArray(api.itinerary) ? (api.itinerary as ApiItineraryDay[]) : [];
  const faqs = Array.isArray(api.faqs) ? (api.faqs as ApiPackageFaq[]) : [];
  return {
    slug: String(api.slug),
    destinationSlug: destination?.slug ? String(destination.slug) : "",
    name: String(api.name),
    destination: destination?.name ? String(destination.name) : "",
    country: destination?.country ? String(destination.country) : "",
    duration: `${durationDays} days`,
    startingPrice: Number(api.starting_price ?? 0),
    highlights: Array.isArray(api.highlights) ? api.highlights.map(String) : [],
    image: String(api.hero_image ?? ""),
    summary: String(api.short_description || api.description || ""),
    itinerary: itinerary.map((day) => ({
      day: `Day ${day.day_number}`,
      title: day.title,
      description: day.description,
    })),
    included: Array.isArray(api.included) ? api.included.map(String) : [],
    featured: Boolean(api.is_featured),
    accommodationSummary: String(api.accommodation_summary ?? ""),
    transportationSummary: String(api.transportation_summary ?? ""),
    mealSummary: String(api.meal_summary ?? ""),
    excluded: Array.isArray(api.excluded) ? api.excluded.map(String) : [],
    cancellationPolicy: String(api.cancellation_policy ?? ""),
    importantInformation: Array.isArray(api.important_information)
      ? api.important_information.map(String)
      : [],
    gallery: Array.isArray(api.gallery) ? api.gallery.map(String) : [],
    itineraryDays: detail ? itinerary : [],
    faqs: detail ? faqs : [],
  };
}

async function request<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    // The public site remains usable during local setup or when the API is offline.
    return null;
  }
}

export async function getDestinationsFromApi(): Promise<Destination[]> {
  const response = await request<Record<string, unknown>[]>("/destinations");
  return response?.map(toDestination) ?? fallbackDestinations;
}

export async function getDestinationFromApi(slug: string): Promise<Destination | undefined> {
  const response = await request<Record<string, unknown>>(`/destinations/${slug}`);
  return response ? toDestination(response) : fallbackDestinations.find((item) => item.slug === slug);
}

export async function getPackagesFromApi(): Promise<CatalogPackageDetail[]> {
  const response = await request<Record<string, unknown>[]>("/packages");
  return response?.map((item) => toPackage(item)) ?? fallbackPackages.map((item) => ({
    ...item,
    accommodationSummary: "Handpicked accommodation selected for location and character.",
    transportationSummary: "Local transport and transfers included as described in the itinerary.",
    mealSummary: "Daily breakfast and selected meals included.",
    included: item.included,
    excluded: ["International flights", "Travel insurance", "Lunches & drinks"],
    cancellationPolicy: "Full cancellation terms are confirmed before booking.",
    importantInformation: [],
    gallery: [item.image],
    itineraryDays: [],
    faqs: [],
  }));
}

export async function getPackageFromApi(slug: string): Promise<CatalogPackageDetail | undefined> {
  const response = await request<Record<string, unknown>>(`/packages/${slug}`);
  if (response) return toPackage(response, true);
  const fallback = fallbackPackages.find((item) => item.slug === slug);
  if (!fallback) return undefined;
  const destination = fallbackDestinations.find((item) => item.slug === fallback.destinationSlug);
  return {
    ...fallback,
    country: destination?.country ?? "",
    accommodationSummary: "Handpicked accommodation selected for location and character.",
    transportationSummary: "Local transport and transfers included as described in the itinerary.",
    mealSummary: "Daily breakfast and selected meals included.",
    excluded: ["International flights", "Travel insurance", "Lunches & drinks"],
    cancellationPolicy: "Full cancellation terms are confirmed before booking.",
    importantInformation: [],
    gallery: [fallback.image],
    itineraryDays: [],
    faqs: [],
  };
}
