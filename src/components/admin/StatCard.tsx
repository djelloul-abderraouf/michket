interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
}

export function StatCard({
  label,
  value,
  description,
  icon,
  trend,
}: StatCardProps) {
  const hasTrend = typeof trend?.value === "number";
  const trendPositive = (trend?.value ?? 0) >= 0;

  return (
    <article className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_8px_28px_rgba(23,23,20,0.035)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(23,23,20,0.065)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-neutral-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-neutral-950">
            {value}
          </p>
        </div>

        {icon ? (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f1efe9] text-neutral-700">
            {icon}
          </div>
        ) : null}
      </div>

      {(description || hasTrend) ? (
        <div className="mt-5 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 border-t border-black/[0.05] pt-4">
          {hasTrend ? (
            <span
              className={[
                "inline-flex items-center gap-1 text-xs font-semibold",
                trendPositive
                  ? "text-emerald-700"
                  : "text-red-700",
              ].join(" ")}
            >
              <svg
                className={[
                  "h-3.5 w-3.5",
                  trendPositive ? "" : "rotate-180",
                ].join(" ")}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3.5 10.5 8 6l4.5 4.5" />
              </svg>

              {trendPositive ? "+" : ""}
              {trend?.value}%
            </span>
          ) : null}

          {trend?.label || description ? (
            <span className="text-xs text-neutral-400">
              {trend?.label || description}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
