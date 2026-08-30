import Image from "next/image";
import Link from "next/link";
import { occasions } from "@/data/occasions";

export function OccasionBar() {
  return (
    <section
      className="bg-[#FAF6EE] py-8 sm:py-10 lg:py-12"
      aria-label="Acheter par occasion"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="w-full">
          <div
            className="
              flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3
              sm:gap-4 sm:px-6 lg:gap-5 lg:px-10
              [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            "
          >
            {occasions.map((occasion) => (
              <OccasionCard key={occasion.id} occasion={occasion} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center px-4 sm:mt-6 sm:px-6 lg:px-10">
          <Link
            href="/lampes-3d"
            scroll
            className="
              group inline-flex min-h-11 items-center justify-center gap-2
              border border-[#1A1A1A] px-5 py-2.5 text-[12px] font-semibold
              uppercase tracking-[0.08em] text-[#1A1A1A]
              transition-colors duration-200 hover:border-[#ECAB1C]
              hover:bg-[#ECAB1C] hover:text-[#0A0A0A] sm:px-6
            "
          >
            Voir les collections

            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function OccasionCard({
  occasion,
}: {
  occasion: (typeof occasions)[number];
}) {
  return (
    <Link
      href={occasion.href}
      scroll
      className="
        group relative block w-[42vw] max-w-[168px] flex-none snap-start
        overflow-hidden rounded-[9px] bg-[#EDE7DC]
        sm:w-[30vw] sm:max-w-[210px]
        md:w-[24vw] md:max-w-[230px]
        lg:w-[18vw] lg:max-w-[245px]
        xl:w-[15.5vw] xl:max-w-[255px]
        2xl:w-[14vw] 2xl:max-w-[270px]
      "
      aria-label={`Découvrir ${occasion.label}`}
    >
      <div className="relative aspect-square">
        <Image
          src={occasion.image}
          alt={occasion.label}
          fill
          className="
            object-cover transition-transform duration-500 ease-out
            group-hover:scale-[1.035]
          "
          sizes="
            (max-width: 639px) 42vw,
            (max-width: 767px) 30vw,
            (max-width: 1023px) 24vw,
            (max-width: 1279px) 18vw,
            (max-width: 1535px) 15.5vw,
            14vw
          "
        />

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/5 to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 lg:p-4">
          <div
            className="
              mb-1.5 h-[2px] w-5 bg-[#ECAB1C] transition-all duration-300
              group-hover:w-8 sm:mb-2 sm:w-6 sm:group-hover:w-10
            "
            aria-hidden="true"
          />

          <div className="flex items-end justify-between gap-2">
            <h3
              className="
                min-w-0 font-body text-[13px] font-semibold leading-[1.15]
                tracking-[-0.01em] text-white sm:text-[14px] lg:text-[15px]
              "
            >
              {occasion.label}
            </h3>

            <span
              className="
                hidden h-7 w-7 shrink-0 items-center justify-center rounded-full
                border border-white/25 bg-black/15 text-white transition-colors
                duration-200 group-hover:border-[#ECAB1C]/60
                group-hover:text-[#ECAB1C] sm:flex
              "
              aria-hidden="true"
            >
              <svg
                className="h-3.5 w-3.5"
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
      </div>
    </Link>
  );
}
