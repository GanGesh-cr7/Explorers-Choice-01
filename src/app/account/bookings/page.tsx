"use client";

import { useMyBookings } from "@/hooks/useMyBookings";
import { BookingsEmptyState } from "@/components/account/BookingsEmptyState";
import { TripCard } from "@/components/account/TripCard";
import { SupportPanel } from "@/components/account/SupportPanel";

export default function BookingsPage() {
  const { bookings, loading, error } = useMyBookings();

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">All journeys</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">My bookings</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Every journey you have requested or confirmed with Explorers Choice.</p>
      </section>

      {loading ? (
        <p className="mt-8 text-charcoal-soft">Loading your trips…</p>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
      ) : bookings.length === 0 ? (
        <div className="mt-8">
          <BookingsEmptyState />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => <TripCard key={b.id} booking={b} />)}
        </div>
      )}

      <div className="mt-12">
        <SupportPanel
          message="Your travel planner can answer questions about any of your bookings and confirm next steps."
          whatsappMessage="Hello Explorers Choice, I have a question about one of my bookings."
        />
      </div>
    </>
  );
}