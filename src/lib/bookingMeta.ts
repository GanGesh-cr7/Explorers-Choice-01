export type BookingStatus =
  | "PENDING"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "PAYMENT_PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED"
  | "COMPLETED";

export type PaymentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type BookingMode = "REQUEST_ONLY" | "INSTANT_BOOKING";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Under review",
  PENDING_CONFIRMATION: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  PAYMENT_PENDING: "Payment pending",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NOT_REQUIRED: "No payment yet",
  PENDING: "Payment pending",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  FAILED: "Payment failed — please retry",
  REFUNDED: "Refunded",
};

export const BOOKING_MODE_LABELS: Record<BookingMode, string> = {
  REQUEST_ONLY: "Request booking",
  INSTANT_BOOKING: "Instant booking",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status as BookingStatus] ?? status;
}

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status;
}

export function bookingModeLabel(mode: string): string {
  return BOOKING_MODE_LABELS[mode as BookingMode] ?? mode;
}

export function formatMoney(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
