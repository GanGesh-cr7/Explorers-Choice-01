import { getApiBaseUrl } from "./api";

export type CabTripType = "LOCAL" | "AIRPORT_TRANSFER" | "OUTSTATION";

export type CabCatalogEntry = {
  key: string;
  label: string;
  seats: number;
  base_fare: number;
  per_km: number;
  luggage: string;
  description: string;
};

export const TRIP_TYPE_LABELS: Record<CabTripType, string> = {
  LOCAL: "Local / City Rental",
  AIRPORT_TRANSFER: "Airport Transfer",
  OUTSTATION: "Outstation / One Way",
};

// Mirrors the authoritative catalogue in backend/app/routes/cabs.py.
export const CAB_CATALOG: CabCatalogEntry[] = [
  {
    key: "Hatchback",
    label: "Hatchback",
    seats: 4,
    base_fare: 250,
    per_km: 12,
    luggage: "1 small bag",
    description: "Best for city hops & quick airport runs",
  },
  {
    key: "Sedan",
    label: "Sedan",
    seats: 4,
    base_fare: 350,
    per_km: 14,
    luggage: "2 bags",
    description: "Comfortable pick for most journeys",
  },
  {
    key: "SUV",
    label: "SUV",
    seats: 6,
    base_fare: 500,
    per_km: 17,
    luggage: "3 bags",
    description: "Spacious, great for families",
  },
  {
    key: "Premium SUV",
    label: "Premium SUV",
    seats: 6,
    base_fare: 650,
    per_km: 20,
    luggage: "3 bags",
    description: "Luxury ride for a premium trip",
  },
  {
    key: "Tempo Traveller",
    label: "Tempo Traveller",
    seats: 12,
    base_fare: 1200,
    per_km: 28,
    luggage: "8 bags",
    description: "Group trips & outstation tours",
  },
];

export const CONVENIENCE_FEE = 50;
export const GST_RATE = 0.05;

export type CabFare = {
  base_fare: number;
  convenience_fee: number;
  gst: number;
  total: number;
};

export function estimateCabFare(
  cab: CabCatalogEntry | null,
  distanceKms: number
): CabFare {
  if (!cab) {
    return { base_fare: 0, convenience_fee: 0, gst: 0, total: 0 };
  }
  const distance = Math.max(0, Number(distanceKms) || 0);
  const baseFare = Math.round((cab.base_fare + cab.per_km * distance) * 100) / 100;
  const convenienceFee = CONVENIENCE_FEE;
  const gst = Math.round(baseFare * GST_RATE * 100) / 100;
  const total = Math.round((baseFare + convenienceFee + gst) * 100) / 100;
  return { base_fare: baseFare, convenience_fee: convenienceFee, gst, total };
}

export type CabBookingPayload = {
  trip_type: CabTripType;
  cab_type: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time: string;
  distance_kms: number;
  passengers: number;
  full_name: string;
  email: string;
  phone: string;
  special_requirements?: string;
  idempotency_key?: string;
};

export type CabBookingConfirmation = {
  id: number;
  booking_reference: string;
  trip_type: CabTripType;
  cab_type: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time: string;
  distance_kms: number;
  passengers: number;
  full_name: string;
  email: string;
  phone: string;
  special_requirements: string;
  base_fare: number;
  convenience_fee: number;
  gst: number;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export async function createCabBooking(
  payload: CabBookingPayload
): Promise<CabBookingConfirmation> {
  const res = await fetch(`${getApiBaseUrl()}/api/cabs/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to place cab booking request");
  }
  return res.json();
}

export async function getCabBookingByReference(
  reference: string
): Promise<CabBookingConfirmation | null> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/cabs/bookings/reference/${encodeURIComponent(reference)}`,
    { cache: "no-store", credentials: "include" }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not load cab booking");
  return res.json();
}

export async function getMyCabBookings(): Promise<CabBookingConfirmation[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/cabs/my-bookings`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}