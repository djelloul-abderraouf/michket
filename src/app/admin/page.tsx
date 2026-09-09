import Link from "next/link";

const STATS = [
  {
    label: "Produits",
    value: "—",
    note: "Données à connecter",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 6.25 10 2.5l7.5 3.75v7.5L10 17.5l-7.5-3.75v-7.5Z" />
        <path d="M10 10.25v7.25" />
        <path d="m10 10.25 7.5-4" />
        <path d="m10 10.25-7.5-4" />
      </svg>
    ),
  },
  {
    label: "Commandes",
    value: "—",
    note: "Données à connecter",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6.5 2.5H4A1.5 1.5 0 0 0 2.5 4v12A1.5 1.5 0 0 0 4 17.5h12a1.5 1.5 0 0 0 1.5-1.5V4A1.5 1.5 0 0 0 16 2.5h-2.5" />
        <path d="M6.5 2.5h7" />
        <path d="M6.5 6.5h7" />
        <path d="M6.5 10.5h4" />
      </svg>
    ),
  },
  {
    label: "En attente",
    value: "—",
    note: "Données à connecter",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 6v4l3 2" />
      </svg>
    ),
  },
  {
    label: "Stock faible",
    value: "—",
    note: "Données à connecter",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m10 2.5 7.5 15h-15l7.5-15Z" />
        <path d="M10 8v3.5" />
        <circle cx="10" cy="14" r=".55" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const QUICK_ACTIONS = [
  {
    title: "Gérer les produits",
    description: "Créer, modifier et organiser le catalogue Michket.",
    href: "/admin/products",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 6.25 10 2.5l7.5 3.75v7.5L10 17.5l-7.5-3.75v-7.5Z" />
        <path d="M10 10.25v7.25" />
      </svg>
    ),
  },
  {
    title: "Suivre les commandes",
    description: "Consulter les commandes et leur état de traitement.",
    href: "/admin/orders",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 2.5h12A1.5 1.5 0 0 1 17.5 4v12A1.5 1.5 0 0 1 16 17.5H4A1.5 1.5 0 0 1 2.5 16V4A1.5 1.5 0 0 1 4 2.5Z" />
        <path d="M6 7h8" />
        <path d="M6 10.5h5" />
      </svg>
    ),
  },
  {
    title: "Organiser les catégories",
    description: "Structurer les collections et la navigation du catalogue.",
    href: "/admin/categories",
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" />
        <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" />
        <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" />
        <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-[#171714] text-white shadow-[0_20px_60px_rgba(23,23,20,0.10)]">
        <div className="relative px-5 py-7 sm:px-7 sm:py-9 lg:px-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/[0.08] blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-white/[0.035] blur-3xl"
          />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
                  Espace administrateur
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Tableau de bord
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-[15px]">
                Pilotez le catalogue, les commandes et les opérations Michket
                depuis un seul espace.
              </p>
            </div>

            <Link
              href="/admin/products"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-auto"
            >
              Gérer les produits
              <svg
                className="h-4 w-4"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 8h10" />
                <path d="m9.5 4.5 3.5 3.5-3.5 3.5" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="overview-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Vue d’ensemble
            </p>
            <h2
              id="overview-title"
              className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950"
            >
              Indicateurs clés
            </h2>
          </div>

          <span className="hidden rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 sm:inline-flex">
            Connexion API à venir
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat) => (
            <article
              key={stat.label}
              className="group rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(23,23,20,0.07)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-700">
                  {stat.icon}
                </span>

                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  bientôt
                </span>
              </div>

              <div className="mt-7">
                <p className="text-[13px] font-medium text-neutral-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-semibold tracking-[-0.045em] text-neutral-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-neutral-400">
                  {stat.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
        aria-labelledby="quick-actions-title"
      >
        <div>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Accès direct
            </p>
            <h2
              id="quick-actions-title"
              className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-950"
            >
              Actions rapides
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex min-h-[170px] flex-col justify-between rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:shadow-[0_14px_34px_rgba(23,23,20,0.07)] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/25"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1efe9] text-neutral-700 transition group-hover:bg-neutral-950 group-hover:text-white">
                  {action.icon}
                </span>

                <span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold tracking-[-0.01em] text-neutral-950">
                      {action.title}
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 8h10" />
                      <path d="m9.5 4.5 3.5 3.5-3.5 3.5" />
                    </svg>
                  </span>

                  <span className="mt-2 block text-xs leading-5 text-neutral-400">
                    {action.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_30px_rgba(23,23,20,0.035)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Administration
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em] text-neutral-950">
                État de l’interface
              </h2>
            </div>

            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="7.5" />
                <path d="m6.5 10 2.25 2.25 4.75-4.75" />
              </svg>
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-[#f7f5f0] p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-sm font-semibold text-neutral-800">
                Interface prête
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-500">
              La navigation et l’authentification admin sont en place. Les
              statistiques réelles seront affichées après connexion aux routes
              métier du backend.
            </p>
          </div>

          <div className="mt-4 space-y-3 border-t border-black/[0.06] pt-4">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-neutral-400">Authentification</span>
              <span className="font-semibold text-neutral-700">Active</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-neutral-400">Navigation admin</span>
              <span className="font-semibold text-neutral-700">Active</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-neutral-400">Données dashboard</span>
              <span className="font-semibold text-amber-700">À connecter</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
