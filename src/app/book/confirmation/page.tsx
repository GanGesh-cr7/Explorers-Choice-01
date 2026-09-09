"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BookingConfirmationView } from "@/components/booking/BookingConfirmation";
import { getConfirmationByReference, type BookingConfirmation } from "@/lib/bookings";
import { formatDate } from "@/lib/bookingMeta";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const reference = (searchParams.get("ref") ?? "").trim();
  const hasReference = Boolean(reference);

  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "missing" | "error">(hasReference ? "loading" : "missing");

  useEffect(() => {
    if (!hasReference) return;
    let cancelled = false;
    getConfirmationByReference(reference)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setBooking(result);
          setStatus("found");
        } else {
          setStatus("missing");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [hasReference, reference]);

  return (
    <>
      <section className="border-b border-line bg-ivory-warm">
        <Container className="py-12 text-center sm:py-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Booking confirmation</p>
          <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">Your journey starts here.</h1>
          {reference && status === "found" && booking && (
            <p className="mt-3 text-charcoal-soft">
              Booking reference <strong className="text-forest">{booking.booking_reference}</strong>
            </p>
          )}
        </Container>
      </section>
      <section className="py-12 sm:py-16">
        <Container>
          {status === "loading" && (
            <div className="rounded-2xl border border-line bg-cream p-10 text-center shadow-card">
              <p className="font-display text-2xl text-forest">Loading your booking…</p>
            </div>
          )}

          {status === "missing" && (
            <div className="mx-auto max-w-xl rounded-2xl border border-line bg-cream p-10 text-center shadow-card">
              <p className="font-display text-2xl text-forest">We couldn&apos;t find that booking</p>
              <p className="mt-3 text-charcoal-soft">
                {reference
                  ? `No booking was found for reference ${reference}. It may have been entered incorrectly, or the booking doesn&apos;t exist.`
                  : "A booking reference is required to view a confirmation."}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/book" variant="primary">
                  Start a new booking
                </Button>
                <Button href="/packages" variant="outline">
                  Browse packages
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="mx-auto max-w-xl rounded-2xl border border-terracotta/30 bg-terracotta/10 p-10 text-center">
              <p className="font-display text-2xl text-forest">We couldn&apos;t load this booking</p>
              <p className="mt-3 text-charcoal-soft">
                Please check your connection and try again in a moment. Your booking is safe.
              </p>
              <div className="mt-6">
                <Button href="/book" variant="primary">
                  Start a new booking
                </Button>
              </div>
            </div>
          )}

          {status === "found" && booking && (
            <div className="mx-auto">
              <BookingConfirmationView booking={booking} />
              <div className="mx-auto mt-8 max-w-xl text-center text-sm text-charcoal-soft">
                <p>
                  Looking for your full booking history?{" "}
                  <Link href="/account" className="font-semibold text-terracotta hover:underline">
                    View My Trips
                  </Link>
                </p>
                <p className="mt-2 text-xs">
                  Travel date: {formatDate(booking.travel_date)} · Brought to you by Explorers Choice
                </p>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-charcoal-soft">Loading confirmation…</Container>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
