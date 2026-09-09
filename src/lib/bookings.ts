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
};

export type BookingConfirmation = {
  booking_reference: string;
  package_name: string;
  destination_name: string;
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
  booking_mode: "REQUEST_ONLY" | "INSTANT_BOOKING";
  created_at: string;
};

const API_URL = (process.env.NEXT_PUBLIC_EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

export async function submitBooking(payload: BookingPayload): Promise<BookingConfirmation> {
  const response = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as { detail?: string } | BookingConfirmation | null;
  if (!response.ok) {
    const detail = body && "detail" in body ? body.detail : null;
    throw new Error(detail ?? "We could not create your booking request. Please try again.");
  }
  return body as BookingConfirmation;
}
