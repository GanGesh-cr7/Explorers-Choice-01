import { Button } from "@/components/ui/Button";
import { waLink } from "@/lib/support";

export function SupportPanel({
  message = "Talk to Explorers Choice for answers from a real travel planner who knows your trip.",
  whatsappMessage = "Hello Explorers Choice, I have a question about my trip.",
  cta = "Talk to Explorers Choice",
}: {
  message?: string;
  whatsappMessage?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-sand-light/50 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">Need help?</p>
      <p className="mt-3 text-sm text-charcoal-soft">{message}</p>
      <Button href={waLink(whatsappMessage)} variant="primary" size="md" className="mt-4">
        {cta}
      </Button>
    </div>
  );
}