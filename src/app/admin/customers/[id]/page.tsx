"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { adminApi, type CustomerDetail } from "@/lib/admin";
import { formatMoney, statusLabel } from "@/lib/bookingMeta";

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const customerId = Number(idStr);

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .customer(customerId)
      .then(setCustomer)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load customer."))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (error) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading || !customer) return <p className="text-charcoal-soft">Loading customer…</p>;

  return (
    <>
      <Link href="/admin/customers" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        All customers
      </Link>

      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Customer</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">{customer.full_name || customer.email}</h1>
        <p className="mt-2 text-charcoal-soft">{customer.email}{customer.phone ? ` · ${customer.phone}` : ""}{customer.country ? ` · ${customer.country}` : ""}</p>
        <p className="mt-2 text-sm text-charcoal-soft">
          Member since {new Date(customer.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })} · {customer.booking_count} bookings · {customer.total_spent ? formatMoney(customer.total_spent) : "no spend yet"}
        </p>
      </section>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Bookings</p>
          {customer.bookings.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal-soft">No bookings yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {customer.bookings.map((b) => (
                <Link key={b.id} href={`/admin/bookings/${b.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:border-terracotta/40">
                  <div>
                    <p className="text-sm font-semibold text-forest">{b.package_name}</p>
                    <p className="mt-0.5 text-xs text-charcoal-soft">{b.booking_reference} · {b.travel_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display text-forest">{formatMoney(b.total, b.currency)}</p>
                    <span className="mt-0.5 inline-block rounded-full bg-ivory px-2.5 py-0.5 text-[11px] font-semibold text-forest">{statusLabel(b.status)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Enquiries</p>
          {customer.enquiries.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal-soft">No enquiries logged.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {customer.enquiries.map((e) => (
                <Link key={e.id} href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 transition-colors hover:border-terracotta/40">
                  <div>
                    <p className="text-sm font-semibold text-forest">{e.destination_interest || "No destination"}</p>
                    <p className="mt-0.5 text-xs text-charcoal-soft">{new Date(e.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-ivory px-2.5 py-0.5 text-[11px] font-semibold text-forest">{e.status.replace(/_/g, " ").toLowerCase()}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}