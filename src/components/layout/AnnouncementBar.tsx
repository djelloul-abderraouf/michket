"use client";

import { useEffect, useMemo, useState } from "react";

/* ───────────────────────── Campaign ───────────────────────── */

const CAMPAIGN_END = new Date("2026-09-15T23:59:59");

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, CAMPAIGN_END.getTime() - Date.now());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function format(value: number | null) {
  if (value === null) return "--";
  return String(value).padStart(2, "0");
}

/* ───────────────────────── Timer ───────────────────────── */

function TimerUnit({
  value,
  label,
  compact = false,
}: {
  value: number | null;
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex min-w-[42px] flex-col items-center"
          : "flex min-w-[54px] flex-col items-center"
      }
    >
      <span
        className={
          compact
            ? "text-[20px] font-semibold leading-none tracking-[-0.025em] text-white"
            : "text-[24px] font-semibold leading-none tracking-[-0.03em] text-white lg:text-[26px]"
        }
        style={{
          fontVariantNumeric: "tabular-nums",
          fontFamily: "var(--font-body)",
        }}
      >
        {format(value)}
      </span>

      <span
        className={
          compact
            ? "mt-1.5 text-[7px] font-medium uppercase tracking-[0.15em] text-white/35"
            : "mt-1.5 text-[8px] font-medium uppercase tracking-[0.17em] text-white/35 lg:text-[9px]"
        }
      >
        {label}
      </span>
    </div>
  );
}

function Separator({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={
        compact
          ? "-mt-[14px] text-[15px] font-medium leading-none text-[#ECAB1C]/75"
          : "-mt-[16px] text-[17px] font-medium leading-none text-[#ECAB1C]/75"
      }
      aria-hidden="true"
    >
      :
    </span>
  );
}

/* ───────────────────────── Announcement bar ───────────────────────── */

export function AnnouncementBar() {
  /*
   * IMPORTANT — hydration-safe:
   * We do NOT call Date.now() during the initial render.
   *
   * Client Components are still pre-rendered by Next.js on the server.
   * If the server calculates one second and the browser calculates another,
   * React sees different HTML and throws a hydration error.
   *
   * null renders "--" identically on the server and on the browser's
   * very first render. The real countdown starts only after mount.
   */
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const update = () => {
      setTime(getTimeLeft());
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const accessibleCountdown = useMemo(() => {
    if (!time) return "Chargement du compte à rebours";

    return `${time.days} jours, ${time.hours} heures, ${time.minutes} minutes et ${time.seconds} secondes`;
  }, [time]);

  return (
    <div className="relative w-full overflow-hidden bg-[#2A1B16] text-white">
      {/* Ligne Michket très discrète */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ECAB1C]/45 to-transparent"
        aria-hidden="true"
      />

      {/* ───────────────── Desktop / tablette ───────────────── */}
      <div className="relative hidden h-[68px] items-center justify-center px-5 sm:flex lg:h-[72px] lg:px-8">
        <div className="flex w-full max-w-[1100px] items-center justify-center gap-7 lg:gap-9">
          {/* Offre */}
          <div className="flex items-center gap-3 whitespace-nowrap">
            <span
              className="h-2 w-2 rounded-full bg-[#ECAB1C]"
              aria-hidden="true"
            />

            <p className="text-[13px] font-medium tracking-[0.01em] text-white/80 lg:text-sm">
              Offre de rentrée
              <span className="mx-2 text-white/20" aria-hidden="true">
                —
              </span>
              <strong className="font-semibold text-[#ECAB1C]">
                jusqu&apos;à 40% de réduction
              </strong>
            </p>
          </div>

          {/* Séparateur */}
          <div className="h-8 w-px bg-white/10" aria-hidden="true" />

          {/* Compte à rebours */}
          <div
            className="flex items-center gap-2.5 lg:gap-3"
            aria-label={`Fin de l'offre dans ${accessibleCountdown}`}
          >
            <TimerUnit value={time?.days ?? null} label="Jours" />
            <Separator />
            <TimerUnit value={time?.hours ?? null} label="Heures" />
            <Separator />
            <TimerUnit value={time?.minutes ?? null} label="Minutes" />
            <Separator />
            <TimerUnit value={time?.seconds ?? null} label="Secondes" />
          </div>
        </div>
      </div>

      {/* ───────────────── Mobile ───────────────── */}
      <div className="relative flex h-[99px] flex-col items-center justify-center px-3 sm:hidden">
        {/* Offre */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#ECAB1C]"
            aria-hidden="true"
          />

          <p className="text-center text-[10.5px] font-medium leading-none tracking-[0.01em] text-white/75">
            Offre de rentrée
            <span className="mx-1.5 text-white/20" aria-hidden="true">
              —
            </span>
            <strong className="font-semibold text-[#ECAB1C]">
              -40% sur tout le site
            </strong>
          </p>
        </div>

        {/* Compte à rebours */}
        <div
          className="flex items-center justify-center gap-[7px]"
          aria-label={`Fin de l'offre dans ${accessibleCountdown}`}
        >
          <TimerUnit value={time?.days ?? null} label="Jours" compact />
          <Separator compact />
          <TimerUnit value={time?.hours ?? null} label="Heures" compact />
          <Separator compact />
          <TimerUnit value={time?.minutes ?? null} label="Min" compact />
          <Separator compact />
          <TimerUnit value={time?.seconds ?? null} label="Sec" compact />
        </div>
      </div>
    </div>
  );
}
