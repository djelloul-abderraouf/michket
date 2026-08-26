"use client";

import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { Badge } from "@/components/ui/Badge";

const badgeLabel: Record<string, string> = {
  "BEST SELLER": "Populaire",
  NOUVEAU: "Nouveau",
  PROMO: "Promo",
  PERSONNALISABLE: "Personnalisable",
  "ENVOI GRATUIT": "Livraison offerte",
};

function formatPriceDZD(price: number): string {
  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)} DA`;
}

function getBadgeVariant(badge?: string) {
  if (badge === "BEST SELLER") return "popular";
  if (badge === "NOUVEAU") return "new";
  if (badge === "PROMO") return "promo";
  return "default";
}

function getDiscountPercent(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

function Rating({
  rating,
  reviewCount,
}: {
  rating?: number;
  reviewCount?: number;
}) {
  if (typeof rating !== "number") return null;

  const safeRating = Math.max(0, Math.min(5, rating));
  const rounded = Math.round(safeRating);

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex items-center gap-[2px]" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= rounded;

          return (
            <svg
              key={star}
              className={`h-3.5 w-3.5 ${
                filled ? "text-[#ECAB1C]" : "text-black/12"
              }`}
              viewBox="0 0 24 24"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.7}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111 5.518.442c.499.04.701.663.321.988l-4.204 3.602 1.285 5.385a.562.562 0 01-.84.61L12 16.748l-4.725 2.889a.562.562 0 01-.84-.61l1.285-5.385-4.204-3.602a.562.562 0 01.321-.988l5.518-.442 2.125-5.11z"
              />
            </svg>
          );
        })}
      </div>

      <span className="text-[12px] text-black/55">
        {safeRating.toFixed(1).replace(".", ",")}
        {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}

export function FeaturedProducts() {
  const featured = products
    .filter(
      (product) =>
        product.badge === "BEST SELLER" || product.badge === "NOUVEAU",
    )
    .slice(0, 10);

  if (featured.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden bg-[#FAF6EE] pt-7 pb-7 sm:pt-9 sm:pb-8 lg:pt-10 lg:pb-10"
      aria-labelledby="featured-heading"
    >
      {/* Soft background depth */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at top center, rgba(255,255,255,0.92), transparent 30%), radial-gradient(circle at 88% 12%, rgba(236,171,28,0.055), transparent 24%), linear-gradient(180deg, #FAF6EE 0%, #F7F2E9 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* Heading */}
        <div className="mx-auto mb-7 max-w-3xl text-center sm:mb-9 lg:mb-10">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8B6B2A]">
            Meilleures ventes
          </span>

          <h2
            id="featured-heading"
            className="mt-3 font-body text-[30px] font-semibold leading-[1.02] tracking-[-0.04em] text-[#111] sm:text-[38px] lg:text-[46px]"
          >
            Les produits préférés de nos clients
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-6 text-black/55 sm:text-sm">
            Une sélection de créations Michket appréciées pour leur style,
            leur personnalisation et leur effet waouh.
          </p>
        </div>

        {/* Product rail */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-10">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featured.map((product) => {
              const primaryImage = product.images[0];
              const secondaryImage = product.images[1];
              const discount = getDiscountPercent(
                product.price,
                product.compareAtPrice,
              );

              return (
                <Link
                  key={product.id}
                  href={`/produits/${product.slug}`}
                  className="group block w-[78vw] max-w-[305px] min-w-[260px] flex-none snap-start sm:w-[44vw] lg:w-[20vw] lg:min-w-[280px]"
                >
                  <article className="overflow-hidden rounded-[10px] border border-black/[0.07] bg-white shadow-[0_10px_24px_rgba(20,16,12,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_35px_rgba(20,16,12,0.10)]">
                    {/* Image */}
                    <div className="relative aspect-[4/4.25] overflow-hidden bg-[#EEE7DB]">
                      <Image
                        src={primaryImage.src}
                        alt={primaryImage.alt}
                        fill
                        className={`object-cover transition-all duration-500 ease-out ${
                          secondaryImage
                            ? "group-hover:opacity-0 group-hover:scale-[1.03]"
                            : "group-hover:scale-[1.05]"
                        }`}
                        sizes="(max-width: 639px) 78vw, (max-width: 1023px) 44vw, 20vw"
                      />

                      {secondaryImage && (
                        <Image
                          src={secondaryImage.src}
                          alt=""
                          fill
                          aria-hidden="true"
                          className="object-cover opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
                          sizes="(max-width: 639px) 78vw, (max-width: 1023px) 44vw, 20vw"
                        />
                      )}

                      <div className="absolute left-3 top-3 z-10">
                        {product.badge ? (
                          <Badge variant={getBadgeVariant(product.badge)}>
                            {badgeLabel[product.badge] || product.badge}
                          </Badge>
                        ) : null}
                      </div>

                      <span
                        aria-hidden="true"
                        className="
                          group/heart
                          absolute
                          bottom-3
                          right-3
                          z-10
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/30
                          bg-black/45
                          text-white
                          backdrop-blur-sm
                          transition-all
                          duration-200
                          hover:scale-105
                          hover:border-[#ECAB1C]
                          hover:bg-[#0A0A0A]
                          hover:text-[#ECAB1C]
                        "
                      >
                        <svg
                          className="h-5 w-5 transition-all duration-200 group-hover/heart:fill-[#ECAB1C] group-hover/heart:scale-110"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                          />
                        </svg>
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 sm:p-4.5">
                      <h3 className="line-clamp-2 min-h-[3.1rem] font-body text-[15px] font-semibold leading-6 tracking-[-0.02em] text-[#171717] transition-colors duration-200 group-hover:text-[#8A6414]">
                        {product.title}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[17px] font-bold tracking-[-0.02em] text-[#111111] sm:text-[18px]">
                          {formatPriceDZD(product.price)}
                        </span>

                        {product.compareAtPrice && (
                          <span className="text-[13px] font-medium text-black/40 line-through">
                            {formatPriceDZD(product.compareAtPrice)}
                          </span>
                        )}

                        {discount && (
                          <span className="rounded-[7px] bg-[#ECAB1C] px-2.5 py-1 text-[12px] font-bold leading-none text-[#0A0A0A]">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      <Rating
                        rating={(product as typeof product & { rating?: number }).rating}
                        reviewCount={(product as typeof product & { reviewCount?: number }).reviewCount}
                      />
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/meilleures-ventes"
            className="inline-flex min-h-12 items-center justify-center border border-[#1A1A1A] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1A1A1A] transition-all duration-200 hover:border-[#ECAB1C] hover:bg-[#ECAB1C] hover:text-[#111] sm:text-[12px]"
          >
            Voir la sélection
          </Link>
        </div>
      </div>
    </section>
  );
}
