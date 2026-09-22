"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, formatWhen, type CustomerStory } from "@/lib/admin";
import { CLIENT_API_URL } from "@/lib/api";

type PackageOption = { id: number; name: string };

const EMPTY_FORM = { customer_name: "", destination: "", package_id: "", story: "", travel_date: "", is_featured: false, is_published: true };

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    adminApi
      .stories()
      .then(setStories)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load stories."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    fetch(`${CLIENT_API_URL}/packages`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Array<{ id: number; name: string }>) => setPackages(list))
      .catch(() => setPackages([]));
  }, []);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(s: CustomerStory) {
    setCreating(false);
    setEditingId(s.id);
    setForm({
      customer_name: s.customer_name,
      destination: s.destination,
      package_id: s.package_id ? String(s.package_id) : "",
      story: s.story,
      travel_date: s.travel_date ?? "",
      is_featured: s.is_featured,
      is_published: s.is_published,
    });
  }

  async function save() {
    setFlash("");
    const payload = {
      customer_name: form.customer_name.trim(),
      destination: form.destination.trim(),
      package_id: form.package_id ? Number(form.package_id) : null,
      story: form.story.trim(),
      travel_date: form.travel_date || null,
      is_featured: form.is_featured,
      is_published: form.is_published,
    };
    if (!payload.customer_name) {
      setFlash("Enter the customer's name.");
      return;
    }
    try {
      if (editingId !== null) await adminApi.updateStory(editingId, payload);
      else await adminApi.createStory(payload);
      setCreating(false);
      setEditingId(null);
      setFlash(editingId !== null ? "Story updated." : "Story created.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save story.");
    }
  }

  async function remove(s: CustomerStory) {
    setFlash("");
    if (!confirm(`Delete the story from ${s.customer_name}?`)) return;
    try {
      await adminApi.deleteStory(s.id);
      setFlash("Story deleted.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not delete story.");
    }
  }

  async function togglePublished(s: CustomerStory) {
    setFlash("");
    try {
      await adminApi.updateStory(s.id, { is_published: !s.is_published });
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not update story.");
    }
  }

  if (error && stories.length === 0) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading) return <p className="text-charcoal-soft">Loading stories…</p>;

  const open = creating || editingId !== null;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Customer stories</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Stories</h1>
          <p className="mt-3 max-w-2xl text-charcoal-soft">First-person tales of past trips, published on the site.</p>
        </div>
        {!open && (
          <button type="button" onClick={startCreate} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark">
            New story
          </button>
        )}
      </section>

      {flash && <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}

      {open && (
        <section className="mt-6 rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{creating ? "New story" : "Edit story"}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-forest">
              Customer name *
              <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="e.g. Priya Raghavan" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Destination
              <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Ladakh" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Package
              <select value={form.package_id} onChange={(e) => setForm({ ...form, package_id: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                <option value="">No package</option>
                {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-forest">
              Travel date
              <input type="date" value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest sm:col-span-2">
              Story
              <textarea value={form.story} onChange={(e) => setForm({ ...form, story: e.target.value })} rows={4} className="mt-2 min-h-32 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
          </div>
          <div className="mt-3 flex gap-6 text-sm font-semibold text-forest">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="h-4 w-4 accent-terracotta" />
              Published
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4 accent-terracotta" />
              Featured
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={save} className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark">
              {editingId !== null ? "Save story" : "Create story"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setEditingId(null); }} className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-soft hover:text-forest">
              Cancel
            </button>
          </div>
        </section>
      )}

      {stories.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No stories yet.</p>
          <p className="mt-2 text-sm text-charcoal-soft">Paste a traveller&apos;s story here and it will appear on the stories page.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {stories.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-forest">{s.customer_name}</p>
                  <span className="rounded-full bg-ivory px-2.5 py-0.5 text-[11px] font-semibold text-forest">{s.destination || "No destination"}</span>
                  {s.is_featured && <span className="rounded-full bg-terracotta/15 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">featured</span>}
                  {!s.is_published && <span className="rounded-full bg-sand-light px-2.5 py-0.5 text-[11px] font-semibold text-charcoal-soft">draft</span>}
                </div>
                <p className="mt-0.5 line-clamp-1 text-sm text-charcoal-soft">{s.story || "No story text yet."}{s.travel_date ? ` · ${formatWhen(s.travel_date)}` : ""}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button type="button" onClick={() => togglePublished(s)} className="rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">
                  {s.is_published ? "Unpublish" : "Publish"}
                </button>
                <button type="button" onClick={() => startEdit(s)} className="rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">Edit</button>
                <button type="button" onClick={() => remove(s)} className="rounded-full border border-terracotta/30 px-5 py-2 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-ivory">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}