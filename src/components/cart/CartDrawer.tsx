"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/contexts/CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 2,
  }).format(price)} DA`;
}

export function CartDrawer({
  open,
  onClose,
}: CartDrawerProps) {
  const {
    items,
    itemCount,
    total,
    hydrated,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /* Escape + initial focus */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 30);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/45 backdrop-blur-[1px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        className="
          absolute
          inset-y-0
          right-0
          flex
          w-full
          flex-col
          bg-[#FFFEFB]
          shadow-[-18px_0_55px_rgba(0,0,0,0.16)]

          sm:w-[440px]
          sm:max-w-[92vw]
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* ───────────────── Header ───────────────── */}
        <header className="flex min-h-[72px] shrink-0 items-center justify-between border-b border-black/[0.08] px-4 sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
              Michket
            </p>

            <h2
              id="cart-title"
              className="mt-0.5 font-body text-[20px] font-semibold tracking-[-0.025em] text-[#111]"
            >
              Mon panier
              {itemCount > 0 && (
                <span className="ml-2 text-[13px] font-medium text-black/35">
                  ({itemCount})
                </span>
              )}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-black/[0.05] hover:text-black"
            aria-label="Fermer le panier"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {/* ───────────────── Content ───────────────── */}
        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="text-sm text-black/35">
              Chargement du panier…
            </p>
          </div>
        ) : items.length === 0 ? (
          <EmptyCart onClose={onClose} />
        ) : (
          <>
            {/* Items */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
              <div className="divide-y divide-black/[0.07]">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/produits/${item.slug}`}
                      onClick={onClose}
                      className="relative h-[92px] w-[82px] shrink-0 overflow-hidden rounded-[9px] bg-[#EFE9DF] sm:h-[104px] sm:w-[92px]"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-[1.035]"
                        sizes="92px"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/produits/${item.slug}`}
                        onClick={onClose}
                        className="line-clamp-2 font-body text-[13px] font-semibold leading-5 text-[#171717] transition-colors hover:text-[#8A6414] sm:text-[14px]"
                      >
                        {item.title}
                      </Link>

                      <p className="mt-1.5 text-[15px] font-bold tracking-[-0.02em] text-[#111]">
                        {formatPrice(item.price)}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                        {/* Quantity */}
                        <div className="inline-flex h-9 items-center rounded-[8px] border border-black/[0.10] bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1,
                              )
                            }
                            className="flex h-full w-9 items-center justify-center text-base text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black"
                            aria-label={`Diminuer la quantité de ${item.title}`}
                          >
                            −
                          </button>

                          <span
                            className="flex h-full min-w-9 items-center justify-center border-x border-black/[0.08] px-1 text-[12px] font-semibold text-[#111]"
                            aria-label={`Quantité ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= 99}
                            className="flex h-full w-9 items-center justify-center text-base text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Augmenter la quantité de ${item.title}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] font-medium text-black/38 underline decoration-black/15 underline-offset-3 transition-colors hover:text-[#111]"
                          aria-label={`Retirer ${item.title} du panier`}
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Footer / subtotal */}
            <footer className="shrink-0 border-t border-black/[0.08] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[12px] font-medium text-black/50">
                    Sous-total
                  </span>
                  <p className="mt-1 text-[10px] leading-4 text-black/35">
                    Livraison calculée lors de la commande.
                  </p>
                </div>

                <span className="text-[20px] font-bold tracking-[-0.03em] text-[#111]">
                  {formatPrice(total)}
                </span>
              </div>

              <Link
                href="/panier"
                onClick={onClose}
                className="flex min-h-12 w-full items-center justify-center bg-[#111111] px-5 text-[12px] font-semibold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#282828]"
              >
                Voir mon panier
              </Link>

              <div className="mt-3 flex items-center justify-between gap-4">
                <Link
                  href="/meilleures-ventes"
                  onClick={onClose}
                  className="text-[11px] font-medium text-black/42 transition-colors hover:text-[#ECAB1C]"
                >
                  Continuer mes achats
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-medium text-black/30 transition-colors hover:text-black/65"
                >
                  Vider le panier
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function EmptyCart({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3EEE5] text-black/28">
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.4}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
          />
        </svg>
      </div>

      <h3 className="mt-5 font-body text-[20px] font-semibold tracking-[-0.025em] text-[#161616]">
        Votre panier est vide
      </h3>

      <p className="mt-2 max-w-[280px] text-[13px] leading-6 text-black/45">
        Découvrez les créations Michket et ajoutez votre prochain cadeau
        personnalisé.
      </p>

      <Link
        href="/meilleures-ventes"
        onClick={onClose}
        className="mt-6 inline-flex min-h-12 items-center justify-center bg-[#ECAB1C] px-6 text-[11px] font-bold uppercase tracking-[0.09em] text-[#0A0A0A] transition-[filter] hover:brightness-95"
      >
        Découvrir nos créations
      </Link>
    </div>
  );
}
