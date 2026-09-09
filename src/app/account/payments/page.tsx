"use client";

import Link from "next/link";
import { useMyBookings } from "@/hooks/useMyBookings";
import { formatMoney, paymentStatusLabel } from "@/lib/bookingMeta";
import { SupportPanel } from "@/components/account/SupportPanel";

export default function PaymentsPage() {
  const { bookings, loading, error } = useMyBookings();

  const paidBookings = bookings.filter((b) => b.payment_status === "PAID");
  const unpaidBookings = bookings.filter((b) => ["PENDING", "PARTIALLY_PAID"].includes(b.payment_status));

  const totalPaid = paidBookings.reduce((sum, b) => sum + b.total, 0);
  const totalPending = unpaidBookings.reduce((sum, b) => sum + b.total, 0);

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Financial overview</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Payments</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Your outstanding and completed payments across all journeys.</p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Paid</p>
          <p className="mt-3 font-display text-3xl text-forest">{formatMoney(totalPaid)}</p>
          <p className="mt-1 text-sm text-charcoal-soft">{paidBookings.length} confirmed payment{paidBookings.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Outstanding</p>
          <p className="mt-3 font-display text-3xl text-forest">{formatMoney(totalPending)}</p>
          <p className="mt-1 text-sm text-charcoal-soft">{unpaidBookings.length} booking{unpaidBookings.length !== 1 ? "s" : ""} awaiting payment</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-8 text-charcoal-soft">Loading payments…</p>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
      ) : bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No payments to display yet.</p>
          <p className="mt-3 text-charcoal-soft">Payment information will appear once your booking is confirmed.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => (
            <Link key={b.id} href={`/account/bookings/${b.id}`} className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-terracotta/40 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-forest">{b.package_name}</p>
                <p className="text-sm text-charcoal-soft">{b.booking_reference} · {b.travel_date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{paymentStatusLabel(b.payment_status)}</span>
                <span className="font-display text-lg text-forest">{formatMoney(b.total, b.currency)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <SupportPanel
          message="Talk to Explorers Choice if you have questions about a payment or booking cost."
          whatsappMessage="Hello Explorers Choice, I have a question about a payment or booking cost."
        />
      </div>
    </>
  );
}