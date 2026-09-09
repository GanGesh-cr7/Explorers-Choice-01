"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type Setting } from "@/lib/admin";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const load = useCallback(() => {
    adminApi
      .settings()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function startEdit(s: Setting) {
    setEditing(s.key);
    setDraft(JSON.stringify(s.value, null, 2));
  }

  async function save() {
    if (!editing) return;
    setFlash("");
    let value: Record<string, unknown>;
    try {
      value = JSON.parse(draft);
      if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Enter a JSON object");
    } catch {
      setFlash("Settings must be valid JSON, e.g. { \"whatsapp_number\": \"+1…\" }");
      return;
    }
    try {
      await adminApi.updateSetting(editing, value);
      setEditing(null);
      setFlash("Setting saved.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not save setting.");
    }
  }

  if (error && settings.length === 0) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading) return <p className="text-charcoal-soft">Loading settings…</p>;

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Admin</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Settings</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Small site-wide values your team needs to tune.</p>
      </section>

      {flash && <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}

      {settings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-cream p-10 text-center">
          <p className="font-display text-2xl text-forest">No settings saved yet.</p>
          <p className="mt-2 text-sm text-charcoal-soft">Saved settings will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {settings.map((s) => (
            <div key={s.key} className="rounded-2xl border border-line bg-cream p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-forest">{s.key}</p>
                  <p className="mt-0.5 text-xs text-charcoal-soft">Updated {new Date(s.updated_at).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                {editing !== s.key && (
                  <button type="button" onClick={() => startEdit(s)} className="shrink-0 rounded-full border border-forest/30 px-5 py-2 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory">Edit</button>
                )}
              </div>
              {editing === s.key ? (
                <>
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={6} spellCheck={false} className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-3 font-mono text-xs text-charcoal focus:border-terracotta focus:outline-none" />
                  <div className="mt-3 flex gap-3">
                    <button type="button" onClick={save} className="rounded-full bg-forest px-6 py-2 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark">Save</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-line bg-white px-6 py-2 text-sm font-semibold text-charcoal-soft hover:text-forest">Cancel</button>
                  </div>
                </>
              ) : (
                <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-white p-4 font-mono text-xs text-charcoal-soft">{JSON.stringify(s.value, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}