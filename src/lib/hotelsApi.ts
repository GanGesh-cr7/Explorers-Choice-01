import { CLIENT_API_URL as API_URL } from "@/lib/api";

export type OwnerHotel = {
  id: number;
  owner_id: number;
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
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type HotelInput = {
  name: string;
  location: string;
  destination?: string;
  tagline?: string;
  description?: string;
  image?: string;
  price_per_night?: number;
  currency?: string;
  amenities?: string[];
  highlights?: string[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  if (!response.ok) {
    let detail = "Something went wrong.";
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch { /* keep default */ }
    throw new Error(detail);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const hotelOwnerApi = {
  myHotels: () => request<OwnerHotel[]>("/hotel-owner/hotels"),
  create: (data: HotelInput) =>
    request<OwnerHotel>("/hotel-owner/hotels", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<HotelInput & { is_published: boolean }>) =>
    request<OwnerHotel>(`/hotel-owner/hotels/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/hotel-owner/hotels/${id}`, { method: "DELETE" }),
};
