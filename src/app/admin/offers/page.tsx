"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, formatWhen, type Offer } from "@/lib/admin";

type PackageOption = { id: number; name: string };

const EMPTY_FORM = { title: "", code: "", description: "", discount_type: "PERCENT" as "PERCENT" | "FIXED", discount_value: "", package_id: "", valid_from: "", valid_to: "", is_active: true };

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    adminApi
      .offers()
      .then(setOffers)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load offers."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    fetch(`${(process.env.NEXT_PUBLIC_EXPLORERS_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "")}/packages`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Array<{ id: number; name: string }>) => setPackages(list))
      .catch(() => setPackages([]));
  }, []);

  function startCreate() {
    setCreating(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(o: Offer) {
    setCreating(false);
    setEditingId(o.id);
    setForm({
      title: o.title,
      code: o.code,
      description: o.description,
      discount_type: o.discount_type,
      discount_value: String(o.discount_value),
      package_id: o.package_id ? String(o.package_id) : "",
      valid_from: o.valid_from ?? "",
      valid_to: o.valid_to ?? "",
      is_active: o.is_active,
    });
  }

  async function save() {
    setFlash("");
    const payload = {
      title: form.title.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      package_id: form.package_id ? Number(form.package_id) : null,
      valid_from: form.valid_from || null,
      valid_to: form.valid_to || null,
      is_active: form.is_active,
    };
    if (!payload.title) {
      setFlash("Give the offer a title.");
      return;
    }
    try {
      if (editingId !== null) await adminApi.updateOffer(editingId, payload);
      else await adminApi.createOffer(payload);
      setCreating(false);
      setEditingId(null);
      setFlash(editingId !== null ? "Offer updated." : "Offer created.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save offer.");
    }
  }

  async function remove(o: Offer) {
    setFlash("");
    if (!confirm(`Delete the offer "${o.title}"?`)) return;
    try {
      await adminApi.deleteOffer(o.id);
      setFlash("Offer deleted.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not delete offer.");
    }
  }

  if (error && offers.length === 0) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading) return <p className="text-charcoal-soft">Loading offers…</p>;

  const open = creating || editingId !== null;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Marketing</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Offers</h1>
          <p className="mt-3 max-w-2xl text-charcoal-soft">Discount codes and headline promotions.</p>
        </div>
        {!open && (
          <button type="button" onClick={startCreate} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark">
            New offer
          </button>
        )}
      </section>

      {flash && <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}

      {open && (
        <section className="mt-6 rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{creating ? "Create an offer" : "Edit offer"}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-semibold text-forest sm:col-span-2 lg:col-span-1">
              Title *
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Iceland in the off-season" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Code
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SPRING10" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Discount type
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "PERCENT" | "FIXED" })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                <option value="PERCENT">Percentage off</option>
                <option value="FIXED">Fixed amount off</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-forest">
              Value
              <input value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} inputMode="decimal" placeholder={form.discount_type === "PERCENT" ? "e.g. 10" : "e.g. 200"} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Package
              <select value={form.package_id} onChange={(e) => setForm({ ...form, package_id: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                <option value="">Any package</option>
                {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-forest">
              Valid from
              <input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Valid to
              <input type="date" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Description
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none" />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-forest">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-terracotta" />
              Active
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={save} className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark">
              {editingId !== null ? "Save offer" : "Create offer"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setEditingId(null); }} className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-soft hover:text-forest">
              Cancel
            </button>
          </div>
        </section>
      )}

      {offers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No offers yet.</p>
          <p className="mt-2 text-sm text-charcoal-soft">Create your first promotion to collect enquiries on the homepage.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {offers.map((o) => (
            <div key={o.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-forest">{o.title}</p>
                  {o.code && <span className="rounded-full bg-ivory px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-forest">{o.code}</span>}
                  {!o.is_active && <span className="rounded-full bg-sand-light px-2.5 py-0.5 text-[11px] font-semibold text-charcoal-soft">inactive</span>}
                </div>
                <p className="mt-0.5 text-sm text-charcoal-soft">
                  {o.discount_type === "PERCENT" ? `${o.discount_value}% off` : `$${o.discount_value} off`}{o.package_name ? ` · ${o.package_name}` : " · any package"}{o.valid_from ? ` · ${formatWhen(o.valid_from)}${o.valid_to ? ` to ${formatWhen(o.valid_to)}` : ""}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button type="button" onClick={() => startEdit(o)} className="rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">Edit</button>
                <button type="button" onClick={() => remove(o)} className="rounded-full border border-terracotta/30 px-5 py-2 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-ivory">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}