"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { destinations } from "@/data/destinations";
import { packages } from "@/data/packages";
import { submitBooking, type BookingConfirmation } from "@/lib/bookings";

const steps = ["Trip", "Travellers", "Details", "Summary", "Confirmation"];
const field = "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal focus:border-terracotta focus:outline-none";

type Values = { packageSlug: string; travelDate: string; adults: number; children: number; infants: number; departure: string; fullName: string; email: string; phone: string; country: string; requirements: string; notes: string };
const empty: Values = { packageSlug: "", travelDate: "", adults: 2, children: 0, infants: 0, departure: "", fullName: "", email: "", phone: "", country: "", requirements: "", notes: "" };

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export function BookingFlow({ packageSlug, destinationSlug }: { packageSlug: string | null; destinationSlug: string | null }) {
  const initialPackage = packages.find((item) => item.slug === packageSlug)
    ?? packages.find((item) => item.destinationSlug === destinationSlug);
  const [current, setCurrent] = useState(1);
  const [values, setValues] = useState<Values>(() => ({ ...empty, packageSlug: initialPackage?.slug ?? "" }));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  const pkg = useMemo(() => packages.find((item) => item.slug === values.packageSlug), [values.packageSlug]);
  const destination = pkg ? destinations.find((item) => item.slug === pkg.destinationSlug) : undefined;
  const payingTravellers = values.adults + values.children;
  const total = pkg ? pkg.startingPrice * payingTravellers : 0;
  const update = <K extends keyof Values>(key: K, value: Values[K]) => { setValues((old) => ({ ...old, [key]: value })); setError(""); };

  function validate() {
    if (current === 1 && !pkg) return "Choose a package to continue.";
    if (current === 2) {
      if (!values.travelDate) return "Choose your preferred travel date.";
      if (values.adults < 1) return "At least one adult traveller is required.";
    }
    if (current === 3) {
      if (!values.fullName.trim() || !values.email.trim() || !values.phone.trim() || !values.country.trim()) return "Complete your name, email, phone number, and country.";
      if (!/^\S+@\S+\.\S+$/.test(values.email)) return "Enter a valid email address.";
    }
    return "";
  }

  function next() { const issue = validate(); if (issue) setError(issue); else setCurrent((step) => Math.min(4, step + 1)); }
  async function submit() {
    const issue = validate();
    if (issue || !pkg) return setError(issue || "Choose an available package.");
    setLoading(true); setError("");
    try {
      setBooking(await submitBooking({ package_slug: pkg.slug, travel_date: values.travelDate, adults: values.adults, children: values.children, infants: values.infants, departure_information: values.departure, full_name: values.fullName, email: values.email, phone: values.phone, country: values.country, special_requirements: values.requirements, notes: values.notes }));
      setCurrent(5);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Your booking request could not be sent. Please try again."); }
    finally { setLoading(false); }
  }

  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
    <main className="rounded-2xl border border-line bg-cream p-5 shadow-card sm:p-8">
      <ol className="mb-8 grid grid-cols-5 gap-2 border-b border-line pb-5" aria-label="Booking progress">{steps.map((label, index) => <li key={label}><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${current >= index + 1 ? "bg-forest text-ivory" : "bg-sand-light text-charcoal-soft"}`}>{index + 1}</span><span className={`mt-2 block text-xs font-semibold ${current === index + 1 ? "text-forest" : "text-charcoal-soft"}`}>{label}</span></li>)}</ol>
      {current === 1 && <section><p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">1. Trip</p><h2 className="mt-2 font-display text-3xl text-forest">Choose your journey</h2><label className="mt-7 block text-sm font-semibold text-forest">Package<select value={values.packageSlug} onChange={(e) => update("packageSlug", e.target.value)} className={field}><option value="">Select a package</option>{packages.map((item) => <option value={item.slug} key={item.slug}>{item.name} — {item.destination} · {item.duration}</option>)}</select></label>{pkg && <div className="mt-5 rounded-xl border border-line bg-white p-5"><p className="font-semibold text-forest">{pkg.name}</p><p className="mt-1 text-sm text-charcoal-soft">{pkg.destination} · {pkg.duration} · From {money(pkg.startingPrice)} / traveller</p><ul className="mt-4 grid gap-2 text-sm text-charcoal-soft sm:grid-cols-2">{pkg.highlights.slice(0, 4).map((item) => <li key={item}>✓ {item}</li>)}</ul></div>}</section>}
      {current === 2 && <section><p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">2. Travellers</p><h2 className="mt-2 font-display text-3xl text-forest">When and who is travelling?</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-forest">Travel date<input type="date" value={values.travelDate} onChange={(e) => update("travelDate", e.target.value)} className={field} /></label><label className="text-sm font-semibold text-forest">Departure city or airport <span className="font-normal text-charcoal-soft">(optional)</span><input value={values.departure} onChange={(e) => update("departure", e.target.value)} className={field} /></label>{([['adults','Adults'], ['children','Children'], ['infants','Infants']] as const).map(([key,label]) => <label className="text-sm font-semibold text-forest" key={key}>{label}<input type="number" min={key === 'adults' ? 1 : 0} max={key === 'infants' ? 10 : 20} value={values[key]} onChange={(e) => update(key, Number(e.target.value))} className={field} /></label>)}</div><p className="mt-5 text-xs text-charcoal-soft">Infant fare and final availability are confirmed by your planner before payment.</p></section>}
      {current === 3 && <section><p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">3. Details</p><h2 className="mt-2 font-display text-3xl text-forest">Your contact details</h2><div className="mt-7 grid gap-5 sm:grid-cols-2">{([['fullName','Full name','text'], ['email','Email','email'], ['phone','Phone','tel'], ['country','Country','text']] as const).map(([key,label,type]) => <label className="text-sm font-semibold text-forest" key={key}>{label}<input required type={type} value={values[key]} onChange={(e) => update(key, e.target.value)} className={field} /></label>)}</div><label className="mt-5 block text-sm font-semibold text-forest">Special requirements <span className="font-normal text-charcoal-soft">(optional)</span><textarea value={values.requirements} onChange={(e) => update("requirements", e.target.value)} rows={3} className={field} placeholder="Dietary, accessibility, or room needs" /></label><label className="mt-5 block text-sm font-semibold text-forest">Notes <span className="font-normal text-charcoal-soft">(optional)</span><textarea value={values.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className={field} /></label></section>}
      {current === 4 && pkg && <section><p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">4. Summary</p><h2 className="mt-2 font-display text-3xl text-forest">Review before you send</h2><div className="mt-7 space-y-3 rounded-xl border border-line bg-white p-5 text-sm"><p><span className="text-charcoal-soft">Journey</span><strong className="float-right text-forest">{pkg.name}</strong></p><p><span className="text-charcoal-soft">Travel date</span><strong className="float-right text-forest">{new Date(`${values.travelDate}T00:00:00`).toLocaleDateString()}</strong></p><p><span className="text-charcoal-soft">Travellers</span><strong className="float-right text-forest">{values.adults} adults, {values.children} children, {values.infants} infants</strong></p></div><div className="mt-5 rounded-xl bg-sand-light p-5 text-sm text-charcoal-soft"><strong className="text-forest">Important conditions</strong><p className="mt-2">This request does not reserve space. A planner confirms availability, any applicable taxes and infant fare, then shares secure payment instructions.</p></div></section>}
      {current === 5 && booking && <section className="text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">5. Confirmation</p><h2 className="mt-3 font-display text-4xl text-forest">Your journey starts here.</h2><p className="mt-5 text-charcoal-soft">Booking request <strong className="text-forest">{booking.booking_reference}</strong> received.</p><div className="mt-6 rounded-xl border border-line bg-white p-5 text-left text-sm"><strong className="text-forest">{booking.package_name} · {booking.destination_name}</strong><p className="mt-2 text-charcoal-soft">We&apos;ll confirm availability and contact you shortly.</p></div><p className="mt-6 text-sm text-charcoal-soft">Need help now? <a href="https://wa.me/" className="font-semibold text-terracotta underline">Contact us on WhatsApp</a>.</p><Button className="mt-7" variant="outline" onClick={() => { setValues(empty); setBooking(null); setCurrent(1); }}>Plan another journey</Button></section>}
      {error && <p role="alert" className="mt-6 rounded-xl border border-terracotta/30 bg-terracotta/10 p-4 text-sm text-charcoal">{error}</p>}
      {current < 5 && <div className="mt-8 flex justify-between gap-3">{current > 1 ? <Button variant="outline" onClick={() => { setError(""); setCurrent((step) => step - 1); }}>Back</Button> : <span />}{current < 4 ? <Button onClick={next}>Continue</Button> : <Button onClick={submit} className={loading ? "pointer-events-none opacity-60" : ""}>{loading ? "Sending request…" : "Submit booking request"}</Button>}</div>}
    </main>
    <aside className="h-fit rounded-2xl border border-line bg-cream p-6 shadow-card lg:sticky lg:top-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-terracotta">Booking summary</p>{pkg ? <><h2 className="mt-3 font-display text-2xl text-forest">{pkg.name}</h2><p className="mt-1 text-sm text-charcoal-soft">{pkg.destination} · {pkg.duration}</p><div className="mt-6 space-y-3 border-y border-line py-5 text-sm"><p><span className="text-charcoal-soft">From / traveller</span><strong className="float-right text-forest">{money(pkg.startingPrice)}</strong></p><p><span className="text-charcoal-soft">Paying travellers</span><strong className="float-right text-forest">{payingTravellers}</strong></p><p><span className="text-charcoal-soft">Taxes & fees</span><strong className="float-right text-forest">To be confirmed</strong></p></div><p className="mt-5"><span className="font-semibold text-forest">Current total</span><strong className="float-right font-display text-2xl text-forest">{money(total)}</strong></p><p className="mt-8 text-xs text-charcoal-soft">Indicative package total before final taxes and any infant fare. The server recalculates the quote; browser prices are never accepted.</p>{destination && <p className="mt-5 border-t border-line pt-5 text-sm text-charcoal-soft">Best time for {destination.name}: {destination.bestTime}</p>}</> : <p className="mt-5 text-sm text-charcoal-soft">Choose a package to see its price, destination, and key details.</p>}</aside>
  </div>;
}
