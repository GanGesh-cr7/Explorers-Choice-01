"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type HotelAdmin, type HotelFormPayload } from "@/lib/admin";
import { imageUrlError } from "@/lib/images";
import { CLIENT_API_URL as API_URL } from "@/lib/api";

const listToText = (list: string[] | undefined): string => (list ?? []).join("\n");
const textToList = (text: string): string[] =>
  text.split("\n").map((s) => s.trim()).filter((s) => s.length > 0);

const EMPTY_FORM: HotelFormPayload = {
  name: "",
  location: "",
  destination: "",
  tagline: "",
  description: "",
  image: "",
  price_per_night: 0,
  currency: "INR",
  amenities: [],
  highlights: [],
  is_published: true,
};

const INPUT_CLS =
  "mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

const LABEL_CLS = "block text-sm font-semibold text-forest";

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    adminApi
      .adminHotels()
      .then(setHotels)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load hotels."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFlash("");
  }

  function startEdit(h: HotelAdmin) {
    setCreating(false);
    setEditingId(h.id);
    setForm({
      name: h.name,
      location: h.location,
      destination: h.destination,
      tagline: h.tagline,
      description: h.description,
      image: h.image,
      price_per_night: h.price_per_night,
      currency: h.currency,
      amenities: toLines(h.amenities),
      highlights: toLines(h.highlights),
      is_published: h.is_published,
    });
    setFlash("");
  }

  async function togglePublished(h: HotelAdmin) {
    setFlash("");
    try {
      await adminApi.updateHotel(h.id, { is_published: !h.is_published });
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not update the hotel.");
    }
  }

  async function remove(h: HotelAdmin) {
    setFlash("");
    if (!confirm(`Delete the hotel "${h.name}"?`)) return;
    try {
      await adminApi.deleteHotel(h.id);
      setFlash("Hotel deleted.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not delete the hotel.");
    }
  }

  async function save() {
    setFlash("");
    // BUG-16: reject image URLs that next/image would refuse to render.
    const imgError = imageUrlError(form.image, [API_URL]);
    if (imgError) {
      setFlash(imgError);
      return;
    }
    const payload: HotelFormPayload = {
      name: form.name.trim(),
      location: form.location.trim(),
      destination: form.destination.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      price_per_night: Number(form.price_per_night) || 0,
      currency: (form.currency.trim() || "INR").toUpperCase().slice(0, 3),
      amenities: textToList(form.amenities.join("\n")),
      highlights: textToList(form.highlights.join("\n")),
      is_published: form.is_published,
    };
    if (!payload.name || !payload.location) {
      setFlash("Give the hotel a name and a location.");
      return;
    }
    try {
      if (editingId !== null) await adminApi.updateHotel(editingId, payload);
      else await adminApi.createHotel(payload);
      setCreating(false);
      setEditingId(null);
      setFlash(editingId !== null ? "Hotel updated." : "Hotel created.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save the hotel.");
    }
  }

  if (error && hotels.length === 0) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading) return <p className="text-charcoal-soft">Loading hotels…</p>;

  const open = creating || editingId !== null;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Catalogue</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Hotels</h1>
          <p className="mt-3 max-w-2xl text-charcoal-soft">Accommodation listed on the site for travellers to discover.</p>
        </div>
        {!open && (
          <button type="button" onClick={startCreate} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark">
            New hotel
          </button>
        )}
      </section>

      {flash && <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}

      {open && (
        <section className="mt-6 rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{creating ? "Create a hotel" : "Edit hotel"}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className={LABEL_CLS}>
              Hotel name *
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mountain View Resort" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Location *
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Old Manali, Himachal Pradesh" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Destination
              <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Himachal Pradesh" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Tagline
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short hook shown under the name" className={INPUT_CLS} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={LABEL_CLS}>
                Price / night
                <input type="number" min={0} step="0.01" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })} placeholder="e.g. 4500" className={INPUT_CLS} />
              </label>
              <label className={LABEL_CLS}>
                Currency
                <input maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="INR" className={INPUT_CLS} />
              </label>
            </div>
            <label className={LABEL_CLS}>
              Image URL
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://…" className={INPUT_CLS} />
            </label>
            <label className={`${LABEL_CLS} sm:col-span-2`}>
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="What makes this stay special…" className={`${INPUT_CLS} min-h-28`} />
            </label>
            <label className={LABEL_CLS}>
              Amenities (one per line)
              <textarea value={listToText(form.amenities)} onChange={(e) => setForm({ ...form, amenities: textToList(e.target.value) })} rows={4} placeholder={"Free Wi-Fi\nRooftop cafe\nValley views"} className={`${INPUT_CLS} min-h-24`} />
            </label>
            <label className={LABEL_CLS}>
              Highlights (one per line)
              <textarea value={listToText(form.highlights)} onChange={(e) => setForm({ ...form, highlights: textToList(e.target.value) })} rows={4} placeholder={"Panoramic valley views\nOld Manali location"} className={`${INPUT_CLS} min-h-24`} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Publishing</p>
            <label className="flex items-center gap-2 text-sm font-semibold text-forest">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 accent-terracotta" />
              Visible on the site
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={save} className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark">
              {editingId !== null ? "Save hotel" : "Create hotel"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setEditingId(null); }} className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-soft hover:text-forest">
              Cancel
            </button>
          </div>
        </section>
      )}

      {hotels.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No hotels yet.</p>
          <p className="mt-2 text-sm text-charcoal-soft">Add your first hotel listing and it will show up on the site.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {hotels.map((h) => (
            <div key={h.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {h.image ? (
                  <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-line sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.image} alt={h.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="hidden h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-white text-[11px] text-charcoal-soft sm:flex">No image</div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-forest">{h.name}</p>
                    {!h.is_published && <span className="rounded-full bg-sand-light px-2.5 py-0.5 text-[11px] font-semibold text-charcoal-soft">unpublished</span>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-charcoal-soft">
                    {h.location}{h.destination ? ` · ${h.destination}` : ""} · {new Intl.NumberFormat(undefined, { style: "currency", currency: h.currency, maximumFractionDigits: 0 }).format(h.price_per_night)}/night
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-3">
                <button type="button" onClick={() => togglePublished(h)} className="rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">
                  {h.is_published ? "Unpublish" : "Publish"}
                </button>
                <button type="button" onClick={() => startEdit(h)} className="rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">Edit</button>
                <button type="button" onClick={() => remove(h)} className="rounded-full border border-terracotta/30 px-5 py-2 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-ivory">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function toLines(list: string[] | undefined): string[] {
  return (list ?? []).filter((s) => s.trim());
}