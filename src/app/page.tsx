import { Hero } from "@/components/Hero";
import { LocationListing } from "@/components/LocationListing";
import { CategoryListing } from "@/components/CategoryListing";
import { OurHotels } from "@/components/OurHotels";
import { PopularTours } from "@/components/PopularTours";
import { ContactSection } from "@/components/ContactSection";
import { ReviewsSection } from "@/components/ReviewsSection";

export default function Home() {
  return (
    <>
      <Hero />
      <LocationListing />
      <CategoryListing />
      <OurHotels />
      <PopularTours />
      <ReviewsSection />
      <ContactSection />
    </>
  );
}
