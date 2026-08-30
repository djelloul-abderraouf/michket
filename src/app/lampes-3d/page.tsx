import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LampesFilterDropdown } from "@/components/collection/LampesFilterDropdown";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Lampes 3D personnalisées | Michket",
  description:
    "Découvrez les lampes 3D personnalisées Michket pour anniversaire, mariage, naissance, famille, métiers, sport et soutenance.",
};

const PRODUCTS_PER_PAGE = 8;

const occasions = [
  {
    id: "anniversaire",
    slug: "anniversaire",
    label: "Anniversaire",
    image: "/images/products/lampes/anniv.jpeg",
  },
  {
    id: "mariage",
    slug: "mariage",
    label: "Mariage",
    image: "/images/products/lampes/mariage.jpeg",
  },
  {
    id: "naissance",
    slug: "naissance",
    label: "Nouveau-né",
    image: "/images/products/lampes/nouveau nee.jpeg",
  },
  {
    id: "maman",
    slug: "maman",
    label: "Maman & Famille",
    image: "/images/products/lampes/maman.jpeg",
  },
  {
    id: "metiers",
    slug: "medecine",
    label: "Médecine",
    image: "/images/products/lampes/medecine.jpeg",
  },
  {
    id: "sport",
    slug: "football",
    label: "Football",
    image: "/images/products/lampes/football.jpeg",
  },
  {
    id: "soutenance",
    slug: "soutenance",
    label: "Soutenance",
    image: "/images/products/lampes/soutenance.jpeg",
  },
  {
    id: "5eme",
    slug: "5eme",
    label: "5ème année",
    image: "/images/products/lampes/5eme.jpeg",
  },
] as const;

const occasionLabels = Object.fromEntries(
  occasions.map((item) => [item.id, item.label]),
) as Record<string, string>;

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

function catalogHref(category?: string, page = 1) {
  const params = new URLSearchParams();

  if (category) params.set("categorie", category);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `/lampes-3d?${query}#produits` : "/lampes-3d#produits";
}

type Lampes3DPageProps = {
  searchParams: Promise<{
    occasion?: string;
    categorie?: string;
    page?: string;
  }>;
};

export default async function Lampes3DPage({
  searchParams,
}: Lampes3DPageProps) {
  const { occasion, categorie, page } = await searchParams;

  /*
   * `occasion` reste réservé à la première section pour le moment.
   * Plus tard, ses cartes pourront pointer vers des pages dédiées :
   * /lampes-3d/anniversaire, /lampes-3d/mariage, etc.
   */
  const activeOccasion =
    occasion && occasionLabels[occasion] ? occasion : undefined;

  /*
   * Le filtre du catalogue est volontairement séparé de la première section.
   * Ainsi, la collection affiche toutes les lampes par défaut.
   */
  const selectedCategory =
    categorie && occasionLabels[categorie] ? categorie : undefined;

  const allLampProducts = products.filter(
    (product) => product.category === "lampes-3d",
  );

  const filteredProducts = selectedCategory
    ? allLampProducts.filter((product) =>
        product.occasion?.includes(selectedCategory),
      )
    : allLampProducts;

  const requestedPage = Number.parseInt(page ?? "1", 10);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );

  const currentPage = Number.isFinite(requestedPage)
    ? Math.min(Math.max(requestedPage, 1), totalPages)
    : 1;

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(
    start,
    start + PRODUCTS_PER_PAGE,
  );

  const selectedCategoryLabel = selectedCategory
    ? occasionLabels[selectedCategory]
    : "Toutes les lampes";

  return (
    <main className="bg-[#F8F3EB] text-[#2A1B16]">
      {/* ───────────────── TOP / SHOP BY OCCASION ───────────────── */}
      <section
        className="relative border-b border-[#2A1B16]/[0.08]"
        style={{
          background:
            "linear-gradient(120deg, rgba(236,171,28,0.065) 0%, rgba(248,243,235,0) 28%), linear-gradient(180deg, #FCF8F2 0%, #F6EFE6 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">
          <div>
            <div className="mx-auto max-w-[760px] text-center">
              <div className="flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2A1B16]/35 sm:text-[10px]">
                <Link
                  href="/"
                  className="transition-colors hover:text-[#ECAB1C]"
                >
                  Accueil
                </Link>
                <span>/</span>
                <span className="text-[#8A6A20]">Lampes 3D</span>
              </div>

              <h1 className="mt-2.5 font-body text-[27px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[34px] lg:text-[39px]">
                Lampes 3D{" "}
                <span className="text-[#8A6A20]">personnalisées</span>
              </h1>

              <p className="mx-auto mt-3 hidden max-w-[560px] text-[12px] leading-5 text-[#2A1B16]/48 sm:block">
                Choisissez une occasion et découvrez l’univers qui correspond
                à votre cadeau.
              </p>
            </div>

            {/* Une seule ligne, scrollable sur toutes les tailles si nécessaire */}
            <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:-mx-2 lg:px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full snap-x snap-mandatory justify-start gap-3 sm:gap-4 lg:justify-start">
                {occasions.map((item) => {
                  return (
                    <Link
                      key={item.id}
                      href={`/lampes-3d/${item.slug}`}
                      className="group w-[166px] flex-none snap-start sm:w-[205px] lg:w-[220px]"
                    >
                      <article
                        className="relative overflow-hidden rounded-[12px] border border-white/10 bg-[#2A1B16] shadow-[0_8px_22px_rgba(42,27,22,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ECAB1C]/40 hover:shadow-[0_14px_30px_rgba(42,27,22,0.13)]"
                      >
                        <div className="relative aspect-[5/4] overflow-hidden">
                          <Image
                            src={item.image}
                            alt={`Lampe 3D ${item.label}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                            sizes="(max-width: 639px) 166px, (max-width: 1023px) 205px, 220px"
                          />

                          <div
                            className="absolute inset-0 bg-gradient-to-t from-[#21130F]/80 via-[#21130F]/18 to-transparent"
                            aria-hidden="true"
                          />

                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                            <span className="text-[10px] font-semibold leading-4 text-white sm:text-[11px]">
                              {item.label}
                            </span>

                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/14 text-white backdrop-blur-sm transition-all group-hover:bg-[#ECAB1C] group-hover:text-[#2A1B16]"
                              aria-hidden="true"
                            >
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.9}
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
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── FULL CATALOG ───────────────── */}
      <section
        id="produits"
        className="scroll-mt-24 py-7 sm:py-9 lg:py-11"
        style={{
          background: "linear-gradient(180deg, #F8F3EB 0%, #F3ECE3 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          {/* Titre catalogue toujours centré */}
          <div className="mx-auto mb-5 max-w-[680px] text-center sm:mb-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#8A6A20] sm:text-[10px]">
              Collection disponible
            </p>

            <h2 className="mt-1.5 font-body text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">
              Une lumière unique pour chaque histoire
            </h2>

            <p className="mt-1.5 text-[10px] font-medium text-[#2A1B16]/42 sm:text-[11px]">
              {selectedCategoryLabel}
            </p>
          </div>

          {/* Barre catalogue : nombre de produits + filtre compact */}
          <div className="mb-5 flex items-center justify-between gap-3 border-y border-[#2A1B16]/[0.08] py-3 sm:mb-6 sm:py-3.5">
            <p className="text-[10px] font-medium text-[#2A1B16]/45 sm:text-[11px]">
              {filteredProducts.length} produit
              {filteredProducts.length > 1 ? "s" : ""}
            </p>

            <LampesFilterDropdown
              selectedCategory={selectedCategory}
              selectedCategoryLabel={selectedCategoryLabel}
              options={occasions.map((item) => ({
                id: item.id,
                label: item.label,
              }))}
            />
          </div>

          {/* Grille produits */}
          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {visibleProducts.map((product, index) => {
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
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        priority={index < 2 && currentPage === 1}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
                      />

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
                          Lampe 3D
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

              <Link
                href={catalogHref()}
                className="mt-4 inline-flex border-b border-[#ECAB1C] pb-1 text-[9px] font-bold uppercase tracking-[0.09em]"
              >
                Voir toutes les lampes
              </Link>
            </div>
          )}

          {/* ───────────────── PAGINATION ───────────────── */}
          {filteredProducts.length > 0 && (
            <nav
              className="mt-8 flex items-center justify-center gap-1.5 sm:mt-10"
              aria-label="Pagination des lampes 3D"
            >
              {currentPage > 1 ? (
                <Link
                  href={catalogHref(selectedCategory, currentPage - 1)}
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
                      href={catalogHref(selectedCategory, pageNumber)}
                      className="flex h-9 min-w-9 items-center justify-center rounded-[8px] border border-[#2A1B16]/10 bg-white px-2 text-[10px] font-semibold text-[#2A1B16]/55 transition-colors hover:border-[#ECAB1C]/50 hover:text-[#2A1B16] sm:h-10 sm:min-w-10 sm:text-[11px]"
                    >
                      {pageNumber}
                    </Link>
                  ),
              )}

              {currentPage < totalPages ? (
                <Link
                  href={catalogHref(selectedCategory, currentPage + 1)}
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
        </div>
      </section>
    </main>
  );
}
