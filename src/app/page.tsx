import { Hero } from "@/components/home/Hero";
import { FeaturedDestinations } from "@/components/home/FeaturedDestinations";
import { FeaturedPackages } from "@/components/home/FeaturedPackages";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CustomerStories } from "@/components/home/CustomerStories";
import { TravelInspiration } from "@/components/home/TravelInspiration";
import { FaqSection } from "@/components/home/FaqSection";
import { BookNowCta } from "@/components/cta/BookNowCta";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedDestinations />
      <FeaturedPackages />
      <HowItWorks />
      <CustomerStories />
      <TravelInspiration />
      <FaqSection />
      <BookNowCta />
    </>
  );
}
