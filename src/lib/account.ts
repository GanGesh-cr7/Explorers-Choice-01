export type BookingSummary = {
  id: number;
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
  booking_mode: string;
  created_at: string;
};

export type BookingDetail = BookingSummary & {
  package_slug: string;
  duration_days: number;
  departure_information: string;
  country: string;
  special_requirements: string;
  notes: string;
  updated_at: string;
  payments: PaymentRecord[];
  documents: DocumentRecord[];
};

export type PaymentRecord = {
  amount: number;
  currency: string;
  status: string;
  provider_reference: string;
  created_at: string;
};

export type DocumentRecord = {
  id: number;
  document_type: string;
  title: string;
  file_name: string;
  created_at: string;
};

export type ItineraryDay = {
  day_number: number;
  title: string;
  description: string;
  activities: string[];
  meals: string;
  accommodation: string;
  transportation: string;
};

export type PackageDetail = {
  id: number;
  slug: string;
  name: string;
  hero_image: string;
  duration_days: number;
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  accommodation_summary: string;
  transportation_summary: string;
  meal_summary: string;
  important_information: string;
};

import { CLIENT_API_URL as API_URL } from "@/lib/api";

export async function fetchMyBookings(): Promise<BookingSummary[]> {
  const response = await fetch(`${API_URL}/account`, { credentials: "include" });
  if (!response.ok) return [];
  return (await response.json()) as BookingSummary[];
}

export async function fetchBookingDetail(bookingId: number): Promise<BookingDetail> {
  const response = await fetch(`${API_URL}/account/${bookingId}`, { credentials: "include" });
  if (!response.ok) throw new Error("Booking not found");
  return (await response.json()) as BookingDetail;
}

export async function fetchMyPayments(bookingId: number): Promise<PaymentRecord[]> {
  const response = await fetch(`${API_URL}/account/${bookingId}/payments`, { credentials: "include" });
  if (!response.ok) return [];
  return (await response.json()) as PaymentRecord[];
}

export async function fetchMyDocuments(bookingId: number): Promise<DocumentRecord[]> {
  const response = await fetch(`${API_URL}/account/${bookingId}/documents`, { credentials: "include" });
  if (!response.ok) return [];
  return (await response.json()) as DocumentRecord[];
}

export function buildDocumentDownloadUrl(documentId: number): string {
  return `${API_URL}/account/documents/${documentId}/download`;
}

export async function fetchPackageDetail(slug: string): Promise<PackageDetail> {
  const response = await fetch(`${API_URL}/packages/${slug}`, { credentials: "include" });
  if (!response.ok) throw new Error("Package not found");
  return (await response.json()) as PackageDetail;
}