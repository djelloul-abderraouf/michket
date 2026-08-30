"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = {
  src: string;
  alt: string;
};

export function CategoryHeroCarousel({ slides }: { slides: Slide[] }) {
  const uniqueSlides = slides.filter(
    (slide, index, all) =>
      slide.src && all.findIndex((item) => item.src === slide.src) === index,
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (uniqueSlides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % uniqueSlides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [uniqueSlides.length]);

  if (uniqueSlides.length === 0) return null;

  return (
    <div className="relative aspect-[16/8.5] overflow-hidden rounded-[14px] border border-[#2A1B16]/[0.08] bg-[#EDE4D9] shadow-[0_16px_38px_rgba(42,27,22,0.09)]">
      {uniqueSlides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="(max-width: 1023px) 100vw, 56vw"
          />
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#21130F]/28 via-transparent to-transparent"
        aria-hidden="true"
      />

      {uniqueSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setActiveIndex(
                (current) =>
                  (current - 1 + uniqueSlides.length) % uniqueSlides.length,
              )
            }
            className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#21130F]/45 text-white backdrop-blur-sm transition-colors hover:bg-[#ECAB1C] hover:text-[#2A1B16] sm:flex"
            aria-label="Image précédente"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((current) => (current + 1) % uniqueSlides.length)
            }
            className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#21130F]/45 text-white backdrop-blur-sm transition-colors hover:bg-[#ECAB1C] hover:text-[#2A1B16] sm:flex"
            aria-label="Image suivante"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#21130F]/40 px-2.5 py-1.5 backdrop-blur-sm">
            {uniqueSlides.map((slide, index) => (
              <button
                key={`${slide.src}-dot`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-5 bg-[#ECAB1C]"
                    : "w-1.5 bg-white/65"
                }`}
                aria-label={`Afficher l'image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
