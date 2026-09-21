"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { heroSlides } from "@/data/hero-slides";
import { heroPlaceholders } from "@/data/hero-placeholders";

const AUTOPLAY_MS = 3000;
const MOBILE_BREAKPOINT = "(max-width: 767px)";
const DESKTOP_BREAKPOINT = "(min-width: 768px)";
const SWIPE_THRESHOLD = 50;

function changeImageFormat(
  src: string,
  format: "avif" | "webp",
): string {
  return src.replace(/\.[^.]+$/, `.${format}`);
}

function getHeroPlaceholder(src: string): string | undefined {
  const fileName = src.split("/").pop();

  if (!fileName) {
    return undefined;
  }

  const key = fileName.replace(
    /\.[^.]+$/,
    "",
  ) as keyof typeof heroPlaceholders;

  return heroPlaceholders[key];
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = heroSlides.length;

  /* ───────────────────────── Carousel navigation ───────────────────────── */

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;

      setCurrent(((index % total) + total) % total);
    },
    [total],
  );

  const next = useCallback(() => {
    if (total <= 1) return;

    setCurrent((previous) => (previous + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total <= 1) return;

    setCurrent(
      (previous) => (previous - 1 + total) % total,
    );
  }, [total]);

  /* ───────────────────────────── Autoplay ───────────────────────────── */

  useEffect(() => {
    if (total <= 1) return;

    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
    }

    autoplayRef.current = setTimeout(() => {
      next();
    }, AUTOPLAY_MS);

    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current);
        autoplayRef.current = null;
      }
    };
  }, [current, next, total]);

  /* ───────────────────────────── Touch swipe ─────────────────────────── */

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      setTouchStart(event.touches[0]?.clientX ?? null);
    },
    [],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (touchStart === null) return;

      const endX = event.changedTouches[0]?.clientX;

      if (typeof endX !== "number") {
        setTouchStart(null);
        return;
      }

      const distance = touchStart - endX;

      if (Math.abs(distance) >= SWIPE_THRESHOLD) {
        if (distance > 0) {
          next();
        } else {
          prev();
        }
      }

      setTouchStart(null);
    },
    [next, prev, touchStart],
  );

  if (total === 0) {
    return null;
  }

  const firstSlide = heroSlides[0]!;

  const firstMobileSource =
    firstSlide.mobileSrc ?? firstSlide.desktopSrc;

  const firstMobileAvif = changeImageFormat(
    firstMobileSource,
    "avif",
  );

  const firstDesktopAvif = changeImageFormat(
    firstSlide.desktopSrc,
    "avif",
  );

  return (
    <>
      {/* Priorité maximale à l'image LCP réellement visible */}
      <link
        rel="preload"
        as="image"
        href={firstMobileAvif}
        type="image/avif"
        media={MOBILE_BREAKPOINT}
        fetchPriority="high"
      />

      <link
        rel="preload"
        as="image"
        href={firstDesktopAvif}
        type="image/avif"
        media={DESKTOP_BREAKPOINT}
        fetchPriority="high"
      />

      <section
        className="
          relative isolate h-[calc(100dvh-163px)] w-full
          overflow-hidden bg-michket-black
          md:aspect-[21/9] md:h-auto
        "
        data-hero-carousel
        aria-label="Carrousel promotionnel"
        role="region"
      >
        <div
          className="relative h-full w-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            touchAction: "pan-y pinch-zoom",
          }}
        >
          {heroSlides.map((slide, index) => {
            const active = index === current;
            const isFirstSlide = index === 0;

            const mobileSource =
              slide.mobileSrc ?? slide.desktopSrc;

            const mobileAvif = changeImageFormat(
              mobileSource,
              "avif",
            );

            const mobileWebp = changeImageFormat(
              mobileSource,
              "webp",
            );

            const desktopAvif = changeImageFormat(
              slide.desktopSrc,
              "avif",
            );

            const desktopWebp = changeImageFormat(
              slide.desktopSrc,
              "webp",
            );

            const mobilePlaceholder =
              getHeroPlaceholder(mobileSource);

            const desktopPlaceholder =
              getHeroPlaceholder(slide.desktopSrc);

            return (
              <Link
                key={slide.id}
                href={slide.href}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  active
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
                aria-label={slide.ariaLabel}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
              >
                {/* Placeholder mobile :
                    visible immédiatement avant l'image finale */}
                <div
                  aria-hidden="true"
                  className="
                    absolute -inset-3
                    scale-105 bg-cover bg-no-repeat
                    blur-xl md:hidden
                  "
                  style={{
                    backgroundImage: mobilePlaceholder
                      ? `url("${mobilePlaceholder}")`
                      : undefined,
                    backgroundPosition:
                      slide.mobileObjectPosition ??
                      "center top",
                  }}
                />

                {/* Placeholder desktop */}
                <div
                  aria-hidden="true"
                  className="
                    absolute -inset-3 hidden
                    scale-105 bg-cover bg-center bg-no-repeat
                    blur-xl md:block
                  "
                  style={{
                    backgroundImage: desktopPlaceholder
                      ? `url("${desktopPlaceholder}")`
                      : undefined,
                  }}
                />

                {/* Image finale */}
                <picture className="relative block h-full w-full">
                  <source
                    media={MOBILE_BREAKPOINT}
                    type="image/avif"
                    srcSet={mobileAvif}
                  />

                  <source
                    media={MOBILE_BREAKPOINT}
                    type="image/webp"
                    srcSet={mobileWebp}
                  />

                  <source
                    media={DESKTOP_BREAKPOINT}
                    type="image/avif"
                    srcSet={desktopAvif}
                  />

                  <source
                    media={DESKTOP_BREAKPOINT}
                    type="image/webp"
                    srcSet={desktopWebp}
                  />

                  <img
                    src={desktopWebp}
                    alt={slide.alt}
                    width={1916}
                    height={821}
                    loading={
                      isFirstSlide ? "eager" : "lazy"
                    }
                    fetchPriority={
                      isFirstSlide ? "high" : "low"
                    }
                    decoding="async"
                    draggable={false}
                    className="
                      relative h-full w-full object-cover
                      [object-position:var(--hero-mobile-object-position)]
                      md:object-center
                    "
                    style={
                      {
                        "--hero-mobile-object-position":
                          slide.mobileObjectPosition ??
                          "center top",
                      } as React.CSSProperties
                    }
                  />
                </picture>
              </Link>
            );
          })}

          {/* Pagination */}
          {total > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {heroSlides.map((slide, index) => {
                const active = index === current;

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      goTo(index);
                    }}
                    className={`h-2.5 rounded-full transition-all ${
                      active
                        ? "w-7 bg-michket-gold"
                        : "w-2.5 bg-white/55 hover:bg-white/85"
                    }`}
                    aria-label={`Aller à la diapositive ${
                      index + 1
                    }: ${slide.alt}`}
                    aria-current={
                      active ? "true" : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}