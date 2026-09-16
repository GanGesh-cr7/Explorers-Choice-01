"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type DestinationAdmin, type DestinationFormPayload } from "@/lib/admin";
import { imageUrlError } from "@/lib/images";
import { CLIENT_API_URL as API_URL } from "@/lib/api";

const listToText = (list: string[] | undefined): string => (list ?? []).join("\n");
const textToList = (text: string): string[] =>
  text.split("\n").map((s) => s.trim()).filter((s) => s.length > 0);

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

const EMPTY_FORM: DestinationFormPayload = {
  name: "",
  slug: "",
  country: "",
  region: "",
  short_description: "",
  description: "",
  hero_image: "",
  gallery: Array.from({ length: 6 }, () => ""),
  best_time: "",
  recommended_duration: "",
  highlights: [],
  things_to_do: [],
  travel_information: [],
  is_featured: false,
  is_active: true,
};

const INPUT_CLS =
  "mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

const LABEL_CLS = "block text-sm font-semibold text-forest";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    adminApi
      .adminDestinations()
      .then(setDestinations)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load destinations."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFlash("");
  }

  function startEdit(d: DestinationAdmin) {
    setCreating(false);
    setEditingId(d.id);
    setForm({
      name: d.name,
      slug: d.slug,
      country: d.country,
      region: d.region,
      short_description: d.short_description,
      description: d.description,
      hero_image: d.hero_image,
      gallery: Array.from({ length: 6 }, (_, i) => d.gallery?.[i] ?? ""),
      best_time: d.best_time,
      recommended_duration: d.recommended_duration,
      highlights: toLines(d.highlights),
      things_to_do: toLines(d.things_to_do),
      travel_information: toLines(d.travel_information),
      is_featured: d.is_featured,
      is_active: d.is_active,
    });
    setFlash("");
  }

  async function toggleActive(d: DestinationAdmin) {
    setFlash("");
    try {
      await adminApi.updateDestination(d.id, { is_active: !d.is_active });
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not update the destination.");
    }
  }

  async function remove(d: DestinationAdmin) {
    setFlash("");
    if (!confirm(`Delete the destination "${d.name}"?`)) return;
    try {
      await adminApi.deleteDestination(d.id);
      setFlash("Destination deleted.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not delete the destination.");
    }
  }

  async function save() {
    setFlash("");
    // BUG-16: reject image URLs that next/image would refuse to render.
    const urlError = imageUrlError(form.hero_image, [API_URL]);
    const galleryErrors = form.gallery.map((g) => imageUrlError(g, [API_URL])).filter(Boolean);
    if (urlError || galleryErrors.length > 0) {
      setFlash(urlError || galleryErrors[0]);
      return;
    }
    const payload: DestinationFormPayload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name.trim()),
      country: form.country.trim(),
      region: form.region.trim(),
      short_description: form.short_description.trim(),
      description: form.description.trim(),
      hero_image: form.hero_image.trim(),
      gallery: form.gallery.map((g) => g.trim()).filter((g) => g.length > 0),
      best_time: form.best_time.trim(),
      recommended_duration: form.recommended_duration.trim(),
      highlights: textToList(form.highlights.join("\n")),
      things_to_do: textToList(form.things_to_do.join("\n")),
      travel_information: textToList(form.travel_information.join("\n")),
      is_featured: form.is_featured,
      is_active: form.is_active,
    };
    if (!payload.name || !payload.slug) {
      setFlash("Give the destination a name (and a slug will be generated from it).");
      return;
    }
    try {
      if (editingId !== null) await adminApi.updateDestination(editingId, payload);
      else await adminApi.createDestination(payload);
      setCreating(false);
      setEditingId(null);
      setFlash(editingId !== null ? "Destination updated." : "Destination created.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save the destination.");
    }
  }

  if (error && destinations.length === 0) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading) return <p className="text-charcoal-soft">Loading destinations…</p>;

  const open = creating || editingId !== null;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Catalogue</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Destinations</h1>
          <p className="mt-3 max-w-2xl text-charcoal-soft">The states and regions packages are built around.</p>
        </div>
        {!open && (
          <button type="button" onClick={startCreate} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark">
            New destination
          </button>
        )}
      </section>

      {flash && <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}

      {open && (
        <section className="mt-6 rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{creating ? "Create a destination" : "Edit destination"}</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className={LABEL_CLS}>
              Name *
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: (form.slug || form.name === "") ? slugify(e.target.value) : form.slug })} placeholder="e.g. Rajasthan" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Slug
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. rajasthan" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Country
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. India" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Region
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. North India" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Best time to visit
              <input value={form.best_time} onChange={(e) => setForm({ ...form, best_time: e.target.value })} placeholder="e.g. October – March" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Recommended duration
              <input value={form.recommended_duration} onChange={(e) => setForm({ ...form, recommended_duration: e.target.value })} placeholder="e.g. 6–10 days" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Short description
              <input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="One-line teaser for cards" className={INPUT_CLS} />
            </label>
            <label className={`${LABEL_CLS} sm:col-span-2`}>
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Full narrative of the region…" className={`${INPUT_CLS} min-h-28`} />
            </label>
            <label className={`${LABEL_CLS} sm:col-span-2`}>
              Hero image URL
              <input value={form.hero_image} onChange={(e) => setForm({ ...form, hero_image: e.target.value })} placeholder="https://…" className={INPUT_CLS} />
            </label>
            <label className={LABEL_CLS}>
              Highlights (one per line)
              <textarea value={listToText(form.highlights)} onChange={(e) => setForm({ ...form, highlights: textToList(e.target.value) })} rows={4} placeholder={"Jaipur City Palace\nUdaipur lakes"} className={`${INPUT_CLS} min-h-24`} />
            </label>
            <label className={LABEL_CLS}>
              Things to do (one per line)
              <textarea value={listToText(form.things_to_do)} onChange={(e) => setForm({ ...form, things_to_do: textToList(e.target.value) })} rows={4} placeholder={"Watch the sun rise over Hawa Mahal\nSail the evening on Lake Pichola"} className={`${INPUT_CLS} min-h-24`} />
            </label>
            <label className={`${LABEL_CLS} lg:col-span-2`}>
              Travel information (one per line)
              <textarea value={listToText(form.travel_information)} onChange={(e) => setForm({ ...form, travel_information: textToList(e.target.value) })} rows={3} placeholder={"Currency: Indian rupee (INR)\nLanguage: Hindi, Rajasthani & English"} className={`${INPUT_CLS} min-h-16`} />
            </label>
            {form.gallery.map((url, i) => (
              <label key={i} className={LABEL_CLS}>
                Gallery image URL {i + 1}
                <input value={url} onChange={(e) => setForm({ ...form, gallery: form.gallery.map((g, gi) => (gi === i ? e.target.value : g)) })} placeholder="https://…" className={INPUT_CLS} />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Publishing</p>
            <label className="flex items-center gap-2 text-sm font-semibold text-forest">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-terracotta" />
              Visible on the site
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-forest">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4 accent-terracotta" />
              Featured on the homepage
            </label>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={save} className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark">
              {editingId !== null ? "Save destination" : "Create destination"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setEditingId(null); }} className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-soft hover:text-forest">
              Cancel
            </button>
          </div>
        </section>
      )}

      {destinations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No destinations yet.</p>
          <p className="mt-2 text-sm text-charcoal-soft">Create your first destination and it will show up on the site.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {destinations.map((d) => (
            <div key={d.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                {d.hero_image ? (
                  <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-line sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.hero_image} alt={d.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="hidden h-16 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-white text-[11px] text-charcoal-soft sm:flex">No image</div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-forest">{d.name}</p>
                    {d.is_featured && <span className="rounded-full bg-terracotta/15 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">featured</span>}
                    {!d.is_active && <span className="rounded-full bg-sand-light px-2.5 py-0.5 text-[11px] font-semibold text-charcoal-soft">archived</span>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-sm text-charcoal-soft">
                    {[d.country, d.region].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-3">
                <button type="button" onClick={() => toggleActive(d)} className="rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">
                  {d.is_active ? "Archive" : "Restore"}
                </button>
                <button type="button" onClick={() => startEdit(d)} className="rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">Edit</button>
                <button type="button" onClick={() => remove(d)} className="rounded-full border border-terracotta/30 px-5 py-2 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-ivory">Delete</button>
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