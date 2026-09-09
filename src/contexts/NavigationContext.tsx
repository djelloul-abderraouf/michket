"use client";

import { createContext, useContext } from "react";
import type { NavItemWithMega } from "@/data/navigation";
import type { ApiCategoryDetail } from "@/lib/api";

/* ── Types ─────────────────────────────────────────────────── */

export interface NavigationContextValue {
  /** Navigation items for header (desktop + mobile mega menu) */
  mainNav: NavItemWithMega[];
  /** Top-level categories with their children (for homepage, etc.) */
  categories: ApiCategoryDetail[];
}

/* ── Context ───────────────────────────────────────────────── */

const NavigationContext = createContext<NavigationContextValue>({
  mainNav: [],
  categories: [],
});

/* ── Provider ──────────────────────────────────────────────── */

export function NavigationProvider({
  value,
  children,
}: {
  value: NavigationContextValue;
  children: React.ReactNode;
}) {
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useNavigation(): NavigationContextValue {
  return useContext(NavigationContext);
}
