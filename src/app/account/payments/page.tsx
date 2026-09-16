"use client";

import Link from "next/link";
import { useMyBookings } from "@/hooks/useMyBookings";
import { formatMoney, paymentStatusLabel } from "@/lib/bookingMeta";
import { SupportPanel } from "@/components/account/SupportPanel";

export default function PaymentsPage() {
  const { bookings, loading, error } = useMyBookings();

  // BUG-07: group by currency to avoid mixing INR + USD totals.
  // "Paid" = only fully PAID bookings. "Outstanding" = remaining balance per booking.
  const currencyTotals: Record<string, { paid: number; outstanding: number; paidCount: number; outstandingCount: number }> = {};
  for (const b of bookings) {
    const c = b.currency || "INR";
    if (!currencyTotals[c]) currencyTotals[c] = { paid: 0, outstanding: 0, paidCount: 0, outstandingCount: 0 };
    if (b.payment_status === "PAID") {
      currencyTotals[c].paid += b.total;
      currencyTotals[c].paidCount += 1;
    } else if (["PENDING", "PARTIALLY_PAID"].includes(b.payment_status)) {
      // Outstanding = total minus any partial payments already made.
      // The server's payment_status tells us "PARTIALLY_PAID" but we don't have the paid amount here.
      // Use conservative display: show full total as outstanding.
      currencyTotals[c].outstanding += b.total;
      currencyTotals[c].outstandingCount += 1;
    }
  }
  const currencies = Object.keys(currencyTotals);

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Financial overview</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Payments</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Your outstanding and completed payments across all journeys.</p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {currencies.length === 0 ? (
          <>
            <div className="rounded-2xl border border-line bg-cream p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Paid</p>
              <p className="mt-3 font-display text-3xl text-forest">{formatMoney(0)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-cream p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Outstanding</p>
              <p className="mt-3 font-display text-3xl text-forest">{formatMoney(0)}</p>
            </div>
          </>
        ) : currencies.map((c) => {
          const { paid, outstanding, paidCount, outstandingCount } = currencyTotals[c];
          return (
            <div key={c} className="rounded-2xl border border-line bg-cream p-6 col-span-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Summary ({c})</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-soft">Paid</span>
                  <span className="font-semibold text-forest">{formatMoney(paid, c)} ({paidCount} booking{paidCount !== 1 ? "s" : ""})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-soft">Outstanding</span>
                  <span className="font-semibold text-forest">{formatMoney(outstanding, c)} ({outstandingCount} booking{outstandingCount !== 1 ? "s" : ""})</span>
                </div>
              </div>
            </div>
          );
        })}
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