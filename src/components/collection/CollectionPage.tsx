"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { SortSelect } from "@/components/ui/SortSelect";
import type { Product, ApiCategory } from "@/lib/api";

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
  /** Pre-fetched products (mapped to frontend Product type) */
  products?: Product[];
  /** Pre-fetched categories */
  categories?: ApiCategory[];
  /** True when API request failed — shows error state instead of empty */
  apiError?: boolean;
}

export function CollectionPage({
  title,
  description,
  category,
  products: allProducts = [],
  categories: mainCategories = [],
  apiError = false,
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
  }, [category, sort, allProducts]);

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
        <nav
          aria-label="Fil d'ariane"
          className="text-xs text-michket-charcoal/50"
        >
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="hover:text-michket-gold transition-colors"
              >
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/collections/all"
                className="hover:text-michket-gold transition-colors"
              >
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
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""}
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
          apiError ? (
            <div className="py-20 text-center">
              <p className="text-sm font-semibold text-red-800">
                Impossible de charger les produits pour le moment.
              </p>
              <p className="mt-1 text-[11px] text-red-600/70">
                Veuillez réessayer plus tard.
              </p>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-sm text-michket-charcoal/40">
                Aucun produit trouvé dans cette collection.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
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
      <div className="relative mb-3 aspect-square overflow-hidden bg-michket-cream">
        <Image
          src={mainImage?.src ?? "/images/placeholder.png"}
          alt={mainImage?.alt ?? product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.badge && (
          <div className="absolute left-2 top-2">
            <Badge
              variant={
                product.badge === "BEST SELLER"
                  ? "popular"
                  : product.badge === "NOUVEAU"
                    ? "new"
                    : product.badge === "PROMO"
                      ? "promo"
                      : "default"
              }
            >
              {badgeLabel[product.badge] || product.badge}
            </Badge>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-michket-black transition-colors group-hover:text-michket-gold line-clamp-2">
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
