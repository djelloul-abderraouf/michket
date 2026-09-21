"use client";

import { getImageProps } from "next/image";
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
const TRANSITION_MS = 700;
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

function getResponsiveImageProps(src: string, alt: string) {
  return getImageProps({
    src,
    alt,
    fill: true,
    sizes: "100vw",
    quality: 80,
  }).props;
}

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(
    null,
  );
  const [touchStart, setTouchStart] = useState<number | null>(
    null,
  );

  const autoplayRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const transitionRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = heroSlides.length;

  /* ───────────────────────── Carousel navigation ───────────────────────── */

  const activateSlide = useCallback(
    (index: number) => {
      if (total === 0) return;

      const normalized =
        ((index % total) + total) % total;

      if (normalized === current) {
        return;
      }

      if (transitionRef.current) {
        clearTimeout(transitionRef.current);
      }

      setPrevious(current);
      setCurrent(normalized);

      transitionRef.current = setTimeout(() => {
        setPrevious(null);
        transitionRef.current = null;
      }, TRANSITION_MS);
    },
    [current, total],
  );

  const goTo = useCallback(
    (index: number) => {
      activateSlide(index);
    },
    [activateSlide],
  );

  const next = useCallback(() => {
    if (total <= 1) return;

    activateSlide(current + 1);
  }, [activateSlide, current, total]);

  const prev = useCallback(() => {
    if (total <= 1) return;

    activateSlide(current - 1);
  }, [activateSlide, current, total]);

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

  useEffect(() => {
    return () => {
      if (transitionRef.current) {
        clearTimeout(transitionRef.current);
        transitionRef.current = null;
      }
    };
  }, []);

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

  return (
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
          const leaving = index === previous;

          /*
           * Important pour les performances :
           * seules la slide active et, pendant 700 ms, l'ancienne slide
           * restent dans le DOM. Les autres images ne sont donc pas
           * découvertes/téléchargées pendant le chargement initial.
           */
          if (!active && !leaving) {
            return null;
          }

          const mobileSource =
            slide.mobileSrc ?? slide.desktopSrc;

          const mobileAvif = changeImageFormat(
            mobileSource,
            "avif",
          );

          const desktopAvif = changeImageFormat(
            slide.desktopSrc,
            "avif",
          );

          const mobilePlaceholder =
            getHeroPlaceholder(mobileSource);

          const desktopPlaceholder =
            getHeroPlaceholder(slide.desktopSrc);

          const mobileImageProps =
            getResponsiveImageProps(
              mobileAvif,
              slide.alt,
            );

          const desktopImageProps =
            getResponsiveImageProps(
              desktopAvif,
              slide.alt,
            );

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
              {/* Placeholder mobile */}
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

              {/*
               * Les srcSet ci-dessous sont générés par Next.js.
               * Le navigateur peut donc choisir une largeur adaptée
               * à l'écran au lieu de télécharger systématiquement
               * l'AVIF mobile 941 px de large.
               */}
              <picture className="relative block h-full w-full">
                <source
                  media={MOBILE_BREAKPOINT}
                  srcSet={mobileImageProps.srcSet}
                  sizes={mobileImageProps.sizes}
                />

                <source
                  media={DESKTOP_BREAKPOINT}
                  srcSet={desktopImageProps.srcSet}
                  sizes={desktopImageProps.sizes}
                />

                <img
                  src={desktopImageProps.src}
                  srcSet={desktopImageProps.srcSet}
                  sizes={desktopImageProps.sizes}
                  alt={slide.alt}
                  loading="eager"
                  fetchPriority={active ? "high" : "low"}
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
  );
}
