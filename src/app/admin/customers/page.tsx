"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type CustomerSummary } from "@/lib/admin";

const STAFF_ROLES = ["TRAVEL_AGENT", "MANAGER", "ACCOUNTANT", "ADMIN"] as const;

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    adminApi
      .customers()
      .then(setCustomers)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load customers."))
      .finally(() => setLoading(false));
  }, []);

  async function promote(customer: CustomerSummary, role: (typeof STAFF_ROLES)[number]) {
    setFlash("");
    if (!confirm(`Promote ${customer.full_name || customer.email} to ${role.replace(/_/g, " ").toLowerCase()}?`)) return;
    try {
      await adminApi.promoteCustomer(customer.id, role);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      setFlash(`${customer.email} is now ${role.replace(/_/g, " ").toLowerCase()}.`);
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not promote this customer.");
    }
  }

  async function remove(customer: CustomerSummary) {
    setFlash("");
    if (!confirm(`Delete customer ${customer.full_name || customer.email} permanently? Their bookings and history will be kept, but the account will be removed.`)) return;
    try {
      await adminApi.deleteCustomer(customer.id);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));
      setFlash(`${customer.email} deleted.`);
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not delete this customer.");
    }
  }

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
        <>
          {flash && <p role="alert" className="mt-8 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}
          <div className="mt-8 space-y-3">
            {customers.map((c) => (
              <div key={c.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/admin/customers/${c.id}`} className="min-w-0">
                  <p className="font-semibold text-forest">{c.full_name || c.email}</p>
                  <p className="mt-0.5 text-sm text-charcoal-soft">{c.email}{c.country ? ` · ${c.country}` : ""}</p>
                  {c.requested_role === "TRAVEL_AGENT" && <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-terracotta">Travel agent application pending</p>}
                  <p className="mt-2 text-sm text-charcoal-soft">{c.booking_count} booking{c.booking_count !== 1 ? "s" : ""} · {c.enquiry_count} enquiry{c.enquiry_count !== 1 ? "ies" : "y"} · {new Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }).format(c.total_spent)}</p>
                </Link>
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-forest">
                  Promote to
                  <select defaultValue="" onChange={(e) => { const role = e.target.value as (typeof STAFF_ROLES)[number]; if (role) promote(c, role); e.currentTarget.value = ""; }} className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                    <option value="">Select role</option>
                    {STAFF_ROLES.map((role) => <option key={role} value={role}>{role.replace(/_/g, " ").toLowerCase()}</option>)}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  aria-label={`Delete ${c.full_name || c.email}`}
                  title="Delete customer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-terracotta/30 text-terracotta transition-colors hover:bg-terracotta hover:text-ivory"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" />
                  </svg>
                </button>
                </div>
              </div>
            ))}
          </div>
          </>
      )}
    </>
  );
}