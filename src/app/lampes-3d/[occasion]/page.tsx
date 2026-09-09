import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryHeroCarousel } from "@/components/collection/CategoryHeroCarousel";
import {
  fetchCategoryBySlug,
  fetchCategoryBySlugSafe,
  fetchProductsForCategory,
  type ApiCategoryDetail,
} from "@/lib/api";
import { ScrollToTop } from "@/components/navigation/ScrollToTop";

// ---------------------------------------------------------------------------
// Static params: pre-render known subcategories at build time.
// Falls back gracefully — unknown slugs get runtime generation.
// ---------------------------------------------------------------------------

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const parent = await fetchCategoryBySlug("lampes-3d");
    return parent.children.map((child) => ({ occasion: child.slug }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ occasion: string }>;
}): Promise<Metadata> {
  const { occasion } = await params;

  const category = await fetchCategoryBySlugSafe(occasion);

  if (!category || category.parentId === null) {
    return { title: "Lampes 3D | Michket" };
  }

  return {
    title: category.metaTitle ?? `${category.name} - Lampes 3D personnalisées | Michket`,
    description:
      category.metaDescription ??
      category.description ??
      `Découvrez les lampes 3D personnalisées ${category.name.toLowerCase()}.`,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function LampesCategoryPage({
  params,
}: {
  params: Promise<{ occasion: string }>;
}) {
  const { occasion } = await params;

  // 1. Resolve subcategory from DB — NOT from hardcoded data
  const category = await fetchCategoryBySlugSafe(occasion);

  // 404: subcategory doesn't exist or is not active
  if (!category || category.parentId === null) {
    notFound();
  }

  // 2. Hero images from DB (category_images table, sorted by sortOrder ASC)
  const heroSlides =
    category.heroImages.length > 0
      ? category.heroImages.map((img, index) => ({
          src: img.url,
          alt: img.altText ?? `${category.name} - visuel ${index + 1}`,
        }))
      : [];

  // 3. Products — backend includes child-category products for parent categories.
  //    Here we query by the subcategory slug directly, so we get exactly its products.
  const categoryProducts = await fetchProductsForCategory(occasion);

  // 4. Other occasions — sibling subcategories from the parent (lampes-3d)
  let siblings: ApiCategoryDetail["children"] = [];
  try {
    const parent = await fetchCategoryBySlug("lampes-3d");
    siblings = parent.children.filter((child) => child.slug !== occasion);
  } catch {
    // Parent fetch failed — section just won't render
  }

  return (
    <main id="top" className="bg-[#F8F3EB] text-[#2A1B16]">
      <ScrollToTop trigger={occasion} />

      {/* ─── Hero Section ─── */}
      <section
        className="relative overflow-hidden border-b border-[#2A1B16]/[0.08]"
        style={{
          background:
            "linear-gradient(120deg, rgba(236,171,28,0.07) 0%, rgba(248,243,235,0) 32%), linear-gradient(180deg, #FCF8F2 0%, #F5EEE5 100%)",
        }}
      >
        <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-9 lg:px-10 lg:py-9">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <div className="flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#2A1B16]/35 lg:justify-start">
              <Link href="/" className="hover:text-[#ECAB1C]">
                Accueil
              </Link>
              <span>/</span>
              <Link href="/lampes-3d" className="hover:text-[#ECAB1C]">
                Lampes 3D
              </Link>
              <span>/</span>
              <span className="text-[#8A6A20]">{category.name}</span>
            </div>

            <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#8A6A20] sm:text-[10px]">
              Lampes 3D {category.name.toLowerCase()}
            </p>

            <h1 className="mt-2 font-body text-[28px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-[36px] lg:text-[42px]">
              {category.description
                ? category.name.charAt(0).toUpperCase() + category.name.slice(1)
                : `Collection ${category.name}`}
            </h1>

            {category.description && (
              <p className="mx-auto mt-3 hidden max-w-[560px] text-[12px] leading-6 text-[#2A1B16]/50 sm:block lg:mx-0">
                {category.description}
              </p>
            )}

            <Link
              href="#produits"
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-[#2A1B16] px-4 text-[9px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#ECAB1C] hover:text-[#2A1B16] sm:min-h-11 sm:px-5 sm:text-[10px]"
            >
              Voir les modèles
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

          {/* Hero carousel — only when DB has hero images */}
          {heroSlides.length > 0 && (
            <div className="order-1 mx-auto w-full max-w-[680px] lg:order-2">
              <CategoryHeroCarousel slides={heroSlides} />
            </div>
          )}
        </div>
      </section>

      {/* ─── Products Section ─── */}
      <section
        id="produits"
        className="scroll-mt-24 py-7 sm:py-9 lg:py-11"
        style={{
          background: "linear-gradient(180deg, #F8F3EB 0%, #F3ECE3 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-5 max-w-[700px] text-center sm:mb-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8A6A20] sm:text-[10px]">
              Collection {category.name}
            </p>

            <h2 className="mt-1.5 font-body text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">
              Choisissez le modèle qui fera la différence
            </h2>

            <p className="mt-1.5 text-[10px] text-[#2A1B16]/40 sm:text-[11px]">
              {categoryProducts.length} produit
              {categoryProducts.length > 1 ? "s" : ""} disponible
              {categoryProducts.length > 1 ? "s" : ""}
            </p>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {categoryProducts.map((product, index) => {
                // Image primary: first image from backend (already sorted isPrimary → sortOrder)
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
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#8A6A20] sm:text-[9px]">
                          {category.name}
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
            <div className="rounded-[12px] border border-[#2A1B16]/[0.08] bg-white px-5 py-10 text-center">
              <p className="font-body text-base font-semibold">
                Aucun produit disponible dans cette catégorie pour le moment.
              </p>

              <Link
                href="/lampes-3d"
                className="mt-4 inline-flex border-b border-[#ECAB1C] pb-1 text-[9px] font-bold uppercase tracking-[0.09em]"
              >
                Retour aux lampes 3D
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Other Occasions (sibling subcategories from DB) ─── */}
      {siblings.length > 0 && (
        <section className="border-t border-[#2A1B16]/[0.07] bg-[#EFE7DD] py-7 sm:py-9">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="mb-4 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#8A6A20] sm:text-[10px]">
                Explorer aussi
              </p>

              <h2 className="mt-1 font-body text-[20px] font-semibold tracking-[-0.035em] sm:text-[24px]">
                D&apos;autres occasions à célébrer
              </h2>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full snap-x snap-mandatory justify-start gap-2.5 sm:gap-3 lg:justify-center">
                {siblings.map((child) => (
                  <Link
                    key={child.slug}
                    href={`/lampes-3d/${child.slug}`}
                    className="group w-[128px] flex-none snap-start sm:w-[150px]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#2A1B16]">
                      {child.imageUrl ? (
                        <Image
                          src={child.imageUrl}
                          alt={child.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                          sizes="150px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-2">
                          <span className="text-center text-[9px] font-semibold text-white sm:text-[10px]">
                            {child.name}
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#21130F]/72 via-transparent to-transparent" />

                      <span className="absolute inset-x-2 bottom-2 text-[9px] font-semibold text-white sm:text-[10px]">
                        {child.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
