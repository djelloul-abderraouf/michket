"use client";

interface AdminHeaderProps {
  email: string;
  role: string;
  onLogout: () => void;
  onMenuToggle: () => void;
}

export function AdminHeader({
  email,
  role,
  onLogout,
  onMenuToggle,
}: AdminHeaderProps) {
  const roleLabel =
    role === "super_admin" ? "Super Admin" : "Administrateur";

  const initial =
    email.trim().charAt(0).toUpperCase() || "M";

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b border-black/[0.07] bg-[#f6f4ef]/90 backdrop-blur-xl"
    >
      <div className="flex min-h-[74px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Ouvrir le menu de navigation"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-black/[0.08] bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 lg:hidden"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 5.5h14" />
              <path d="M3 10h14" />
              <path d="M3 14.5h14" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[-0.02em] text-neutral-950 lg:hidden">
              Michket Admin
            </p>

            <div className="hidden items-center gap-2 lg:flex">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />
              <p className="text-sm font-medium capitalize text-neutral-500">
                {formattedDate}
              </p>
            </div>

            <p className="mt-0.5 truncate text-xs text-neutral-400 lg:hidden">
              Espace d’administration
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden min-w-0 items-center gap-3 sm:flex">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-black/[0.07] bg-white text-xs font-bold text-neutral-950 shadow-sm">
              {initial}
            </div>

            <div className="hidden min-w-0 text-left md:block">
              <p
                className="max-w-[220px] truncate text-sm font-semibold tracking-[-0.01em] text-neutral-950"
                title={email}
              >
                {email}
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full border border-black/[0.07] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="mx-1 hidden h-8 w-px bg-black/[0.08] sm:block"
          />

          <button
            type="button"
            onClick={onLogout}
            aria-label="Se déconnecter"
            className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 text-sm font-medium text-neutral-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 sm:px-3.5"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 14H3.33A1.33 1.33 0 0 1 2 12.67V3.33A1.33 1.33 0 0 1 3.33 2H6" />
              <path d="M10.67 11.33 14 8l-3.33-3.33" />
              <path d="M14 8H6" />
            </svg>

            <span className="hidden sm:inline">
              Déconnexion
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
