import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryCatalog } from "@/components/catalog/CategoryCatalog";
import { fetchCategoryBySlugSafe } from "@/lib/api";

const CATEGORY_SLUG = "lampes-3d";

export async function generateMetadata(): Promise<Metadata> {
  const category = await fetchCategoryBySlugSafe(CATEGORY_SLUG);

  if (!category || category.parentId) {
    return { title: "Catégorie introuvable | Michket" };
  }

  return {
    title: category.metaTitle || `${category.name} | Michket`,
    description:
      category.metaDescription ||
      category.description ||
      `Découvrez la collection ${category.name} sur Michket.`,
  };
}

export default async function Lampes3DPage() {
  const category = await fetchCategoryBySlugSafe(CATEGORY_SLUG);

  if (!category || category.parentId) {
    notFound();
  }

  return <CategoryCatalog slug={CATEGORY_SLUG} />;
}
