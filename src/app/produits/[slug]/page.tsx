import { Suspense } from "react";
import { Cairo } from "next/font/google";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/product/ProductDetail";
import { RelatedProductsSection } from "@/components/product/RelatedProductsSection";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import {
  fetchProductDetail,
  fetchProductBySlugSafe,
  type Product,
  ApiNotFoundError,
} from "@/lib/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

const arabicFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/*
 * Product pages depend on live backend data.
 *
 * Do not pre-render them during `next build`: the backend may not be reachable
 * from the build environment (local machine, CI or Hostinger build worker).
 * Rendering them dynamically also ensures the customer always receives the
 * current price, variants, personalization settings and availability.
 */
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  let detail: Awaited<
    ReturnType<typeof fetchProductBySlugSafe>
  > = null;

  try {
    detail = await fetchProductBySlugSafe(slug);
  } catch {
    return {
      title: "Produit | Michket",
    };
  }

  if (!detail) {
    return {
      title: "Produit non trouvé | Michket",
    };
  }

  const title =
    detail.metaTitle ??
    `${detail.name} | Michket`;

  const description =
    detail.metaDescription ??
    detail.description ??
    "";

  const firstImage =
    detail.images.length > 0
      ? [...detail.images].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) {
            return -1;
          }

          if (!a.isPrimary && b.isPrimary) {
            return 1;
          }

          return a.sortOrder - b.sortOrder;
        })[0]
      : null;

  return {
    title,
    description,
    openGraph: {
      title:
        detail.metaTitle ??
        detail.name,
      description,
      images: firstImage
        ? [{ url: firstImage.url }]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  let product: Product & {
    metaTitle?: string;
    metaDescription?: string;
  };

  try {
    product =
      await fetchProductDetail(slug);
  } catch (error) {
    if (
      error instanceof
      ApiNotFoundError
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <>
      <ProductJsonLd
        product={product}
        url={`${SITE_URL}/produits/${product.slug}`}
      />

      <main
        lang="ar"
        dir="rtl"
        className={`${arabicFont.className} michket-arabic min-h-screen overflow-x-hidden bg-[#F7F1E8] pb-8 text-[#251713]`}
      >
        <ProductDetail product={product} />

        {product.category ? (
          <Suspense fallback={null}>
            <RelatedProductsSection
              categorySlug={product.category}
              currentProductId={product.id}
            />
          </Suspense>
        ) : null}
      </main>
    </>
  );
}
