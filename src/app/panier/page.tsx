"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

export default function CartPage() {
  const {
    items,
    itemCount,
    total,
    hydrated,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  /* ── Loading ── */
  if (!hydrated || loading) {
    return (
      <main className="min-h-screen bg-[#F7F1E8]">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
              Mon panier
            </h1>
            <div className="mt-8 flex items-center justify-center py-16">
              <p className="text-sm text-[#251713]/45">
                Chargement du panier…
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <main className="min-h-screen bg-[#F7F1E8]">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
              Mon panier
            </h1>
            <div className="mt-8 rounded-[12px] border border-red-800/10 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#F7F1E8]">
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
              Mon panier
            </h1>
            <div className="mt-8 rounded-[14px] border border-[#251713]/[0.07] bg-white py-16 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-[#251713]/15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5"
                />
              </svg>
              <h2 className="font-body text-[20px] font-semibold text-[#161616]">
                Votre panier est vide
              </h2>
              <p className="mt-2 mx-auto max-w-[300px] text-[13px] leading-6 text-[#251713]/45">
                Découvrez les créations Michket et ajoutez votre prochain
                cadeau personnalisé.
              </p>
              <Link
                href="/meilleures-ventes"
                className="mt-6 inline-flex min-h-12 items-center justify-center bg-[#ECAB1C] px-6 text-[11px] font-bold uppercase tracking-[0.09em] text-[#0A0A0A] transition-[filter] hover:brightness-95"
              >
                Découvrir nos créations
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ── Cart with items ── */
  return (
    <main className="min-h-screen bg-[#F7F1E8]">
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Fil d&apos;ariane" className="mb-6 text-[11px] text-[#251713]/45">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="transition-colors hover:text-[#ECAB1C]">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-[#251713]">Panier</li>
            </ol>
          </nav>

          <h1 className="font-body text-[24px] font-semibold text-[#251713] sm:text-[30px]">
            Mon panier
          </h1>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
            {/* ── Items list ── */}
            <div className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-3 rounded-[12px] border border-[#251713]/[0.07] bg-white p-3 sm:gap-4 sm:p-4"
                >
                  {/* Image */}
                  <Link
                    href={`/produits/${item.slug}`}
                    className="relative h-20 w-[72px] shrink-0 overflow-hidden rounded-[8px] bg-[#EFE9DF] sm:h-24 sm:w-24"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[#251713]/25">
                        —
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/produits/${item.slug}`}
                        className="line-clamp-2 text-[13px] font-semibold text-[#171717] transition-colors hover:text-[#8A6414] sm:text-[14px]"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 p-1 text-[#251713]/25 transition-colors hover:text-red-500"
                        aria-label={`Retirer ${item.title}`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Variant swatch */}
                    {item.variantId && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full border border-black/10"
                          style={{
                            backgroundColor: item.selectedColorHex ?? "#ccc",
                          }}
                          aria-hidden="true"
                        />
                        <span className="text-[11px] text-[#251713]/45">
                          {item.selectedColorName ?? "Couleur"}
                        </span>
                      </div>
                    )}

                    {/* Personalization */}
                    {item.personalization &&
                      typeof item.personalization === "object" && (
                        <p className="mt-1 text-[11px] italic text-[#251713]/35 line-clamp-2">
                          {item.personalization.text as string ??
                            Object.values(item.personalization)
                              .filter(Boolean)
                              .join(" · ")}
                        </p>
                      )}

                    {/* Quantity + line total */}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="inline-flex h-9 items-center rounded-[8px] border border-[#251713]/10 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-full w-9 items-center justify-center text-base text-[#251713]/55 transition-colors hover:bg-[#251713]/[0.04] hover:text-[#251713]"
                          aria-label="Diminuer la quantité"
                        >
                          −
                        </button>
                        <span className="flex h-full min-w-9 items-center justify-center border-x border-[#251713]/[0.08] px-1 text-[12px] font-semibold text-[#111]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= 99}
                          className="flex h-full w-9 items-center justify-center text-base text-[#251713]/55 transition-colors hover:bg-[#251713]/[0.04] hover:text-[#251713] disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[14px] font-bold text-[#111]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}

              {/* Clear + continue shopping */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-[#251713]/30 transition-colors hover:text-red-500"
                >
                  Vider le panier
                </button>
                <Link
                  href="/meilleures-ventes"
                  className="text-[11px] font-medium text-[#251713]/42 transition-colors hover:text-[#ECAB1C]"
                >
                  ← Continuer les achats
                </Link>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div className="lg:sticky lg:top-20">
              <div className="rounded-[14px] border border-[#251713]/[0.08] bg-white p-5 shadow-[0_12px_35px_rgba(37,23,19,0.06)] sm:p-6">
                <h2 className="font-body text-[18px] font-semibold text-[#111]">
                  Récapitulatif
                </h2>

                <div className="mt-4 space-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#251713]/50">
                      Sous-total ({itemCount} article
                      {itemCount > 1 ? "s" : ""})
                    </span>
                    <span className="font-medium text-[#111]">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#251713]/50">Livraison</span>
                    <span className="text-[11px] text-[#251713]/35">
                      Calculée à la commande
                    </span>
                  </div>
                </div>

                <div className="my-3 h-px bg-[#251713]/[0.08]" />

                <div className="flex items-end justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8A6A20]">
                    Total
                  </span>
                  <span className="text-[22px] font-extrabold text-[#111]">
                    {formatPrice(total)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-[11px] bg-[#ECAB1C] px-5 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#251713] shadow-[0_10px_22px_rgba(236,171,28,0.22)] transition hover:bg-[#F1B82F]"
                >
                  Passer la commande
                </Link>

                {/* Trust signals */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#251713]/45">
                    <svg
                      className="h-3.5 w-3.5 flex-shrink-0 text-[#ECAB1C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    Paiement à la livraison
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#251713]/45">
                    <svg
                      className="h-3.5 w-3.5 flex-shrink-0 text-[#ECAB1C]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-1.25m-.5 0H9.375m6.375 0v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5m0 1.5v-1.5"
                      />
                    </svg>
                    Livraison dans toute l&apos;Algérie
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
