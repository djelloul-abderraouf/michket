/**
 * Build dynamic navigation from backend categories.
 *
 * Server-side only — used in root layout to provide
 * categories to Header (desktop + mobile) and mega menu.
 *
 * The DB is the single source of truth for catalog navigation.
 * Non-catalog links (Accueil, Meilleures ventes) are static.
 */

import {
  fetchCategories,
  fetchCategoryBySlug,
  type ApiCategory,
  type ApiCategoryDetail,
} from "@/lib/api";
import type { NavItemWithMega } from "@/data/navigation";

/* ── Static non-catalog items ─────────────────────────────── */

const STATIC_NAV_ITEMS: NavItemWithMega[] = [
  {
    label: "Accueil",
    href: "/",
  },
  {
    label: "Meilleures ventes",
    href: "/meilleures-ventes",
    badge: "BEST SELLER",
  },
];

/* ── Build navigation from API ────────────────────────────── */

export interface NavigationData {
  /** Navigation items for header (desktop + mobile) */
  mainNav: NavItemWithMega[];
  /** All top-level categories with their children (for homepage, etc.) */
  categories: ApiCategoryDetail[];
}

/**
 * Build navigation from backend categories.
 *
 * - Top-level categories (parentId === null) become nav items
 * - Each parent's children become mega menu category cards + column items
 * - Static items (Accueil, Meilleures ventes) are prepended
 * - On API failure: returns only static items (graceful degradation)
 */
export async function buildNavigation(): Promise<NavigationData> {
  try {
    // 1. Fetch all active categories (flat list)
    const allCategories = await fetchCategories();

    // 2. Separate top-level from subcategories
    const topLevel = allCategories.filter((c) => c.parentId === null);
    const subcategories = allCategories.filter((c) => c.parentId !== null);

    // 3. Group subcategories by parentId
    const childrenByParent = new Map<string, ApiCategory[]>();
    for (const sub of subcategories) {
      if (!sub.parentId) continue;
      const list = childrenByParent.get(sub.parentId) ?? [];
      list.push(sub);
      childrenByParent.set(sub.parentId, list);
    }

    // 4. Build navigation items for each top-level category
    const categoryNavItems: NavItemWithMega[] = [];

    for (const category of topLevel) {
      const children = childrenByParent.get(category.id) ?? [];

      // Category cards for mega menu (children with imageUrl)
      const megaCategories = children
        .filter((child) => child.imageUrl) // Only children with images
        .map((child) => ({
          label: child.name,
          href: `/${category.slug}/${child.slug}`,
          image: child.imageUrl!,
          objectPosition: "center" as const,
        }));

      // If parent has no children with images, show the parent itself as a card
      if (megaCategories.length === 0 && category.imageUrl) {
        megaCategories.push({
          label: category.name,
          href: `/${category.slug}`,
          image: category.imageUrl,
          objectPosition: "center" as const,
        });
      }

      // Column items: children as text links
      const columnItems = children.map((child) => ({
        label: child.name,
        href: `/${category.slug}/${child.slug}`,
      }));

      // Build columns — always include a main link column
      const columns = [];

      if (columnItems.length > 0) {
        columns.push({
          title: `Par occasion`,
          items: columnItems,
        });
      }

      // Add a "Tous les X" column
      columns.push({
        title: `Tous`,
        items: [
          {
            label: `Tous les ${category.name.toLowerCase()}`,
            href: `/${category.slug}`,
          },
        ],
      });

      categoryNavItems.push({
        label: category.name,
        href: `/${category.slug}`,
        mega: {
          categories: megaCategories,
          columns,
        },
      });
    }

    // 5. Insert "Meilleures ventes" with dynamic category cards
    const bestSellersItem: NavItemWithMega = {
      label: "Meilleures ventes",
      href: "/meilleures-ventes",
      badge: "BEST SELLER",
      mega: {
        categories: topLevel
          .filter((c) => c.imageUrl)
          .map((c) => ({
            label: c.name,
            href: `/${c.slug}`,
            image: c.imageUrl!,
            objectPosition: "center" as const,
          })),
        columns: [
          {
            title: "Nos catégories",
            items: topLevel.map((c) => ({
              label: c.name,
              href: `/${c.slug}`,
            })),
          },
        ],
      },
    };

    // 6. Final navigation: Accueil + Best sellers + category items
    const mainNav: NavItemWithMega[] = [
      STATIC_NAV_ITEMS[0], // Accueil
      bestSellersItem,
      ...categoryNavItems,
    ];

    return {
      mainNav,
      categories: topLevel.map((cat) => {
        const children = childrenByParent.get(cat.id) ?? [];
        return {
          ...cat,
          children,
          heroImages: [],
        } as ApiCategoryDetail;
      }),
    };
  } catch {
    // API unavailable — return only static items (no fake categories)
    return {
      mainNav: STATIC_NAV_ITEMS,
      categories: [],
    };
  }
}
