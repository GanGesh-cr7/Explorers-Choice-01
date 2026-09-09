"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers";
import { updateProfile, changePassword } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

const fieldClasses = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setSaved(false); setError("");
    try {
      await updateProfile({ full_name: name, phone, country });
      await refresh();
      setSaved(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Profile could not be updated."); }
    finally { setLoading(false); }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true); setPwSaved(false); setPwError("");
    try {
      await changePassword(currentPw, newPw);
      setPwSaved(true); setCurrentPw(""); setNewPw("");
    } catch (err) { setPwError(err instanceof Error ? err.message : "Password could not be changed."); }
    finally { setPwLoading(false); }
  }

  return (
    <>
      <section className="border-b border-line pb-6 sm:mb-8 sm:border-0 sm:pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Your account</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-forest sm:text-5xl">Profile</h1>
        <p className="mt-3 max-w-2xl text-charcoal-soft">Update your contact details so your travel planner can reach you at any time.</p>
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={handleProfile} className="grid gap-6 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-semibold text-forest">
            Email
            <input type="email" disabled value={user?.email ?? ""} className={`${fieldClasses} mt-2 cursor-not-allowed bg-ivory text-charcoal-soft`} />
            <span className="mt-1.5 block text-xs font-normal text-charcoal-soft">Your email is your sign-in. Please contact support to change it.</span>
          </label>
          <label className="sm:col-span-2 text-sm font-semibold text-forest">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${fieldClasses} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-forest">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${fieldClasses} mt-2`} placeholder="Include country code" />
          </label>
          <label className="text-sm font-semibold text-forest">
            Country
            <input value={country} onChange={(e) => setCountry(e.target.value)} className={`${fieldClasses} mt-2`} />
          </label>
          {error && <p className="sm:col-span-2 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>}
          {saved && <p className="sm:col-span-2 rounded-xl border border-forest/30 bg-forest/5 p-4 text-sm text-forest font-medium">Your profile has been updated.</p>}
          <div className="sm:col-span-2"><Button type="submit" variant="primary" className={loading ? "pointer-events-none opacity-60" : ""}>{loading ? "Saving…" : "Save changes"}</Button></div>
        </form>

        <section className="rounded-2xl border border-line bg-cream p-6">
          <h2 className="font-display text-xl text-forest">Change password</h2>
          <form onSubmit={handlePassword} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-forest">Current password
              <input type="password" required value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={`${fieldClasses} mt-2`} />
            </label>
            <label className="block text-sm font-semibold text-forest">New password
              <input type="password" required value={newPw} onChange={(e) => setNewPw(e.target.value)} className={`${fieldClasses} mt-2`} />
            </label>
            {pwError && <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{pwError}</p>}
            {pwSaved && <p className="rounded-xl border border-forest/30 bg-forest/5 p-4 text-sm text-forest font-medium">Password changed.</p>}
            <Button type="submit" variant="secondary" className={pwLoading ? "pointer-events-none opacity-60" : ""}>{pwLoading ? "Changing…" : "Change password"}</Button>
          </form>
        </section>
      </div>
    </>
  );
}