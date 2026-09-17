"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { NavItem, NavItemWithMega } from "@/data/navigation";
import { footerNav } from "@/data/navigation";
import { siteConfig } from "@/data/site-config";

const PHONE_DISPLAY = "+213 542 63 82 42";
const PHONE_HREF = "tel:+213542638242";
const WHATSAPP_HREF =
  "https://wa.me/213542638242?text=" +
  encodeURIComponent("Bonjour Michket, j’ai besoin d’aide.");

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/mi_chket",
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/imichket",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@michket3",
    icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
] as const;

function uniqueLinks(
  links: NavItem[],
): NavItem[] {
  const seen = new Set<string>();

  return links.filter((link) => {
    const key = `${link.href}::${link.label}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

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
        className="flex w-full items-center justify-between py-4 text-left lg:pointer-events-none"
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
          <li key={`${link.href}-${link.label}`}>
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

function ContactColumn() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 lg:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left lg:pointer-events-none"
        aria-expanded={open}
      >
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/90">
          Contact
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

      <div
        className={`space-y-4 pb-4 lg:block lg:pb-0 ${
          open ? "block" : "hidden"
        }`}
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">
            Téléphone
          </p>
          <a
            href={PHONE_HREF}
            className="mt-1 inline-flex text-sm font-medium text-white/70 transition-colors hover:text-[#ECAB1C]"
          >
            {PHONE_DISPLAY}
          </a>
        </div>

        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#25D366]/25 bg-[#25D366]/10 px-3 text-sm font-semibold text-white/80 transition hover:border-[#25D366]/40 hover:bg-[#25D366]/15 hover:text-white"
        >
          <svg
            className="h-4 w-4 text-[#25D366]"
            viewBox="0 0 32 32"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16.1 3.2A12.6 12.6 0 0 0 5.2 22.1L3.4 28.8l6.9-1.8a12.6 12.6 0 1 0 5.8-23.8Zm0 22.8a10.3 10.3 0 0 1-5.2-1.4l-.4-.2-4.1 1.1 1.1-4-.3-.4A10.3 10.3 0 1 1 16.1 26Zm5.7-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.7.1-1.9-.9-3.2-1.7-4.5-3.8-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.3 3.4 1.4 3.6c.2.2 2.5 3.8 6 5.3 2.2.9 3 .9 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4Z" />
          </svg>
          WhatsApp
        </a>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">
            Réseaux sociaux
          </p>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/55 transition-all hover:border-[#ECAB1C]/35 hover:bg-white/[0.06] hover:text-[#ECAB1C]"
                aria-label={social.label}
                title={social.label}
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
        </div>
      </div>
    </div>
  );
}

export function Footer({
  navItems = [],
}: {
  navItems?: NavItemWithMega[];
}) {
  const catalogueLinks = useMemo(
    () =>
      uniqueLinks(
        navItems
          .filter(
            (item) =>
              item.href !== "/" &&
              item.label.toLowerCase() !== "accueil",
          )
          .map((item) => ({
            label: item.label,
            href: item.href,
          })),
      ),
    [navItems],
  );

  const discoverLinks = useMemo(() => {
    const dynamicLinks = navItems.flatMap(
      (item) =>
        item.mega?.categories.map(
          (category) => ({
            label: category.label,
            href: category.href,
          }),
        ) ?? [],
    );

    return uniqueLinks(dynamicLinks).slice(0, 10);
  }, [navItems]);

  return (
    <footer
      className="relative mt-auto overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(180deg, rgba(236,171,28,0.035) 0%, rgba(236,171,28,0) 22%), linear-gradient(135deg, #3B2A23 0%, #2A1B16 46%, #21130F 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/35 to-transparent"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.018) 0%, transparent 28%, transparent 72%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      <div className="relative container-michket py-10 lg:py-12">
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <FooterColumn
            title="Catalogue"
            links={catalogueLinks}
          />

          <FooterColumn
            title="À découvrir"
            links={discoverLinks}
          />

          <FooterColumn
            title="À propos"
            links={footerNav.aPropos}
          />

          <FooterColumn
            title="Assistance"
            links={footerNav.assistance}
          />

          <ContactColumn />
        </div>
      </div>

      <div className="relative border-t border-white/[0.10] bg-[#21130F]/72">
        <div className="container-michket flex flex-col items-center justify-between gap-4 py-6 lg:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4 lg:items-center">
            <Image
              src="/images/brand/michket-logo-black.png"
              alt="Michket"
              width={80}
              height={22}
              className="h-5 w-auto brightness-0 invert"
            />

            <span className="text-center text-xs text-white/40 sm:text-left">
              {siteConfig.legal.copyright}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/45">
            <a
              href={PHONE_HREF}
              className="transition-colors hover:text-[#ECAB1C]"
            >
              {PHONE_DISPLAY}
            </a>

            <span
              className="hidden h-3 w-px bg-white/15 sm:block"
              aria-hidden="true"
            />

            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#ECAB1C]"
            >
              WhatsApp
            </a>

            <span
              className="hidden h-3 w-px bg-white/15 sm:block"
              aria-hidden="true"
            />

            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/38">
              Paiement à la livraison
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
