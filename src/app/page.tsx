import { HeroCarousel } from "@/components/home/HeroCarousel";
import { OccasionBar } from "@/components/home/OccasionBar";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BeforeAfterSection } from "@/components/home/BeforeAfterSection";
import { USPSection } from "@/components/home/USPSection";
import { Testimonials } from "@/components/home/Testimonials";

import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <HeroCarousel />
      <OccasionBar />
      <FeaturedCategories />
      <NewArrivals />
      <FeaturedProducts />
      <BeforeAfterSection />
      <Testimonials />
      <USPSection />
      
    </>
  );
}
