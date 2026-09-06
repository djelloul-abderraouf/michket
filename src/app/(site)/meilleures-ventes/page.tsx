import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Meilleures ventes | Michket",
  description:
    "Découvrez les meilleures ventes Michket : nos créations personnalisées les plus populaires.",
};

function formatPriceDA(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

export default function MeilleuresVentesPage() {
  const bestSellers = products.filter(
    (product) => product.badge === "BEST SELLER",
  );

  return (
    <main className="min-h-screen bg-[#F8F3EB] text-[#2A1B16]">
      {/* TOP */}
      <section
        className="relative border-b border-[#2A1B16]/[0.08]"
        style={{
          background:
            "linear-gradient(120deg, rgba(236,171,28,0.065) 0%, rgba(248,243,235,0) 28%), linear-gradient(180deg, #FCF8F2 0%, #F6EFE6 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-[760px] text-center">
            <div className="flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2A1B16]/35 sm:text-[10px]">
              <Link
                href="/"
                className="transition-colors hover:text-[#ECAB1C]"
              >
                Accueil
              </Link>
              <span>/</span>
              <span className="text-[#8A6A20]">Meilleures ventes</span>
            </div>

            <h1 className="mt-2.5 font-body text-[28px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[35px] lg:text-[40px]">
              Meilleures{" "}
              <span className="text-[#8A6A20]">ventes</span>
            </h1>

            <p className="mx-auto mt-3 hidden max-w-[560px] text-[12px] leading-5 text-[#2A1B16]/48 sm:block">
              Découvrez les créations Michket les plus appréciées.
            </p>
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section
        id="produits"
        className="py-7 sm:py-9 lg:py-11"
        style={{
          background: "linear-gradient(180deg, #F8F3EB 0%, #F3ECE3 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-5 max-w-[680px] text-center sm:mb-7">
            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#8A6A20] sm:text-[10px]">
              Les préférés de nos clients
            </p>

            <h2 className="mt-1.5 font-body text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">
              Nos produits les plus populaires
            </h2>
          </div>

          <div className="mb-5 flex items-center justify-between gap-3 border-y border-[#2A1B16]/[0.08] py-3 sm:mb-6 sm:py-3.5">
            <p className="text-[10px] font-medium text-[#2A1B16]/45 sm:text-[11px]">
              {bestSellers.length} produit
              {bestSellers.length > 1 ? "s" : ""}
            </p>
          </div>

          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {bestSellers.map((product, index) => {
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

                const categoryLabel =
                  product.category === "lampes-3d"
                    ? "Lampe 3D"
                    : product.category === "trophees"
                      ? "Trophée"
                      : product.category === "neon-led"
                        ? "Néon LED"
                        : product.category === "cartes-du-monde"
                          ? "Carte du Monde"
                          : "Michket";

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
                        priority={index < 2}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 25vw"
                      />

                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#21130F]/24 via-transparent to-transparent"
                        aria-hidden="true"
                      />

                      <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                        <span className="inline-flex rounded-[5px] bg-[#ECAB1C] px-2 py-1.5 text-[7px] font-bold uppercase tracking-[0.09em] text-[#2A1B16] sm:text-[8px]">
                          Best Seller
                        </span>

                        {discount && (
                          <span className="inline-flex rounded-[5px] bg-[#2A1B16]/85 px-2 py-1.5 text-[7px] font-bold text-white backdrop-blur-sm sm:text-[8px]">
                            -{discount}%
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#8A6A20] sm:text-[9px]">
                        {categoryLabel}
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
          ) : (
            <div className="rounded-[12px] border border-[#2A1B16]/[0.08] bg-white px-5 py-10 text-center">
              <p className="font-body text-base font-semibold">
                Aucun produit marqué comme meilleure vente pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
