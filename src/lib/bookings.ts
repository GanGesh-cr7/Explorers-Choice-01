import type { BookingMode } from "@/lib/bookingMeta";

export type BookingPayload = {
  package_slug: string;
  travel_date: string;
  adults: number;
  children: number;
  infants: number;
  departure_information: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  special_requirements: string;
  notes: string;
  // BUG-18: client-generated idempotency key so a retried request is not duplicated.
  idempotency_key?: string;
};

/** BUG-18: generate a random idempotency key (crypto.randomUUID where available). */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for older browsers.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export type BookingConfirmation = {
  booking_reference: string;
  package_name: string;
  destination_name: string;
  duration_days: number;
  travel_date: string;
  adults: number;
  children: number;
  infants: number;
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  booking_mode: BookingMode;
  created_at: string;
};

export type BookingOptionPackage = {
  slug: string;
  name: string;
  destination_name: string;
  country: string;
  duration_days: number;
  starting_price: number;
  currency: string;
  highlights: string[];
  booking_mode: BookingMode;
  is_active: boolean;
};

import { CLIENT_API_URL as API_URL } from "@/lib/api";

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.detail === "string" && body.detail) return body.detail;
    if (Array.isArray(body?.detail)) {
      return body.detail
        .map((item: { msg?: string; loc?: unknown[] }) => {
          const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "";
          return field && field !== "body" ? `${field}: ${item.msg ?? "invalid"}` : item.msg ?? "invalid input";
        })
        .join(". ");
    }
    return "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export async function fetchBookingPackages(): Promise<BookingOptionPackage[]> {
  const response = await fetch(`${API_URL}/packages`, { next: { revalidate: 0 } });
  if (!response.ok) return [];
  const body = (await response.json().catch(() => [])) as Array<Record<string, unknown>>;
  return body
    .filter((p) => Boolean(p?.is_active))
    .map((p) => {
      const destination = p.destination as Record<string, unknown> | undefined;
      return {
        slug: String(p.slug),
        name: String(p.name),
        destination_name: String(destination?.name ?? ""),
        country: String(destination?.country ?? ""),
        duration_days: Number(p.duration_days ?? 0),
        starting_price: Number(p.starting_price ?? 0),
        currency: String(p.currency ?? "INR").toUpperCase(),
        highlights: Array.isArray(p.highlights) ? p.highlights.map(String) : [],
        booking_mode: (p.booking_mode ?? "REQUEST_ONLY") as BookingMode,
        is_active: Boolean(p.is_active),
      };
    });
}

export class BookingError extends Error {
  code: "PACKAGE_UNAVAILABLE" | "INVALID_DATE" | "VALIDATION" | "NETWORK" | "UNKNOWN";
  constructor(message: string, code: BookingError["code"]) {
    super(message);
    this.name = "BookingError";
    this.code = code;
  }
}

export async function submitBooking(payload: BookingPayload): Promise<BookingConfirmation> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch {
    throw new BookingError(
      "We could not reach the booking service. Please check your connection and try again.",
      "NETWORK"
    );
  }

  if (response.status === 401) {
    throw new BookingError("Your session has expired. Please log in again and resubmit.", "NETWORK");
  }

  if (!response.ok) {
    const message = await readError(response);
    if (response.status === 404) {
      throw new BookingError("This package is unavailable. Please choose another journey.", "PACKAGE_UNAVAILABLE");
    }
    if (/travel date/i.test(message)) {
      throw new BookingError("Your travel date must be in the future. Please choose another date.", "INVALID_DATE");
    }
    throw new BookingError(message, "VALIDATION");
  }

  const body = (await response.json().catch(() => null)) as BookingConfirmation | null;
  if (!body?.booking_reference) throw new BookingError("We could not create your booking request. Please try again.", "UNKNOWN");
  return body;
}

export async function getConfirmationByReference(reference: string): Promise<BookingConfirmation | null> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/bookings/reference/${encodeURIComponent(reference)}`, {
      credentials: "include",
    });
  } catch {
    throw new BookingError("We could not reach the booking service. Please try again.", "NETWORK");
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new BookingError("We could not load this booking. Please try again.", "UNKNOWN");
  return (await response.json().catch(() => null)) as BookingConfirmation | null;
}
