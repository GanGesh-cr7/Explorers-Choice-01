"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { packages } from "@/data/packages";
import { destinations } from "@/data/destinations";

const fieldClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

function BookContent() {
  const searchParams = useSearchParams();
  const packageSlug = searchParams.get("package");
  const destinationSlug = searchParams.get("destination");

  const defaultPackage = packageSlug
    ? packages.find((p) => p.slug === packageSlug)
    : undefined;
  const defaultDestination = destinationSlug
    ? destinations.find((d) => d.slug === destinationSlug)
    : undefined;

  const [submitted, setSubmitted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(defaultPackage?.slug ?? "");

  const chosen = packages.find((p) => p.slug === selectedPackage);
  const chosenDestination = defaultDestination ?? (chosen ? destinations.find((d) => d.slug === chosen.destinationSlug) : undefined);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="border-b border-line bg-ivory-warm">
        <Container className="py-14 sm:py-16">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            Book your journey
          </p>
          <h1 className="font-display text-5xl leading-tight text-forest sm:text-6xl">
            Book Now
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal-soft">
            Tell us what you&apos;re dreaming of and share a few details. A real travel planner
            will confirm availability and handle everything from there.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          {submitted ? (
            <div className="rounded-2xl border border-line bg-cream p-10 text-center">
              <p className="font-display text-3xl text-forest">Request received!</p>
              <p className="mt-4 text-charcoal-soft">
                Thank you — your booking request is with our team. A travel planner will be in
                touch within one working day to confirm details.
              </p>
              <Button
                variant="outline"
                size="md"
                className="mt-6"
                onClick={() => setSubmitted(false)}
              >
                Make another request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div>
                <label htmlFor="package" className="mb-2 block text-sm font-semibold text-forest">
                  Which journey interests you?
                </label>
                <select
                  id="package"
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className={fieldClasses}
                >
                  <option value="">I&apos;m just exploring</option>
                  {packages.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name} — {p.destination} · {p.duration}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-forest">
                    Full name
                  </label>
                  <input id="name" name="name" required placeholder="Your name" className={fieldClasses} />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-forest">
                    Email
                  </label>
                  <input id="email" name="email" type="email" required placeholder="you@email.com" className={fieldClasses} />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-forest">
                    Phone <span className="font-normal text-charcoal-soft">(optional)</span>
                  </label>
                  <input id="phone" name="phone" type="tel" placeholder="+1 …" className={fieldClasses} />
                </div>
                <div>
                  <label htmlFor="travellers" className="mb-2 block text-sm font-semibold text-forest">
                    Number of travellers
                  </label>
                  <select id="travellers" name="travellers" className={fieldClasses}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="mb-2 block text-sm font-semibold text-forest">
                    Preferred dates
                  </label>
                  <input id="date" name="date" type="month" className={fieldClasses} />
                </div>
                <div>
                  <label htmlFor="flexible" className="mb-2 block text-sm font-semibold text-forest">
                    Flexibility
                  </label>
                  <select id="flexible" name="flexible" className={fieldClasses}>
                    <option>Dates are flexible</option>
                    <option>Need specific dates</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-semibold text-forest">
                  Anything we should know?
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Dietary needs, accessibility, celebrating something special, or anything else…"
                  className={fieldClasses}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                Submit booking request
              </Button>
              <p className="text-xs text-charcoal-soft">
                No payment is taken here. A planner will confirm availability and send a
                secure booking link.
              </p>
            </form>
          )}

          {/* Summary card */}
          <aside className="h-fit rounded-2xl border border-line bg-cream p-8 shadow-card">
            <h2 className="font-display text-xl text-forest">Your selection</h2>
            {chosen || chosenDestination ? (
              <div className="mt-5 space-y-4 text-sm">
                {chosen && (
                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="font-semibold text-forest">{chosen.name}</p>
                    <p className="mt-1 text-charcoal-soft">
                      {chosen.duration} · From ${chosen.startingPrice.toLocaleString()} / person
                    </p>
                  </div>
                )}
                {chosenDestination && (
                  <div className="rounded-xl border border-line bg-white p-4">
                    <p className="font-semibold text-forest">{chosenDestination.name}</p>
                    <p className="mt-1 text-charcoal-soft">{chosenDestination.country}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-charcoal-soft">
                No journey selected yet. Choose one from the form to see it here, or leave it
                blank and we&apos;ll help you find the right one.
              </p>
            )}
            <div className="mt-6 border-t border-line pt-6">
              <p className="text-sm leading-relaxed text-charcoal-soft">
                Small deposit to reserve, balance due closer to departure. Full terms shared
                before you commit.
              </p>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center text-charcoal-soft">Loading…</Container>
      }
    >
      <BookContent />
    </Suspense>
  );
}
