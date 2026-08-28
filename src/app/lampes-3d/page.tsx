import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Lampes 3D personnalisées | Michket",
  description:
    "Découvrez les lampes 3D personnalisées Michket pour anniversaire, mariage, naissance, famille, métiers, sport et soutenance.",
};

const occasions = [
  {
    id: "anniversaire",
    label: "Anniversaire",
    image: "/images/products/lampes/anniv.jpeg",
  },
  {
    id: "mariage",
    label: "Mariage",
    image: "/images/products/lampes/mariage.jpeg",
  },
  {
    id: "naissance",
    label: "Nouveau-né",
    image: "/images/products/lampes/nouveau nee.jpeg",
  },
  {
    id: "maman",
    label: "Maman & Famille",
    image: "/images/products/lampes/maman.jpeg",
  },
  {
    id: "metiers",
    label: "Médecine",
    image: "/images/products/lampes/medecine.jpeg",
  },
  {
    id: "sport",
    label: "Football",
    image: "/images/products/lampes/football.jpeg",
  },
  {
    id: "soutenance",
    label: "Soutenance",
    image: "/images/products/lampes/soutenance.jpeg",
  },
  {
    id: "5eme",
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

type Lampes3DPageProps = {
  searchParams: Promise<{
    occasion?: string;
  }>;
};

export default async function Lampes3DPage({
  searchParams,
}: Lampes3DPageProps) {
  const { occasion } = await searchParams;

  const activeOccasion =
    occasion && occasionLabels[occasion] ? occasion : undefined;

  const lampProducts = products.filter(
    (product) =>
      product.category === "lampes-3d" &&
      (!activeOccasion || product.occasion === activeOccasion),
  );

  const activeLabel = activeOccasion
    ? occasionLabels[activeOccasion]
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
            {/* Intro compact */}
            <div className="mx-auto max-w-[760px] text-center">
              <div className="flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2A1B16]/35 sm:text-[10px]">
                <Link href="/" className="transition-colors hover:text-[#ECAB1C]">
                  Accueil
                </Link>
                <span>/</span>
                <span className="text-[#8A6A20]">Lampes 3D</span>
              </div>

              <h1 className="mt-2.5 font-body text-[27px] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-[34px] lg:text-[39px]">
                Lampes 3D <span className="text-[#8A6A20]">personnalisées</span>
              </h1>

              <p className="mx-auto mt-3 hidden max-w-[560px] text-[12px] leading-5 text-[#2A1B16]/48 sm:block">
                Choisissez une occasion et accédez directement aux modèles disponibles.
              </p>

              <Link
                href="/lampes-3d#produits"
                className={`mx-auto mt-4 hidden min-h-10 w-fit items-center border-b text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors sm:inline-flex ${
                  !activeOccasion
                    ? "border-[#ECAB1C] text-[#2A1B16]"
                    : "border-[#2A1B16]/20 text-[#2A1B16]/55 hover:border-[#ECAB1C] hover:text-[#2A1B16]"
                }`}
              >
                Voir toutes les lampes
              </Link>
            </div>

            {/* Catégories — visuelles, sans texte inutile */}
            <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-2 lg:px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full snap-x snap-mandatory justify-start gap-2.5 sm:gap-3 lg:justify-center">
                {occasions.map((item) => {
                  const isActive = activeOccasion === item.id;

                  return (
                    <Link
                      key={item.id}
                      href={`/lampes-3d?occasion=${item.id}#produits`}
                      className="group w-[138px] flex-none snap-start sm:w-[170px] lg:w-[175px]"
                    >
                      <article
                        className={`relative overflow-hidden rounded-[12px] border bg-[#2A1B16] shadow-[0_8px_22px_rgba(42,27,22,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(42,27,22,0.13)] ${
                          isActive
                            ? "border-[#ECAB1C] ring-1 ring-[#ECAB1C]/20"
                            : "border-white/10 hover:border-[#ECAB1C]/40"
                        }`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={item.image}
                            alt={`Lampe 3D ${item.label}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                            sizes="(max-width: 1023px) 170px, 22vw"
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
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${
                                isActive
                                  ? "bg-[#ECAB1C] text-[#2A1B16]"
                                  : "bg-white/14 text-white backdrop-blur-sm group-hover:bg-[#ECAB1C] group-hover:text-[#2A1B16]"
                              }`}
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

      {/* ───────────────── PRODUCTS ───────────────── */}
      <section
        id="produits"
        className="scroll-mt-24 py-7 sm:py-9 lg:py-11"
        style={{
          background:
            "linear-gradient(180deg, #F8F3EB 0%, #F3ECE3 100%)",
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          {/* Header catalogue */}
          <div className="mb-5 text-center sm:mb-7">
            <div className="mx-auto">
              <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#8A6A20] sm:text-[10px]">
                Collection disponible
              </p>

              <h2 className="mt-1.5 font-body text-[24px] font-semibold tracking-[-0.04em] sm:text-[30px]">
                {activeLabel}
              </h2>

              <p className="mt-1 text-[10px] text-[#2A1B16]/40 sm:text-[11px]">
                {lampProducts.length} produit{lampProducts.length > 1 ? "s" : ""}
              </p>
            </div>

            {activeOccasion && (
              <Link
                href="/lampes-3d#produits"
                className="mt-3 inline-flex text-[9px] font-semibold uppercase tracking-[0.08em] text-[#2A1B16]/45 underline decoration-[#ECAB1C]/60 underline-offset-4 transition-colors hover:text-[#2A1B16] sm:text-[10px]"
              >
                Tout afficher
              </Link>
            )}
          </div>

          {lampProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {lampProducts.map((product, index) => {
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
                        priority={index < 2}
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
                href="/lampes-3d#produits"
                className="mt-4 inline-flex border-b border-[#ECAB1C] pb-1 text-[9px] font-bold uppercase tracking-[0.09em]"
              >
                Voir toutes les lampes
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────── SMALL TRUST BAR ───────────────── */}
      <section className="border-t border-[#2A1B16]/[0.07] bg-[#EFE6DB]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-px bg-[#2A1B16]/[0.06] sm:grid-cols-4">
          {[
            ["Personnalisable", "Selon le modèle"],
            ["Finition soignée", "Préparée avec attention"],
            ["Livraison Algérie", "À travers le pays"],
            ["Besoin d’aide ?", "Équipe à votre écoute"],
          ].map(([title, description]) => (
            <div
              key={title}
              className="bg-[#F5EEE6] px-4 py-4 text-center sm:px-5 sm:py-5"
            >
              <p className="text-[10px] font-semibold text-[#2A1B16] sm:text-[11px]">
                {title}
              </p>
              <p className="mt-0.5 hidden text-[9px] text-[#2A1B16]/38 sm:block sm:text-[10px]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
