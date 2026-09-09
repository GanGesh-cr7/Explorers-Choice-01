"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { Container } from "@/components/ui/Container";

function BookContent() {
  const searchParams = useSearchParams();

  return (
    <>
      <section className="border-b border-line bg-ivory-warm">
        <Container className="py-12 sm:py-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Book your journey</p>
          <h1 className="font-display text-4xl leading-tight text-forest sm:text-6xl">Book Now</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal-soft sm:text-lg">
            A clear, considered way to start your next journey. Your price is always visible before you send a request.
          </p>
        </Container>
      </section>
      <section className="py-10 sm:py-16">
        <Container>
          <BookingFlow packageSlug={searchParams.get("package")} destinationSlug={searchParams.get("destination")} />
        </Container>
      </section>
    </>
  );
}

export default function BookPage() {
  return <Suspense fallback={<Container className="py-20 text-center text-charcoal-soft">Loading booking…</Container>}><BookContent /></Suspense>;
}
