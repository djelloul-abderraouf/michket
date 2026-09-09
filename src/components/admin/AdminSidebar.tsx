"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const iconClassName = "h-5 w-5";

const NAV_ITEMS: NavItem[] = [
  {
    label: "Tableau de bord",
    href: "/admin",
    icon: (
      <svg
        className={iconClassName}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2.25" y="2.25" width="6.5" height="6.5" rx="1.5" />
        <rect x="11.25" y="2.25" width="6.5" height="6.5" rx="1.5" />
        <rect x="2.25" y="11.25" width="6.5" height="6.5" rx="1.5" />
        <rect x="11.25" y="11.25" width="6.5" height="6.5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Produits",
    href: "/admin/products",
    icon: (
      <svg
        className={iconClassName}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 6.25 10 2.5l7.5 3.75v7.5L10 17.5l-7.5-3.75v-7.5Z" />
        <path d="M10 10.25V17.5" />
        <path d="m10 10.25 7.5-4" />
        <path d="m10 10.25-7.5-4" />
      </svg>
    ),
  },
  {
    label: "Catégories",
    href: "/admin/categories",
    icon: (
      <svg
        className={iconClassName}
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
  {
    label: "Commandes",
    href: "/admin/orders",
    icon: (
      <svg
        className={iconClassName}
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
    label: "Promotions",
    href: "/admin/promotions",
    icon: (
      <svg
        className={iconClassName}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6.25V4A1.5 1.5 0 0 1 4.5 2.5h2.25L17.5 13.25 13.25 17.5 2.5 6.75V4.5A2 2 0 0 1 4.5 2.5" />
        <circle cx="6.25" cy="6.25" r="1.15" />
      </svg>
    ),
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: (
      <svg
        className={iconClassName}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="10" cy="6.25" r="3.25" />
        <path d="M3 17.25c0-3.15 3.13-5.75 7-5.75s7 2.6 7 5.75" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Fermer le menu administrateur"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-neutral-950/35 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        aria-label="Navigation administrateur"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col overflow-hidden border-r border-white/10 bg-[#151512] text-white shadow-2xl transition-transform duration-300 ease-out",
          "lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:shadow-none",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.045] blur-3xl"
        />

        <div className="relative flex h-[82px] items-center border-b border-white/10 px-5">
          <Link
            href="/admin"
            onClick={onClose}
            className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white text-sm font-bold tracking-[-0.04em] text-neutral-950 shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
              M
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold tracking-[-0.02em] text-white">
                Michket
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
                Administration
              </span>
            </span>
          </Link>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Navigation
          </p>

          <nav
            className="space-y-1"
            aria-label="Menu principal"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200",
                    "focus-visible:ring-2 focus-visible:ring-white/60",
                    active
                      ? "bg-white text-neutral-950 shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                      : "text-white/65 hover:bg-white/[0.07] hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                      active
                        ? "bg-neutral-950/[0.06] text-neutral-950"
                        : "bg-white/[0.04] text-white/60 group-hover:bg-white/[0.08] group-hover:text-white",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>

                  {active ? (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-neutral-950"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative border-t border-white/10 p-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-emerald-400"
              />
              <p className="text-xs font-medium text-white/75">
                Espace sécurisé
              </p>
            </div>

            <p className="mt-1.5 text-[11px] leading-4 text-white/35">
              Gestion interne Michket
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
