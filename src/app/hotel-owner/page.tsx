"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { Container } from "@/components/ui/Container";
import { hotelOwnerApi, type OwnerHotel, type HotelInput } from "@/lib/hotelsApi";

const EMPTY_FORM: HotelInput = {
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
};

const fieldClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

export default function HotelOwnerPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [hotels, setHotels] = useState<OwnerHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<OwnerHotel | null>(null);
  const [form, setForm] = useState<HotelInput>(EMPTY_FORM);
  const [amenitiesStr, setAmenitiesStr] = useState("");
  const [highlightsStr, setHighlightsStr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "HOTEL_OWNER")) {
      router.replace("/login?redirect=/hotel-owner");
    }
  }, [authLoading, user, router]);

  const load = useCallback(() => {
    hotelOwnerApi
      .myHotels()
      .then(setHotels)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load hotels."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role === "HOTEL_OWNER") load();
  }, [user, load]);

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setAmenitiesStr("");
    setHighlightsStr("");
    setCreating(true);
  }

  function startEdit(hotel: OwnerHotel) {
    setCreating(false);
    setEditing(hotel);
    setForm({
      name: hotel.name,
      location: hotel.location,
      destination: hotel.destination,
      tagline: hotel.tagline,
      description: hotel.description,
      image: hotel.image,
      price_per_night: hotel.price_per_night,
      currency: hotel.currency,
      amenities: hotel.amenities,
      highlights: hotel.highlights,
    });
    setAmenitiesStr(hotel.amenities.join(", "));
    setHighlightsStr(hotel.highlights.join(", "));
  }

  function resetForm() {
    setCreating(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setAmenitiesStr("");
    setHighlightsStr("");
  }

  async function submitForm() {
    setFlash("");
    if (!form.name.trim() || !form.location.trim()) {
      setFlash("Hotel name and location are required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: HotelInput = {
        ...form,
        name: form.name.trim(),
        location: form.location.trim(),
        amenities: amenitiesStr.split(",").map((s) => s.trim()).filter(Boolean),
        highlights: highlightsStr.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editing) {
        await hotelOwnerApi.update(editing.id, payload);
        setFlash("Hotel updated.");
      } else {
        await hotelOwnerApi.create(payload);
        setFlash("Hotel created.");
      }
      resetForm();
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save hotel.");
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePublished(hotel: OwnerHotel) {
    setFlash("");
    try {
      await hotelOwnerApi.update(hotel.id, { is_published: !hotel.is_published });
      setFlash(hotel.is_published ? "Hotel unpublished." : "Hotel published.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not update hotel.");
    }
  }

  async function remove(hotel: OwnerHotel) {
    setFlash("");
    if (!confirm(`Delete "${hotel.name}" permanently?`)) return;
    try {
      await hotelOwnerApi.remove(hotel.id);
      setHotels((prev) => prev.filter((h) => h.id !== hotel.id));
      setFlash(`"${hotel.name}" deleted.`);
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not delete hotel.");
    }
  }

  if (authLoading || !user || user.role !== "HOTEL_OWNER") {
    return <Container className="py-20"><p className="text-charcoal-soft">Loading…</p></Container>;
  }

  return (
    <Container className="py-12 sm:py-16">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Hotel Owner</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">My Hotels</h1>
          <p className="mt-3 max-w-2xl text-charcoal-soft">List and manage your properties on Explorers Choice.</p>
        </div>
        {!creating && !editing && (
          <button
            type="button"
            onClick={startCreate}
            className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark"
          >
            Add hotel
          </button>
        )}
      </section>

      {flash && (
        <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">
          {flash}
        </p>
      )}

      {(creating || editing) && (
        <section className="mt-6 rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            {editing ? "Edit hotel" : "Add a hotel"}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-forest sm:col-span-2 lg:col-span-1">
              Hotel name *
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mountain View Resort"
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Location *
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Manali, Himachal Pradesh"
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Destination
              <input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="e.g. Himachal Pradesh"
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Tagline
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Short tagline shown on listing"
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Price per night (₹)
              <input
                type="number"
                min={0}
                value={form.price_per_night || ""}
                onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) || 0 })}
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Currency
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase().slice(0, 3) })}
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest sm:col-span-2 lg:col-span-1">
              Image URL
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest sm:col-span-2">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell guests about this hotel…"
                className={`${fieldClasses} mt-2 resize-y`}
              />
            </label>
            <label className="block text-sm font-semibold text-foreground sm:col-span-2 lg:col-span-1">
              Amenities <span className="font-normal text-charcoal-soft">(comma-separated)</span>
              <input
                value={amenitiesStr}
                onChange={(e) => setAmenitiesStr(e.target.value)}
                placeholder="e.g. Pool, Spa, Restaurant, Wi-Fi"
                className={`${fieldClasses} mt-2`}
              />
            </label>
            <label className="block text-sm font-semibold text-forest sm:col-span-2 lg:col-span-1">
              Highlights <span className="font-normal text-charcoal-soft">(comma-separated)</span>
              <input
                value={highlightsStr}
                onChange={(e) => setHighlightsStr(e.target.value)}
                placeholder="e.g. Mountain views, Rooftop bar, Free parking"
                className={`${fieldClasses} mt-2`}
              />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={submitForm}
              disabled={submitting}
              className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark disabled:opacity-50"
            >
              {submitting ? "Saving…" : editing ? "Save changes" : "Create hotel"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-soft hover:text-forest"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <p className="mt-8 text-charcoal-soft">Loading your hotels…</p>
      ) : error && hotels.length === 0 ? (
        <p className="mt-8 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>
      ) : hotels.length === 0 && !creating ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No hotels listed yet.</p>
          <p className="mt-2 text-sm text-charcoal-soft">Click &quot;Add hotel&quot; to submit your first listing.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-forest">{hotel.name}</p>
                  {hotel.is_published ? (
                    <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-forest">
                      published
                    </span>
                  ) : (
                    <span className="rounded-full bg-terracotta/15 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">
                      draft
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-charcoal-soft">{hotel.location}{hotel.destination ? ` · ${hotel.destination}` : ""}</p>
                {hotel.price_per_night > 0 && (
                  <p className="mt-1 text-sm text-charcoal-soft">₹{hotel.price_per_night.toLocaleString("en-IN")} / night</p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => togglePublished(hotel)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                    hotel.is_published
                      ? "border-terracotta/30 text-terracotta hover:bg-terracotta hover:text-ivory"
                      : "border-forest/30 text-forest hover:bg-forest hover:text-ivory"
                  }`}
                >
                  {hotel.is_published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(hotel)}
                  className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-charcoal-soft hover:text-forest"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(hotel)}
                  aria-label={`Delete ${hotel.name}`}
                  title="Delete hotel"
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
      )}
    </Container>
  );
}