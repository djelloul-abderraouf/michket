import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryCatalog } from "@/components/catalog/CategoryCatalog";
import { fetchCategoryBySlugSafe } from "@/lib/api";

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await fetchCategoryBySlugSafe(categorySlug);

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

export default async function GenericCategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = await fetchCategoryBySlugSafe(categorySlug);

  if (!category || category.parentId) {
    notFound();
  }

  return <CategoryCatalog slug={category.slug} />;
}
