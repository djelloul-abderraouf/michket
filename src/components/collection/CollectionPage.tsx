"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { SortSelect } from "@/components/ui/SortSelect";
import { QuickAddButton } from "@/components/product/QuickAddButton";
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
  category?: string;
  products?: Product[];
  categories?: ApiCategory[];
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

  // Kept in the public props for compatibility with existing callers.
  void mainCategories;

  const filteredProducts = useMemo(() => {
    const items = category
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
      <section className="relative bg-michket-cream py-12 sm:py-16">
        <div className="michket-container relative z-10 text-center">
          <h1 className="mb-3 font-display text-3xl text-michket-black sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-michket-charcoal/60 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      <div className="michket-container py-4">
        <nav
          aria-label="Fil d'ariane"
          className="text-xs text-michket-charcoal/50"
        >
          <ol className="flex items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-michket-gold"
              >
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/collections/all"
                className="transition-colors hover:text-michket-gold"
              >
                Collections
              </Link>
            </li>
            {category && (
              <>
                <li aria-hidden="true">/</li>
                <li className="font-medium text-michket-black">{title}</li>
              </>
            )}
          </ol>
        </nav>
      </div>

      <div className="michket-container pb-6">
        <div className="flex items-center justify-between border-b border-michket-ivory pb-4">
          <p className="text-sm text-michket-charcoal/60">
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? "s" : ""}
          </p>
          <SortSelect
            options={sortOptions}
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
          />
        </div>
      </div>

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
  return `${new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

function ProductCard({ product }: { product: Product }) {
  const mainImage = product.images[0];

  return (
    <article className="group">
      <div className="relative mb-3 aspect-square overflow-hidden bg-michket-cream">
        <Link
          href={`/produits/${product.slug}`}
          className="absolute inset-0"
          aria-label={`Voir ${product.title}`}
        >
          {mainImage ? (
            <Image
              src={mainImage.src}
              alt={mainImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-michket-charcoal/25">
              <svg
                className="h-9 w-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.4}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v10.5A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V6.75z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 15l4.72-4.72a1.5 1.5 0 012.12 0L15 14.69m-1.5-1.5 1.22-1.22a1.5 1.5 0 012.12 0L20.25 15.38"
                />
              </svg>
            </div>
          )}
        </Link>

        {product.badge && (
          <div className="pointer-events-none absolute left-2 top-2 z-10">
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

        <QuickAddButton
          product={product}
          className="absolute bottom-2 right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/60 text-white shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-michket-black hover:text-michket-gold disabled:cursor-wait disabled:opacity-70 sm:h-11 sm:w-11"
        />
      </div>

      <div className="space-y-1">
        <Link href={`/produits/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-sm font-medium text-michket-black transition-colors group-hover:text-michket-gold">
            {product.title}
          </h3>
        </Link>

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
    </article>
  );
}
