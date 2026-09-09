import Link from "next/link";
import { Container } from "@/components/ui/Container";

const fieldClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

export default function LoginPage() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-20">
      <div className="w-full max-w-sm">
        <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
          Welcome back
        </p>
        <h1 className="text-center font-display text-4xl text-forest">Login</h1>
        <p className="mt-4 text-center text-sm text-charcoal-soft">
          This is a placeholder for the upcoming login flow.
        </p>
        <form className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-forest">
              Email
            </label>
            <input id="email" type="email" placeholder="you@email.com" className={fieldClasses} />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-forest">
              Password
            </label>
            <input id="password" type="password" placeholder="••••••••" className={fieldClasses} />
          </div>
          <button
            type="button"
            className="w-full rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-light"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-charcoal-soft">
          Don&apos;t have an account?{" "}
          <Link href="/contact" className="font-semibold text-terracotta hover:underline">
            Get in touch
          </Link>
        </p>
      </div>
    </Container>
  );
}
