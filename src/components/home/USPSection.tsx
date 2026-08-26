/**
 * Bloc de réassurance Michket.
 *
 * Design premium marron foncé + ivoire + accent #ECAB1C.
 * Le fond utilise plusieurs couches très discrètes pour créer du relief
 * sans motifs visibles ni effet "plat".
 */

const usps = [
  {
    title: "Créations personnalisées",
    description:
      "Des cadeaux pensés pour être personnalisés selon chaque occasion.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    ),
  },
  {
    title: "Finition soignée",
    description:
      "Chaque création est préparée avec attention pour offrir un rendu élégant.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3.057A9.77 9.77 0 0112 2.75c5.108 0 9.25 3.806 9.25 8.5 0 5.222-4.682 9.072-9.25 10-4.568-.928-9.25-4.778-9.25-10 0-1.464.402-2.844 1.114-4.038"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 11.5l3 3 6-7"
        />
      </svg>
    ),
  },
  {
    title: "Livraison en Algérie",
    description:
      "Vos commandes Michket sont préparées pour être expédiées à travers l’Algérie.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 6.75h11.25v10.5H3V6.75z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.25 10.5h3.355c.497 0 .96.246 1.238.658l2.407 3.564v2.528h-7V10.5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.125 20.25a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75zM17.625 20.25a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z"
        />
      </svg>
    ),
  },
  {
    title: "Une équipe à votre écoute",
    description:
      "Une question sur votre personnalisation ? Nous vous accompagnons avant la commande.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3h6m-9.75 8.25l2.61-2.61A8.25 8.25 0 103.75 12c0 1.44.37 2.793 1.02 3.97L3.75 19.5z"
        />
      </svg>
    ),
  },
];

export function USPSection() {
  return (
    <section
      className="relative overflow-hidden py-10 sm:py-12 lg:py-14"
      aria-label="Les engagements Michket"
      style={{
        background:
          "radial-gradient(circle at 18% 0%, rgba(236,171,28,0.10), transparent 28%), radial-gradient(circle at 86% 100%, rgba(255,255,255,0.035), transparent 24%), linear-gradient(135deg, #3A2922 0%, #2A1B16 48%, #21130F 100%)",
      }}
    >
      {/* Voile de profondeur — invisible comme motif, visible comme lumière */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0) 22%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* Ligne supérieure discrète */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* En-tête */}
        <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-8 lg:mb-9">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-7 bg-[#ECAB1C]" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ECAB1C] sm:text-[11px]">
              L’expérience Michket
            </span>
            <span className="h-px w-7 bg-[#ECAB1C]" aria-hidden="true" />
          </div>

          <h2 className="font-body text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[32px] lg:text-[36px]">
            Pensé pour vos plus beaux moments
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[12px] leading-6 text-white/45 sm:text-[13px]">
            Des créations préparées avec attention, du choix jusqu’à la livraison.
          </p>
        </div>

        {/* Cartes avec relief */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {usps.map((usp) => (
            <article
              key={usp.title}
              className="
                group
                relative
                overflow-hidden
                rounded-[14px]
                border
                border-white/[0.09]
                bg-white/[0.035]
                px-4
                py-6
                text-center
                shadow-[0_14px_35px_rgba(15,8,5,0.16),inset_0_1px_0_rgba(255,255,255,0.035)]
                backdrop-blur-[2px]
                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#ECAB1C]/25
                hover:bg-white/[0.055]
                hover:shadow-[0_20px_45px_rgba(15,8,5,0.22),inset_0_1px_0_rgba(255,255,255,0.045)]

                sm:px-5
                sm:py-7
                lg:px-6
                lg:py-8
              "
            >
              {/* Très légère lumière interne en haut de chaque carte */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.035] to-transparent"
                aria-hidden="true"
              />

              {/* Icône */}
              <div className="relative mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#ECAB1C]/20 bg-[#ECAB1C]/[0.075] text-[#ECAB1C] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-transform duration-300 group-hover:scale-[1.05] sm:h-12 sm:w-12">
                {usp.icon}
              </div>

              <h3 className="relative font-body text-[13px] font-semibold leading-5 text-white sm:text-[14px]">
                {usp.title}
              </h3>

              <p className="relative mx-auto mt-2 max-w-[245px] text-[11px] leading-5 text-white/46 sm:text-[12px]">
                {usp.description}
              </p>

              {/* Accent bas très fin */}
              <div
                className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
