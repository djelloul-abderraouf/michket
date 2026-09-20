"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
} from "react";

import type { ApiCategory } from "@/lib/api";

const AUTOPLAY_MS = 3000;

type CategoryMosaicProps = {
  categories: ApiCategory[];
  basePath?: string;
  limit?: number;
};

export function CategoryMosaic({
  categories,
  basePath = "",
  limit,
}: CategoryMosaicProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const selected =
    typeof limit === "number"
      ? categories.slice(0, limit)
      : categories;

  const normalizedBasePath =
    basePath.replace(/\/+$/, "");

  const scrollNext = useCallback(() => {
    const container = scrollRef.current;

    if (!container || selected.length <= 1) {
      return;
    }

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-category-card]",
      );

    if (!firstCard) {
      return;
    }

    const styles = window.getComputedStyle(
      container,
    );
    const gap =
      Number.parseFloat(styles.columnGap) ||
      Number.parseFloat(styles.gap) ||
      16;

    const step =
      firstCard.getBoundingClientRect().width +
      gap;

    const maxScroll =
      container.scrollWidth -
      container.clientWidth;

    const nextLeft =
      container.scrollLeft + step;

    if (
      maxScroll <= 2 ||
      nextLeft >= maxScroll - 2
    ) {
      container.scrollTo({
        left: 0,
        behavior: "smooth",
      });
      return;
    }

    container.scrollBy({
      left: step,
      behavior: "smooth",
    });
  }, [selected.length]);

  useEffect(() => {
    if (selected.length <= 1) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    const interval = window.setInterval(
      scrollNext,
      AUTOPLAY_MS,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [scrollNext, selected.length]);

  if (selected.length === 0) {
    return null;
  }

  return (
    <div
      ref={scrollRef}
      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Sous-catégories"
    >
      {selected.map((category, index) => {
        const href = `${normalizedBasePath}/${category.slug}`;

        return (
          <Link
            key={category.id}
            href={href}
            data-category-card
            className="group relative aspect-square w-[64vw] max-w-[220px] flex-none snap-start overflow-hidden rounded-[12px] border border-black/[0.06] bg-[#151515] shadow-[0_8px_22px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ECAB1C]/35 hover:shadow-[0_12px_28px_rgba(17,17,17,0.10)] sm:w-[210px] lg:w-[230px]"
            aria-label={`Découvrir ${category.name}`}
          >
            {category.imageUrl ? (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                priority={index === 0}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                sizes="(max-width: 639px) 64vw, (max-width: 1023px) 210px, 230px"
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#2E2E2E] to-[#111111]"
                aria-hidden="true"
              />
            )}

            <div
              className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/16 to-black/5 transition-colors duration-300 group-hover:from-black/86"
              aria-hidden="true"
            />

            <span
              className="absolute right-0 top-0 h-[2px] w-10 bg-[#ECAB1C] transition-all duration-300 group-hover:w-16"
              aria-hidden="true"
            />

            <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
              <div className="mb-2 h-[2px] w-5 bg-[#ECAB1C] transition-all duration-300 group-hover:w-8" />

              <div className="flex items-end justify-between gap-3">
                <h3 className="min-w-0 font-body text-[15px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[17px]">
                  {category.name}
                </h3>

                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#ECAB1C] group-hover:bg-[#ECAB1C] group-hover:text-[#0A0A0A]"
                  aria-hidden="true"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
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
          </Link>
        );
      })}
    </div>
  );
}
