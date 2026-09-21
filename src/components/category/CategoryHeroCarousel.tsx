"use client";

import { getImageProps } from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ApiCategoryImage } from "@/lib/api";

const AUTOPLAY_MS = 3000;
const MOBILE_BREAKPOINT = "(max-width: 767px)";
const SWIPE_THRESHOLD = 50;

type CategoryHeroCarouselProps = {
  images: ApiCategoryImage[];
  categoryName: string;
};

export function CategoryHeroCarousel({
  images,
  categoryName,
}: CategoryHeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = useMemo(
    () =>
      images
        .filter((image) => Boolean(image.url))
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder ||
            a.createdAt.localeCompare(b.createdAt),
        ),
    [images],
  );

  const total = slides.length;

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

    setCurrent((previous) => (previous - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (current < total) return;
    setCurrent(0);
  }, [current, total]);

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

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    setTouchStart(event.touches[0]?.clientX ?? null);
  }, []);

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
      className="relative isolate h-[calc(100dvh-163px)] w-full overflow-hidden bg-michket-black md:aspect-[21/9] md:h-auto"
      data-category-hero-carousel
      aria-label={`Carrousel ${categoryName}`}
      role="region"
    >
      <div
        className="relative h-full w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {slides.map((slide, index) => {
          const active = index === current;
          const isFirstSlide = index === 0;
          const alt = slide.altText ?? categoryName;

          const sharedImageOptions = {
            alt,
            fill: true,
            sizes: "100vw",
            loading: isFirstSlide ? ("eager" as const) : ("lazy" as const),
            fetchPriority: isFirstSlide ? ("high" as const) : ("low" as const),
          };

          const { props: desktopImageProps } = getImageProps({
            ...sharedImageOptions,
            src: slide.url,
          });

          const mobileImageProps = slide.mobileUrl
            ? getImageProps({
                ...sharedImageOptions,
                src: slide.mobileUrl,
              }).props
            : null;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                active
                  ? "z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
              aria-hidden={!active}
            >
              <picture>
                {mobileImageProps?.srcSet && (
                  <source
                    media={MOBILE_BREAKPOINT}
                    srcSet={mobileImageProps.srcSet}
                    sizes={mobileImageProps.sizes ?? "100vw"}
                  />
                )}

                <img
                  {...desktopImageProps}
                  alt={alt}
                  className="object-cover object-top md:object-center"
                />
              </picture>
            </div>
          );
        })}

        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, index) => {
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
                  aria-label={`Aller à la diapositive ${index + 1}: ${
                    slide.altText ?? categoryName
                  }`}
                  aria-current={active ? "true" : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
