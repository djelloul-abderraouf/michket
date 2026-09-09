interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-black/[0.06] pb-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Administration
        </p>

        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-[28px]">
          {title}
        </h1>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="flex w-full shrink-0 items-center sm:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
