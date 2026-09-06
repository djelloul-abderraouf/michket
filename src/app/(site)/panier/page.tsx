"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-michket-white">
        <section className="py-12 sm:py-16">
          <div className="michket-container max-w-4xl">
            <h1 className="font-display text-2xl sm:text-3xl text-michket-black mb-8">
              Mon panier
            </h1>
            <div className="text-center py-16 bg-michket-cream">
              <svg className="w-16 h-16 text-michket-charcoal/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
              </svg>
              <h2 className="font-display text-xl text-michket-black mb-2">
                Votre panier est vide
              </h2>
              <p className="text-sm text-michket-charcoal/60 mb-6">
                Découvrez nos créations artisanales et trouvez l&apos;idéal cadeau.
              </p>
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-2 px-6 py-3 bg-michket-gold text-white text-sm font-semibold hover:bg-michket-gold-dark transition-colors"
              >
                Voir les collections
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-michket-white">
      <section className="py-8 sm:py-12">
        <div className="michket-container max-w-5xl">
          {/* Breadcrumb */}
          <nav aria-label="Fil d&apos;ariane" className="text-xs text-michket-charcoal/50 mb-6">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-michket-gold transition-colors">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-michket-black font-medium">Panier</li>
            </ol>
          </nav>

          <h1 className="font-display text-2xl sm:text-3xl text-michket-black mb-8">
            Mon panier
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-michket-cream/50 border border-michket-ivory"
                >
                  {/* Image */}
                  <Link href={`/produits/${item.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-michket-ivory overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/produits/${item.slug}`}
                        className="text-sm font-medium text-michket-black hover:text-michket-gold transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-michket-charcoal/30 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                        aria-label={`Retirer ${item.title}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-michket-ivory">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-michket-charcoal/60 hover:bg-michket-cream transition-colors text-sm"
                          aria-label="Diminuer la quantité"
                        >
                          −
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-medium text-michket-black border-x border-michket-ivory">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-michket-charcoal/60 hover:bg-michket-cream transition-colors text-sm"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="text-sm font-semibold text-michket-black">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={clearCart}
                  className="text-xs text-michket-charcoal/40 hover:text-red-500 transition-colors"
                >
                  Vider le panier
                </button>
                <Link
                  href="/collections/all"
                  className="text-xs text-michket-gold hover:text-michket-gold-dark transition-colors font-medium"
                >
                  ← Continuer les achats
                </Link>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-michket-cream/50 border border-michket-ivory p-6 sticky top-20">
                <h2 className="font-display text-lg text-michket-black mb-4">
                  Récapitulatif
                </h2>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-michket-charcoal/60">
                      Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium text-michket-black">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-michket-charcoal/60">Livraison</span>
                    <span className="text-michket-charcoal/40">Calculée à la caisse</span>
                  </div>
                </div>

                <div className="border-t border-michket-ivory pt-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-michket-black">Total</span>
                    <span className="font-bold text-lg text-michket-black">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link
                  href="/paiement"
                  className="block w-full py-3 text-center text-sm font-semibold bg-michket-gold text-white hover:bg-michket-gold-dark transition-colors"
                >
                  Commander
                </Link>

                {/* Trust signals */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-michket-charcoal/50">
                    <svg className="w-3.5 h-3.5 text-michket-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Paiement 100% sécurisé
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-michket-charcoal/50">
                    <svg className="w-3.5 h-3.5 text-michket-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-1.25m-.5 0H9.375m6.375 0v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5" />
                    </svg>
                    Livraison offerte dès 100€
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
