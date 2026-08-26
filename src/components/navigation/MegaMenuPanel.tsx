"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { NavItemWithMega } from "@/data/navigation";

interface MegaMenuPanelProps {
  item: NavItemWithMega;
  onClose: () => void;
  onPanelEnter: () => void;
  onPanelLeave: () => void;
  headerRef: React.RefObject<HTMLElement | null>;
}

export function MegaMenuPanel({
  item,
  onClose,
  onPanelEnter,
  onPanelLeave,
  headerRef,
}: MegaMenuPanelProps) {
  const [top, setTop] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updatePosition = () => {
      if (!headerRef.current) return;

      const rect = headerRef.current.getBoundingClientRect();
      setTop(Math.round(rect.bottom));
    };

    updatePosition();

    const handlePositionChange = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    window.addEventListener("scroll", handlePositionChange, {
      passive: true,
    });
    window.addEventListener("resize", handlePositionChange);

    return () => {
      window.removeEventListener("scroll", handlePositionChange);
      window.removeEventListener("resize", handlePositionChange);
      cancelAnimationFrame(rafRef.current);
    };
  }, [headerRef]);

  if (!item.mega) return null;

  const categories = item.mega.categories ?? [];

  return (
    <div
      className="
        fixed left-0 right-0
        z-40
        bg-white
        border-t border-black/5
        shadow-[0_16px_35px_rgba(0,0,0,0.08)]
      "
      style={{ top }}
      role="menu"
      aria-label={`Sous-menu ${item.label}`}
      onMouseEnter={onPanelEnter}
      onMouseLeave={onPanelLeave}
    >
      <div className="w-full px-8 xl:px-12 2xl:px-16 py-7">
        {categories.length > 0 ? (
          <div
            className="
              grid
              grid-cols-6
              xl:grid-cols-8
              2xl:grid-cols-9
              gap-x-5
              gap-y-7
              items-start
            "
          >
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                role="menuitem"
                onClick={onClose}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    onClose();
                  }
                }}
                className="
                  group
                  block
                  min-w-0
                  text-center
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-michket-gold
                  focus-visible:ring-offset-2
                "
              >
                {/* IMPORTANT:
                    relative is mandatory because Next/Image uses fill
                */}
                <div
                  className="
                    relative
                    w-full
                    aspect-square
                    overflow-hidden
                    rounded-[8px]
                    bg-[#f7f5f1]
                  "
                >
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="
                      object-cover
                      transition-transform
                      duration-300
                      ease-out
                      group-hover:scale-[1.035]
                    "
                    style={
                      cat.objectPosition
                        ? { objectPosition: cat.objectPosition }
                        : undefined
                    }
                    sizes="
                      (min-width: 1536px) 10vw,
                      (min-width: 1280px) 12vw,
                      15vw
                    "
                  />
                </div>

                <span
                  className="
                    mt-2.5
                    block
                    text-[13px]
                    xl:text-[14px]
                    leading-tight
                    font-medium
                    text-[#242424]
                    transition-colors
                    duration-200
                    group-hover:text-michket-gold
                  "
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-5 text-sm text-black/50">
            Aucune catégorie disponible.
          </div>
        )}
      </div>
    </div>
  );
}