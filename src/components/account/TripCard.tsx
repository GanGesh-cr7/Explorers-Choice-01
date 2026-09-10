import Link from "next/link";
import { formatDate, formatMoney, paymentStatusLabel, statusLabel } from "@/lib/bookingMeta";
import type { BookingSummary } from "@/lib/account";

export function TripCard({ booking }: { booking: BookingSummary }) {
  const travellers = booking.adults + booking.children + booking.infants;
  return (
    <Link
      href={`/account/bookings/${booking.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-terracotta/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold text-forest">{booking.package_name}</p>
          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{statusLabel(booking.status)}</span>
        </div>
        <p className="mt-1 text-sm text-charcoal-soft">
          {booking.destination_name} · {formatDate(booking.travel_date)} · {travellers} traveller{travellers !== 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-xs text-charcoal-soft">
          {booking.booking_reference} · {paymentStatusLabel(booking.payment_status)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
        <span className="font-display text-lg text-forest">{formatMoney(booking.total, booking.currency)}</span>
        <svg className="h-4 w-4 text-terracotta transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </div>
    </Link>
  );
}