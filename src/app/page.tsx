import { HeroCarousel } from "@/components/home/HeroCarousel";
import { OccasionBar } from "@/components/home/OccasionBar";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BeforeAfterSection } from "@/components/home/BeforeAfterSection";
import { USPSection } from "@/components/home/USPSection";
import { Testimonials } from "@/components/home/Testimonials";

import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import {
  fetchFeaturedCategories,
  fetchProductsByBadge,
  type ApiCategory,
  type Product,
} from "@/lib/api";

export default async function HomePage() {
  // Fetch data in parallel
  const [featuredCategories, newProducts, popularProducts] = await Promise.all([
    fetchFeaturedCategories().catch(() => [] as ApiCategory[]),
    fetchProductsByBadge("NOUVEAU", { limit: 8 }).catch(() => [] as Product[]),
    fetchProductsByBadge("BEST_SELLER", { limit: 8 }).catch(() => [] as Product[]),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <HeroCarousel />
      <OccasionBar />
      <FeaturedCategories categories={featuredCategories} />
      <NewArrivals products={newProducts} />
      <FeaturedProducts products={popularProducts} />
      <BeforeAfterSection />
      <Testimonials />
      <USPSection />
    </>
  );
}
