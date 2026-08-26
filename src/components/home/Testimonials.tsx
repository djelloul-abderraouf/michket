"use client";

/**
 * Avis de démonstration pour la maquette de la homepage.
 * Remplace ces textes par de vrais avis clients avant la mise en production.
 */

const testimonials = [
  {
    id: 1,
    name: "Yasmine B.",
    location: "Alger",
    rating: 5,
    text: "J’ai commandé une lampe personnalisée pour l’anniversaire de ma sœur. Le rendu est très propre et la personnalisation donne vraiment quelque chose d’unique.",
    product: "Lampe anniversaire",
    initials: "YB",
  },
  {
    id: 2,
    name: "Amine K.",
    location: "Oran",
    rating: 5,
    text: "Le trophée pour la soutenance était magnifique. La gravure est nette, les détails sont soignés et le cadeau a beaucoup plu.",
    product: "Trophée soutenance",
    initials: "AK",
  },
  {
    id: 3,
    name: "Lina M.",
    location: "Constantine",
    rating: 5,
    text: "Très contente de ma carte du monde. Elle donne beaucoup de caractère au salon et la finition du bois est vraiment élégante.",
    product: "Carte du monde",
    initials: "LM",
  },
  {
    id: 4,
    name: "Sofiane R.",
    location: "Béjaïa",
    rating: 5,
    text: "J’ai choisi un néon personnalisé avec deux prénoms. Le résultat est moderne, lumineux et exactement dans le style que je voulais.",
    product: "Néon LED",
    initials: "SR",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} étoiles sur 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? "fill-[#ECAB1C] text-[#ECAB1C]"
              : "fill-[#2A1B16]/10 text-[#2A1B16]/10"
          }`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      className="relative overflow-hidden pt-4 pb-12 sm:pt-5 sm:pb-14 lg:pt-6 lg:pb-16"
      aria-labelledby="testimonials-heading"
      style={{
        background:
          "radial-gradient(circle at 18% 8%, rgba(236,171,28,0.10), transparent 30%), radial-gradient(circle at 88% 92%, rgba(42,27,22,0.07), transparent 28%), linear-gradient(180deg, #FBF7F0 0%, #F5EEE4 58%, #F1E8DD 100%)",
      }}
    >
      {/* Couche de lumière douce pour donner du relief sans motif visible */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 36%, rgba(42,27,22,0.035) 100%)",
        }}
      />

      {/* Ligne de séparation premium, très discrète */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/30 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* ───────────────── En-tête ───────────────── */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10 lg:mb-11">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#ECAB1C]" aria-hidden="true" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A6A20] sm:text-[11px]">
              Avis clients
            </span>

            <span className="h-px w-8 bg-[#ECAB1C]" aria-hidden="true" />
          </div>

          <h2
            id="testimonials-heading"
            className="font-body text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#2A1B16] sm:text-[38px] lg:text-[44px]"
          >
            Ils ont choisi Michket
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-[#2A1B16]/55 sm:text-sm">
            Des créations pensées pour marquer les moments qui comptent.
          </p>
        </div>

        {/* ───────────────── Avis ─────────────────
            Mobile : rail horizontal compact.
            Desktop : grille 4 colonnes centrée.
        */}
        <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max snap-x snap-mandatory gap-3 sm:gap-4 lg:grid lg:w-full lg:grid-cols-4 lg:gap-4 xl:gap-5">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="
                  group
                  relative
                  flex
                  w-[82vw]
                  min-w-[255px]
                  max-w-[315px]
                  flex-none
                  snap-start
                  flex-col
                  overflow-hidden
                  rounded-[14px]
                  border
                  border-[#2A1B16]/[0.08]
                  bg-white/80
                  p-5
                  shadow-[0_14px_35px_rgba(42,27,22,0.08),inset_0_1px_0_rgba(255,255,255,0.75)]
                  backdrop-blur-[3px]
                  transition-all
                  duration-300

                  hover:-translate-y-1
                  hover:border-[#ECAB1C]/35
                  hover:shadow-[0_20px_50px_rgba(42,27,22,0.12),inset_0_1px_0_rgba(255,255,255,0.85)]

                  sm:w-[48vw]
                  sm:min-w-[285px]

                  lg:w-auto
                  lg:min-w-0
                  lg:max-w-none
                "
              >
                {/* Reflet très léger en haut de la carte */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent"
                  aria-hidden="true"
                />

                {/* Accent de profondeur discret */}
                <div
                  className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/18 to-transparent"
                  aria-hidden="true"
                />

                {/* Haut de carte : étoiles + guillemet */}
                <div className="relative flex items-start justify-between gap-4">
                  <Stars rating={testimonial.rating} />

                  <svg
                    className="h-8 w-8 shrink-0 text-[#ECAB1C]/20"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12.8 6.4C7.4 8 4 12.4 4 18.1c0 4.4 2.5 7.5 6.2 7.5 3.2 0 5.4-2.4 5.4-5.3 0-2.8-2-4.8-4.5-4.8-.7 0-1.3.1-1.8.4.6-2.5 2.3-4.6 5.2-5.8L12.8 6.4zm13.2 0C20.6 8 17.2 12.4 17.2 18.1c0 4.4 2.5 7.5 6.2 7.5 3.2 0 5.4-2.4 5.4-5.3 0-2.8-2-4.8-4.5-4.8-.7 0-1.3.1-1.8.4.6-2.5 2.3-4.6 5.2-5.8L26 6.4z" />
                  </svg>
                </div>

                {/* Commentaire */}
                <blockquote className="relative mt-5 flex-1">
                  <p className="text-[13px] leading-6 text-[#2A1B16]/70 sm:text-[14px] sm:leading-7">
                    “{testimonial.text}”
                  </p>
                </blockquote>

                {/* Produit concerné */}
                <div className="relative mt-5">
                  <span className="inline-flex rounded-full border border-[#2A1B16]/[0.06] bg-[#F5EEE4] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2A1B16]/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                    {testimonial.product}
                  </span>
                </div>

                {/* Auteur */}
                <div className="relative mt-5 flex items-center gap-3 border-t border-[#2A1B16]/[0.07] pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3A2922] to-[#2A1B16] text-[11px] font-bold tracking-[0.05em] text-white shadow-[0_6px_14px_rgba(42,27,22,0.18)]">
                    {testimonial.initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#2A1B16]">
                      {testimonial.name}
                    </p>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#2A1B16]/40">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.7}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>

                      <span>{testimonial.location}</span>
                    </div>
                  </div>

                  <span
                    className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ECAB1C]/15 bg-[#ECAB1C]/10 text-[#8A6A20]"
                    aria-label="Avis client"
                    title="Avis client"
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
                        d="M9 12.75l2.25 2.25L15 9.75M12 3l7 3v5c0 4.97-2.99 8.74-7 10-4.01-1.26-7-5.03-7-10V6l7-3z"
                      />
                    </svg>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Indication uniquement mobile/tablette */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2A1B16]/35 lg:hidden">
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

          Faites glisser pour voir plus d’avis
        </div>
      </div>
    </section>
  );
}
