"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type BookingListItem } from "@/lib/admin";
import { formatMoney, paymentStatusLabel, statusLabel } from "@/lib/bookingMeta";

const STATUS_FILTERS = ["", "PENDING_CONFIRMATION", "CONFIRMED", "PAYMENT_PENDING", "PAID", "UPCOMING", "TRAVELLING", "COMPLETED", "CANCELLED"] as const;

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .bookings(status || undefined)
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load bookings."))
      .finally(() => setLoading(false));
  }, [status]);

  function changeStatus(next: string) {
    setLoading(true);
    setError("");
    setStatus(next);
  }

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Bookings</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">All trips</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Every request and confirmed journey, in one place.</p>
      </section>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeStatus(s)}
            aria-pressed={status === s}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              status === s ? "border-forest bg-forest text-ivory" : "border-line bg-white text-charcoal-soft hover:text-forest"
            }`}
          >
            {s === "" ? "All" : statusLabel(s)}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
      ) : loading ? (
        <p className="mt-8 text-charcoal-soft">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No bookings in this view.</p>
          <p className="mt-2 text-sm text-charcoal-soft">Try a different status filter.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-terracotta/40 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-forest">{b.package_name}</p>
                <p className="mt-0.5 text-sm text-charcoal-soft">
                  {b.booking_reference} · {b.destination_name} · {b.travel_date}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{statusLabel(b.status)}</span>
                <span className="hidden rounded-full bg-sand-light px-3 py-1 text-xs font-semibold text-charcoal-soft sm:inline-block">{paymentStatusLabel(b.payment_status)}</span>
                <span className="font-display text-lg text-forest">{formatMoney(b.total, b.currency)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}