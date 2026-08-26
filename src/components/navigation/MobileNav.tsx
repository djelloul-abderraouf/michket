"use client";

import Link from "next/link";
import { useState } from "react";
import { mobileNav, type NavItemWithMega } from "@/data/navigation";

function MobileAccordionItem({ item }: { item: NavItemWithMega }) {
  const [open, setOpen] = useState(false);
  const hasSubItems = item.mega && item.mega.columns.length > 0;

  if (!hasSubItems) {
    return (
      <li>
        <Link
          href={item.href}
          className="flex items-center py-3.5 px-4 text-[15px] font-medium text-foreground border-b border-border/50 hover:text-michket-gold transition-colors"
        >
          {item.label}
          {item.badge && (
            <span className="ml-2 text-[9px] font-bold tracking-wider bg-michket-gold text-michket-black px-1.5 py-0.5 rounded-sm">
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  }

  return (
    <li className="border-b border-border/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3.5 px-4 text-[15px] font-medium text-foreground"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="text-[9px] font-bold tracking-wider bg-michket-gold text-michket-black px-1.5 py-0.5 rounded-sm">
              {item.badge}
            </span>
          )}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="pb-2 pl-6">
          {item.mega?.columns.map((col) => (
            <ul key={col.title} className="space-y-0.5 mb-2">
              {col.items.map((subItem) => (
                <li key={`${col.title}-${subItem.href}`}>
                  <Link
                    href={subItem.href}
                    className="block py-2 px-4 text-sm text-foreground/70 hover:text-michket-gold transition-colors"
                  >
                    {subItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      )}
    </li>
  );
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-[320px] max-w-[85vw] bg-white z-50 lg:hidden flex flex-col transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation mobile"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:text-michket-gold transition-colors"
            aria-label="Fermer le menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto">
          <ul className="py-1">
            {mobileNav.map((item) => (
              <MobileAccordionItem key={item.label} item={item} />
            ))}
          </ul>
        </div>

        {/* Footer links */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/notre-histoire" className="hover:text-michket-gold transition-colors">
              Notre histoire
            </Link>
            <Link href="/faq" className="hover:text-michket-gold transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-michket-gold transition-colors">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
