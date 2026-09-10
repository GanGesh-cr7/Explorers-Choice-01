"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers";

const fieldClasses = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register({ full_name: fullName, email, phone, country, password });
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-16 sm:py-20">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Get started</p>
        <h1 className="text-center font-display text-4xl text-forest">Create an account</h1>
        <p className="mt-4 text-center text-sm text-charcoal-soft">
          Your own place for journeys booked with Explorers Choice — trips, documents and travel details, all in one account.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>}
          <label className="block text-sm font-semibold text-forest">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className={`${fieldClasses} mt-2`} /></label>
          <label className="block text-sm font-semibold text-forest">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={`${fieldClasses} mt-2`} /></label>
          <label className="block text-sm font-semibold text-forest">Phone <span className="font-normal text-charcoal-soft">(optional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Include country code" className={`${fieldClasses} mt-2`} /></label>
          <label className="block text-sm font-semibold text-forest">Country <span className="font-normal text-charcoal-soft">(optional)</span><input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Your country" className={`${fieldClasses} mt-2`} /></label>
          <label className="block text-sm font-semibold text-forest">Password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={`${fieldClasses} mt-2`} /></label>
          <Button type="submit" variant="primary" size="lg" className="w-full" ariaLabel="Create account" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-charcoal-soft">
          Already have an account? <Link href="/login" className="font-semibold text-terracotta hover:underline">Sign in</Link>
        </p>
      </div>
    </Container>
  );
}