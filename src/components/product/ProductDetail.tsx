"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductGallery } from "./ProductGallery";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/data/products";
import { mainCategories } from "@/data/categories";
import { useCart } from "@/contexts/CartContext";

const badgeLabel: Record<string, string> = {
  "BEST SELLER": "Populaire",
  NOUVEAU: "Nouveau",
  PROMO: "Promo",
  PERSONNALISABLE: "Personnalisable",
  "ENVOI GRATUIT": "Livraison offerte",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const category = mainCategories.find((c) => c.id === product.category);

  return (
    <main className="min-h-screen bg-michket-white">
      {/* Breadcrumb */}
      <div className="michket-container py-4">
        <nav aria-label="Fil d'ariane" className="text-xs text-michket-charcoal/50">
          <ol className="flex items-center gap-1.5 flex-wrap">
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
                <li>
                  <Link
                    href={category.href}
                    className="hover:text-michket-gold transition-colors"
                  >
                    {category.label}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li className="text-michket-black font-medium">{product.title}</li>
          </ol>
        </nav>
      </div>

      {/* Product detail */}
      <div className="michket-container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ProductGallery images={product.images} />

          {/* Info */}
          <div className="flex flex-col">
            {/* Badge */}
            {product.badge && (
              <div className="flex gap-2 mb-3">
                <Badge variant={product.badge === "BEST SELLER" ? "popular" : product.badge === "NOUVEAU" ? "new" : product.badge === "PROMO" ? "promo" : "default"}>
                  {badgeLabel[product.badge] || product.badge}
                </Badge>
              </div>
            )}

            <h1 className="font-display text-2xl sm:text-3xl text-michket-black mb-2">
              {product.title}
            </h1>

            <p className="text-xs text-michket-charcoal/50 mb-4">
              {category?.label || product.category}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-semibold text-michket-black">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-michket-charcoal/40 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating!) ? "text-michket-gold" : "text-michket-charcoal/20"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-michket-charcoal/50">
                  {product.rating} ({product.reviewCount} avis)
                </span>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-sm text-michket-charcoal mb-6">
              <p>{product.description}</p>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center border border-michket-ivory">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-michket-charcoal hover:bg-michket-cream transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 h-10 flex items-center justify-center text-sm font-medium text-michket-black border-x border-michket-ivory">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-michket-charcoal hover:bg-michket-cream transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => {
                  addItem(
                    {
                      id: product.id,
                      slug: product.slug,
                      title: product.title,
                      price: product.price,
                      image: product.images[0].src,
                    },
                    quantity
                  );
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="flex-1 h-12 bg-michket-gold text-white font-semibold text-sm hover:bg-michket-gold-dark transition-colors"
              >
                {added ? "✓ Ajouté !" : "Ajouter au panier"}
              </button>
            </div>

            {/* Trust signals */}
            <div className="border-t border-michket-ivory pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-michket-charcoal/60">
                <svg className="w-5 h-5 text-michket-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-1.25m-.5 0H9.375m6.375 0v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5" />
                </svg>
                <span>Livraison offerte dès 50€ d&apos;achat</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-michket-charcoal/60">
                <svg className="w-5 h-5 text-michket-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span>Fait main en France 🇫🇷</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-michket-charcoal/60">
                <svg className="w-5 h-5 text-michket-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>Paiement 100% sécurisé</span>
              </div>
              {product.personalizable && (
                <div className="flex items-center gap-3 text-sm text-michket-charcoal/60">
                  <svg className="w-5 h-5 text-michket-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                  <span>Personnalisable sur mesure</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-michket-cream">
          <div className="michket-container">
            <h2 className="font-display text-2xl text-michket-black mb-6">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/produits/${p.slug}`} className="group block">
                  <div className="relative aspect-square bg-michket-white overflow-hidden mb-3">
                    <Image
                      src={p.images[0].src}
                      alt={p.images[0].alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-michket-black group-hover:text-michket-gold transition-colors line-clamp-2 mb-1">
                    {p.title}
                  </h3>
                  <span className="text-base font-semibold text-michket-black">
                    {formatPrice(p.price)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
