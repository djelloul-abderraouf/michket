"use client";

import Image from "next/image";
import Link from "next/link";
import type { ApiCategory } from "@/lib/api";

interface FeaturedCategoriesProps {
  categories?: ApiCategory[];
}

type CategoryCardData = {
  id: string;
  title: string;
  href: string;
  image: string | null;
  subtitle: string;
  imagePosition: "center" | "top" | "bottom";
};

function mapCategory(category: ApiCategory): CategoryCardData {
  return {
    id: category.id,
    title: category.name,
    href: `/${category.slug}`,
    image: category.imageUrl,
    subtitle:
      category.description?.trim() ||
      `Découvrez la collection ${category.name} de Michket.`,
    imagePosition: "center",
  };
}

export function FeaturedCategories({
  categories = [],
}: FeaturedCategoriesProps) {
  /**
   * The backend GET /categories/featured is the source of truth.
   * It returns up to 4 active top-level categories in sortOrder order.
   *
   * The visual layout remains fixed, but the category content is dynamic.
   */
  const featured = categories.slice(0, 4).map(mapCategory);

  if (featured.length === 0) {
    return null;
  }

  const [first, second, third, fourth] = featured;

  return (
    <section
      className="relative overflow-hidden bg-white py-10 sm:py-12 lg:py-16"
      aria-labelledby="featured-categories-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto mb-7 max-w-3xl text-center sm:mb-9 lg:mb-10">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-[#ECAB1C]" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A6A20] sm:text-[11px]">
              L&apos;univers Michket
            </span>
            <span className="h-px w-7 bg-[#ECAB1C]" aria-hidden="true" />
          </div>

          <h2
            id="featured-categories-heading"
            className="font-body text-[30px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#111111] sm:text-[38px] lg:text-[44px]"
          >
            Nos grandes catégories
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-6 text-black/50 sm:text-sm">
            Découvrez les univers Michket disponibles actuellement.
          </p>
        </div>

        {/* Mobile */}
        <div className="grid gap-3 sm:gap-4 lg:hidden">
          {first && (
            <CategoryCard
              category={first}
              className="aspect-[16/11]"
              priority
            />
          )}

          {second && (
            <CategoryCard
              category={second}
              className="aspect-[16/10]"
            />
          )}

          {(third || fourth) && (
            <div
              className={`grid gap-3 sm:gap-4 ${
                third && fourth ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              {third && (
                <CategoryCard
                  category={third}
                  className="aspect-[4/5]"
                  compact
                />
              )}

              {fourth && (
                <CategoryCard
                  category={fourth}
                  className="aspect-[4/5]"
                  compact
                />
              )}
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden grid-cols-[1.08fr_0.92fr] gap-5 lg:grid">
          {first && (
            <CategoryCard
              category={first}
              className="min-h-[610px] xl:min-h-[680px]"
              priority
              large
            />
          )}

          {(second || third || fourth) && (
            <div className="grid gap-5">
              {second && (
                <CategoryCard
                  category={second}
                  className="min-h-[315px] xl:min-h-[350px]"
                  wide
                />
              )}

              {(third || fourth) && (
                <div
                  className={`grid gap-5 ${
                    third && fourth ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {third && (
                    <CategoryCard
                      category={third}
                      className="min-h-[275px] xl:min-h-[310px]"
                      compact
                    />
                  )}

                  {fourth && (
                    <CategoryCard
                      category={fourth}
                      className="min-h-[275px] xl:min-h-[310px]"
                      compact
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  className = "",
  compact = false,
  large = false,
  wide = false,
  priority = false,
}: {
  category: CategoryCardData;
  className?: string;
  compact?: boolean;
  large?: boolean;
  wide?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={category.href}
      className={`group relative block overflow-hidden rounded-[10px] bg-[#151515] ${className}`}
      aria-label={`Découvrir ${category.title}`}
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
          style={{ objectPosition: category.imagePosition }}
          sizes={
            large
              ? "(min-width: 1024px) 54vw, 100vw"
              : wide
                ? "(min-width: 1024px) 46vw, 100vw"
                : "(min-width: 1024px) 23vw, 50vw"
          }
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#2E2E2E] to-[#111111]"
          aria-hidden="true"
        />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/12 to-black/5 transition-colors duration-300 group-hover:from-black/82"
        aria-hidden="true"
      />

      <span
        className="absolute right-0 top-0 h-[3px] w-14 bg-[#ECAB1C] transition-all duration-300 group-hover:w-24"
        aria-hidden="true"
      />

      <div
        className={`absolute inset-x-0 bottom-0 ${
          compact ? "p-4 sm:p-5" : large ? "p-6 xl:p-8" : "p-5 sm:p-6"
        }`}
      >
        <div className="mb-2 h-[2px] w-7 bg-[#ECAB1C] transition-all duration-300 group-hover:w-12" />

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3
              className={`font-body font-semibold leading-tight tracking-[-0.025em] text-white ${
                compact
                  ? "text-[18px] sm:text-[20px]"
                  : large
                    ? "text-[28px] xl:text-[34px]"
                    : "text-[22px] sm:text-[25px]"
              }`}
            >
              {category.title}
            </h3>

            {!compact && (
              <p
                className={`mt-2 max-w-md text-white/68 ${
                  large
                    ? "text-[14px] leading-6 xl:text-[15px]"
                    : "text-[13px] leading-5"
                }`}
              >
                {category.subtitle}
              </p>
            )}
          </div>

          <span
            className={`flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#ECAB1C] group-hover:bg-[#ECAB1C] group-hover:text-[#0A0A0A] ${
              compact ? "h-9 w-9" : "h-11 w-11"
            }`}
            aria-hidden="true"
          >
            <svg
              className={compact ? "h-4 w-4" : "h-5 w-5"}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
