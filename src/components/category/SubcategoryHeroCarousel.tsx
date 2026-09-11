"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type HeroImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

export function SubcategoryHeroCarousel({
  images,
  categoryName,
}: {
  images: HeroImage[];
  categoryName: string;
}) {
  const orderedImages = useMemo(
    () =>
      [...images].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    [images],
  );

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (orderedImages.length <= 1) {
      setCurrent(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrent((value) =>
        value + 1 >= orderedImages.length
          ? 0
          : value + 1,
      );
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [orderedImages.length]);

  useEffect(() => {
    if (current >= orderedImages.length) {
      setCurrent(0);
    }
  }, [current, orderedImages.length]);

  if (orderedImages.length === 0) {
    return null;
  }

  function goPrevious() {
    setCurrent((value) =>
      value === 0
        ? orderedImages.length - 1
        : value - 1,
    );
  }

  function goNext() {
    setCurrent((value) =>
      value + 1 >= orderedImages.length
        ? 0
        : value + 1,
    );
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-[1180px] sm:mt-7">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] border border-[#2A1B16]/[0.08] bg-[#EDE3D7] shadow-[0_14px_38px_rgba(42,27,22,0.10)] sm:aspect-[16/7]">
        {orderedImages.map((image, index) => (
          <div
            key={image.id}
            className={[
              "absolute inset-0 transition-opacity duration-700",
              index === current
                ? "z-10 opacity-100"
                : "z-0 opacity-0",
            ].join(" ")}
            aria-hidden={index !== current}
          >
            <Image
              src={image.url}
              alt={
                image.altText?.trim() ||
                `${categoryName} - image ${index + 1}`
              }
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 1180px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#21130F]/20 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
        ))}

        {orderedImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/88 text-[#2A1B16] shadow-sm backdrop-blur-sm transition hover:bg-white sm:left-4 sm:h-10 sm:w-10"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15 18-6-6 6-6"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/88 text-[#2A1B16] shadow-sm backdrop-blur-sm transition hover:bg-white sm:right-4 sm:h-10 sm:w-10"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 18 6-6-6-6"
                />
              </svg>
            </button>

            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#21130F]/35 px-2.5 py-2 backdrop-blur-sm sm:bottom-4">
              {orderedImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`Afficher l'image ${index + 1}`}
                  aria-current={
                    index === current ? "true" : undefined
                  }
                  className={[
                    "h-1.5 rounded-full transition-all",
                    index === current
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/55 hover:bg-white/80",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
