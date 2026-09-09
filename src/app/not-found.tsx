import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Error 404</p>
      <h1 className="font-display text-5xl leading-tight text-forest sm:text-6xl">
        This trail doesn&apos;t exist
      </h1>
      <p className="mt-5 max-w-md text-charcoal-soft">
        The page you&apos;re looking for has wandered off. Let&apos;s get you back to somewhere
        worth being.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-forest px-7 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-light"
        >
          Back home
        </Link>
        <Link
          href="/packages"
          className="rounded-full border border-forest/30 px-7 py-3 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-ivory"
        >
          Browse packages
        </Link>
      </div>
    </Container>
  );
}
