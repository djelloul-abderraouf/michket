"use client";

import Image from "next/image";
import { useState } from "react";

const BEFORE_IMAGE = "/images/avant-apres/avant.png";
const AFTER_IMAGE = "/images/avant-apres/apres.png";

export function BeforeAfterSection() {
  const [position, setPosition] = useState(50);

  return (
    <section
      className="relative overflow-hidden bg-[#FAF6EE] pt-3 pb-10 sm:pt-4 sm:pb-12 lg:pt-5 lg:pb-16"
      aria-labelledby="before-after-heading"
    >
      {/* Subtle depth, only in Michket neutrals + #ECAB1C */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 14% 18%, rgba(236,171,28,0.055), transparent 26%), radial-gradient(circle at 90% 82%, rgba(10,10,10,0.035), transparent 28%), linear-gradient(180deg, #FAF6EE 0%, #F7F2E9 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="overflow-hidden rounded-[12px] border border-black/[0.07] bg-white shadow-[0_18px_50px_rgba(20,16,12,0.08)]">
          <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
            {/* ───────────────── Before / After visual ───────────────── */}
            <div className="relative min-h-[360px] sm:min-h-[500px] lg:min-h-[610px]">
              {/* BEFORE = base image */}
              <Image
                src={BEFORE_IMAGE}
                alt="Avant transformation Michket"
                fill
                priority={false}
                className="select-none object-cover"
                sizes="(max-width: 1023px) 100vw, 68vw"
                draggable={false}
              />

              {/* AFTER = clipped from slider position to the right */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: `inset(0 0 0 ${position}%)`,
                }}
                aria-hidden="true"
              >
                <Image
                  src={AFTER_IMAGE}
                  alt=""
                  fill
                  className="select-none object-cover"
                  sizes="(max-width: 1023px) 100vw, 68vw"
                  draggable={false}
                />
              </div>

              {/* Gentle contrast so labels stay readable */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent"
                aria-hidden="true"
              />

              {/* Vertical divider */}
              <div
                className="pointer-events-none absolute inset-y-0 z-20 w-[2px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
                style={{ left: `${position}%` }}
                aria-hidden="true"
              />

              {/* Drag handle */}
              <div
                className="pointer-events-none absolute top-1/2 z-30 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#161616] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-transform sm:h-12 sm:w-12"
                style={{ left: `${position}%` }}
                aria-hidden="true"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7l-5 5 5 5M16 7l5 5-5 5"
                  />
                </svg>
              </div>

              {/* Native range = accessible + mouse/touch drag */}
              <input
                type="range"
                min="8"
                max="92"
                value={position}
                onChange={(event) => setPosition(Number(event.target.value))}
                className="absolute inset-0 z-40 h-full w-full cursor-ew-resize opacity-0"
                aria-label="Comparer la photo avant et la photo après"
                aria-valuetext={`${position}% avant-après`}
              />

              {/* Labels */}
              <div className="pointer-events-none absolute bottom-4 left-4 z-30 sm:bottom-6 sm:left-6">
                <span className="inline-flex bg-black/58 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:text-xs">
                  Avant
                </span>
              </div>

              <div className="pointer-events-none absolute bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">
                <span className="inline-flex bg-[#ECAB1C] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A] sm:text-xs">
                  Après
                </span>
              </div>

              {/* Mobile helper */}
              <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 lg:hidden">
                <span className="whitespace-nowrap rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-black/55 shadow-sm backdrop-blur-sm">
                  Faites glisser
                </span>
              </div>
            </div>

            {/* ───────────────── Brand copy ───────────────── */}
            <div className="flex items-center bg-white px-6 py-9 sm:px-10 sm:py-11 lg:px-12 lg:py-14 xl:px-14">
              <div className="mx-auto w-full max-w-md text-center lg:text-left">
                <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
                  <span className="h-px w-8 bg-[#ECAB1C]" aria-hidden="true" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A6A20] sm:text-[11px]">
                    Avant / Après
                  </span>
                </div>

                <h2
                  id="before-after-heading"
                  className="font-body text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#111111] sm:text-[38px] lg:text-[42px]"
                >
                  Voyez la différence
                </h2>

                <p className="mt-4 text-[14px] leading-7 text-black/58">
                  Une création Michket peut changer toute l’atmosphère d’un
                  espace. Faites glisser le curseur et découvrez la
                  transformation en un seul geste.
                </p>

                <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/40 lg:justify-start">
                  <svg
                    className="h-4 w-4 text-[#ECAB1C]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7l-5 5 5 5M16 7l5 5-5 5"
                    />
                  </svg>
                  Faites glisser pour comparer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
