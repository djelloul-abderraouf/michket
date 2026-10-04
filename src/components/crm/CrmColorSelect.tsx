"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { neutralTone, personTone, type OptionTone } from "@/lib/crm/option-colors";
import { cx } from "./CrmUi";

export type ColorOption = {
  value: string;
  label: string;
  tone?: OptionTone;
  dotColor?: string;
  disabled?: boolean;
};

function Chip({
  label,
  tone,
  dotColor,
  className,
}: {
  label: string;
  tone: OptionTone;
  dotColor?: string;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex min-w-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold", tone.chip, className)}>
      <span
        className={cx("h-2.5 w-2.5 shrink-0 rounded-full", !dotColor && tone.dot)}
        style={dotColor ? { backgroundColor: dotColor } : undefined}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

export function ColorChip({
  label,
  tone,
  className,
}: {
  label: string;
  tone: OptionTone;
  className?: string;
}) {
  return <Chip label={label} tone={tone} className={className} />;
}

export function PersonChip({ name }: { name: string }) {
  return <Chip label={name} tone={personTone(name)} />;
}

export function CrmColorSelect({
  value,
  options,
  onChange,
  disabled,
  className,
  size = "md",
  ariaLabel,
}: {
  value: string;
  options: ColorOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number; maxHeight: number }>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const tone = selected?.tone || neutralTone;

  function placeMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const margin = 8;
    const preferred = 280;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(preferred, openUp ? spaceAbove : spaceBelow));
    setMenuStyle({
      top: openUp ? rect.top - maxHeight - 4 : rect.bottom + 4,
      left: Math.max(margin, Math.min(rect.left, window.innerWidth - rect.width - margin)),
      width: rect.width,
      maxHeight,
    });
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    placeMenu();
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open]);

  const heights = { sm: "min-h-9", md: "min-h-11" };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-black/15 bg-white px-2.5 text-left outline-none transition hover:border-black/30 focus:border-michket-gold disabled:cursor-not-allowed disabled:opacity-50",
          heights[size],
          className,
        )}
      >
        <Chip label={selected?.label || "Choisir"} tone={tone} dotColor={selected?.dotColor} className="max-w-[calc(100%-1.5rem)]" />
        <ChevronDown className={cx("h-4 w-4 shrink-0 text-black/40 transition", open && "rotate-180")} />
      </button>
      {open && menuStyle && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              style={{
                position: "fixed",
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
                maxHeight: menuStyle.maxHeight,
                zIndex: 80,
              }}
              className="overflow-auto rounded-xl border border-black/10 bg-white p-1.5 shadow-xl"
            >
              {options.map((option) => {
                const active = option.value === value;
                const optionTone = option.tone || neutralTone;
                return (
                  <button
                    key={option.value || "__empty"}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={option.disabled}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (option.disabled) {
                        return;
                      }
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cx(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition",
                      option.disabled ? "cursor-not-allowed opacity-40" : "hover:bg-black/[0.04]",
                      active && "bg-black/[0.03]",
                    )}
                  >
                    <Chip label={option.label} tone={optionTone} dotColor={option.dotColor} />
                    {active ? <Check className="h-4 w-4 shrink-0 text-black/70" /> : <span className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
