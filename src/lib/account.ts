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

const API_URL = (process.env.NEXT_PUBLIC_EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

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