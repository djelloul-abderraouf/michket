"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { heroSlides } from "@/data/hero-slides";

const AUTOPLAY_MS = 3000;
const MOBILE_BREAKPOINT = "(max-width: 767px)";
const SWIPE_THRESHOLD = 50;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [initialChromeHeight, setInitialChromeHeight] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measureRafRef = useRef<number | null>(null);

  const total = heroSlides.length;

  /* ─────────────────────── Mobile viewport detection ─────────────────────── */

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

    const sync = () => {
      setIsMobile(mediaQuery.matches);
    };

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, []);

  /* ───────────────────── First-screen chrome measurement ─────────────────── */

  useEffect(() => {
    if (!isMobile) {
      setInitialChromeHeight(0);
      return;
    }

    const header = document.querySelector("header") as HTMLElement | null;
    const promoWrapper = header?.previousElementSibling as HTMLElement | null;

    if (!header || !promoWrapper) {
      return;
    }

    const measure = () => {
      if (window.scrollY > 5) return;

      const promoHeight = promoWrapper.getBoundingClientRect().height;
      const navbarHeight = header.getBoundingClientRect().height;
      const nextHeight = Math.round(promoHeight + navbarHeight);

      if (nextHeight > 0) {
        setInitialChromeHeight(nextHeight);
      }
    };

    const scheduleMeasure = () => {
      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current);
      }

      measureRafRef.current = requestAnimationFrame(() => {
        measure();
        measureRafRef.current = null;
      });
    };

    scheduleMeasure();

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(header);
    resizeObserver.observe(promoWrapper);

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);

      if (measureRafRef.current !== null) {
        cancelAnimationFrame(measureRafRef.current);
      }
    };
  }, [isMobile]);

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
    setCurrent((previous) => (previous - 1 + total) % total);
  }, [total]);

  /* ───────────────────────────── Autoplay ───────────────────────────── */

  /*
   * IMPORTANT:
   * We intentionally DO NOT pause autoplay on mouse hover.
   *
   * The previous version had:
   *   onMouseEnter={() => setPaused(true)}
   *
   * On desktop, if the visitor's cursor was already over the hero, the
   * carousel stayed paused and looked broken.
   *
   * A fresh 3-second timeout is started after every slide change.
   * This also means a manual pagination click or mobile swipe naturally
   * restarts the 3-second countdown before autoplay continues.
   */
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

  /* ─────────────────────────── Mobile hero sizing ─────────────────────── */

  const mobileHeroStyle =
    isMobile && initialChromeHeight > 0
      ? {
          height: `calc(100dvh - ${initialChromeHeight}px)`,
          minHeight: "0px",
        }
      : undefined;

  if (total === 0) {
    return null;
  }

  return (
    <section
      className="relative isolate w-full bg-michket-black"
      style={mobileHeroStyle}
      data-hero-carousel
      aria-label="Carrousel promotionnel"
      role="region"
    >
      {/* ── Slides viewport ── */}
      <div
        className={`relative w-full overflow-hidden ${
          isMobile ? "h-full" : "aspect-[21/9]"
        }`}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        style={isMobile ? { touchAction: "pan-y pinch-zoom" } : undefined}
      >
        {heroSlides.map((slide, index) => {
          const active = index === current;
          const source =
            isMobile && slide.mobileSrc
              ? slide.mobileSrc
              : slide.desktopSrc;

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
              <Image
                src={source}
                alt={slide.alt}
                fill
                className="object-cover"
                style={
                  isMobile
                    ? {
                        objectPosition:
                          slide.mobileObjectPosition ?? "center top",
                      }
                    : {
                        objectPosition: "center center",
                      }
                }
                sizes="100vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </Link>
          );
        })}

        {/* Pagination dots */}
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
                  aria-label={`Aller à la diapositive ${index + 1}: ${slide.alt}`}
                  aria-current={active ? "true" : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* No left/right arrows:
          desktop = autoplay every 3s
          mobile = autoplay every 3s + finger swipe */}
    </section>
  );
}
