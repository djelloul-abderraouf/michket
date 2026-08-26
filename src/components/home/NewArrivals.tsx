"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

function categoryLabel(category: string) {
  switch (category) {
    case "lampes-3d":
      return "Lampes 3D";
    case "trophees":
      return "Trophées";
    case "cartes-du-monde":
      return "Cartes du monde";
    case "neon-led":
      return "Néon LED";
    default:
      return category.replaceAll("-", " ");
  }
}

export function NewArrivals() {
  const newProducts = products.filter(
    (product) => product.badge === "NOUVEAU",
  );

  if (newProducts.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden py-11 sm:py-13 lg:py-16"
      aria-labelledby="new-arrivals-heading"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgba(236,171,28,0.11), transparent 28%), radial-gradient(circle at 82% 100%, rgba(255,255,255,0.035), transparent 26%), linear-gradient(135deg, #3A2922 0%, #2A1B16 48%, #21130F 100%)",
      }}
    >
      {/* Relief global très discret : aucune forme visible */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 24%, rgba(0,0,0,0.10) 100%)",
        }}
      />

      {/* Ligne supérieure Michket */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* ───────────────── Header ───────────────── */}
        <div className="mx-auto mb-7 max-w-3xl text-center sm:mb-9 lg:mb-10">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-[#ECAB1C]" aria-hidden="true" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ECAB1C] sm:text-[11px]">
              Les dernières créations
            </span>

            <span className="h-px w-7 bg-[#ECAB1C]" aria-hidden="true" />
          </div>

          <h2
            id="new-arrivals-heading"
            className="font-body text-[30px] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-[39px] lg:text-[46px]"
          >
            Nouveautés Michket
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-white/50 sm:text-sm">
            De nouvelles idées à personnaliser, imaginées pour vos prochains
            moments à célébrer.
          </p>
        </div>

        {/* ───────────────── Products ─────────────────
            Mobile/tablette : rail compact.
            Desktop : cartes centrées, pas collées à gauche.
        */}
        <div className="-mx-4 overflow-x-auto px-4 pb-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max min-w-full snap-x snap-mandatory justify-start gap-3 sm:gap-5 lg:justify-center lg:gap-6">
            {newProducts.map((product, index) => {
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
                <Link
                  key={product.id}
                  href={`/produits/${product.slug}`}
                  className="
                    group
                    w-[64vw]
                    min-w-[195px]
                    max-w-[235px]
                    flex-none
                    snap-start
                    outline-none

                    sm:w-[36vw]
                    sm:min-w-[235px]
                    sm:max-w-[285px]

                    lg:w-[310px]
                    lg:min-w-[310px]
                    lg:max-w-[310px]
                  "
                >
                  <article
                    className="
                      relative
                      overflow-hidden
                      rounded-[16px]
                      border
                      border-white/[0.10]
                      bg-[#F8F2E8]
                      shadow-[0_18px_42px_rgba(14,7,4,0.20),inset_0_1px_0_rgba(255,255,255,0.45)]
                      transition-all
                      duration-300

                      group-hover:-translate-y-1.5
                      group-hover:border-[#ECAB1C]/40
                      group-hover:shadow-[0_26px_58px_rgba(14,7,4,0.30),inset_0_1px_0_rgba(255,255,255,0.55)]
                    "
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#EDE5DA]">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        priority={index === 0}
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]"
                        sizes="(max-width: 639px) 64vw, (max-width: 1023px) 36vw, 310px"
                      />

                      {/* Légère profondeur sur la photo */}
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A1B16]/42 via-transparent to-white/[0.03]"
                        aria-hidden="true"
                      />

                      {/* Badge nouveau */}
                      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-[#ECAB1C] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-[#2A1B16] shadow-[0_5px_14px_rgba(42,27,22,0.14)] sm:text-[10px]">
                          Nouveau
                        </span>

                        {product.personalizable && (
                          <span className="hidden rounded-full border border-white/20 bg-[#2A1B16]/55 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.10em] text-white/85 backdrop-blur-md sm:inline-flex">
                            Personnalisable
                          </span>
                        )}
                      </div>

                      {/* CTA directement visible sur l'image */}
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                        <span className="inline-flex min-h-9 items-center rounded-full border border-white/20 bg-[#2A1B16]/60 px-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-white backdrop-blur-md transition-colors duration-300 group-hover:border-[#ECAB1C]/50 group-hover:bg-[#2A1B16]/80 sm:text-[11px]">
                          Découvrir
                        </span>

                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F2E8] text-[#2A1B16] shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:bg-[#ECAB1C] group-hover:translate-x-0.5"
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
                              d="M5 12h14M13 6l6 6-6 6"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* Infos produit */}
                    <div className="relative p-4 sm:p-5">
                      {/* Petit reflet haut */}
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/30 to-transparent"
                        aria-hidden="true"
                      />

                      <div className="relative flex items-center justify-between gap-3">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8A6A20] sm:text-[10px]">
                          {categoryLabel(product.category)}
                        </p>

                        {typeof product.rating === "number" && (
                          <div className="flex shrink-0 items-center gap-1 text-[#2A1B16]/45">
                            <svg
                              className="h-3.5 w-3.5 fill-[#ECAB1C] text-[#ECAB1C]"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111 5.518.442c.499.04.701.663.321.988l-4.204 3.602 1.285 5.385a.562.562 0 01-.84.61L12 16.748l-4.725 2.889a.562.562 0 01-.84-.61l1.285-5.385-4.204-3.602a.562.562 0 01.321-.988l5.518-.442 2.125-5.11z"
                              />
                            </svg>

                            <span className="text-[10px] font-semibold sm:text-[11px]">
                              {product.rating.toFixed(1).replace(".", ",")}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="relative mt-2 line-clamp-2 min-h-[2.7rem] font-body text-[14px] font-semibold leading-[1.35] tracking-[-0.025em] text-[#2A1B16] sm:text-[16px]">
                        {product.title}
                      </h3>

                      <div className="relative mt-3 flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[16px] font-bold tracking-[-0.03em] text-[#2A1B16] sm:text-[18px]">
                          {formatPriceDA(product.price)}
                        </span>

                        {product.compareAtPrice && (
                          <span className="text-[10px] text-[#2A1B16]/35 line-through sm:text-[11px]">
                            {formatPriceDA(product.compareAtPrice)}
                          </span>
                        )}

                        {discount && (
                          <span className="ml-auto rounded-full bg-[#2A1B16]/[0.06] px-2 py-1 text-[9px] font-bold text-[#8A6A20] sm:text-[10px]">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Indication mobile */}
        {newProducts.length > 1 && (
          <div className="mt-1 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.11em] text-white/30 lg:hidden">
            <svg
              className="h-4 w-4 text-[#ECAB1C]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7l-5 5 5 5M16 7l5 5-5 5"
              />
            </svg>
            Faites glisser
          </div>
        )}

        {/* CTA principal */}
        <div className="mt-7 flex justify-center sm:mt-8">
          <Link
            href="/nouveautes"
            className="
              group
              inline-flex
              min-h-12
              items-center
              justify-center
              gap-2.5
              rounded-full
              bg-[#ECAB1C]
              px-6
              py-3
              text-[10px]
              font-bold
              uppercase
              tracking-[0.11em]
              text-[#2A1B16]
              shadow-[0_10px_28px_rgba(236,171,28,0.14)]
              transition-all
              duration-300

              hover:-translate-y-0.5
              hover:shadow-[0_14px_34px_rgba(236,171,28,0.22)]

              sm:px-7
              sm:text-[11px]
            "
          >
            Voir toutes les nouveautés

            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
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
      </div>
    </section>
  );
}
