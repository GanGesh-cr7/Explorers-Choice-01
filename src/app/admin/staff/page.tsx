"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, type StaffMember } from "@/lib/admin";
import { useAuth } from "@/components/providers";

const ROLES = ["TRAVEL_AGENT", "MANAGER", "ACCOUNTANT", "ADMIN"] as const;

const EMPTY_FORM = { email: "", password: "", full_name: "", phone: "", country: "", role: "TRAVEL_AGENT" as StaffMember["role"] };

export default function AdminStaffPage() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    adminApi
      .staff()
      .then(setStaff)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load staff."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function create() {
    setFlash("");
    if (!form.email.trim() || !form.password || !form.full_name.trim()) {
      setFlash("Email, password and full name are required.");
      return;
    }
    try {
      await adminApi.createStaff({ ...form, email: form.email.trim(), full_name: form.full_name.trim() });
      setCreating(false);
      setForm(EMPTY_FORM);
      setFlash("Staff member created.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not create staff member.");
    }
  }

  async function update(member: StaffMember, patch: Partial<StaffMember>) {
    setFlash("");
    if (patch.role !== undefined && member.role === "ADMIN" && patch.role !== "ADMIN") {
      if (!confirm(`Demote ${member.full_name} from ADMIN? This cannot be undone.`)) return;
    }
    try {
      await adminApi.updateStaff(member.id, patch);
      setFlash("Staff member updated.");
      load();
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not update staff member.");
    }
  }

  async function toggleActive(member: StaffMember) {
    if (member.is_active && !confirm(`Deactivate ${member.email}? They will no longer be able to log in.`)) return;
    await update(member, { is_active: !member.is_active });
  }

  async function remove(member: StaffMember) {
    setFlash("");
    if (!confirm(`Delete ${member.full_name} (${member.email}) permanently? This cannot be undone.`)) return;
    try {
      await adminApi.deleteStaff(member.id);
      setStaff((current) => current.filter((item) => item.id !== member.id));
      setFlash(`${member.email} deleted.`);
    } catch (err) {
      setFlash(err instanceof Error ? err.message : "Could not delete this staff member.");
    }
  }

  if (error && staff.length === 0) return <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>;
  if (loading) return <p className="text-charcoal-soft">Loading staff…</p>;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Admin</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Team</h1>
          <p className="mt-3 max-w-2xl text-charcoal-soft">People who can sign in and manage the workspace.</p>
        </div>
        {!creating && (
          <button type="button" onClick={() => setCreating(true)} className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-terracotta-dark">
            Add member
          </button>
        )}
      </section>

      {flash && <p role="alert" className="mt-6 rounded-xl border border-forest/25 bg-forest/5 p-4 text-sm text-forest">{flash}</p>}

      {creating && (
        <section className="mt-6 rounded-2xl border border-line bg-cream p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Add staff member</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-semibold text-forest sm:col-span-2 lg:col-span-1">
              Full name *
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Email *
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Password *
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffMember["role"] })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none">
                {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ").toLowerCase()}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-forest">
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
            <label className="block text-sm font-semibold text-forest">
              Country
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-charcoal focus:border-terracotta focus:outline-none" />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={create} className="rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-ivory transition-colors hover:bg-forest-dark">Create member</button>
            <button type="button" onClick={() => setCreating(false)} className="rounded-full border border-line bg-white px-6 py-2.5 text-sm font-semibold text-charcoal-soft hover:text-forest">Cancel</button>
          </div>
        </section>
      )}

      <div className="mt-8 space-y-3">
        {staff.map((m) => {
          const isSelf = currentUser ? m.id === currentUser.id : false;
          const activeAdminsCount = staff.filter((s) => s.is_active && s.role === "ADMIN").length;
          const isLastActiveAdmin = m.is_active && m.role === "ADMIN" && activeAdminsCount <= 1;

          return (
            <div key={m.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-forest">{m.full_name}</p>
                  {isSelf && (
                    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-bold text-forest">You</span>
                  )}
                  <span className="rounded-full bg-ivory px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-forest">{m.role.replace(/_/g, " ").toLowerCase()}</span>
                  {!m.is_active && <span className="rounded-full bg-terracotta/15 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">deactivated</span>}
                </div>
                <p className="mt-0.5 text-sm text-charcoal-soft">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <select
                  value={m.role}
                  disabled={isLastActiveAdmin}
                  onChange={(e) => update(m, { role: e.target.value as StaffMember["role"] })}
                  aria-label={`Role for ${m.full_name}`}
                  title={isLastActiveAdmin ? "Cannot demote the last active administrator" : `Role for ${m.full_name}`}
                  className="rounded-xl border border-line bg-white px-3 py-2 text-sm text-charcoal focus:border-terracotta focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ").toLowerCase()}</option>)}
                </select>
                <button
                  type="button"
                  disabled={isSelf || (isLastActiveAdmin && m.is_active)}
                  onClick={() => toggleActive(m)}
                  title={
                    isSelf
                      ? "You cannot deactivate your own account"
                      : isLastActiveAdmin
                      ? "Cannot deactivate the last active administrator"
                      : m.is_active
                      ? "Deactivate member"
                      : "Activate member"
                  }
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    m.is_active ? "border-terracotta/30 text-terracotta hover:bg-terracotta hover:text-ivory" : "border-forest/30 text-forest hover:bg-forest hover:text-ivory"
                  }`}
                >
                  {m.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() => remove(m)}
                  aria-label={`Delete ${m.full_name}`}
                  title={isSelf ? "You cannot delete your own account" : "Delete member"}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-terracotta/30 text-terracotta transition-colors hover:bg-terracotta hover:text-ivory disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}