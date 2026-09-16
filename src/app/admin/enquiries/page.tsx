"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { adminApi, ENQUIRY_STAGES, type Enquiry } from "@/lib/admin";

export default function AdminEnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [filter, setFilter] = useState<string>("");
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // BUG-12: sequence counter to discard stale responses.
  const seqRef = useRef(0);

  useEffect(() => {
    (async () => {
      const params = await searchParams;
      if (params.status) setFilter(params.status);
    })();
  }, [searchParams]);

  useEffect(() => {
    const seq = ++seqRef.current;
    adminApi
      .enquiries(filter || undefined)
      .then((data) => {
        // BUG-12: ignore out-of-order responses.
        if (seq !== seqRef.current) return;
        setEnquiries(data);
      })
      .catch((err) => {
        if (seq !== seqRef.current) return;
        setError(err instanceof Error ? err.message : "Could not load enquiries.");
      })
      .finally(() => {
        if (seq !== seqRef.current) return;
        setLoading(false);
      });
  }, [filter]);

  function changeFilter(next: string) {
    // BUG-11: if the filter hasn't changed, don't set loading=true and re-fetch.
    if (next === filter) return;
    setLoading(true);
    setError("");
    setFilter(next);
  }

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">CRM</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Enquiries</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Leads from the site and conversations logged by your team.</p>
      </section>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["", ...ENQUIRY_STAGES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeFilter(s)}
            aria-pressed={filter === s}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              filter === s ? "border-forest bg-forest text-ivory" : "border-line bg-white text-charcoal-soft hover:text-forest"
            }`}
          >
            {s === "" ? "All" : s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
      ) : loading ? (
        <p className="mt-8 text-charcoal-soft">Loading enquiries…</p>
      ) : enquiries.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No enquiries here.</p>
          <p className="mt-2 text-sm text-charcoal-soft">New enquiries from the site will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {enquiries.map((e) => (
            <Link key={e.id} href={`/admin/enquiries/${e.id}`} className="flex flex-col gap-2 rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-terracotta/40 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-forest">{e.customer_name}</p>
                <p className="mt-0.5 text-sm text-charcoal-soft">
                  {e.destination_interest || "No destination"} · {e.travellers} traveller{e.travellers !== 1 ? "s" : ""}
                  {e.travel_date_from ? ` · ${e.travel_date_from}` : ""}
                </p>
                <p className="mt-1 text-xs text-charcoal-soft">{e.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{e.status.replace(/_/g, " ").toLowerCase()}</span>
                <span className="hidden text-xs text-charcoal-soft sm:inline">{new Date(e.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}