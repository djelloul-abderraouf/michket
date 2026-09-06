import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { products } from "@/data/products";
import { getAlgeriaLocations } from "@/lib/algeria";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Produit non trouvé | Michket" };
  }

  return {
    title: `${product.title} | Michket`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.images[0].src }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  const [wilayas] = await Promise.all([getAlgeriaLocations()]);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

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
