"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { fetchBookingDetail, buildDocumentDownloadUrl, type BookingDetail } from "@/lib/account";
import { Container } from "@/components/ui/Container";

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

const TIMELINE_STEPS = ["PENDING", "PENDING_CONFIRMATION", "CONFIRMED", "PAYMENT_PENDING", "PAID", "COMPLETED"];
const TIMELINE_LABELS = ["Requested", "Awaiting confirmation", "Confirmed", "Payment pending", "Paid", "Ready to travel"];

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function Timeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = TIMELINE_STEPS.indexOf(currentStatus);
  return (
    <ol className="mt-5 space-y-3" aria-label="Booking status timeline">
      {TIMELINE_STEPS.map((step, idx) => {
        const reached = currentIdx >= idx;
        const active = currentIdx === idx;
        return (
          <li key={step} className="flex items-start gap-3">
            <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${reached ? "border-forest bg-forest" : "border-line bg-ivory"}`}><span className="h-2 w-2 rounded-full bg-ivory" /></span>
            <div>
              <p className={`text-sm font-semibold ${reached ? "text-forest" : "text-charcoal-soft"}`}>{TIMELINE_LABELS[idx]}</p>
              {active && <p className="mt-0.5 text-xs text-terracotta">Current status</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function useBookingDetail(bookingId: number) {
  const [data, setData] = useState<BookingDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(bookingId)) return;
    fetchBookingDetail(bookingId)
      .then(setData)
      .catch((err) => setError(err?.message ?? "Booking not found."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  return { data, error, loading };
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const bookingId = Number(idStr);
  const { data, error, loading } = useBookingDetail(bookingId);

  if (loading) return <Container className="py-20 text-center text-charcoal-soft">Loading trip details…</Container>;
  if (error || !data) return <Container className="py-20 text-center text-charcoal-soft">{error || "Booking not found"}</Container>;

  const paidAmount = data.payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = Math.max(0, data.total - paidAmount);

  return (
    <main className="py-6 sm:py-10">
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Booking {data.booking_reference}</p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-forest sm:text-5xl">{data.destination_name}</h1>
        <p className="mt-2 text-charcoal-soft">{data.package_name} · {data.travel_date}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{STATUSES[data.status] ?? data.status}</span>
          <span className="rounded-full bg-sand-light px-3 py-1 text-xs font-semibold text-charcoal-soft">{PAYMENT_STATUSES[data.payment_status] ?? data.payment_status}</span>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div>
          {/* Trip */}
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Trip</p>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-charcoal-soft">Package</dt><dd className="font-semibold text-forest">{data.package_name}</dd></div>
              <div><dt className="text-charcoal-soft">Destination</dt><dd className="font-semibold text-forest">{data.destination_name}</dd></div>
              <div><dt className="text-charcoal-soft">Travel date</dt><dd className="font-semibold text-forest">{data.travel_date}</dd></div>
              <div><dt className="text-charcoal-soft">Travellers</dt><dd className="font-semibold text-forest">{data.adults} adults{data.children ? `, ${data.children} children` : ""}{data.infants ? `, ${data.infants} infants` : ""}</dd></div>
              <div><dt className="text-charcoal-soft">Departure</dt><dd className="font-semibold text-forest">{data.departure_information || "—"}</dd></div>
              <div><dt className="text-charcoal-soft">Special requirements</dt><dd className="font-semibold text-forest">{data.special_requirements || "—"}</dd></div>
            </dl>
          </section>

          {/* Status timeline */}
          <section className="mt-8 rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Status</p>
            <Timeline currentStatus={data.status} />
          </section>

          {/* Documents */}
          <section className="mt-8 rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Documents</p>
            {data.documents.length === 0 ? (
              <p className="mt-4 text-sm text-charcoal-soft">Your travel documents will appear here once your booking is confirmed.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {data.documents.map((doc) => (
                  <a key={doc.id} href={buildDocumentDownloadUrl(doc.id)} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 text-sm transition-colors hover:border-terracotta/40">
                    <div>
                      <p className="font-semibold text-forest">{doc.title}</p>
                      <p className="text-charcoal-soft">{doc.document_type.replace("_", " ")}</p>
                    </div>
                    <svg className="h-4 w-4 shrink-0 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4" /></svg>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Payments</p>
            <div className="mt-4 space-y-3 border-y border-line py-4 text-sm">
              <p><span className="text-charcoal-soft">Total</span><strong className="float-right text-forest">{formatMoney(data.total, data.currency)}</strong></p>
              <p><span className="text-charcoal-soft">Paid</span><strong className="float-right text-forest">{formatMoney(paidAmount, data.currency)}</strong></p>
              <p><span className="text-charcoal-soft">Remaining</span><strong className="float-right text-forest">{formatMoney(remainingAmount, data.currency)}</strong></p>
            </div>
            {data.payments.length > 0 && (
              <ul className="mt-4 space-y-2 text-xs text-charcoal-soft">
                {data.payments.map((payment, idx) => <li key={idx}>{payment.status === "PAID" ? "✓" : "•"} {formatMoney(payment.amount, payment.currency)} {payment.provider_reference ? `(${payment.provider_reference})` : ""}</li>)}
              </ul>
            )}
            <p className="mt-4 text-xs text-charcoal-soft">Status: {PAYMENT_STATUSES[data.payment_status] ?? data.payment_status}</p>
          </div>

          <div className="rounded-2xl border border-line bg-sand-light/50 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Need help?</p>
            <p className="mt-3 text-sm text-charcoal-soft">Your travel planner can answer questions about your booking and confirm next steps.</p>
            <Link href="/contact" className="mt-4 block w-full rounded-full bg-forest px-6 py-3 text-center text-sm font-semibold text-ivory transition-colors hover:bg-forest-light">Talk to Explorers Choice</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}