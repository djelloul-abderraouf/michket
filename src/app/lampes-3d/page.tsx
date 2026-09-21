import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LampesFilterDropdown } from "@/components/collection/LampesFilterDropdown";
import {
  fetchCategoryBySlugSafe,
  fetchProductsForCategoryPage,
  type ApiCategory,
} from "@/lib/api";
import { CategoryHeroCarousel } from "@/components/category/CategoryHeroCarousel";
import { CategoryMosaic } from "@/components/category/CategoryMosaic";

const PRODUCTS_PER_PAGE = 8;
const CATEGORY_SLUG = "lampes-3d";

export async function generateMetadata(): Promise<Metadata> {
  const category = await fetchCategoryBySlugSafe(CATEGORY_SLUG);

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

function catalogHref(basePath: string, category?: string, page = 1) {
  const params = new URLSearchParams();

  if (category) params.set("categorie", category);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `${basePath}?${query}#produits` : `${basePath}#produits`;
}

function parsePage(value?: string): number {
  const parsed = Number.parseInt(value ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

type Lampes3DPageProps = {
  searchParams: Promise<{
    categorie?: string;
    page?: string;
  }>;
};

type CatalogProps = {
  categorySlug: string;
  categoryName: string;
  selectedCategory?: string;
  selectedCategoryLabel: string;
  selectedSubcategory?: ApiCategory;
  subcategories: ApiCategory[];
  basePath: string;
  requestedPage: number;
};

function CatalogToolbar({
  productCount,
  basePath,
  selectedCategory,
  selectedCategoryLabel,
  subcategories,
}: {
  productCount?: number;
  basePath: string;
  selectedCategory?: string;
  selectedCategoryLabel: string;
  subcategories: ApiCategory[];
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-y border-[#2A1B16]/[0.08] py-3 sm:mb-6 sm:py-3.5">
      <p className="text-[10px] font-medium text-[#2A1B16]/45 sm:text-[11px]">
        {typeof productCount === "number" ? (
          <>
            {productCount} produit{productCount > 1 ? "s" : ""}
          </>
        ) : (
          <span className="opacity-60">Chargement des produits…</span>
        )}
      </p>

      {subcategories.length > 0 && (
        <LampesFilterDropdown
          basePath={basePath}
          selectedCategory={selectedCategory}
          selectedCategoryLabel={selectedCategoryLabel}
          options={subcategories.map((item) => ({
            id: item.slug,
            label: item.name,
          }))}
        />
      )}
    </div>
  );
}

function CatalogLoading({
  basePath,
  selectedCategory,
  selectedCategoryLabel,
  subcategories,
}: Omit<CatalogProps, "categorySlug" | "categoryName" | "requestedPage" | "selectedSubcategory">) {
  return (
    <>
      <CatalogToolbar
        basePath={basePath}
        selectedCategory={selectedCategory}
        selectedCategoryLabel={selectedCategoryLabel}
        subcategories={subcategories}
      />

      <div
        className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
        aria-hidden="true"
      >
        {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[13px] border border-[#2A1B16]/[0.05] bg-[#FFFDFC]"
          >
            <div className="aspect-[4/5] bg-[#EEE5DA]" />
            <div className="h-[118px] sm:h-[136px]" />
          </div>
        ))}
      </div>
    </>
  );
}

async function Catalog({
  categorySlug,
  categoryName,
  selectedCategory,
  selectedCategoryLabel,
  selectedSubcategory,
  subcategories,
  basePath,
  requestedPage,
}: CatalogProps) {
  let result: Awaited<ReturnType<typeof fetchProductsForCategoryPage>>;

  try {
    result = await fetchProductsForCategoryPage(categorySlug, {
      page: requestedPage,
      limit: PRODUCTS_PER_PAGE,
    });

    const lastPage = Math.max(1, result.meta.totalPages);

    if (result.meta.total > 0 && requestedPage > lastPage) {
      result = await fetchProductsForCategoryPage(categorySlug, {
        page: lastPage,
        limit: PRODUCTS_PER_PAGE,
      });
    }
  } catch {
    return (
      <>
        <CatalogToolbar
          basePath={basePath}
          selectedCategory={selectedCategory}
          selectedCategoryLabel={selectedCategoryLabel}
          subcategories={subcategories}
        />

        <div className="rounded-[12px] border border-red-200 bg-red-50 px-5 py-10 text-center">
          <p className="font-body text-base font-semibold text-red-800">
            Impossible de charger les produits pour le moment.
          </p>
          <p className="mt-1 text-[11px] text-red-600/70">
            Veuillez réessayer plus tard.
          </p>
        </div>
      </>
    );
  }

  const products = result.data;
  const totalProducts = result.meta.total;
  const totalPages = Math.max(1, result.meta.totalPages);
  const currentPage = Math.min(Math.max(result.meta.page, 1), totalPages);

  return (
    <>
      <CatalogToolbar
        productCount={totalProducts}
        basePath={basePath}
        selectedCategory={selectedCategory}
        selectedCategoryLabel={selectedCategoryLabel}
        subcategories={subcategories}
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => {
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
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#8A6A20] sm:text-[9px]">
                      {product.categoryName ?? categoryName}
                    </p>

                    {typeof product.rating === "number" && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3 w-3 fill-[#ECAB1C] text-[#ECAB1C]"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M12 2.8l2.85 5.77 6.37.93-4.61 4.49 1.09 6.34L12 17.33l-5.7 3 1.09-6.34L2.78 9.5l6.37-.93L12 2.8z" />
                        </svg>
                        <span className="text-[8px] font-semibold text-[#2A1B16]/40 sm:text-[9px]">
                          {product.rating.toFixed(1).replace(".", ",")}
                        </span>
                      </div>
                    )}
                  </div>

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
      ) : (
        <div className="border border-[#2A1B16]/[0.08] bg-white px-5 py-10 text-center">
          <p className="font-body text-base font-semibold">
            Aucun produit dans cette catégorie pour le moment.
          </p>

          {selectedSubcategory && (
            <Link
              href={catalogHref(basePath)}
              className="mt-4 inline-flex border-b border-[#ECAB1C] pb-1 text-[9px] font-bold uppercase tracking-[0.09em]"
            >
              Voir toute la collection
            </Link>
          )}
        </div>
      )}

      {totalProducts > 0 && totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-1.5 sm:mt-10"
          aria-label={`Pagination ${categoryName}`}
        >
          {currentPage > 1 ? (
            <Link
              href={catalogHref(basePath, selectedCategory, currentPage - 1)}
              className="flex h-9 min-w-9 items-center justify-center rounded-[8px] border border-[#2A1B16]/10 bg-white px-2 text-[#2A1B16]/60 transition-colors hover:border-[#ECAB1C]/50 hover:text-[#2A1B16] sm:h-10 sm:min-w-10"
              aria-label="Page précédente"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 18l-6-6 6-6"
                />
              </svg>
            </Link>
          ) : (
            <span
              className="flex h-9 min-w-9 cursor-not-allowed items-center justify-center rounded-[8px] border border-[#2A1B16]/[0.06] bg-white/40 px-2 text-[#2A1B16]/20 sm:h-10 sm:min-w-10"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 18l-6-6 6-6"
                />
              </svg>
            </span>
          )}

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) =>
              pageNumber === currentPage ? (
                <span
                  key={pageNumber}
                  className="flex h-9 min-w-9 items-center justify-center rounded-[8px] bg-[#2A1B16] px-2 text-[10px] font-bold text-white shadow-[0_7px_18px_rgba(42,27,22,0.14)] sm:h-10 sm:min-w-10 sm:text-[11px]"
                  aria-current="page"
                >
                  {pageNumber}
                </span>
              ) : (
                <Link
                  key={pageNumber}
                  href={catalogHref(basePath, selectedCategory, pageNumber)}
                  className="flex h-9 min-w-9 items-center justify-center rounded-[8px] border border-[#2A1B16]/10 bg-white px-2 text-[10px] font-semibold text-[#2A1B16]/55 transition-colors hover:border-[#ECAB1C]/50 hover:text-[#2A1B16] sm:h-10 sm:min-w-10 sm:text-[11px]"
                >
                  {pageNumber}
                </Link>
              ),
          )}

          {currentPage < totalPages ? (
            <Link
              href={catalogHref(basePath, selectedCategory, currentPage + 1)}
              className="flex h-9 min-w-9 items-center justify-center rounded-[8px] border border-[#2A1B16]/10 bg-white px-2 text-[#2A1B16]/60 transition-colors hover:border-[#ECAB1C]/50 hover:text-[#2A1B16] sm:h-10 sm:min-w-10"
              aria-label="Page suivante"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6l6 6-6 6"
                />
              </svg>
            </Link>
          ) : (
            <span
              className="flex h-9 min-w-9 cursor-not-allowed items-center justify-center rounded-[8px] border border-[#2A1B16]/[0.06] bg-white/40 px-2 text-[#2A1B16]/20 sm:h-10 sm:min-w-10"
              aria-hidden="true"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6l6 6-6 6"
                />
              </svg>
            </span>
          )}
        </nav>
      )}
    </>
  );
}

export default async function Lampes3DPage({
  searchParams,
}: Lampes3DPageProps) {
  const [{ categorie, page }, category] = await Promise.all([
    searchParams,
    fetchCategoryBySlugSafe(CATEGORY_SLUG),
  ]);

  if (!category || category.parentId) {
    notFound();
  }

  const subcategories = category.children
    .filter((child) => child.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedSubcategory = categorie
    ? subcategories.find((child) => child.slug === categorie)
    : undefined;

  const selectedCategory =
    categorie && selectedSubcategory ? selectedSubcategory.slug : undefined;

  const selectedCategoryLabel =
    selectedSubcategory?.name ?? "Toute la collection";

  const requestedPage = parsePage(page);
  const basePath = `/${category.slug}`;
  const catalogueTitle =
    category.productsTitle?.trim() ||
    category.pageTitle?.trim() ||
    category.name;

  return (
    <main className="bg-[#F8F3EB] text-[#2A1B16]">
      {category.heroImages.length > 0 ? (
        <CategoryHeroCarousel
          images={category.heroImages}
          categoryName={category.name}
        />
      ) : null}

      {subcategories.length > 0 ? (
        <section
          className="relative overflow-hidden bg-white py-6 sm:py-7 lg:py-8"
          aria-labelledby="lampes-subcategories-heading"
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
            <CategoryMosaic categories={subcategories} basePath={basePath} />
          </div>
        </section>
      ) : null}

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
              {catalogueTitle}
            </h2>

            <p className="mt-1.5 text-[10px] font-medium text-[#2A1B16]/42 sm:text-[11px]">
              {selectedCategoryLabel}
            </p>
          </div>

          <Suspense
            key={`${selectedCategory ?? category.slug}-${requestedPage}`}
            fallback={
              <CatalogLoading
                basePath={basePath}
                selectedCategory={selectedCategory}
                selectedCategoryLabel={selectedCategoryLabel}
                subcategories={subcategories}
              />
            }
          >
            <Catalog
              categorySlug={selectedSubcategory?.slug ?? category.slug}
              categoryName={category.name}
              selectedCategory={selectedCategory}
              selectedCategoryLabel={selectedCategoryLabel}
              selectedSubcategory={selectedSubcategory}
              subcategories={subcategories}
              basePath={basePath}
              requestedPage={requestedPage}
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
