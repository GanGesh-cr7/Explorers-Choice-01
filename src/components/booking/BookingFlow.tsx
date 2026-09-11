"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers";
import {
  submitBooking,
  fetchBookingPackages,
  BookingError,
  type BookingOptionPackage,
  type BookingConfirmation,
} from "@/lib/bookings";
import { BookingConfirmationView } from "@/components/booking/BookingConfirmation";
import {
  bookingModeLabel,
  formatMoney,
  formatDate,
} from "@/lib/bookingMeta";

const steps = ["Trip", "Travellers", "Details", "Summary", "Confirmation"] as const;

const field =
  "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";
const labelCls = "text-sm font-semibold text-forest";

type Values = {
  packageSlug: string;
  travelDate: string;
  adults: number;
  children: number;
  infants: number;
  departure: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  requirements: string;
  notes: string;
};

const empty = (): Values => ({
  packageSlug: "",
  travelDate: "",
  adults: 2,
  children: 0,
  infants: 0,
  departure: "",
  fullName: "",
  email: "",
  phone: "",
  country: "",
  requirements: "",
  notes: "",
});

function todayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function BookingFlow({
  packageSlug,
  destinationSlug,
}: {
  packageSlug: string | null;
  destinationSlug: string | null;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [packages, setPackages] = useState<BookingOptionPackage[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  const [current, setCurrent] = useState(1);
  const [values, setValues] = useState<Values>(() => empty());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const submittedRef = useRef<string | null>(null);

  // Load live package catalog (so booking_mode, price and availability reflect the server).
  useEffect(() => {
    let cancelled = false;
    fetchBookingPackages()
      .then((list) => {
        if (cancelled) return;
        setPackages(list);
        const initial =
          (packageSlug && list.find((p) => p.slug === packageSlug)) ||
          (destinationSlug &&
            list.find((p) => p.destination_name.toLowerCase() === destinationSlug.toLowerCase())) ||
          undefined;
        if (initial) setValues((old) => ({ ...old, packageSlug: initial.slug }));
      })
      .catch(() => {
        if (!cancelled) setCatalogError("We could not load journeys right now. Please try again in a moment.");
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [packageSlug, destinationSlug]);

  // Prefill customer details from the logged-in profile once available.
  const prefilledRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function syncProfile() {
      if (!user || authLoading || prefilledRef.current) return;
      await Promise.resolve();
      if (cancelled) return;
      prefilledRef.current = true;
      setValues((old) => ({
        ...old,
        fullName: old.fullName || user.full_name || "",
        email: old.email || user.email || "",
        phone: old.phone || user.phone || "",
        country: old.country || user.country || "",
      }));
    }
    syncProfile();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const pkg = useMemo(() => packages.find((item) => item.slug === values.packageSlug), [packages, values.packageSlug]);
  const instant = pkg?.booking_mode === "INSTANT_BOOKING";
  const payingTravellers = values.adults + values.children;
  const subtotal = pkg ? pkg.starting_price * payingTravellers : 0;
  const taxes = 0;
  const total = subtotal + taxes;

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((old) => ({ ...old, [key]: value }));
    setError("");
  };

  const validate = useCallback((): string => {
    if (current === 1 && !pkg) return "Choose a package to continue.";
    if (current === 2) {
      if (!values.travelDate) return "Choose your preferred travel date.";
      if (values.travelDate <= todayInputValue()) return "Your travel date must be in the future.";
      if (values.adults < 1) return "At least one adult traveller is required.";
    }
    if (current === 3) {
      if (!values.fullName.trim()) return "Enter your full name.";
      if (!values.email.trim()) return "Enter your email address.";
      if (!/^\S+@\S+\.\S+$/.test(values.email)) return "Enter a valid email address.";
      if (!values.phone.trim()) return "Enter your phone number.";
      if (!values.country.trim()) return "Enter your country.";
    }
    return "";
  }, [current, pkg, values]);

  function next() {
    const issue = validate();
    if (issue) {
      setError(issue);
      return;
    }
    setCurrent((step) => Math.min(4, step + 1));
  }

  function back() {
    setError("");
    setCurrent((step) => Math.max(1, step - 1));
  }

  async function submit() {
    const issue = validate();
    if (issue || !pkg) {
      setError(issue || "Choose an available package.");
      return;
    }
    // Prevent duplicate submissions (double-click / retries).
    if (submitting || submittedRef.current) return;
    setSubmitting(true);
    setError("");
    try {
      const created = await submitBooking({
        package_slug: pkg.slug,
        travel_date: values.travelDate,
        adults: values.adults,
        children: values.children,
        infants: values.infants,
        departure_information: values.departure.trim(),
        full_name: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        country: values.country.trim(),
        special_requirements: values.requirements.trim(),
        notes: values.notes.trim(),
      });
      submittedRef.current = created.booking_reference;
      setBooking(created);
      setCurrent(5);
      document.getElementById("trip")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        router.replace(`/book/confirmation?ref=${encodeURIComponent(created.booking_reference)}`, { scroll: false });
      }, 2400);
    } catch (reason) {
      if (reason instanceof BookingError) {
        const duplicate = /already exist|duplicate/i.test(reason.message);
        setError(duplicate ? "It looks like this request was already submitted. Check your email or My Trips." : reason.message);
      } else {
        setError("Your booking request could not be sent. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (catalogLoading) {
    return (
      <div className="rounded-2xl border border-line bg-cream p-10 text-center shadow-card">
        <p className="font-display text-2xl text-forest">Loading journeys…</p>
        <p className="mt-2 text-sm text-charcoal-soft">Fetching the latest packages and prices.</p>
      </div>
    );
  }

  if (catalogError || packages.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-cream p-10 text-center shadow-card">
        <p className="font-display text-2xl text-forest">We couldn&apos;t load journeys</p>
        <p className="mt-3 text-charcoal-soft">
          {catalogError || "No journeys are available to book right now."}
        </p>
        <Button
          className="mt-6"
          variant="primary"
          onClick={() => {
            setCatalogError("");
            setCatalogLoading(true);
            fetchBookingPackages()
              .then((list) => setPackages(list))
              .catch(() => setCatalogError("We could not load journeys right now."))
              .finally(() => setCatalogLoading(false));
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
      <main className="rounded-2xl border border-line bg-cream p-5 shadow-card sm:p-8">
        {/* Step indicator */}
        <ol className="mb-8 grid grid-cols-5 gap-1 border-b border-line pb-5" aria-label="Booking progress">
          {steps.map((label, index) => {
            const reached = current >= index + 1;
            return (
              <li key={label}>
                <span
                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    reached ? "bg-forest text-ivory" : "bg-sand-light text-charcoal-soft"
                  }`}
                >
                  {index + 1}
                </span>
                <span className={`mt-2 block text-center text-[11px] font-semibold sm:text-xs ${
                  current === index + 1 ? "text-forest" : "text-charcoal-soft"
                }`}>{label}</span>
              </li>
            );
          })}
        </ol>

        {current === 1 && (
          <section className="step-enter">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">1. Trip</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Choose your journey</h2>
            <label className="mt-7 block">
              <span className={labelCls}>Package</span>
              <select
                value={values.packageSlug}
                onChange={(e) => update("packageSlug", e.target.value)}
                className={field}
              >
                <option value="">Select a package</option>
                {packages.map((item) => (
                  <option value={item.slug} key={item.slug}>
                    {item.name} — {item.destination_name} · {item.duration_days} days
                  </option>
                ))}
              </select>
            </label>
            {pkg && (
              <div className="mt-5 rounded-xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-forest">{pkg.name}</p>
                    <p className="mt-1 text-sm text-charcoal-soft">
                      {pkg.destination_name} · {pkg.duration_days} days · From{" "}
                      <strong className="text-forest">{formatMoney(pkg.starting_price, pkg.currency)}</strong> / traveller
                    </p>
                  </div>
                  <span className="rounded-full bg-sand-light px-3 py-1 text-xs font-semibold text-charcoal">
                    {bookingModeLabel(pkg.booking_mode)}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-terracotta">Highlights</p>
                <ul className="mt-2 grid gap-2 text-sm text-charcoal-soft sm:grid-cols-2">
                  {pkg.highlights.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-forest">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {current === 2 && (
          <section className="step-enter">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">2. Travellers</p>
            <h2 className="mt-2 font-display text-3xl text-forest">When and who is travelling?</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={labelCls}>Travel date</span>
                <input
                  type="date"
                  min={todayInputValue()}
                  value={values.travelDate}
                  onChange={(e) => update("travelDate", e.target.value)}
                  className={field}
                />
              </label>
              <label>
                <span className={labelCls}>
                  Departure city or airport <span className="font-normal text-charcoal-soft">(optional)</span>
                </span>
                <input
                  value={values.departure}
                  onChange={(e) => update("departure", e.target.value)}
                  className={field}
                  placeholder="e.g. London (LHR)"
                />
              </label>
              <div />
              {(
                [
                  ["adults", "Adults", 1, 20],
                  ["children", "Children", 0, 20],
                  ["infants", "Infants (under 2)", 0, 10],
                ] as const
              ).map(([key, label, min, max]) => (
                <label key={key}>
                  <span className={labelCls}>{label}</span>
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={values[key]}
                    onChange={(e) => update(key, Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
                    className={field}
                  />
                </label>
              ))}
            </div>
            <p className="mt-5 text-xs text-charcoal-soft">
              Adults and children are charged the package rate. Infant fares, final availability and any
              applicable taxes are confirmed before you pay.
            </p>
          </section>
        )}

        {current === 3 && (
          <section className="step-enter">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">3. Details</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Your contact details</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {(
                [
                  ["fullName", "Full name", "text"],
                  ["email", "Email", "email"],
                  ["phone", "Phone", "tel"],
                  ["country", "Country", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key}>
                  <span className={labelCls}>{label}</span>
                  <input
                    type={type}
                    value={values[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className={field}
                  />
                </label>
              ))}
            </div>
            <label className="mt-5 block">
              <span className={labelCls}>
                Special requirements <span className="font-normal text-charcoal-soft">(optional)</span>
              </span>
              <textarea
                value={values.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                rows={3}
                className={field}
                placeholder="Dietary, accessibility, or room needs"
              />
            </label>
            <label className="mt-5 block">
              <span className={labelCls}>
                Notes <span className="font-normal text-charcoal-soft">(optional)</span>
              </span>
              <textarea
                value={values.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={3}
                className={field}
              />
            </label>
            {!user && (
              <p className="mt-5 rounded-xl bg-sand-light p-4 text-xs text-charcoal-soft">
                Booking as a guest? No account is needed. If you have an account,{" "}
                <Link href="/login" className="font-semibold text-terracotta hover:underline">
                  log in
                </Link>{" "}
                first and your journey will appear in My Trips.
              </p>
            )}
          </section>
        )}

        {current === 4 && pkg && (
          <section className="step-enter">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">4. Summary</p>
            <h2 className="mt-2 font-display text-3xl text-forest">Review before you book</h2>

            <div className="mt-7 space-y-3 rounded-xl border border-line bg-white p-5 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Journey</span>
                <strong className="text-right text-forest">{pkg.name}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Destination</span>
                <strong className="text-right text-forest">{pkg.destination_name}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Duration</span>
                <strong className="text-right text-forest">{pkg.duration_days} days</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Travel date</span>
                <strong className="text-right text-forest">{formatDate(values.travelDate)}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Travellers</span>
                <strong className="text-right text-forest">
                  {values.adults} adult{values.adults === 1 ? "" : "s"}
                  {values.children ? `, ${values.children} child${values.children === 1 ? "" : "ren"}` : ""}
                  {values.infants ? `, ${values.infants} infant${values.infants === 1 ? "" : "s"}` : ""}
                </strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Booking method</span>
                <strong className="text-right text-forest">{bookingModeLabel(pkg.booking_mode)}</strong>
              </p>
            </div>

            {/* Pricing — never hidden */}
            <div className="mt-5 rounded-xl border border-line bg-white p-5 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Package rate / traveller</span>
                <strong className="text-right text-forest">{formatMoney(pkg.starting_price, pkg.currency)}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Paying travellers (adults + children)</span>
                <strong className="text-right text-forest">{payingTravellers}</strong>
              </p>
              <p className="mt-3 flex justify-between gap-3 border-t border-line pt-3">
                <span className="text-charcoal-soft">Subtotal</span>
                <strong className="text-right text-forest">{formatMoney(subtotal, pkg.currency)}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Taxes &amp; fees</span>
                <strong className="text-right text-forest">{formatMoney(taxes, pkg.currency)}</strong>
              </p>
              <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
                <span className="font-semibold text-forest">Total</span>
                <strong className="font-display text-2xl text-forest">{formatMoney(total, pkg.currency)}</strong>
              </p>
              <p className="mt-2 text-xs text-charcoal-soft">
                This is an indicative total based on the current package rate. The server verifies the final
                amount before booking; browser prices are never accepted.
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-sand-light p-5 text-sm text-charcoal-soft">
              <strong className="text-forest">Important conditions</strong>
              {instant ? (
                <>
                  <p className="mt-2">
                    This package supports instant booking. On confirmation you&apos;ll be directed to complete
                    payment to secure your space. Availability is checked at the time of booking.
                  </p>
                  <p className="mt-2 text-xs">
                    {pkg.highlights.length ? "Holding a space does not guarantee it until payment clears." : ""}
                  </p>
                </>
              ) : (
                <p className="mt-2">
                  This request does not reserve space. A planner confirms availability, any applicable taxes and
                  the infant fare, then shares secure payment instructions.
                </p>
              )}
            </div>
          </section>
        )}

        {current === 5 && booking && (
          <div className="step-enter">
            <BookingConfirmationView booking={booking} onReset={resetFlow} embedded />
          </div>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">
            {error}
          </p>
        )}

        {current < 5 && (
          <div className="mt-8 flex justify-between gap-3">
            {current > 1 ? (
              <Button variant="outline" onClick={back} disabled={submitting}>
                Back
              </Button>
            ) : (
              <span />
            )}
            {current < 4 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className={submitting ? "opacity-60" : ""}>
                {submitting
                  ? instant
                    ? "Creating booking…"
                    : "Sending request…"
                  : instant
                  ? "Continue to payment"
                  : "Submit booking request"}
              </Button>
            )}
          </div>
        )}
      </main>

      <aside className="h-fit rounded-2xl border border-line bg-cream p-6 shadow-card lg:sticky lg:top-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">Booking summary</p>
        {pkg ? (
          <>
            <h2 className="mt-3 font-display text-2xl text-forest">{pkg.name}</h2>
            <p className="mt-1 text-sm text-charcoal-soft">
              {pkg.destination_name} · {pkg.duration_days} days · {bookingModeLabel(pkg.booking_mode)}
            </p>
            <div className="mt-6 space-y-3 border-y border-line py-5 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">From / traveller</span>
                <strong className="text-forest">{formatMoney(pkg.starting_price, pkg.currency)}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Paying travellers</span>
                <strong className="text-forest">{payingTravellers}</strong>
              </p>
              <p className="flex justify-between gap-3">
                <span className="text-charcoal-soft">Taxes &amp; fees</span>
                <strong className="text-forest">{formatMoney(taxes, pkg.currency)}</strong>
              </p>
            </div>
            <p className="mt-5 flex items-baseline justify-between gap-3">
              <span className="font-semibold text-forest">Total</span>
              <strong className="font-display text-2xl text-forest">{formatMoney(total, pkg.currency)}</strong>
            </p>
            {values.travelDate && (
              <p className="mt-3 text-xs text-charcoal-soft">{formatDate(values.travelDate)}</p>
            )}
            <p className="mt-8 text-xs text-charcoal-soft">
              Indicative package total before final taxes and infant fare. The server recalculates the quote;
              browser prices are never accepted.
            </p>
          </>
        ) : (
          <p className="mt-5 text-sm text-charcoal-soft">Choose a package to see its price, destination and key details.</p>
        )}
      </aside>
    </div>
  );

  function resetFlow() {
    setValues(empty());
    setBooking(null);
    setCurrent(1);
    submittedRef.current = null;
    router.push("/book", { scroll: false });
  }
}
