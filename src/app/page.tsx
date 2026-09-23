import { Hero } from "@/components/home/Hero";
import { TravelServices } from "@/components/home/TravelServices";
import { CustomerStories } from "@/components/home/CustomerStories";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BookNowCta } from "@/components/cta/BookNowCta";

export default function Home() {
  return (
    <>
      <Hero />
      <TravelServices />
      <CustomerStories />
      <HowItWorks />
      <BookNowCta />
    </>
  );
}
