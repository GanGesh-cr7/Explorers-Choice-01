"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers";
import { useMyBookings } from "@/hooks/useMyBookings";
import { formatDate, formatMoney, paymentStatusLabel, statusLabel } from "@/lib/bookingMeta";
import { SupportPanel } from "@/components/account/SupportPanel";
import { BookingsEmptyState } from "@/components/account/BookingsEmptyState";
import { TripCard } from "@/components/account/TripCard";

function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86400000);
}

export default function AccountPage() {
  const { user } = useAuth();
  const { bookings, loading, error } = useMyBookings();

  const active = bookings.filter((b) => !["CANCELLED", "COMPLETED"].includes(b.status));
  const nextTrip = [...active].find((b) => daysUntil(b.travel_date) >= 0) ?? active[0];
  const paidBooking = bookings.find((b) => b.payment_status === "PAID") ?? active[0] ?? bookings[0];
  const recent = bookings.slice(0, 3);

  return (
    <>
      <section className="border-b border-line pb-8 sm:mb-10 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Welcome back, {user?.full_name?.split(" ")[0] || "traveller"}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Your journeys</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">
          Every trip you have booked with Explorers Choice lives here — upcoming journeys, payments and everything you need before departure.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Next trip</p>
          {nextTrip ? (
            <div className="mt-3">
              <p className="font-display text-xl text-forest">{nextTrip.destination_name}</p>
              <p className="mt-1 text-sm text-charcoal-soft">{nextTrip.package_name} · {formatDate(nextTrip.travel_date)}</p>
              <p className="mt-2 text-sm font-semibold text-forest">
                {daysUntil(nextTrip.travel_date) > 0
                  ? `${daysUntil(nextTrip.travel_date)} day${daysUntil(nextTrip.travel_date) !== 1 ? "s" : ""} to go`
                  : daysUntil(nextTrip.travel_date) === 0
                    ? "Departs today"
                    : "Trip in progress"}
              </p>
              <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${nextTrip.status === "CONFIRMED" ? "bg-forest/10 text-forest" : "bg-ivory text-forest"}`}>
                {statusLabel(nextTrip.status)}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-charcoal-soft">Your next journey hasn&apos;t been chosen yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Payment status</p>
          {paidBooking ? (
            <div className="mt-3">
              <p className="font-display text-2xl text-forest">{formatMoney(paidBooking.total, paidBooking.currency)}</p>
              <p className="mt-1 text-sm text-charcoal-soft">{paidBooking.package_name}</p>
              <span className="mt-2 inline-block rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{paymentStatusLabel(paidBooking.payment_status)}</span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-charcoal-soft">No payments are due yet.</p>
          )}
        </div>

        <SupportPanel
          message="Talk to a real travel planner who knows your trip and can confirm next steps."
          whatsappMessage="Hello Explorers Choice, I have a question about my journey."
        />
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-3xl text-forest">Recent journeys</h2>
          {bookings.length > 0 && (
            <Link href="/account/bookings" className="text-sm font-semibold text-terracotta hover:underline">
              View all trips →
            </Link>
          )}
        </div>
        {loading ? (
          <p className="mt-6 text-charcoal-soft">Loading your trips…</p>
        ) : error ? (
          <p className="mt-6 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="mt-6">
            <BookingsEmptyState />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {recent.map((b) => <TripCard key={b.id} booking={b} />)}
            {bookings.length > 3 && (
              <Link href="/account/bookings" className="block rounded-2xl border border-dashed border-line p-5 text-center text-sm font-semibold text-terracotta transition-colors hover:border-terracotta/50">
                View all {bookings.length} trips
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}