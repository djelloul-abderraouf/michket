import { Suspense } from "react";

import { HeroCarousel } from "@/components/home/HeroCarousel";
import { OccasionBar } from "@/components/home/OccasionBar";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BeforeAfterSection } from "@/components/home/BeforeAfterSection";
import { ClientReferences } from "@/components/home/ClientReferences";
import { USPSection } from "@/components/home/USPSection";
import { Testimonials } from "@/components/home/Testimonials";

import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

import {
  fetchFeaturedCategories,
  fetchProductsByBadge,
  type ApiCategory,
  type Product,
} from "@/lib/api";

/* ───────────────────────────── Data sections ───────────────────────────── */

async function FeaturedCategoriesSection() {
  const categories = await fetchFeaturedCategories().catch(
    () => [] as ApiCategory[],
  );

  return <FeaturedCategories categories={categories} />;
}

async function NewArrivalsSection() {
  const products = await fetchProductsByBadge("NOUVEAU", {
    limit: 8,
  }).catch(() => [] as Product[]);

  return <NewArrivals products={products} />;
}

async function FeaturedProductsSection() {
  const products = await fetchProductsByBadge("BEST_SELLER", {
    limit: 8,
  }).catch(() => [] as Product[]);

  return <FeaturedProducts products={products} />;
}

/* ───────────────────────────── Loading shells ──────────────────────────── */

function CategoriesLoading() {
  return (
    <div
      className="w-full"
      aria-hidden="true"
    >
      <div className="h-40 sm:h-48" />
    </div>
  );
}

function ProductsLoading() {
  return (
    <div
      className="w-full"
      aria-hidden="true"
    >
      <div className="h-72 sm:h-96" />
    </div>
  );
}

/* ───────────────────────────── Home page ───────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />

      {/* Critical above-the-fold content.
          Never blocked by product/category API requests. */}
      <HeroCarousel />
      <OccasionBar />

      {/* Stream backend-dependent sections independently. */}
      <Suspense fallback={<CategoriesLoading />}>
        <FeaturedCategoriesSection />
      </Suspense>

      <Suspense fallback={<ProductsLoading />}>
        <NewArrivalsSection />
      </Suspense>

      <Suspense fallback={<ProductsLoading />}>
        <FeaturedProductsSection />
      </Suspense>

      {/* Static / independently loaded homepage content. */}
      <BeforeAfterSection />
      <Testimonials />
      <ClientReferences />
      <USPSection />
    </>
  );
}