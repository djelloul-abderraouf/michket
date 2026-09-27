import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { ModelGrid } from "@/components/catalog/ProductCatalog";
import {
  fetchCategoryBySlugSafe,
  fetchProductsForCategory,
} from "@/lib/api";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;

  const [parent, category] = await Promise.all([
    fetchCategoryBySlugSafe(categorySlug),
    fetchCategoryBySlugSafe(subcategorySlug),
  ]);

  if (
    !parent ||
    parent.parentId ||
    !category ||
    category.parentId !== parent.id
  ) {
    return { title: "Catégorie introuvable | Michket" };
  }

  return {
    title: category.metaTitle || `${category.name} | Michket`,
    description:
      category.metaDescription ||
      category.description ||
      `Découvrez les modèles ${category.name} sur Michket.`,
  };
}

export default async function GenericSubcategoryPage({
  params,
}: {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}) {
  const { categorySlug, subcategorySlug } = await params;

  const [parent, category] = await Promise.all([
    fetchCategoryBySlugSafe(categorySlug),
    fetchCategoryBySlugSafe(subcategorySlug),
  ]);

  if (
    !parent ||
    parent.parentId ||
    !category ||
    category.parentId !== parent.id
  ) {
    notFound();
  }

  const subSubcategories = [...(category.children ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "fr"),
  );

  let products: Awaited<ReturnType<typeof fetchProductsForCategory>> = [];
  let apiError = false;

  if (subSubcategories.length === 0) {
    try {
      products = await fetchProductsForCategory(category.slug);
    } catch {
      apiError = true;
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F1E8] text-[#251713]">
      <section className="border-b border-[#251713]/[0.08] bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-2 text-xs text-[#251713]/45"
          >
            <Link href="/" className="hover:text-[#8A6A20]">
              Accueil
            </Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${parent.slug}`} className="hover:text-[#8A6A20]">
              {parent.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-[#251713]">{category.name}</span>
          </nav>

          <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.04em] sm:text-[36px]">
            {category.pageTitle?.trim() || category.name}
          </h1>

          {category.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#251713]/55">
              {category.description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
        {subSubcategories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
            {subSubcategories.map((item) => (
              <Link
                key={item.id}
                href={`/${parent.slug}/${category.slug}/${item.slug}`}
                className="group overflow-hidden rounded-2xl border border-[#251713]/[0.08] bg-white shadow-[0_10px_28px_rgba(37,23,19,0.06)]"
              >
                <div className="relative aspect-[4/3] bg-[#EDE3D7]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                    />
                  ) : null}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#21130F]/75 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-[#251713]/50">
              {products.length} modèle{products.length > 1 ? "s" : ""}
            </p>
            <ModelGrid products={products} apiError={apiError} />
          </>
        )}
      </section>
    </main>
  );
}
