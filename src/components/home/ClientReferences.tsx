"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

type ClientReference = {
  id: string;
  name: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

function repeatReferences(
  references: ClientReference[],
): ClientReference[] {
  if (references.length === 0) {
    return [];
  }

  let repeatCount = 1;

  if (references.length === 1) {
    repeatCount = 6;
  } else if (references.length === 2) {
    repeatCount = 4;
  } else if (references.length === 3) {
    repeatCount = 3;
  } else if (references.length <= 5) {
    repeatCount = 2;
  }

  return Array.from(
    { length: repeatCount },
    () => references,
  ).flat();
}

export function ClientReferences() {
  const [references, setReferences] =
    useState<ClientReference[]>([]);
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadReferences() {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/references`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (!cancelled) {
            setIsLoading(false);
          }
          return;
        }

        const payload =
          (await response.json()) as ClientReference[];

        if (cancelled) {
          return;
        }

        const validReferences = Array.isArray(payload)
          ? payload
              .filter(
                (reference) =>
                  reference &&
                  typeof reference.id === "string" &&
                  typeof reference.name === "string" &&
                  typeof reference.imageUrl === "string" &&
                  reference.imageUrl.trim().length > 0,
              )
              .sort(
                (a, b) =>
                  a.sortOrder - b.sortOrder ||
                  a.name.localeCompare(
                    b.name,
                    "fr",
                  ),
              )
          : [];

        setReferences(validReferences);
      } catch {
        // The references section is non-critical.
        // If the public API is temporarily unavailable,
        // keep the rest of the homepage fully usable.
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadReferences();

    return () => {
      cancelled = true;
    };
  }, []);

  const marqueeItems = useMemo(
    () => repeatReferences(references),
    [references],
  );

  if (isLoading) {
    return (
      <section
        className="bg-[#f7f3eb] py-10 sm:py-12 lg:py-14"
        aria-label="Chargement de nos références"
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-7 max-w-2xl text-center">
            <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-black/[0.06]" />
            <div className="mx-auto mt-4 h-8 w-48 animate-pulse rounded-lg bg-black/[0.06]" />
          </div>

          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-24 w-40 shrink-0 animate-pulse rounded-2xl border border-black/[0.05] bg-white/70 sm:h-28 sm:w-48"
                />
              ),
            )}
          </div>
        </div>
      </section>
    );
  }

  if (marqueeItems.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden bg-[#f7f3eb] py-10 sm:py-12 lg:py-14"
      aria-labelledby="client-references-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3A2922]/15 to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-[#ECAB1C]/[0.07] blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[1440px]">
        <div className="mx-auto mb-7 max-w-2xl px-4 text-center sm:mb-8 sm:px-6 lg:px-10">
          <div className="mb-3 flex items-center justify-center gap-3">
            <span
              className="h-px w-7 bg-[#ECAB1C]"
              aria-hidden="true"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A6B0B] sm:text-[11px]">
              Ils nous ont fait confiance
            </span>
            <span
              className="h-px w-7 bg-[#ECAB1C]"
              aria-hidden="true"
            />
          </div>

          <h2
            id="client-references-title"
            className="font-body text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#2A1B16] sm:text-[32px] lg:text-[36px]"
          >
            Nos références
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[12px] leading-6 text-[#6f625c] sm:text-[13px]">
            Entreprises, organismes et partenaires qui ont choisi Michket pour leurs créations.
          </p>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#f7f3eb] to-transparent sm:w-20 lg:w-28"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#f7f3eb] to-transparent sm:w-20 lg:w-28"
          />

          <div className="references-marquee overflow-hidden">
            <div className="references-marquee-track flex w-max items-stretch">
              <div className="flex shrink-0 items-stretch gap-3 pr-3 sm:gap-4 sm:pr-4 lg:gap-5 lg:pr-5">
                {marqueeItems.map(
                  (reference, index) => (
                    <ReferenceCard
                      key={`first-${reference.id}-${index}`}
                      reference={reference}
                    />
                  ),
                )}
              </div>

              <div
                aria-hidden="true"
                className="flex shrink-0 items-stretch gap-3 pr-3 sm:gap-4 sm:pr-4 lg:gap-5 lg:pr-5"
              >
                {marqueeItems.map(
                  (reference, index) => (
                    <ReferenceCard
                      key={`second-${reference.id}-${index}`}
                      reference={reference}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes michket-references-marquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .references-marquee-track {
          animation: michket-references-marquee 32s linear infinite;
          will-change: transform;
        }

        .references-marquee:hover .references-marquee-track {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .references-marquee-track {
            animation-duration: 24s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .references-marquee {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .references-marquee::-webkit-scrollbar {
            display: none;
          }

          .references-marquee-track {
            animation: none;
            transform: none;
          }

          .references-marquee-track > div[aria-hidden="true"] {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

function ReferenceCard({
  reference,
}: {
  reference: ClientReference;
}) {
  return (
    <article className="group flex h-24 w-40 shrink-0 items-center justify-center rounded-2xl border border-[#3A2922]/[0.08] bg-white/80 p-4 shadow-[0_8px_24px_rgba(58,41,34,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-[#ECAB1C]/25 hover:bg-white hover:shadow-[0_12px_30px_rgba(58,41,34,0.08)] sm:h-28 sm:w-48 sm:p-5 lg:h-32 lg:w-56 lg:p-6">
      <img
        src={reference.imageUrl}
        alt={
          reference.altText?.trim() ||
          `Logo ${reference.name}`
        }
        loading="lazy"
        decoding="async"
        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.025]"
      />
    </article>
  );
}
