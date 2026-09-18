"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMyBookings } from "@/hooks/useMyBookings";
import { BookingsEmptyState } from "@/components/account/BookingsEmptyState";
import { TripCard } from "@/components/account/TripCard";
import { SupportPanel } from "@/components/account/SupportPanel";
import { getMyTrainBookings, TrainBookingConfirmation } from "@/lib/trainsApi";

export default function BookingsPage() {
  const { bookings, loading, error } = useMyBookings();
  const [trainBookings, setTrainBookings] = useState<TrainBookingConfirmation[]>([]);
  const [trainsLoading, setTrainsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"packages" | "trains">("packages");

  useEffect(() => {
    getMyTrainBookings()
      .then((res) => setTrainBookings(res))
      .catch(() => {})
      .finally(() => setTrainsLoading(false));
  }, []);

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">All journeys</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">My bookings</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Every journey you have requested or confirmed with Explorers Choice.</p>
      </section>

      {/* Tabs for Packages vs Train Tickets */}
      <div className="mt-6 flex border-b border-sand pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("packages")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 font-display text-sm font-semibold transition-colors ${
            activeTab === "packages"
              ? "border-forest text-forest"
              : "border-transparent text-charcoal-soft hover:text-forest"
          }`}
        >
          <span>🌴</span> Tour Packages ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("trains")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 font-display text-sm font-semibold transition-colors ${
            activeTab === "trains"
              ? "border-forest text-forest"
              : "border-transparent text-charcoal-soft hover:text-forest"
          }`}
        >
          <span>🚆</span> Train Tickets ({trainBookings.length})
        </button>
      </div>

      {activeTab === "packages" ? (
        loading ? (
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
        )
      ) : (
        /* Train Bookings Tab */
        trainsLoading ? (
          <p className="mt-8 text-charcoal-soft">Loading train bookings…</p>
        ) : trainBookings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-sand bg-white p-8 text-center sm:p-12">
            <span className="text-4xl">🚆</span>
            <h3 className="mt-3 font-display text-xl font-bold text-forest">No train tickets booked yet</h3>
            <p className="mt-2 text-sm text-charcoal-soft">Search Vande Bharat, Rajdhani, and Superfast express trains to reserve your seats.</p>
            <div className="mt-6">
              <Link href="/trains" className="inline-block rounded-lg bg-forest px-6 py-2.5 text-sm font-bold text-ivory hover:bg-forest/90">
                Book Train Tickets
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {trainBookings.map((tb) => (
              <div key={tb.id} className="rounded-xl border border-sand bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand pb-3">
                  <div>
                    <span className="rounded bg-forest/10 px-2 py-0.5 font-mono text-xs font-bold text-forest">{tb.train_number}</span>
                    <h3 className="text-lg font-bold text-forest">{tb.train_name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-charcoal-soft">PNR: </span>
                    <span className="font-mono text-base font-extrabold text-forest">{tb.pnr_number}</span>
                    <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">{tb.status}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <div>
                    <span className="text-xs text-charcoal-soft">From</span>
                    <p className="font-semibold text-forest">{tb.from_station_name} ({tb.from_station_code})</p>
                    <span className="text-xs text-charcoal-soft">{tb.departure_time}</span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-soft">To</span>
                    <p className="font-semibold text-forest">{tb.to_station_name} ({tb.to_station_code})</p>
                    <span className="text-xs text-charcoal-soft">{tb.arrival_time}</span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-soft">Journey Date</span>
                    <p className="font-semibold text-forest">{tb.journey_date}</p>
                    <span className="text-xs text-charcoal-soft">Class: {tb.travel_class}</span>
                  </div>
                  <div>
                    <span className="text-xs text-charcoal-soft">Total Paid</span>
                    <p className="text-base font-bold text-terracotta">₹{tb.total_amount.toLocaleString()}</p>
                    <span className="text-xs text-charcoal-soft">Ref: {tb.booking_reference}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-sand/60 pt-3">
                  <span className="text-xs font-bold uppercase text-charcoal-soft">Passengers &amp; Berths:</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {tb.passengers.map((p, idx) => (
                      <span key={idx} className="rounded bg-ivory/60 border border-sand px-2.5 py-1 text-xs text-forest">
                        <strong>{p.name}</strong> ({p.seat_number})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
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