"use client";

import { useEffect, useState } from "react";
import { adminApi, type AuditLogEntry } from "@/lib/admin";

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .auditLog()
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the audit log."))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading) return <p className="text-charcoal-soft">Loading audit log…</p>;

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Accountability</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Audit log</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Every member action on bookings, payments and staff, most recent first.</p>
      </section>

      {entries.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-line bg-cream">
          {entries.map((entry, idx) => (
            <div key={entry.id} className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${idx > 0 ? "border-t border-line" : ""}`}>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-forest">
                  {entry.action.replace(/_/g, " ")} <span className="font-normal text-charcoal-soft">{entry.entity.replace(/_/g, " ")} · {entry.entity_id}</span>
                </p>
                {entry.details && <p className="mt-0.5 truncate text-xs text-charcoal-soft">{entry.details}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-charcoal-soft">{entry.username || `user ${entry.user_id ?? "?"}`}</p>
                <p className="text-xs text-charcoal-soft">{new Date(entry.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}