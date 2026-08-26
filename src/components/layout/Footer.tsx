"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { footerNav } from "@/data/navigation";
import { siteConfig } from "@/data/site-config";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 lg:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 lg:pointer-events-none"
        aria-expanded={open}
      >
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
          {title}
        </h3>

        <svg
          className={`h-4 w-4 text-white/45 transition-transform lg:hidden ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <ul
        className={`space-y-2.5 pb-4 lg:pb-0 ${
          open ? "block" : "hidden lg:block"
        }`}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/58 transition-colors duration-200 hover:text-[#ECAB1C]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      className="relative mt-auto overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(180deg, rgba(236,171,28,0.035) 0%, rgba(236,171,28,0) 22%), linear-gradient(135deg, #3B2A23 0%, #2A1B16 46%, #21130F 100%)",
      }}
    >
      {/* Ligne supérieure très discrète */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/35 to-transparent"
        aria-hidden="true"
      />

      {/* Léger voile horizontal pour donner de la profondeur sans décoration visible */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.018) 0%, transparent 28%, transparent 72%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      {/* Colonnes principales */}
      <div className="relative container-michket py-10 lg:py-12">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <FooterColumn title="Catalogue" links={footerNav.catalogue} />
          <FooterColumn title="Cadeaux" links={footerNav.cadeaux} />
          <FooterColumn title="Occasions" links={footerNav.occasions} />
          <FooterColumn title="À propos" links={footerNav.aPropos} />
          <FooterColumn title="Assistance" links={footerNav.assistance} />
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="relative border-t border-white/[0.10] bg-[#21130F]/72">
        <div className="container-michket flex flex-col items-center justify-between gap-4 py-6 lg:flex-row">
          <div className="flex items-center gap-4">
            <Image
              src="/images/brand/michket-logo-black.png"
              alt="Michket"
              width={80}
              height={22}
              className="h-5 w-auto brightness-0 invert"
            />

            <span className="text-xs text-white/40">
              {siteConfig.legal.copyright}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {[
              {
                label: "Instagram",
                href: siteConfig.social.instagram,
                icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
              },
              {
                label: "Facebook",
                href: siteConfig.social.facebook,
                icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
              },
              {
                label: "TikTok",
                href: siteConfig.social.tiktok,
                icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
              },
            ]
              .filter((social) => social.href)
              .map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-[#ECAB1C]"
                  aria-label={social.label}
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/38">
              Paiements sécurisés
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
