import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { faqs } from "@/data/extras";

export function FaqSection() {
  const preview = faqs.slice(0, 5);
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Questions, answered"
            title="Before you book, a few helpful answers"
            description="The things travellers ask us most. If yours isn't here, we'd love to hear it."
          />
          <Link
            href="/faq"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            See all FAQs
          </Link>
        </div>
        <FaqAccordion items={preview} />
      </Container>
    </section>
  );
}
