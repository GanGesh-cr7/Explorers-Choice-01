"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { adminApi, ENQUIRY_STAGES, type Enquiry, type StaffMember } from "@/lib/admin";

export default function AdminEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const enquiryId = Number(idStr);

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [status, setStatus] = useState("NEW");
  const [assigned, setAssigned] = useState<number | "">("");
  const [nextAction, setNextAction] = useState("");
  const [nextActionAt, setNextActionAt] = useState("");
  const [notes, setNotes] = useState("");

  const load = () => {
    adminApi
      .enquiry(enquiryId)
      .then((e) => {
        setEnquiry(e);
        setStatus(e.status);
        setAssigned(e.assigned_staff_id ?? "");
        setNextAction(e.next_action);
        setNextActionAt(e.next_action_at ?? "");
        setNotes(e.notes);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load enquiry."));
  };

  useEffect(load, [enquiryId]);

  useEffect(() => {
    adminApi.staffAssign().then(setStaff).catch(() => setStaff([]));
  }, []);

  async function save() {
    if (!enquiry) return;
    setFlash("");
    try {
      await adminApi.updateEnquiry(enquiry.id, {
        status: status as Enquiry["status"],
        assigned_staff_id: assigned === "" ? null : Number(assigned),
        next_action: nextAction,
        next_action_at: nextActionAt || null,
        notes,
        last_contact_at: new Date().toISOString(),
      });
      setFlash("Enquiry updated.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save changes.");
    }
  }

  if (error && !enquiry) {
    return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  }
  if (!enquiry) {
    return <p className="text-charcoal-soft">Loading enquiry…</p>;
  }

  return (
    <>
      <Link href="/admin/enquiries" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        All enquiries
      </Link>

      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Enquiry #{enquiry.id}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">{enquiry.customer_name}</h1>
        <p className="mt-2 text-charcoal-soft">{enquiry.email}{enquiry.phone ? ` · ${enquiry.phone}` : ""}{enquiry.country ? ` · ${enquiry.country}` : ""}</p>
        <div className="mt-4">
          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{enquiry.status.replace(/_/g, " ").toLowerCase()}</span>
        </div>
      </section>

      {flash && <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Inquiry details</p>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-charcoal-soft">Destination interest</dt><dd className="font-semibold text-forest">{enquiry.destination_interest || "—"}</dd></div>
              <div><dt className="text-charcoal-soft">Package</dt><dd className="font-semibold text-forest">{enquiry.package_name || "—"}</dd></div>
              <div><dt className="text-charcoal-soft">Travellers</dt><dd className="font-semibold text-forest">{enquiry.travellers}</dd></div>
              <div><dt className="text-charcoal-soft">Travel dates</dt><dd className="font-semibold text-forest">{enquiry.travel_date_from ? `${enquiry.travel_date_from} — ${enquiry.travel_date_to ?? "flexible"}` : "Flexible"}</dd></div>
              <div><dt className="text-charcoal-soft">Budget</dt><dd className="font-semibold text-forest">{enquiry.budget || "—"}</dd></div>
              <div><dt className="text-charcoal-soft">Received</dt><dd className="font-semibold text-forest">{new Date(enquiry.created_at).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</dd></div>
              {enquiry.message && <div className="sm:col-span-2"><dt className="text-charcoal-soft">Message</dt><dd className="font-semibold text-forest">{enquiry.message}</dd></div>}
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Update enquiry</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-forest">
                Stage
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                  {ENQUIRY_STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-forest">
                Assigned to
                <select value={assigned} onChange={(e) => setAssigned(e.target.value === "" ? "" : Number(e.target.value))} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.email}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-forest">
                Next action
                <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="e.g. Send quote" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-forest">
                Next action date
                <input type="date" value={nextActionAt} onChange={(e) => setNextActionAt(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
              </label>
            </div>
            <label className="mt-4 block text-sm font-semibold text-forest">
              Internal notes
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 min-h-24 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
            <button type="button" onClick={save} className="mt-4 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark">
              Save enquiry
            </button>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Assigned planner</p>
            <p className="mt-3 text-sm font-semibold text-forest">{enquiry.assigned_staff?.full_name || enquiry.assigned_staff?.email || "Unassigned"}</p>
          </section>
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Next steps</p>
            <p className="mt-3 text-sm text-charcoal-soft">{enquiry.next_action || "No follow-up scheduled."}{enquiry.next_action_at ? ` · ${enquiry.next_action_at}` : ""}</p>
          </section>
        </aside>
      </div>
    </>
  );
}