"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/lib/auth";

const fieldClasses = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

function ResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setError("This reset link is invalid."); return; }
    setError(""); setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your password could not be reset. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {success ? (
        <>
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-terracotta">All set</p>
          <h1 className="text-center font-display text-4xl text-forest">Password reset</h1>
          <p className="mt-4 text-center text-sm text-charcoal-soft">Your password has been updated. You can now sign in with your new password.</p>
          <div className="mt-8 text-center"><Button href="/login" variant="primary" size="lg">Sign in</Button></div>
        </>
      ) : (
        <>
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-terracotta">New password</p>
          <h1 className="text-center font-display text-4xl text-forest">Set a new password</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>}
            <label className="block text-sm font-semibold text-forest">New password<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={`${fieldClasses} mt-2`} /></label>
            <Button type="submit" variant="primary" size="lg" className="w-full" ariaLabel="Reset password" disabled={loading}>{loading ? "Resetting…" : "Reset password"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-charcoal-soft"><Link href="/login" className="font-semibold text-terracotta hover:underline">Back to login</Link></p>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<Container className="py-20 text-center text-charcoal-soft">Loading…</Container>}><ResetContent /></Suspense>;
}