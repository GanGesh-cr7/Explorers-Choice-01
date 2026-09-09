"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { BookingConfirmation } from "@/lib/bookings";
import {
  formatMoney,
  formatDate,
  statusLabel,
  paymentStatusLabel,
} from "@/lib/bookingMeta";
import { waLink } from "@/lib/support";

export function BookingConfirmationView({
  booking,
  onReset,
  embedded = false,
}: {
  booking: BookingConfirmation;
  onReset?: () => void;
  embedded?: boolean;
}) {
  const instant = booking.booking_mode === "INSTANT_BOOKING";
  const reference = booking.booking_reference;

  return (
    <section className={embedded ? "text-center" : "mx-auto max-w-2xl text-center"}>
      {!embedded && (
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-ivory">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
      )}
      <h2 className="font-display text-4xl text-forest">Your journey starts here.</h2>
      <p className="mt-4 text-charcoal-soft">
        {instant ? "Booking" : "Booking request"}{" "}
        <strong className="text-forest">{reference}</strong> {instant ? "created" : "received"}.
      </p>

      <div className="mt-6 rounded-xl border border-line bg-white p-5 text-left text-sm">
        <p className="flex justify-between gap-3">
          <span className="text-charcoal-soft">Journey</span>
          <strong className="text-right text-forest">
            {booking.package_name} · {booking.destination_name}
          </strong>
        </p>
        <p className="mt-2 flex justify-between gap-3">
          <span className="text-charcoal-soft">Travel date</span>
          <strong className="text-right text-forest">{formatDate(booking.travel_date)}</strong>
        </p>
        <p className="mt-2 flex justify-between gap-3">
          <span className="text-charcoal-soft">Travellers</span>
          <strong className="text-right text-forest">
            {booking.adults} adults
            {booking.children ? `, ${booking.children} children` : ""}
            {booking.infants ? `, ${booking.infants} infants` : ""}
          </strong>
        </p>
        <p className="mt-2 flex justify-between gap-3">
          <span className="text-charcoal-soft">Status</span>
          <strong className="text-right text-forest">{statusLabel(booking.status)}</strong>
        </p>
        <p className="mt-2 flex justify-between gap-3 border-t border-line pt-2">
          <span className="text-charcoal-soft">Total</span>
          <strong className="text-right text-forest">{formatMoney(booking.total, booking.currency)}</strong>
        </p>
      </div>

      {/* Next steps */}
      <div className="mt-6 rounded-xl bg-sand-light p-5 text-left text-sm text-charcoal-soft">
        <strong className="text-forest">What happens next</strong>
        {instant ? (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your booking has been created and your space is being held.</li>
            <li>Please complete payment to secure and confirm your journey.</li>
            <li>Once paid, we&apos;ll send your confirmation and travel documents.</li>
          </ul>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>We&apos;ll confirm availability and contact you shortly.</li>
            <li>A planner will share any applicable taxes and the infant fare.</li>
            <li>You&apos;ll then receive secure payment instructions to finalise.</li>
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button href={waLink(`Hello Explorers Choice, I just booked ${reference}. What are my next steps?`)} variant="primary">
          Contact us on WhatsApp
        </Button>
        <Button href="/packages" variant="outline">
          Browse more journeys
        </Button>
      </div>

      {!instant && (
        <p className="mt-4 text-xs text-charcoal-soft">
          Need to reach us?{" "}
          <Link href="/contact" className="font-semibold text-terracotta hover:underline">
            Contact support
          </Link>{" "}
          · Save your reference <strong>{reference}</strong>.
        </p>
      )}

      {onReset && (
        <Button className="mt-7" variant="ghost" onClick={onReset}>
          Plan another journey
        </Button>
      )}
      <p className="mt-3 text-xs text-charcoal-soft">
        Payment status: {paymentStatusLabel(booking.payment_status)}
      </p>
    </section>
  );
}
