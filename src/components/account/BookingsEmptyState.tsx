import { Button } from "@/components/ui/Button";

export function BookingsEmptyState({ message = "Start exploring journeys curated by real local experts." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-10 text-center">
      <p className="font-display text-2xl text-forest">Your next journey hasn&apos;t been chosen yet.</p>
      <p className="mt-3 text-charcoal-soft">{message}</p>
      <Button href="/packages" variant="primary" size="md" className="mt-6">Explore Packages</Button>
    </div>
  );
}