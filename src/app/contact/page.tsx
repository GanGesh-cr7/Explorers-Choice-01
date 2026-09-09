"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const fieldClasses =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:border-terracotta focus:outline-none";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="border-b border-line bg-ivory-warm">
        <Container className="py-16 sm:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            Contact
          </p>
          <h1 className="font-display text-5xl leading-tight text-forest sm:text-6xl">
            Talk to a real person
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal-soft">
            Questions, ideas or a trip already forming in your mind — reach out and a travel
            planner will get back to you within one working day.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <div>
            {submitted ? (
              <div className="rounded-2xl border border-line bg-cream p-10 text-center">
                <p className="font-display text-3xl text-forest">Thank you!</p>
                <p className="mt-4 text-charcoal-soft">
                  Your message is on its way. A travel planner will be in touch within one
                  working day.
                </p>
                <Button
                  variant="outline"
                  size="md"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
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
                <div className="sm:col-span-2">
                  <label htmlFor="topic" className="mb-2 block text-sm font-semibold text-forest">
                    What&apos;s this about?
                  </label>
                  <select id="topic" name="topic" className={fieldClasses}>
                    <option>Planning a trip</option>
                    <option>Question about a package</option>
                    <option>Existing booking</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold text-forest">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    placeholder="Tell us a little about where you'd like to go and how you like to travel…"
                    className={fieldClasses}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                    Send message
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-line bg-cream p-8">
              <h2 className="font-display text-xl text-forest">Get in touch directly</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-charcoal">Email</dt>
                  <dd className="mt-1 text-charcoal-soft">hello@explorerschoice.com</dd>
                </div>
                <div>
                  <dt className="font-semibold text-charcoal">Phone</dt>
                  <dd className="mt-1 text-charcoal-soft">+1 (555) 123-4567</dd>
                </div>
                <div>
                  <dt className="font-semibold text-charcoal">Office</dt>
                  <dd className="mt-1 text-charcoal-soft">
                    12 Harbour Lane
                    <br />
                    Portland, Oregon
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-line bg-sand-light/50 p-8">
              <h2 className="font-display text-xl text-forest">Prefer to just book?</h2>
              <p className="mt-3 text-sm text-charcoal-soft">
                Browse our packages and book directly — a planner will confirm the details
                within one working day.
              </p>
              <Button href="/packages" variant="primary" size="md" className="mt-5">
                Browse Packages
              </Button>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
