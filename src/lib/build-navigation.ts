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
  /** All top-level categories with their direct children (for homepage, etc.) */
  categories: ApiCategoryDetail[];
}

function sortCategories(items: ApiCategory[]): ApiCategory[] {
  return [...items].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.name.localeCompare(b.name, "fr"),
  );
}

/**
 * Build navigation from backend categories.
 *
 * Supported hierarchy:
 * - Level 1: category        (example: Lampes 3D)
 * - Level 2: subcategory     (example: Médecine)
 * - Level 3: sub-subcategory (example: Chirurgie)
 *
 * The third level is optional. A level-2 category without children keeps
 * linking directly to its existing page.
 *
 * On API failure: returns only static items (graceful degradation).
 */
export async function buildNavigation(): Promise<NavigationData> {
  try {
    // 1. Fetch every active category as a flat list.
    const allCategories = await fetchCategories();

    // 2. Group every non-root category by its direct parent.
    // This works for both level 2 and level 3.
    const childrenByParent = new Map<string, ApiCategory[]>();

    for (const category of allCategories) {
      if (!category.parentId) {
        continue;
      }

      const children =
        childrenByParent.get(category.parentId) ?? [];

      children.push(category);
      childrenByParent.set(category.parentId, children);
    }

    for (const [parentId, children] of childrenByParent) {
      childrenByParent.set(
        parentId,
        sortCategories(children),
      );
    }

    // 3. Root categories become the main catalogue nav entries.
    const topLevel = sortCategories(
      allCategories.filter(
        (category) => category.parentId === null,
      ),
    );

    const categoryNavItems: NavItemWithMega[] = [];

    for (const category of topLevel) {
      const subcategories =
        childrenByParent.get(category.id) ?? [];

      /*
       * Visual cards remain based on level-2 categories.
       * A level-2 card opens the level-2 page:
       * /lampes-3d/medecine
       *
       * That page can then display its optional level-3 children.
       */
      const megaCategories = subcategories
        .filter((subcategory) => subcategory.imageUrl)
        .map((subcategory) => ({
          label: subcategory.name,
          href: `/${category.slug}/${subcategory.slug}`,
          image: subcategory.imageUrl!,
          objectPosition: "center" as const,
        }));

      // If there are no illustrated subcategories, keep the root fallback card.
      if (
        megaCategories.length === 0 &&
        category.imageUrl
      ) {
        megaCategories.push({
          label: category.name,
          href: `/${category.slug}`,
          image: category.imageUrl,
          objectPosition: "center" as const,
        });
      }

      const columns: NonNullable<
        NonNullable<NavItemWithMega["mega"]>["columns"]
      > = [];

      /*
       * Level-2 categories WITH level-3 children each get their own column.
       *
       * Example:
       * Médecine
       *   - Toute la catégorie Médecine
       *   - Chirurgie
       *   - Dentiste
       */
      for (const subcategory of subcategories) {
        const subSubcategories =
          childrenByParent.get(subcategory.id) ?? [];

        if (subSubcategories.length === 0) {
          continue;
        }

        columns.push({
          title: subcategory.name,
          items: [
            {
              label: `Toute la catégorie ${subcategory.name}`,
              href: `/${category.slug}/${subcategory.slug}`,
            },
            ...subSubcategories.map((subSubcategory) => ({
              label: subSubcategory.name,
              href: `/${category.slug}/${subcategory.slug}/${subSubcategory.slug}`,
            })),
          ],
        });
      }

      /*
       * Level-2 categories WITHOUT level-3 children stay directly accessible.
       * The third level is therefore completely optional.
       */
      const directSubcategories = subcategories.filter(
        (subcategory) =>
          (childrenByParent.get(subcategory.id) ?? []).length === 0,
      );

      if (directSubcategories.length > 0) {
        columns.push({
          title: "Sous-catégories",
          items: directSubcategories.map((subcategory) => ({
            label: subcategory.name,
            href: `/${category.slug}/${subcategory.slug}`,
          })),
        });
      }

      // Always keep a direct link to the root category.
      columns.push({
        title: "Tous",
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

    // 4. "Meilleures ventes" stays based on top-level categories.
    const bestSellersItem: NavItemWithMega = {
      label: "Meilleures ventes",
      href: "/meilleures-ventes",
      badge: "BEST SELLER",
      mega: {
        categories: topLevel
          .filter((category) => category.imageUrl)
          .map((category) => ({
            label: category.name,
            href: `/${category.slug}`,
            image: category.imageUrl!,
            objectPosition: "center" as const,
          })),
        columns: [
          {
            title: "Nos catégories",
            items: topLevel.map((category) => ({
              label: category.name,
              href: `/${category.slug}`,
            })),
          },
        ],
      },
    };

    // 5. Final navigation.
    const mainNav: NavItemWithMega[] = [
      STATIC_NAV_ITEMS[0],
      bestSellersItem,
      ...categoryNavItems,
    ];

    return {
      mainNav,

      /*
       * Keep the existing homepage contract: each top-level category exposes
       * its direct level-2 children. Level-3 children are used by navigation
       * and will be handled on the level-2 public page in the next step.
       */
      categories: topLevel.map((category) => ({
        ...category,
        children:
          childrenByParent.get(category.id) ?? [],
        heroImages: [],
      })) as ApiCategoryDetail[],
    };
  } catch {
    // API unavailable — return only static items (no fake categories).
    return {
      mainNav: STATIC_NAV_ITEMS,
      categories: [],
    };
  }
}
