import Image from "next/image";
import Link from "next/link";

import type { ApiCategory } from "@/lib/api";

type CategoryCardData = {
  id: string;
  title: string;
  href: string;
  image: string | null;
  subtitle: string;
  imagePosition: "center" | "top" | "bottom";
};

type CategoryMosaicProps = {
  categories: ApiCategory[];
  basePath?: string;
  limit?: number;
};

function mapCategory(
  category: ApiCategory,
  basePath: string,
): CategoryCardData {
  const normalizedBasePath = basePath.replace(/\/+$/, "");

  return {
    id: category.id,
    title: category.name,
    href: `${normalizedBasePath}/${category.slug}` || `/${category.slug}`,
    image: category.imageUrl,
    subtitle:
      category.description?.trim() ||
      `Découvrez la collection ${category.name} de Michket.`,
    imagePosition: "center",
  };
}

function chunkCategories(
  categories: CategoryCardData[],
): CategoryCardData[][] {
  const chunks: CategoryCardData[][] = [];

  for (let index = 0; index < categories.length; index += 4) {
    chunks.push(categories.slice(index, index + 4));
  }

  return chunks;
}

export function CategoryMosaic({
  categories,
  basePath = "",
  limit,
}: CategoryMosaicProps) {
  const selected =
    typeof limit === "number"
      ? categories.slice(0, limit)
      : categories;

  const mapped = selected.map((category) =>
    mapCategory(category, basePath),
  );

  if (mapped.length === 0) {
    return null;
  }

  const chunks = chunkCategories(mapped);

  return (
    <div className="space-y-4 xl:space-y-5">
      {chunks.map((chunk, chunkIndex) => (
        <CategoryMosaicGroup
          key={chunk.map((category) => category.id).join("-")}
          categories={chunk}
          priorityFirst={chunkIndex === 0}
        />
      ))}
    </div>
  );
}

function CategoryMosaicGroup({
  categories,
  priorityFirst,
}: {
  categories: CategoryCardData[];
  priorityFirst: boolean;
}) {
  const [first, second, third, fourth] = categories;

  return (
    <>
      {/* Mobile / tablette : même mosaïque que la Home */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:hidden">
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            priority={priorityFirst && index === 0}
            className={
              categories.length === 3 && index === 0
                ? "sm:row-span-2 sm:min-h-[360px]"
                : "min-h-[180px] sm:min-h-[172px]"
            }
            compact={categories.length >= 3 && index > 0}
          />
        ))}
      </div>

      {/* Desktop : mêmes compositions que la Home */}
      <div className="hidden lg:block">
        {categories.length === 1 && first ? (
          <div className="mx-auto max-w-[760px]">
            <CategoryCard
              category={first}
              priority={priorityFirst}
              className="min-h-[330px] xl:min-h-[360px]"
              large
            />
          </div>
        ) : null}

        {categories.length === 2 && first && second ? (
          <div className="grid grid-cols-2 gap-4 xl:gap-5">
            <CategoryCard
              category={first}
              priority={priorityFirst}
              className="min-h-[300px] xl:min-h-[330px]"
            />

            <CategoryCard
              category={second}
              className="min-h-[300px] xl:min-h-[330px]"
            />
          </div>
        ) : null}

        {categories.length === 3 && first && second && third ? (
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4 xl:gap-5">
            <CategoryCard
              category={first}
              priority={priorityFirst}
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

        {categories.length === 4 &&
        first &&
        second &&
        third &&
        fourth ? (
          <div className="grid grid-cols-2 gap-4 xl:gap-5">
            <CategoryCard
              category={first}
              priority={priorityFirst}
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
    </>
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

            {!compact ? (
              <p
                className={`mt-1.5 max-w-md text-white/68 ${
                  large
                    ? "text-[12px] leading-5 xl:text-[13px]"
                    : "text-[11px] leading-5"
                }`}
              >
                {category.subtitle}
              </p>
            ) : null}
          </div>

          <span
            className={`flex shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#ECAB1C] group-hover:bg-[#ECAB1C] group-hover:text-[#0A0A0A] ${
              compact ? "h-8 w-8" : "h-9 w-9"
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
