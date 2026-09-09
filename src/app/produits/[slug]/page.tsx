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
import { getAlgeriaLocations } from "@/lib/algeria";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  // At build time, try to pre-generate product pages.
  // Verify each slug against the detail endpoint — skip broken ones (500/inconsistent data).
  // If backend is entirely unavailable, dynamicParams=true handles runtime generation.
  try {
    const { fetchProducts } = await import("@/lib/api");
    const res = await fetchProducts({ limit: 50 });
    const validSlugs: { slug: string }[] = [];
    for (const p of res.data) {
      try {
        await fetchProductDetail(p.slug);
        validSlugs.push({ slug: p.slug });
      } catch {
        // Detail endpoint returned 500 or other error — skip this slug
      }
    }
    return validSlugs;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;

  let detail: Awaited<ReturnType<typeof fetchProductBySlugSafe>> = null;
  try {
    detail = await fetchProductBySlugSafe(slug);
  } catch {
    // Server error during build — return fallback metadata
    return { title: "Produit | Michket" };
  }

  if (!detail) {
    return { title: "Produit non trouvé | Michket" };
  }

  const title = detail.metaTitle ?? `${detail.name} | Michket`;
  const description = detail.metaDescription ?? detail.description ?? "";

  // Get first image URL for OG
  const firstImage =
    detail.images.length > 0
      ? [...detail.images]
          .sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return a.sortOrder - b.sortOrder;
          })[0]
      : null;

  return {
    title,
    description,
    openGraph: {
      title: detail.metaTitle ?? detail.name,
      description,
      images: firstImage ? [{ url: firstImage.url }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: Product & { metaTitle?: string; metaDescription?: string };
  try {
    product = await fetchProductDetail(slug);
  } catch (e) {
    if (e instanceof ApiNotFoundError) {
      notFound();
    }
    // Server error (500/network) — propagate to error.tsx, NOT notFound()
    throw e;
  }

  const [wilayas] = await Promise.all([getAlgeriaLocations()]);

  // Fetch related products from same category
  let relatedProducts: Product[] = [];
  if (product.category) {
    try {
      const allCategoryProducts = await fetchProductsForCategory(product.category);
      relatedProducts = allCategoryProducts
        .filter((p) => p.id !== product.id)
        .slice(0, 4);
    } catch {
      relatedProducts = [];
    }
  }

  return (
    <>
      <ProductJsonLd
        product={product}
        url={`https://seashell-armadillo-282520.hostingersite.com/produits/${product.slug}`}
      />
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        wilayas={wilayas}
      />
    </>
  );
}
