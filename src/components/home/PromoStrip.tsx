import Image from "next/image";
import Link from "next/link";

export function PromoStrip() {
  return (
    <section
      className="bg-[#FAF6EE] px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-16"
      aria-label="Promotion sur les lampes personnalisées"
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="overflow-hidden border border-black/10 bg-white shadow-[0_18px_50px_rgba(10,10,10,0.08)]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* ── Image ── */}
            <div className="relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px]">
              <Image
                src="/images/products/lampes/anniv.jpeg"
                alt="Lampe LED personnalisée Michket pour anniversaire"
                fill
                className="object-cover"
                sizes="(max-width: 1023px) 100vw, 55vw"
              />

              {/* Soft overlay for readability on mobile label */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent lg:hidden" />

              {/* Mobile floating badge */}
              <div className="absolute bottom-4 left-4 lg:hidden">
                <span className="inline-flex items-center gap-2 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1A1A1A] shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#ECAB1C]" />
                  Lampes personnalisées
                </span>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="relative flex items-center bg-[#FFFDF8] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12 xl:px-14">
              {/* Decorative accent */}
              <div
                className="absolute left-0 top-8 hidden h-20 w-1 bg-[#ECAB1C] lg:block"
                aria-hidden="true"
              />

              <div className="w-full max-w-xl">
                {/* Eyebrow */}
                <div className="mb-4 hidden items-center gap-3 lg:flex">
                  <span className="h-px w-9 bg-[#ECAB1C]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6A20]">
                    Offre spéciale
                  </span>
                </div>

                {/* Offer */}
                <div className="mb-4 flex items-end gap-3 sm:mb-5">
                  <span
                    className="font-display text-[54px] font-semibold leading-none tracking-[-0.04em] text-[#ECAB1C] sm:text-[64px] lg:text-[72px]"
                    aria-hidden="true"
                  >
                    -15%
                  </span>

                  <div className="pb-1.5 sm:pb-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
                      sur toutes les
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#1A1A1A] sm:text-base">
                      lampes personnalisées
                    </p>
                  </div>
                </div>

                {/* Heading */}
                <h2 className="font-display text-3xl leading-[1.08] text-[#151515] sm:text-4xl lg:text-[42px]">
                  Un cadeau unique,
                  <br className="hidden sm:block" /> créé pour marquer le moment.
                </h2>

                {/* Description */}
                <p className="mt-4 max-w-lg text-sm leading-6 text-black/60 sm:text-[15px] sm:leading-7">
                  Anniversaire, mariage, naissance ou souvenir spécial :
                  personnalisez une lampe Michket et offrez quelque chose qui reste.
                </p>

                {/* Code promo */}
                <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-black/10 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-black/45">
                    Code promo
                  </span>

                  <span className="border border-[#ECAB1C]/45 bg-[#ECAB1C]/10 px-3 py-1.5 text-sm font-bold tracking-[0.16em] text-[#1A1A1A]">
                    LAMPE15
                  </span>

                  <span className="text-xs text-black/40">
                    À utiliser au moment de la commande
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/lampes-3d"
                    className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#151515] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ECAB1C]"
                  >
                    Découvrir les lampes
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
                        d="M5 12h14M13 6l6 6-6 6"
                      />
                    </svg>
                  </Link>

                  <Link
                    href="/meilleures-ventes"
                    className="inline-flex min-h-12 items-center justify-center px-2 py-3 text-sm font-medium text-[#1A1A1A] underline decoration-black/20 underline-offset-4 transition-colors hover:text-[#ECAB1C]"
                  >
                    Voir les meilleures ventes
                  </Link>
                </div>

                {/* Reassurance */}
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                  <span>Personnalisable</span>
                  <span aria-hidden="true">•</span>
                  <span>Idée cadeau</span>
                  <span aria-hidden="true">•</span>
                  <span>Création Michket</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}