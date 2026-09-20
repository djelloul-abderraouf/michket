import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  fetchCategoryBySlugSafe,
  fetchProductsForCategory,
} from "@/lib/api";
import { CategoryHeroCarousel } from "@/components/category/CategoryHeroCarousel";
import { CategoryMosaic } from "@/components/category/CategoryMosaic";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await fetchCategoryBySlugSafe(categorySlug);

  if (!category || category.parentId) {
    return { title: "Catégorie introuvable | Michket" };
  }

  return {
    title: category.metaTitle || `${category.name} | Michket`,
    description:
      category.metaDescription ||
      category.description ||
      `Découvrez la collection ${category.name} sur Michket.`,
  };
}

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

export default async function GenericCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  const category = await fetchCategoryBySlugSafe(categorySlug);

  if (!category || category.parentId) {
    notFound();
  }

  let products: Awaited<ReturnType<typeof fetchProductsForCategory>> = [];
  let apiError = false;

  try {
    products = await fetchProductsForCategory(category.slug);
  } catch {
    apiError = true;
  }

  const subcategories = category.children
    .filter((child) => child.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const displayName =
    category.productsTitle?.trim() ||
    category.pageTitle?.trim() ||
    category.name;

  return (
    <main className="min-h-screen bg-[#F8F3EB] text-[#2A1B16]">
      {category.heroImages.length > 0 ? (
        <CategoryHeroCarousel
          images={category.heroImages}
          categoryName={category.name}
        />
      ) : null}

      {/* SOUS-CATÉGORIES — même structure visuelle que la Home */}
      {subcategories.length > 0 ? (
        <section
          className="relative overflow-hidden bg-white py-8 sm:py-9 lg:py-11"
          aria-labelledby="category-subcategories-heading"
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
                  {category.name}
                </span>

                <span
                  className="h-px w-6 bg-[#ECAB1C]"
                  aria-hidden="true"
                />
              </div>

              <h1
                id="category-subcategories-heading"
                className="font-body text-[26px] font-semibold leading-tight tracking-[-0.035em] text-[#111111] sm:text-[31px] lg:text-[36px]"
              >
                {category.pageTitle?.trim() || "Nos sous-catégories"}
              </h1>

              {category.description ? (
                <p className="mx-auto mt-2 max-w-xl text-[12px] leading-5 text-black/48 sm:text-[13px]">
                  {category.description}
                </p>
              ) : null}
            </div>

            <CategoryMosaic
              categories={subcategories}
              basePath={`/${category.slug}`}
            />
          </div>
        </section>
      ) : null}

      {/* CATALOGUE */}
      <section
        id="produits"
        className="scroll-mt-24 py-7 sm:py-9 lg:py-11"
        style={{
          background: "linear-gradient(180deg, #F8F3EB 0%, #F3ECE3 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-5 max-w-[680px] text-center sm:mb-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#8A6A20] sm:text-[10px]">
              Collection disponible
            </p>

            <h2 className="mt-1.5 font-body text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">
              {displayName}
            </h2>

            <p className="mt-1.5 text-[10px] font-medium text-[#2A1B16]/42 sm:text-[11px]">
              Tous les produits
            </p>
          </div>

          <div className="mb-5 flex items-center justify-between gap-3 border-y border-[#2A1B16]/[0.08] py-3 sm:mb-6 sm:py-3.5">
            <p className="text-[10px] font-medium text-[#2A1B16]/45 sm:text-[11px]">
              {products.length} produit
              {products.length > 1 ? "s" : ""}
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {products.map((product, index) => {
                const image = product.images[0];

                const hasDiscount =
                  typeof product.compareAtPrice === "number" &&
                  product.compareAtPrice > product.price;

                const discount = hasDiscount
                  ? Math.round(
                      ((product.compareAtPrice! - product.price) /
                        product.compareAtPrice!) *
                        100,
                    )
                  : null;

                return (
                  <article
                    key={product.id}
                    className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[13px] border border-[#2A1B16]/[0.07] bg-[#FFFDFC] shadow-[0_8px_24px_rgba(42,27,22,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ECAB1C]/35 hover:shadow-[0_16px_38px_rgba(42,27,22,0.10)]"
                  >
                    <Link
                      href={`/produits/${product.slug}`}
                      className="relative block aspect-[4/5] overflow-hidden bg-[#EEE5DA]"
                    >
                      {image && (
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          priority={index < 2}
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
                        />
                      )}

                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#21130F]/24 via-transparent to-transparent"
                        aria-hidden="true"
                      />

                      {(product.badge || discount) && (
                        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                          {product.badge && (
                            <span className="inline-flex rounded-[5px] bg-[#ECAB1C] px-2 py-1.5 text-[7px] font-bold uppercase tracking-[0.09em] text-[#2A1B16] sm:text-[8px]">
                              {product.badge}
                            </span>
                          )}

                          {discount && (
                            <span className="inline-flex rounded-[5px] bg-[#2A1B16]/85 px-2 py-1.5 text-[7px] font-bold text-white backdrop-blur-sm sm:text-[8px]">
                              -{discount}%
                            </span>
                          )}
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#8A6A20] sm:text-[9px]">
                        {product.categoryName ?? category.name}
                      </p>

                      <Link href={`/produits/${product.slug}`}>
                        <h3 className="mt-1.5 line-clamp-2 min-h-[2.25rem] font-body text-[12px] font-semibold leading-[1.35] tracking-[-0.02em] text-[#2A1B16] sm:min-h-[2.6rem] sm:text-[14px]">
                          {product.title}
                        </h3>
                      </Link>

                      <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1 sm:mt-3">
                        <span className="text-[13px] font-bold tracking-[-0.02em] text-[#2A1B16] sm:text-[16px]">
                          {formatPriceDA(product.price)}
                        </span>

                        {product.compareAtPrice && (
                          <span className="text-[8px] text-[#2A1B16]/30 line-through sm:text-[9px]">
                            {formatPriceDA(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/produits/${product.slug}`}
                        className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#2A1B16] px-2 text-[8px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#ECAB1C] hover:text-[#2A1B16] sm:min-h-10 sm:text-[9px]"
                      >
                        Voir le produit
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.9}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M13 6l6 6-6 6"
                          />
                        </svg>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : apiError ? (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-5 py-10 text-center">
              <p className="font-body text-base font-semibold text-red-800">
                Impossible de charger les produits pour le moment.
              </p>
              <p className="mt-1 text-[11px] text-red-600/70">
                Veuillez réessayer plus tard.
              </p>
            </div>
          ) : (
            <div className="border border-[#2A1B16]/[0.08] bg-white px-5 py-10 text-center">
              <p className="font-body text-base font-semibold">
                Aucun produit disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
