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
  const featured = categories.slice(0, 4).map(mapCategory);

  if (featured.length === 0) {
    return null;
  }

  const [first, second, third, fourth] = featured;

  return (
    <section
      className="relative overflow-hidden bg-white py-8 sm:py-9 lg:py-11"
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

      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 max-w-2xl text-center sm:mb-6 lg:mb-7">
          <div className="mb-2 flex items-center justify-center gap-2.5">
            <span
              className="h-px w-6 bg-[#ECAB1C]"
              aria-hidden="true"
            />

            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8A6A20] sm:text-[10px]">
              L&apos;univers Michket
            </span>

            <span
              className="h-px w-6 bg-[#ECAB1C]"
              aria-hidden="true"
            />
          </div>

          <h2
            id="featured-categories-heading"
            className="font-body text-[26px] font-semibold leading-tight tracking-[-0.035em] text-[#111111] sm:text-[31px] lg:text-[36px]"
          >
            Nos grandes catégories
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-[12px] leading-5 text-black/48 sm:text-[13px]">
            Découvrez les univers Michket disponibles actuellement.
          </p>
        </div>

        {/* Mobile / tablette : mosaïque compacte */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:hidden">
          {featured.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              priority={index === 0}
              className={
                featured.length === 3 && index === 0
                  ? "sm:row-span-2 sm:min-h-[360px]"
                  : "min-h-[180px] sm:min-h-[172px]"
              }
              compact={featured.length >= 3 && index > 0}
            />
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          {featured.length === 1 && first ? (
            <div className="mx-auto max-w-[760px]">
              <CategoryCard
                category={first}
                priority
                className="min-h-[330px] xl:min-h-[360px]"
                large
              />
            </div>
          ) : null}

          {featured.length === 2 && first && second ? (
            <div className="grid grid-cols-2 gap-4 xl:gap-5">
              <CategoryCard
                category={first}
                priority
                className="min-h-[300px] xl:min-h-[330px]"
              />

              <CategoryCard
                category={second}
                className="min-h-[300px] xl:min-h-[330px]"
              />
            </div>
          ) : null}

          {featured.length === 3 && first && second && third ? (
            <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 xl:gap-5">
              <CategoryCard
                category={first}
                priority
                className="min-h-[420px] xl:min-h-[450px]"
                large
              />

              <div className="grid grid-rows-2 gap-4 xl:gap-5">
                <CategoryCard
                  category={second}
                  className="min-h-0"
                  compact
                />

                <CategoryCard
                  category={third}
                  className="min-h-0"
                  compact
                />
              </div>
            </div>
          ) : null}

          {featured.length === 4 &&
          first &&
          second &&
          third &&
          fourth ? (
            <div className="grid grid-cols-2 gap-4 xl:gap-5">
              <CategoryCard
                category={first}
                priority
                className="min-h-[210px] xl:min-h-[225px]"
                compact
              />

              <CategoryCard
                category={second}
                className="min-h-[210px] xl:min-h-[225px]"
                compact
              />

              <CategoryCard
                category={third}
                className="min-h-[210px] xl:min-h-[225px]"
                compact
              />

              <CategoryCard
                category={fourth}
                className="min-h-[210px] xl:min-h-[225px]"
                compact
              />
            </div>
          ) : null}
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
  priority = false,
}: {
  category: CategoryCardData;
  className?: string;
  compact?: boolean;
  large?: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={category.href}
      className={`group relative block overflow-hidden rounded-[12px] border border-black/[0.06] bg-[#151515] shadow-[0_8px_22px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ECAB1C]/35 hover:shadow-[0_12px_28px_rgba(17,17,17,0.10)] ${className}`}
      aria-label={`Découvrir ${category.title}`}
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
          style={{ objectPosition: category.imagePosition }}
          sizes={
            large
              ? "(min-width: 1024px) 52vw, 100vw"
              : "(min-width: 1024px) 50vw, 100vw"
          }
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#2E2E2E] to-[#111111]"
          aria-hidden="true"
        />
      )}

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/14 to-black/4 transition-colors duration-300 group-hover:from-black/84"
        aria-hidden="true"
      />

      <span
        className="absolute right-0 top-0 h-[2px] w-10 bg-[#ECAB1C] transition-all duration-300 group-hover:w-16"
        aria-hidden="true"
      />

      <div
        className={`absolute inset-x-0 bottom-0 ${
          large
            ? "p-5 xl:p-6"
            : compact
              ? "p-3.5 sm:p-4"
              : "p-4 sm:p-5"
        }`}
      >
        <div className="mb-1.5 h-[2px] w-5 bg-[#ECAB1C] transition-all duration-300 group-hover:w-8" />

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={`font-body font-semibold leading-tight tracking-[-0.025em] text-white ${
                large
                  ? "text-[24px] xl:text-[28px]"
                  : compact
                    ? "text-[16px] sm:text-[18px]"
                    : "text-[19px] sm:text-[21px]"
              }`}
            >
              {category.title}
            </h3>

            {!compact && (
              <p
                className={`mt-1.5 max-w-md text-white/68 ${
                  large
                    ? "text-[12px] leading-5 xl:text-[13px]"
                    : "text-[11px] leading-5"
                }`}
              >
                {category.subtitle}
              </p>
            )}
          </div>

          <span
            className={`flex shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#ECAB1C] group-hover:bg-[#ECAB1C] group-hover:text-[#0A0A0A] ${
              compact
                ? "h-8 w-8"
                : "h-9 w-9"
            }`}
            aria-hidden="true"
          >
            <svg
              className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
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
