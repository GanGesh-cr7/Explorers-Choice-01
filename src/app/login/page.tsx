"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers";

const fieldClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/account";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/account";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="w-full max-w-sm">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
          Welcome back
        </p>
        <h1 className="text-center font-display text-4xl text-forest">Login</h1>
        <p className="mt-4 text-center text-sm text-charcoal-soft">
          Sign in to view your bookings, manage payments and access your travel documents.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <p className="rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-forest">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={fieldClasses} />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-forest">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={fieldClasses} />
          </div>
          <Button type="submit" variant="primary" size="lg" className="w-full" ariaLabel="Sign in" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-charcoal-soft">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-terracotta hover:underline">Create one</Link>
        </p>
        <p className="mt-4 text-center text-sm text-charcoal-soft">
          <Link href="/forgot-password" className="font-semibold text-terracotta hover:underline">Forgot your password?</Link>
        </p>
      </div>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Container className="py-20 text-center text-charcoal-soft">Loading…</Container>}>
      <LoginContent />
    </Suspense>
  );
}
