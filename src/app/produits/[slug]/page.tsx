import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import {
  fetchProductDetail,
  fetchProductsForCategory,
  fetchProductBySlugSafe,
  type Product,
  ApiNotFoundError,
} from "@/lib/api";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001";

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

  let relatedProducts: Product[] =
    [];

  if (product.category) {
    try {
      const allCategoryProducts =
        await fetchProductsForCategory(
          product.category,
        );

      relatedProducts =
        allCategoryProducts
          .filter(
            (relatedProduct) =>
              relatedProduct.id !==
              product.id,
          )
          .slice(0, 4);
    } catch {
      relatedProducts = [];
    }
  }

  return (
    <>
      <ProductJsonLd
        product={product}
        url={`${SITE_URL}/produits/${product.slug}`}
      />

      <ProductDetail
        product={product}
        relatedProducts={
          relatedProducts
        }
      />
    </>
  );
}
