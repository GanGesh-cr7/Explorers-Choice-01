"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMyBookings, type BookingSummary } from "@/lib/account";
import { Button } from "@/components/ui/Button";

const STATUSES: Record<string, string> = {
  PENDING: "Under review",
  PENDING_CONFIRMATION: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  PAYMENT_PENDING: "Payment pending",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const PAYMENT_STATUSES: Record<string, string> = {
  NOT_REQUIRED: "No payment yet",
  PENDING: "Payment pending",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  FAILED: "Payment failed",
  REFUNDED: "Refunded",
};

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export default function AccountPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings().then(setBookings).finally(() => setLoading(false));
  }, []);

  const nextTrip = bookings.find((b) => b.travel_date >= new Date().toISOString().slice(0, 10) && !["CANCELLED", "COMPLETED"].includes(b.status));
  const lastTrip = bookings[0];

  return (
    <>
      <section className="border-b border-line pb-8 sm:mb-10 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Welcome back</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Your journeys</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">
          Every trip you have booked with Explorers Choice lives here — upcoming journeys, documents and everything you need before departure.
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Next trip</p>
          {nextTrip ? (
            <div className="mt-3">
              <p className="font-display text-xl text-forest">{nextTrip.destination_name}</p>
              <p className="mt-1 text-sm text-charcoal-soft">{nextTrip.package_name} · {new Date(`${nextTrip.travel_date}T00:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
              <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold text-forest bg-ivory ${nextTrip.status === "CONFIRMED" ? "bg-forest/10 text-forest" : ""}`}>{STATUSES[nextTrip.status] ?? nextTrip.status}</span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-charcoal-soft">Your next journey hasn&apos;t been chosen yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Payment status</p>
          {lastTrip ? (
            <div className="mt-3">
              <p className="font-display text-2xl text-forest">{formatMoney(lastTrip.total, lastTrip.currency)}</p>
              <span className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-forest bg-ivory">{PAYMENT_STATUSES[lastTrip.payment_status] ?? lastTrip.payment_status}</span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-charcoal-soft">No payments are due yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-sand-light/50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Need help?</p>
          <p className="mt-3 text-sm text-charcoal-soft">Talk to a real travel planner who knows your trip.</p>
          <Button href="/contact" variant="primary" size="md" className="mt-4">Talk to Explorers Choice</Button>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl text-forest">Your bookings</h2>
        {loading ? (
          <p className="mt-6 text-charcoal-soft">Loading your trips…</p>
        ) : bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-line bg-cream p-10 text-center">
            <p className="font-display text-2xl text-forest">Your next journey hasn&apos;t been chosen yet.</p>
            <p className="mt-3 text-charcoal-soft">Start exploring our journeys curated by real local experts.</p>
            <Button href="/packages" variant="primary" size="md" className="mt-6">Explore Packages</Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {bookings.map((b) => (
              <Link key={b.id} href={`/account/bookings/${b.id}`} className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-terracotta/40 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-forest">{b.package_name}</p>
                    <span className="text-xs text-charcoal-soft">{b.booking_reference}</span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal-soft">{b.destination_name} · {b.travel_date} · {b.adults + b.children} travellers</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{STATUSES[b.status] ?? b.status}</span>
                  <span className="font-display text-lg text-forest">{formatMoney(b.total, b.currency)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}