"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { SortSelect } from "@/components/ui/SortSelect";
import { products as allProducts, type Product } from "@/data/products";
import { mainCategories } from "@/data/categories";

type SortKey = "newest" | "price-asc" | "price-desc" | "popular";

const sortOptions = [
  { value: "popular", label: "Populaires" },
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

const badgeLabel: Record<string, string> = {
  "BEST SELLER": "Populaire",
  NOUVEAU: "Nouveau",
  PROMO: "Promo",
  PERSONNALISABLE: "Personnalisable",
  "ENVOI GRATUIT": "Livraison offerte",
};

interface CollectionPageProps {
  title: string;
  description: string;
  /** Category ID filter — matches product.category field */
  category?: string;
}

export function CollectionPage({
  title,
  description,
  category,
}: CollectionPageProps) {
  const [sort, setSort] = useState<SortKey>("popular");

  const filteredProducts = useMemo(() => {
    let items = category
      ? allProducts.filter((p) => p.category === category)
      : [...allProducts];

    switch (sort) {
      case "newest":
        items.sort((a, b) => {
          const aNew = a.badge === "NOUVEAU" ? 1 : 0;
          const bNew = b.badge === "NOUVEAU" ? 1 : 0;
          return bNew - aNew;
        });
        break;
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "popular":
      default:
        items.sort((a, b) => {
          const aPop = a.badge === "BEST SELLER" ? 1 : 0;
          const bPop = b.badge === "BEST SELLER" ? 1 : 0;
          return bPop - aPop;
        });
    }

    return items;
  }, [category, sort]);

  return (
    <main className="min-h-screen bg-michket-white">
      {/* Hero banner */}
      <section className="relative bg-michket-cream py-12 sm:py-16">
        <div className="michket-container text-center relative z-10">
          <h1 className="font-display text-3xl sm:text-4xl text-michket-black mb-3">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-michket-charcoal/60 max-w-xl mx-auto">
            {description}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="michket-container py-4">
        <nav aria-label="Fil d'ariane" className="text-xs text-michket-charcoal/50">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-michket-gold transition-colors">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/collections/all" className="hover:text-michket-gold transition-colors">
                Collections
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden="true">/</li>
                <li className="text-michket-black font-medium">{title}</li>
              </>
            )}
          </ol>
        </nav>
      </div>

      {/* Toolbar */}
      <div className="michket-container pb-6">
        <div className="flex items-center justify-between border-b border-michket-ivory pb-4">
          <p className="text-sm text-michket-charcoal/60">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
          </p>
          <SortSelect
            options={sortOptions}
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
          />
        </div>
      </div>

      {/* Product grid */}
      <div className="michket-container pb-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-michket-charcoal/40 text-sm">
              Aucun produit trouvé dans cette collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function ProductCard({ product }: { product: Product }) {
  const mainImage = product.images[0];

  return (
    <Link href={`/produits/${product.slug}`} className="group block">
      <div className="relative aspect-square bg-michket-cream overflow-hidden mb-3">
        <Image
          src={mainImage.src}
          alt={mainImage.alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.badge && (
          <div className="absolute top-2 left-2">
            <Badge variant={product.badge === "BEST SELLER" ? "popular" : product.badge === "NOUVEAU" ? "new" : product.badge === "PROMO" ? "promo" : "default"}>
              {badgeLabel[product.badge] || product.badge}
            </Badge>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-michket-black group-hover:text-michket-gold transition-colors line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-michket-black">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-michket-charcoal/40 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
