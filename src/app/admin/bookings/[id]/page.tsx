"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { adminApi, adminDocumentUrl, attachDocument, formatMoneyAmount, type BookingAdminDetail } from "@/lib/admin";
import { formatDate, formatMoney, paymentStatusLabel, statusLabel } from "@/lib/bookingMeta";

const BOOKING_STATUSES = ["PENDING_CONFIRMATION", "CONFIRMED", "PAYMENT_PENDING", "PAID", "UPCOMING", "TRAVELLING", "COMPLETED", "CANCELLED"];
const PAYMENT_STATUSES = ["NOT_REQUIRED", "PENDING", "PARTIALLY_PAID", "PAID", "FAILED", "REFUNDED"];
const DOC_TYPES = [
  { value: "invoice", label: "Invoice" },
  { value: "hotel_voucher", label: "Hotel voucher" },
  { value: "confirmation", label: "Confirmation" },
  { value: "travel_docs", label: "Travel documents" },
];

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const bookingId = Number(idStr);

  const [booking, setBooking] = useState<BookingAdminDetail | null>(null);
  const [error, setError] = useState("");

  // status control
  const [status, setStatus] = useState("PENDING_CONFIRMATION");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");

  // note form
  const [noteText, setNoteText] = useState("");

  // payment form
  const [pmtAmount, setPmtAmount] = useState("");
  const [pmtRef, setPmtRef] = useState("");

  // document form
  const [docType, setDocType] = useState("invoice");
  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  const load = () => {
    adminApi
      .booking(bookingId)
      .then((b) => {
        setBooking(b);
        setStatus(b.status);
        setPaymentStatus(b.payment_status);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load booking."));
  };

  useEffect(load, [bookingId]);

  async function saveStatus() {
    if (!booking) return;
    setSaving(true);
    setFlash("");
    try {
      await adminApi.updateBookingStatus(booking.id, status, paymentStatus);
      setFlash("Booking updated.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!booking || !noteText.trim()) return;
    try {
      await adminApi.addNote(booking.id, noteText.trim());
      setNoteText("");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not add note.");
    }
  }

  async function recordPayment() {
    if (!booking) return;
    const amount = Number(pmtAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFlash("Enter a valid payment amount.");
      return;
    }
    try {
      await adminApi.recordPayment({ booking_id: booking.id, amount, provider_reference: pmtRef, provider: "manual", status: "PAID" });
      setPmtAmount("");
      setPmtRef("");
      setFlash("Payment recorded.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not record payment.");
    }
  }

  async function uploadDocument() {
    if (!booking || !docFile) return;
    try {
      await attachDocument(booking.id, docType, docTitle.trim() || docFile.name, docFile);
      setDocTitle("");
      setDocFile(null);
      setFlash("Document attached.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not upload document.");
    }
  }

  if (error && !booking) {
    return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  }
  if (!booking) {
    return <p className="text-charcoal-soft">Loading booking…</p>;
  }

  const paidAmount = booking.payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <Link href="/admin/bookings" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:underline">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        All bookings
      </Link>

      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Booking {booking.booking_reference}</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">{booking.destination_name}</h1>
        <p className="mt-2 text-charcoal-soft">{booking.package_name} · {formatDate(booking.travel_date)} · {booking.duration_days} days</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-forest">{statusLabel(booking.status)}</span>
          <span className="rounded-full bg-sand-light px-3 py-1 text-xs font-semibold text-charcoal-soft">{paymentStatusLabel(booking.payment_status)}</span>
        </div>
      </section>

      {flash && (
        <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          {/* Customer */}
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Customer</p>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-charcoal-soft">Name</dt><dd className="font-semibold text-forest">{booking.full_name}</dd></div>
              <div><dt className="text-charcoal-soft">Email</dt><dd className="font-semibold text-forest">{booking.email}{booking.user ? " · registered" : " · guest"}</dd></div>
              <div><dt className="text-charcoal-soft">Phone</dt><dd className="font-semibold text-forest">{booking.phone || "—"}</dd></div>
              <div><dt className="text-charcoal-soft">Country</dt><dd className="font-semibold text-forest">{booking.country || "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-charcoal-soft">Departure information</dt><dd className="font-semibold text-forest">{booking.departure_information || "—"}</dd></div>
              {booking.special_requirements && <div className="sm:col-span-2"><dt className="text-charcoal-soft">Special requirements</dt><dd className="font-semibold text-forest">{booking.special_requirements}</dd></div>}
              {booking.notes && <div className="sm:col-span-2"><dt className="text-charcoal-soft">Notes</dt><dd className="font-semibold text-forest">{booking.notes}</dd></div>}
            </dl>
          </section>

          {/* Settings */}
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Update booking</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-forest">
                Status
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                  {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-forest">
                Payment status
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{paymentStatusLabel(s)}</option>)}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={saveStatus}
              disabled={saving}
              className="mt-4 rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </section>

          {/* Notes */}
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Internal notes</p>
            <div className="mt-4 space-y-3">
              {booking.internal_notes.length === 0 ? (
                <p className="text-sm text-charcoal-soft">No notes yet.</p>
              ) : (
                booking.internal_notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-line bg-white p-4">
                    <p className="text-sm text-charcoal">{note.body}</p>
                    <p className="mt-2 text-xs text-charcoal-soft">
                      {note.author?.full_name || note.author?.email || "System"} · {new Date(note.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))
              )}
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add an internal note…"
              className="mt-4 min-h-24 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none"
            />
            <button type="button" onClick={addNote} disabled={!noteText.trim()} className="mt-3 rounded-full border border-forest/30 px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory disabled:opacity-50">
              Add note
            </button>
          </section>

          {/* Documents */}
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Documents</p>
            <div className="mt-4 space-y-3">
              {booking.documents.length === 0 ? (
                <p className="text-sm text-charcoal-soft">No documents attached.</p>
              ) : (
                booking.documents.map((doc) => (
                  <a key={doc.id} href={adminDocumentUrl(doc.id)} className="flex items-center justify-between rounded-xl border border-line bg-white p-4 text-sm">
                    <span className="font-semibold text-forest">{doc.title}</span>
                    <span className="text-charcoal-soft">{doc.document_type.replace("_", " ")}</span>
                  </a>
                ))
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-forest">
                Type
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                  {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-forest">
                Title
                <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g. Hotel voucher" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
              </label>
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="file"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                className="flex-1 text-sm text-charcoal-soft file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-ivory"
              />
              <button type="button" onClick={uploadDocument} disabled={!docFile} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark disabled:opacity-50">
                Attach
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
          <section className="rounded-2xl border border-line bg-cream p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Payments</p>
            <div className="mt-4 space-y-2 border-y border-line py-4 text-sm">
              <p><span className="text-charcoal-soft">Total</span><strong className="float-right text-forest">{formatMoney(booking.total, booking.currency)}</strong></p>
              <p><span className="text-charcoal-soft">Paid</span><strong className="float-right text-forest">{formatMoneyAmount(paidAmount, booking.currency)}</strong></p>
              <p><span className="text-charcoal-soft">Remaining</span><strong className="float-right text-forest">{formatMoneyAmount(Math.max(0, booking.total - paidAmount), booking.currency)}</strong></p>
            </div>
            {booking.payments.length > 0 && (
              <ul className="mt-4 space-y-2 text-xs text-charcoal-soft">
                {booking.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span>{formatMoneyAmount(p.amount, p.currency)}{p.provider_reference ? ` · ${p.provider_reference}` : ""}</span>
                    <span className="font-semibold text-forest">{paymentStatusLabel(p.status)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 space-y-3">
              <input value={pmtAmount} onChange={(e) => setPmtAmount(e.target.value)} inputMode="decimal" placeholder="Amount (e.g. 500)" className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
              <input value={pmtRef} onChange={(e) => setPmtRef(e.target.value)} placeholder="Reference (optional)" className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
              <button type="button" onClick={recordPayment} className="w-full rounded-full border border-forest/30 px-6 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">
                Record paid amount
              </button>
            </div>
          </section>

          {booking.travellers.length > 0 && (
            <section className="rounded-2xl border border-line bg-cream p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Travellers</p>
              <div className="mt-4 space-y-2 text-sm">
                {booking.travellers.map((t) => (
                  <p key={t.traveller_type} className="flex justify-between text-charcoal-soft">
                    <span className="capitalize">{t.traveller_type.toLowerCase()}</span>
                    <span className="font-semibold text-forest">{t.quantity}</span>
                  </p>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}