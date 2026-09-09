"use client";

import { useEffect, useState } from "react";
import { fetchMyBookings, fetchMyDocuments, buildDocumentDownloadUrl, type DocumentRecord } from "@/lib/account";
import { SupportPanel } from "@/components/account/SupportPanel";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchMyBookings()
      .then((items) => {
        if (cancelled) return;
        const ids = items.map((b) => b.id);
        if (!ids.length) return;
        return Promise.all(ids.map((id) => fetchMyDocuments(id)))
          .then((groups) => groups.flat())
          .then((docs) => !cancelled && setDocuments(docs));
      })
      .catch(() => {
        if (!cancelled) setError("We could not load your documents right now. Please try again shortly.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Travel documents</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Documents</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Your invoices, hotel vouchers and travel confirmations.</p>
      </section>

      {loading ? (
        <p className="mt-8 text-charcoal-soft">Loading documents…</p>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
      ) : documents.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">Your travel documents will appear here once your booking is confirmed.</p>
          <p className="mt-3 text-charcoal-soft">We will prepare your invoices, vouchers and confirmations as your trip approaches.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {documents.map((doc) => (
            <a key={doc.id} href={buildDocumentDownloadUrl(doc.id)} className="flex items-center justify-between rounded-2xl border border-line bg-cream p-6 transition-colors hover:border-terracotta/40">
              <div>
                <p className="font-semibold text-forest">{doc.title}</p>
                <p className="text-sm text-charcoal-soft">{doc.document_type.replace("_", " ")}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4" /></svg>
            </a>
          ))}
        </div>
      )}

      <div className="mt-12">
        <SupportPanel
          message="Your planner can send you a missing voucher or booking confirmation at any time."
          whatsappMessage="Hello Explorers Choice, I am missing a travel document for my booking."
        />
      </div>
    </>
  );
}