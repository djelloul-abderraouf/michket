"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function categoryLabel(categoryId: string) {
  return (
    categories.find((category) => category.id === categoryId)?.label ??
    categoryId.replaceAll("-", " ")
  );
}

/*
 * Current product catalogue still stores demo numeric values that were
 * initially entered as EUR placeholders. The UI itself is DZD/DA-oriented.
 * This formatter deliberately only changes presentation, not product data.
 * Update products.ts later with final Algerian prices.
 */
function formatPriceDA(price: number) {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

function scoreMatch(source: string, query: string) {
  if (!source || !query) return 0;

  const normalizedSource = normalizeSearch(source);

  if (normalizedSource === query) return 100;
  if (normalizedSource.startsWith(query)) return 70;
  if (normalizedSource.includes(query)) return 40;

  return 0;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeSearch(deferredQuery);

  /* ───────────────────────── Open / focus / reset ───────────────────────── */

  useEffect(() => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }

    if (open) {
      focusTimerRef.current = setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    } else {
      setQuery("");
    }

    return () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    };
  }, [open]);

  /* ───────────────────────── Escape + focus trap ───────────────────────── */

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("aria-hidden"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  /* ───────────────────────── Ranked product search ───────────────────────── */

  const productResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return products
      .map((product) => {
        const titleScore = scoreMatch(product.title, normalizedQuery) * 5;
        const categoryScore =
          scoreMatch(categoryLabel(product.category), normalizedQuery) * 4;
        const occasionScore =
          Math.max(
            0,
            ...(product.occasion ?? []).map(
              (occasion) => scoreMatch(occasion, normalizedQuery) * 3,
            ),
          );
        const descriptionScore =
          scoreMatch(product.description, normalizedQuery) * 2;
        const badgeScore = product.badge
          ? scoreMatch(product.badge, normalizedQuery)
          : 0;

        const score =
          titleScore +
          categoryScore +
          occasionScore +
          descriptionScore +
          badgeScore;

        return { product, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ product }) => product);
  }, [normalizedQuery]);

  const categoryResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return categories
      .map((category) => ({
        category,
        score:
          scoreMatch(category.label, normalizedQuery) * 4 +
          scoreMatch(category.description, normalizedQuery) * 2,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ category }) => category);
  }, [normalizedQuery]);

  const visibleProducts = productResults.slice(0, 8);
  const visibleCategories = categoryResults.slice(0, 4);
  const hasQuery = normalizedQuery.length > 0;
  const hasResults =
    visibleProducts.length > 0 || visibleCategories.length > 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="
          absolute
          inset-0
          flex
          flex-col
          overflow-hidden
          bg-[#FAF6EE]

          sm:inset-x-6
          sm:bottom-auto
          sm:top-8
          sm:mx-auto
          sm:max-h-[calc(100dvh-4rem)]
          sm:max-w-[980px]
          sm:rounded-[14px]
          sm:border
          sm:border-black/[0.08]
          sm:bg-white
          sm:shadow-[0_24px_70px_rgba(0,0,0,0.20)]

          lg:top-16
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
      >
        {/* ───────────────── Search header ───────────────── */}
        <div className="shrink-0 border-b border-black/[0.08] bg-white">
          <div className="flex min-h-[68px] items-center gap-3 px-4 sm:min-h-[76px] sm:px-6">
            <svg
              className="h-5 w-5 shrink-0 text-black/35"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>

            <div className="min-w-0 flex-1">
              <label id="search-dialog-title" htmlFor="michket-search" className="sr-only">
                Rechercher sur Michket
              </label>

              <input
                id="michket-search"
                ref={inputRef}
                type="search"
                inputMode="search"
                autoComplete="off"
                enterKeyHint="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une lampe, un trophée, une occasion..."
                className="
                  w-full
                  border-0
                  bg-transparent
                  py-3
                  text-[16px]
                  font-medium
                  text-[#111111]
                  outline-none
                  ring-0
                  placeholder:text-black/30
                  focus:border-0
                  focus:outline-none
                  focus:ring-0
                  focus-visible:border-0
                  focus-visible:outline-none
                  focus-visible:ring-0
                  sm:text-[17px]
                "
                style={{
                  outline: "none",
                  boxShadow: "none",
                }}
              />
            </div>

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="hidden min-h-10 items-center px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/40 transition-colors hover:text-[#ECAB1C] sm:inline-flex"
              >
                Effacer
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-black/[0.05] hover:text-[#111111]"
              aria-label="Fermer la recherche"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ───────────────── Results ───────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!hasQuery ? (
            <EmptySearchState onClose={onClose} />
          ) : hasResults ? (
            <div className="px-4 py-5 sm:px-6 sm:py-6">
              {/* Category matches */}
              {visibleCategories.length > 0 && (
                <section aria-labelledby="search-categories-title">
                  <div className="mb-3 flex items-center justify-between">
                    <h2
                      id="search-categories-title"
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40"
                    >
                      Catégories
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                    {visibleCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={category.href}
                        onClick={onClose}
                        className="group relative overflow-hidden rounded-[9px] bg-[#EEE8DE]"
                      >
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={category.image}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.035]"
                            sizes="(max-width: 639px) 50vw, 25vw"
                          />

                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/5 to-transparent"
                            aria-hidden="true"
                          />

                          <span className="absolute inset-x-0 bottom-0 p-3 text-[12px] font-semibold leading-tight text-white sm:text-[13px]">
                            {category.label}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Product matches */}
              {visibleProducts.length > 0 && (
                <section
                  className={visibleCategories.length > 0 ? "mt-7" : ""}
                  aria-labelledby="search-products-title"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2
                      id="search-products-title"
                      className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40"
                    >
                      Produits
                      <span className="ml-2 text-black/25">
                        {productResults.length}
                      </span>
                    </h2>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                    {visibleProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/produits/${product.slug}`}
                        onClick={onClose}
                        className="
                          group
                          flex
                          min-w-0
                          items-center
                          gap-3
                          rounded-[9px]
                          border
                          border-black/[0.07]
                          bg-white
                          p-2.5
                          transition-all
                          duration-200
                          hover:border-[#ECAB1C]/40
                          hover:shadow-[0_8px_24px_rgba(20,16,12,0.07)]
                          sm:p-3
                        "
                      >
                        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[7px] bg-[#EEE8DE] sm:h-[82px] sm:w-[82px]">
                          <Image
                            src={product.images[0].src}
                            alt={product.images[0].alt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                            sizes="82px"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9A741C]">
                            {categoryLabel(product.category)}
                          </p>

                          <h3 className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#171717] sm:text-[14px]">
                            {product.title}
                          </h3>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[13px] font-bold text-[#111111] sm:text-[14px]">
                              {formatPriceDA(product.price)}
                            </span>

                            {product.compareAtPrice && (
                              <span className="text-[10px] text-black/30 line-through sm:text-[11px]">
                                {formatPriceDA(product.compareAtPrice)}
                              </span>
                            )}

                            {typeof product.rating === "number" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-black/45">
                                <svg
                                  className="h-3 w-3 fill-[#ECAB1C] text-[#ECAB1C]"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111 5.518.442c.499.04.701.663.321.988l-4.204 3.602 1.285 5.385a.562.562 0 01-.84.61L12 16.748l-4.725 2.889a.562.562 0 01-.84-.61l1.285-5.385-4.204-3.602a.562.562 0 01.321-.988l5.518-.442 2.125-5.11z"
                                  />
                                </svg>
                                {product.rating.toFixed(1).replace(".", ",")}
                              </span>
                            )}
                          </div>
                        </div>

                        <svg
                          className="h-4 w-4 shrink-0 text-black/20 transition-all group-hover:translate-x-0.5 group-hover:text-[#ECAB1C]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    ))}
                  </div>

                  {productResults.length > visibleProducts.length && (
                    <p className="mt-4 text-center text-[11px] text-black/35">
                      {productResults.length - visibleProducts.length} autre
                      {productResults.length - visibleProducts.length > 1
                        ? "s"
                        : ""}{" "}
                      résultat
                      {productResults.length - visibleProducts.length > 1
                        ? "s"
                        : ""}
                    </p>
                  )}
                </section>
              )}
            </div>
          ) : (
            <NoResults query={query} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptySearchState({ onClose }: { onClose: () => void }) {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-7">
      <div className="mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
          Explorer Michket
        </p>
        <p className="mt-1 text-[13px] text-black/45">
          Recherchez par produit, occasion ou catégorie.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            onClick={onClose}
            className="group overflow-hidden rounded-[9px] bg-[#EEE8DE]"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={category.image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                sizes="(max-width: 639px) 50vw, 25vw"
              />

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent"
                aria-hidden="true"
              />

              <span className="absolute inset-x-0 bottom-0 p-3 text-[12px] font-semibold text-white sm:text-[13px]">
                {category.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 border-t border-black/[0.07] pt-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
          Idées de recherche
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            "Anniversaire",
            "Mariage",
            "Naissance",
            "BAC",
            "Soutenance",
            "Maman",
            "Football",
            "Médecin",
          ].map((label) => (
            <span
              key={label}
              className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-medium text-black/55"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoResults({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-black/35">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>

      <h2 className="mt-4 text-[16px] font-semibold text-[#171717]">
        Aucun résultat
      </h2>

      <p className="mt-2 max-w-sm text-[13px] leading-6 text-black/45">
        Aucun produit ou catégorie ne correspond à « {query} ». Essayez par
        exemple “mariage”, “BAC”, “football” ou “lampe”.
      </p>

      <Link
        href="/meilleures-ventes"
        onClick={onClose}
        className="mt-5 inline-flex min-h-11 items-center justify-center border border-[#1A1A1A] px-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1A1A1A] transition-colors hover:border-[#ECAB1C] hover:bg-[#ECAB1C]"
      >
        Voir les meilleures ventes
      </Link>
    </div>
  );
}