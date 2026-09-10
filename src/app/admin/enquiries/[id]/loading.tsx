import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Container className="py-20 text-center text-charcoal-soft">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-line border-t-terracotta" aria-label="Loading" role="status" />
      <p className="mt-4 text-sm">Loading enquiry…</p>
    </Container>
  );
}
