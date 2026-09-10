"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type CustomerSummary } from "@/lib/admin";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .customers()
      .then(setCustomers)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load customers."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Customers</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Your travellers</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Registered customers, their bookings and enquiry history.</p>
      </section>

      {error ? (
        <p className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
      ) : loading ? (
        <p className="mt-8 text-charcoal-soft">Loading customers…</p>
      ) : customers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No registered customers yet.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {customers.map((c) => (
            <Link key={c.id} href={`/admin/customers/${c.id}`} className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-terracotta/40 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-forest">{c.full_name || c.email}</p>
                <p className="mt-0.5 text-sm text-charcoal-soft">{c.email}{c.country ? ` · ${c.country}` : ""}</p>
              </div>
              <div className="flex shrink-0 gap-4 text-sm">
                <span className="text-charcoal-soft">{c.booking_count} booking{c.booking_count !== 1 ? "s" : ""}</span>
                <span className="text-charcoal-soft">{c.enquiry_count} enquiry{c.enquiry_count !== 1 ? "ies" : ""}</span>
                <span className="font-semibold text-forest">
                  {new Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }).format(c.total_spent)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}