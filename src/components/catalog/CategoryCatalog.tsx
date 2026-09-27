import { notFound } from "next/navigation";

import { ProductCatalog } from "@/components/catalog/ProductCatalog";
import {
  fetchCategoryBySlugSafe,
  fetchProductsForCategory,
  type Product,
} from "@/lib/api";

export async function CategoryCatalog({ slug }: { slug: string }) {
  const category = await fetchCategoryBySlugSafe(slug);

  if (!category || category.parentId) {
    notFound();
  }

  let products: Product[] = [];
  let apiError = false;

  try {
    products = await fetchProductsForCategory(category.slug);
  } catch {
    apiError = true;
  }

  const subcategories = category.children
    .filter((child) => child.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr"))
    .map((child) => ({
      slug: child.slug,
      name: child.name,
    }));

  return (
    <ProductCatalog
      title={category.productsTitle?.trim() || category.pageTitle?.trim() || category.name}
      description={category.description}
      subcategories={subcategories}
      products={products}
      apiError={apiError}
    />
  );
}
