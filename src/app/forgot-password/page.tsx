"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/lib/auth";

const fieldClasses = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not send a reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="w-full max-w-sm">
        {sent ? (
          <>
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Check your email</p>
            <h1 className="text-center font-display text-4xl text-forest">Reset link sent</h1>
            <p className="mt-4 text-center text-sm text-charcoal-soft">
              If an account exists with <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
            </p>
            <div className="mt-8 text-center">
              <Link href="/login" className="font-semibold text-terracotta hover:underline">Back to login</Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Forgotten password</p>
            <h1 className="text-center font-display text-4xl text-forest">Reset your password</h1>
            <p className="mt-4 text-center text-sm text-charcoal-soft">
              Enter your registered email and we&apos;ll send you a link to set a new password.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>}
              <label className="block text-sm font-semibold text-forest">
                Email
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={`${fieldClasses} mt-2`} />
              </label>
              <Button type="submit" variant="primary" size="lg" className="w-full" ariaLabel="Send reset link" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-charcoal-soft">
              <Link href="/login" className="font-semibold text-terracotta hover:underline">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </Container>
  );
}