"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type FilterOption = {
  id: string;
  label: string;
};

type LampesFilterDropdownProps = {
  selectedCategory?: string;
  selectedCategoryLabel: string;
  options: readonly FilterOption[];
};

function hrefFor(category?: string) {
  return category
    ? `/lampes-3d?categorie=${category}#produits`
    : "/lampes-3d#produits";
}

export function LampesFilterDropdown({
  selectedCategory,
  selectedCategoryLabel,
  options,
}: LampesFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (!target || rootRef.current?.contains(target)) return;

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.09em] text-[#2A1B16] sm:text-[10px]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <svg
          className="h-3.5 w-3.5 text-[#8A6A20]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.7}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 5.25h16.5M6.75 12h10.5M9.75 18.75h4.5"
          />
        </svg>

        <span className="sm:hidden">Filtrer</span>
        <span className="hidden sm:inline">
          Filtrer : {selectedCategoryLabel}
        </span>

        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 9l6 6 6-6"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+12px)] z-30 w-[220px] overflow-hidden rounded-[10px] border border-[#2A1B16]/10 bg-[#FFFDFC] p-1.5 shadow-[0_18px_45px_rgba(42,27,22,0.14)]"
          role="menu"
        >
          <Link
            href={hrefFor()}
            onClick={() => setOpen(false)}
            className={`flex min-h-9 items-center justify-between rounded-[7px] px-3 text-[11px] transition-colors ${
              !selectedCategory
                ? "bg-[#2A1B16] font-semibold text-white"
                : "text-[#2A1B16]/65 hover:bg-[#F5EEE5] hover:text-[#2A1B16]"
            }`}
            role="menuitem"
          >
            Toutes les lampes
            {!selectedCategory && (
              <span className="text-[#ECAB1C]" aria-hidden="true">
                ✓
              </span>
            )}
          </Link>

          {options.map((item) => {
            const selected = selectedCategory === item.id;

            return (
              <Link
                key={item.id}
                href={hrefFor(item.id)}
                onClick={() => setOpen(false)}
                className={`flex min-h-9 items-center justify-between rounded-[7px] px-3 text-[11px] transition-colors ${
                  selected
                    ? "bg-[#2A1B16] font-semibold text-white"
                    : "text-[#2A1B16]/65 hover:bg-[#F5EEE5] hover:text-[#2A1B16]"
                }`}
                role="menuitem"
              >
                {item.label}
                {selected && (
                  <span className="text-[#ECAB1C]" aria-hidden="true">
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
