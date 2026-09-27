import { notFound } from "next/navigation";

import {
  ProductCatalog,
  type CatalogCategoryCard,
} from "@/components/catalog/ProductCatalog";
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

  try {
    products = await fetchProductsForCategory(category.slug);
  } catch {
    products = [];
  }

  const categories: CatalogCategoryCard[] = category.children
    .filter((child) => child.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr"))
    .map((child) => {
      const models = products.filter(
        (product) => product.subcategorySlug === child.slug,
      );
      const examples = models
        .flatMap((product) => product.images.slice(0, 1))
        .filter((image) => image.src !== child.imageUrl)
        .slice(0, 3);
      const coverSource = child.imageUrl
        ? { src: child.imageUrl, alt: child.name }
        : models[0]?.images[0];

      return {
        slug: child.slug,
        name: child.name,
        description: child.description,
        href: `/${category.slug}/${child.slug}`,
        cover: coverSource
          ? { src: coverSource.src, alt: coverSource.alt || child.name }
          : undefined,
        examples,
        modelCount: models.length,
      };
    });

  return (
    <ProductCatalog
      title={category.pageTitle?.trim() || category.name}
      description={category.description}
      categories={categories}
    />
  );
}
