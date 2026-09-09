import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { faqs } from "@/data/extras";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the questions travellers ask us most — group size, what's included, booking, cancellation and more.",
};

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line bg-ivory-warm">
        <Container className="py-16 sm:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-terracotta">
            FAQ
          </p>
          <h1 className="font-display text-5xl leading-tight text-forest sm:text-6xl">
            Questions, answered
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal-soft">
            The things travellers ask us most. If yours isn&apos;t here, we&apos;d love to hear it —
            talk to a real person, any time.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <FaqAccordion items={faqs} />

          <div className="mt-12 rounded-2xl border border-line bg-sand-light/50 p-8 text-center">
            <h2 className="font-display text-2xl text-forest">Still have a question?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-charcoal-soft">
              No question is too small when it comes to your trip. Get in touch and a real
              travel planner will reply within one working day.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-forest px-7 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-forest-light"
            >
              Contact us
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
